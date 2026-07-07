import { createClient } from '@supabase/supabase-js'

interface SDSCustomer {
  customerId: number
  name: string
  status: string
  createdDate?: string
}

interface SDSDevice {
  deviceId: number
  serialNumber: string
  customerId: number
  monitorStatus: string
  assetNumber: string
  discoveryDate: string | null
  lastContact: string | null
  registered: string | null
  ipAddress: string | null
  extendedFields?: {
    manufacturer: string | null
    model: string | null
    location: string | null
    zone: string | null
    monitorName: string | null
    mibDescription: string | null
    firmware?: string | null
  }
}

async function getSdsToken(apiKey: string, apiSecret: string): Promise<string> {
  const basic = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  const res = await fetch('https://hp-sds-latam.insightportal.net/PortalAPI/login', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}` },
  })
  if (!res.ok) throw new Error(`SDS Auth failed: ${res.status}`)
  const data = await res.json() as { access_token: string }
  return data.access_token
}

async function fetchAllCustomers(token: string): Promise<SDSCustomer[]> {
  const res = await fetch('https://hp-sds-latam.insightportal.net/PortalAPI/api/customers', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Customers fetch failed: ${res.status}`)
  return res.json() as Promise<SDSCustomer[]>
}

async function fetchDevices(token: string, customerId: number): Promise<SDSDevice[]> {
  const res = await fetch(
    `https://hp-sds-latam.insightportal.net/PortalAPI/api/devices?customerId=${customerId}&includeExtendedFields=true`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) throw new Error(`Devices fetch failed for customer ${customerId}: ${res.status}`)
  return res.json() as Promise<SDSDevice[]>
}

function getWeekKey(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + yearStart.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

export default async (req: Request) => {
  const url = new URL(req.url)
  const view = url.searchParams.get('view') ?? 'status'

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  const sdsApiKey = process.env.SDS_API_KEY
  const sdsApiSecret = process.env.SDS_API_SECRET

  if (!supabaseUrl || !supabaseKey || !sdsApiKey || !sdsApiSecret) {
    return new Response(JSON.stringify({ error: 'Missing env vars' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const token = await getSdsToken(sdsApiKey, sdsApiSecret)
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (view === 'alerts') return handleAlerts(token, supabase)
    if (view === 'customers') return handleCustomers(token)
    if (view === 'customer-details') return handleCustomerDetails(token)
    if (view === 'customer-summary') return handleCustomerSummary(token, url)
    return handleStatus(token)
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    )
  }
}

async function handleStatus(token: string) {
  const customers = await fetchAllCustomers(token)

  const activeCustomers = customers.filter(c => c.status === 'ACTIVE')
  const expiredCustomers = customers.filter(c => c.status === 'EXPIRED')
  const totalClients = customers.length

  const deviceResults = await Promise.allSettled(
    activeCustomers.map(c => fetchDevices(token, c.customerId)),
  )
  const allDevices: SDSDevice[] = []
  for (const result of deviceResults) {
    if (result.status === 'fulfilled') allDevices.push(...result.value)
  }

  const totalDevices = allDevices.length
  const now = Date.now()
  const FORTY_EIGHT_H_MS = 48 * 3_600_000

  function isWithin48h(iso: string): boolean {
    return (now - new Date(iso).getTime()) < FORTY_EIGHT_H_MS
  }

  const online = allDevices.filter(d => {
    if (!d.lastContact) return false
    return isWithin48h(d.lastContact)
  }).length
  const offline = allDevices.filter(d => {
    if (!d.lastContact) return false
    return !isWithin48h(d.lastContact)
  }).length
  const unknown = allDevices.filter(d => !d.lastContact).length
  const onlinePct = totalDevices ? Math.round((online / totalDevices) * 100) : 0
  const offlinePct = totalDevices ? Math.round((offline / totalDevices) * 100) : 0

  const thirtyDaysAgo = Date.now() - 30 * 86_400_000
  const discoveredLast30d = allDevices.filter(d => {
    if (!d.discoveryDate) return false
    return new Date(d.discoveryDate).getTime() >= thirtyDaysAgo
  }).length

  const coverageClients = activeCustomers.filter(c => {
    return allDevices.some(d => d.customerId === c.customerId && d.lastContact)
  }).length

  const manufacturerMap = new Map<string, number>()
  for (const d of allDevices) {
    const mfr = d.extendedFields?.manufacturer
    if (mfr) manufacturerMap.set(mfr, (manufacturerMap.get(mfr) ?? 0) + 1)
  }
  const manufacturerDist = [...manufacturerMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const customerDeviceMap = new Map<string, number>()
  for (const d of allDevices) {
    if (d.customerId) {
      const c = customers.find(c => c.customerId === d.customerId)
      const name = c?.name ?? `ID ${d.customerId}`
      customerDeviceMap.set(name, (customerDeviceMap.get(name) ?? 0) + 1)
    }
  }
  const devicesByCustomer = [...customerDeviceMap.entries()]
    .map(([name, devices]) => ({ name, devices }))
    .sort((a, b) => b.devices - a.devices)

  const modelMap = new Map<string, number>()
  for (const d of allDevices) {
    const model = d.extendedFields?.model
    if (model) modelMap.set(model, (modelMap.get(model) ?? 0) + 1)
  }
  const topModels = [...modelMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const weeklyDiscoveryMap = new Map<string, number>()
  const monthlyDiscoveryMap = new Map<string, number>()
  const yearlyDiscoveryMap = new Map<string, number>()
  for (const d of allDevices) {
    if (!d.discoveryDate) continue
    const date = new Date(d.discoveryDate)
    const week = getWeekKey(date)
    weeklyDiscoveryMap.set(week, (weeklyDiscoveryMap.get(week) ?? 0) + 1)
    const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
    monthlyDiscoveryMap.set(month, (monthlyDiscoveryMap.get(month) ?? 0) + 1)
    const year = `${date.getUTCFullYear()}`
    yearlyDiscoveryMap.set(year, (yearlyDiscoveryMap.get(year) ?? 0) + 1)
  }
  const discoveredWeekly = [...weeklyDiscoveryMap.entries()]
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))
  const discoveredMonthly = [...monthlyDiscoveryMap.entries()]
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))
  const discoveredYearly = [...yearlyDiscoveryMap.entries()]
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))

  const registeredWeeklyMap = new Map<string, number>()
  const registeredMonthlyMap = new Map<string, number>()
  const registeredYearlyMap = new Map<string, number>()
  for (const d of allDevices) {
    if (!d.registered) continue
    const date = new Date(d.registered)
    const week = getWeekKey(date)
    registeredWeeklyMap.set(week, (registeredWeeklyMap.get(week) ?? 0) + 1)
    const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
    registeredMonthlyMap.set(month, (registeredMonthlyMap.get(month) ?? 0) + 1)
    const year = `${date.getUTCFullYear()}`
    registeredYearlyMap.set(year, (registeredYearlyMap.get(year) ?? 0) + 1)
  }
  const registeredWeekly = [...registeredWeeklyMap.entries()]
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))
  const registeredMonthly = [...registeredMonthlyMap.entries()]
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))
  const registeredYearly = [...registeredYearlyMap.entries()]
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))

  const discoveredHistorical = [...discoveredMonthly]

  let totalAgeDays = 0
  let ageCount = 0
  let totalLcHours = 0
  let lcCount = 0
  for (const d of allDevices) {
    if (d.discoveryDate) {
      totalAgeDays += (now - new Date(d.discoveryDate).getTime()) / 86_400_000
      ageCount++
    }
    if (d.lastContact) {
      totalLcHours += (now - new Date(d.lastContact).getTime()) / 3_600_000
      lcCount++
    }
  }

  const desyncCutoff = new Date(Date.now() - 48 * 3_600_000)
  const desyncWeeklyMap = new Map<string, number>()
  const desyncMonthlyMap = new Map<string, number>()
  const desyncYearlyMap = new Map<string, number>()
  for (const d of allDevices) {
    if (!d.lastContact) continue
    const lcDate = new Date(d.lastContact)
    if (lcDate >= desyncCutoff) continue
    const week = getWeekKey(lcDate)
    desyncWeeklyMap.set(week, (desyncWeeklyMap.get(week) ?? 0) + 1)
    const month = `${lcDate.getUTCFullYear()}-${String(lcDate.getUTCMonth() + 1).padStart(2, '0')}`
    desyncMonthlyMap.set(month, (desyncMonthlyMap.get(month) ?? 0) + 1)
    const year = `${lcDate.getUTCFullYear()}`
    desyncYearlyMap.set(year, (desyncYearlyMap.get(year) ?? 0) + 1)
  }
  const desyncWeekly = [...desyncWeeklyMap.entries()]
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))
  const desyncMonthly = [...desyncMonthlyMap.entries()]
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))
  const desyncYearly = [...desyncYearlyMap.entries()]
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))

  return new Response(
    JSON.stringify({
      kpis: {
        totalClients,
        activeClients: activeCustomers.length,
        expiredClients: expiredCustomers.length,
        totalDevices,
        onlinePct,
        offlinePct,
        coverageClients,
        discoveredLast30d,
      },
      charts: {
        discoveredWeekly,
        discoveredMonthly,
        discoveredYearly,
        desyncWeekly,
        desyncMonthly,
        desyncYearly,
        registeredWeekly,
        registeredMonthly,
        registeredYearly,
        monitorStatus: [
          { name: 'Online', value: online },
          { name: 'Offline', value: offline },
          { name: 'Unknown', value: unknown },
        ],
        manufacturerDist,
        devicesByCustomer,
        topModels,
        discoveredHistorical,
      },
      extras: {
        avgAgeDays: ageCount ? Math.round(totalAgeDays / ageCount) : null,
        avgLastContactHours: lcCount ? Math.round(totalLcHours / lcCount) : null,
      },
    }),
    { headers: { 'content-type': 'application/json' } },
  )
}

async function handleCustomers(token: string) {
  const customers = await fetchAllCustomers(token)
  return new Response(
    JSON.stringify(customers.map(c => ({ customerId: c.customerId, name: c.name, status: c.status }))),
    { headers: { 'content-type': 'application/json' } },
  )
}

async function handleCustomerDetails(token: string) {
  const customers = await fetchAllCustomers(token)

  const activeCustomers = customers.filter(c => c.status === 'ACTIVE')

  const deviceResults = await Promise.allSettled(
    activeCustomers.map(c => fetchDevices(token, c.customerId)),
  )

  const customerMap = new Map<number, {
    customerId: number
    name: string
    status: string
    createdDate: string | null
    deviceCount: number
  }>()
  for (const c of customers) {
    customerMap.set(c.customerId, {
      customerId: c.customerId,
      name: c.name,
      status: c.status,
      createdDate: c.createdDate ?? null,
      deviceCount: 0,
    })
  }

  const offlineDevices: Record<number, {
    serialNumber: string | null
    model: string | null
    daysSinceLastContact: number | null
    ipAddress: string | null
  }[]> = {}

  const newDevices: Record<number, {
    serialNumber: string | null
    model: string | null
    discoveryDate: string | null
    ipAddress: string | null
  }[]> = {}

  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 86_400_000

  for (const result of deviceResults) {
    if (result.status !== 'fulfilled') continue
    for (const d of result.value) {
      const entry = customerMap.get(d.customerId)
      if (!entry) continue
      entry.deviceCount++

      const model = d.extendedFields?.model ?? null
      const ip = d.ipAddress ?? null

      if (d.discoveryDate) {
        if (new Date(d.discoveryDate).getTime() >= thirtyDaysAgo) {
          ;(newDevices[d.customerId] ??= []).push({
            serialNumber: d.serialNumber,
            model,
            discoveryDate: d.discoveryDate,
            ipAddress: ip,
          })
        }
      }

      if (d.lastContact) {
        const hoursSince = (now - new Date(d.lastContact).getTime()) / 3_600_000
        if (hoursSince > 48) {
          ;(offlineDevices[d.customerId] ??= []).push({
            serialNumber: d.serialNumber,
            model,
            daysSinceLastContact: Math.floor(hoursSince / 24),
            ipAddress: ip,
          })
        }
      }
    }
  }

  return new Response(
    JSON.stringify({
      customers: [...customerMap.values()],
      offlineDevices,
      newDevices,
    }),
    { headers: { 'content-type': 'application/json' } },
  )
}

async function handleCustomerSummary(token: string, url: URL) {
  const customerId = parseInt(url.searchParams.get('customerId') ?? '', 10)
  if (!customerId) {
    return new Response(JSON.stringify({ error: 'customerId required' }), { status: 400, headers: { 'content-type': 'application/json' } })
  }

  const customers = await fetchAllCustomers(token)
  const customer = customers.find(c => c.customerId === customerId)
  if (!customer) {
    return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404, headers: { 'content-type': 'application/json' } })
  }

  const deviceResults = await Promise.allSettled(
    customers.filter(c => c.status === 'ACTIVE').map(c => fetchDevices(token, c.customerId)),
  )
  const allDevices: SDSDevice[] = []
  for (const result of deviceResults) {
    if (result.status === 'fulfilled') result.value.forEach(d => { if (d.customerId === customerId) allDevices.push(d) })
  }

  const now = Date.now()
  const FORTY_EIGHT_H_MS = 48 * 3_600_000
  function isSameUtcDay(iso: string): boolean {
    const d = new Date(iso); const n = new Date()
    return d.getUTCFullYear() === n.getUTCFullYear() && d.getUTCMonth() === n.getUTCMonth() && d.getUTCDate() === n.getUTCDate()
  }
  function isWithin48h(iso: string): boolean {
    return (now - new Date(iso).getTime()) < FORTY_EIGHT_H_MS
  }

  // --- Depuration logic ---
  // Group by serialNumber within this customer to find duplicates
  const serialGroups = new Map<string, SDSDevice[]>()
  const noSerialDevices: SDSDevice[] = []
  for (const d of allDevices) {
    if (d.serialNumber) {
      const group = serialGroups.get(d.serialNumber) ?? []
      group.push(d)
      serialGroups.set(d.serialNumber, group)
    } else {
      noSerialDevices.push(d)
    }
  }

  let duplicateCount = 0
  const depuratedDevices: SDSDevice[] = []

  for (const [, group] of serialGroups) {
    if (group.length === 1) {
      depuratedDevices.push(group[0])
    } else {
      duplicateCount += group.length
      // Pick the valid device from duplicates:
      // 1) Any device with lastContact == today UTC
      // 2) Else the one with most recent lastContact
      // 3) If same lastContact, the one with oldest discoveryDate
      const todayDevices = group.filter(d => d.lastContact && isSameUtcDay(d.lastContact))
      if (todayDevices.length > 0) {
        depuratedDevices.push(todayDevices[0])
      } else {
        const sorted = [...group].sort((a, b) => {
          const aTime = a.lastContact ? new Date(a.lastContact).getTime() : 0
          const bTime = b.lastContact ? new Date(b.lastContact).getTime() : 0
          if (bTime !== aTime) return bTime - aTime
          const aDisc = a.discoveryDate ? new Date(a.discoveryDate).getTime() : Infinity
          const bDisc = b.discoveryDate ? new Date(b.discoveryDate).getTime() : Infinity
          return aDisc - bDisc
        })
        depuratedDevices.push(sorted[0])
      }
    }
  }
  for (const d of noSerialDevices) depuratedDevices.push(d)

  const totalOriginal = allDevices.length
  const totalDepurated = depuratedDevices.length

  // Sync/desync/unknown based on depurated devices (48h rule)
  const online = depuratedDevices.filter(d => d.lastContact && isWithin48h(d.lastContact)).length
  const offline = depuratedDevices.filter(d => d.lastContact && !isWithin48h(d.lastContact)).length
  const unknown = depuratedDevices.filter(d => !d.lastContact).length

  const desyncMonthlyMap = new Map<string, number>()
  for (const d of depuratedDevices) {
    if (!d.lastContact) continue
    const lc = new Date(d.lastContact)
    if (isWithin48h(d.lastContact)) continue
    const month = `${lc.getUTCFullYear()}-${String(lc.getUTCMonth() + 1).padStart(2, '0')}`
    desyncMonthlyMap.set(month, (desyncMonthlyMap.get(month) ?? 0) + 1)
  }
  const desyncTimeline = [...desyncMonthlyMap.entries()]
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))

  const modelMap = new Map<string, number>()
  const firmwareMap = new Map<string, number>()
  const desyncedDevices: { serialNumber: string | null; model: string | null; ipAddress: string | null; daysSinceLastContact: number | null }[] = []
  for (const d of depuratedDevices) {
    const model = d.extendedFields?.model ?? null
    if (model) modelMap.set(model, (modelMap.get(model) ?? 0) + 1)

    const fw = d.extendedFields?.firmware ?? null
    if (fw) firmwareMap.set(fw, (firmwareMap.get(fw) ?? 0) + 1)

    if (d.lastContact && !isWithin48h(d.lastContact)) {
      const lc = new Date(d.lastContact)
      desyncedDevices.push({
        serialNumber: d.serialNumber,
        model,
        ipAddress: d.ipAddress,
        daysSinceLastContact: Math.floor((now - lc.getTime()) / 86_400_000),
      })
    }
  }

  return new Response(
    JSON.stringify({
      customerName: customer.name,
      totalDevices: totalOriginal,
      totalDepurated,
      onlineDevices: online,
      offlineDevices: offline,
      unknownDevices: unknown,
      duplicateCount,
      desyncTimeline,
      topModels: [...modelMap.entries()]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10),
      topFirmware: [...firmwareMap.entries()]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10),
      desyncedDevices: desyncedDevices.sort((a, b) => (b.daysSinceLastContact ?? 0) - (a.daysSinceLastContact ?? 0)),
    }),
    { headers: { 'content-type': 'application/json' } },
  )
}

async function handleAlerts(token: string, supabase: ReturnType<any>) {
  const customers = await fetchAllCustomers(token)
  const activeCustomers = customers.filter(c => c.status === 'ACTIVE')

  const deviceResults = await Promise.allSettled(
    activeCustomers.map(c => fetchDevices(token, c.customerId)),
  )
  const allDevices: SDSDevice[] = []
  for (const result of deviceResults) {
    if (result.status === 'fulfilled') allDevices.push(...result.value)
  }

  const now = new Date()
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000)
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000)

  const oneDayAgo = hoursAgo(24)
  const sevenDaysAgo = daysAgo(7)

  const noContact24h = allDevices.filter(d => d.lastContact && new Date(d.lastContact) < oneDayAgo)
  const noContact7d = allDevices.filter(d => d.lastContact && new Date(d.lastContact) < sevenDaysAgo)
  const neverContacted = allDevices.filter(d => !d.lastContact)

  const serialGroups = new Map<string, typeof allDevices>()
  for (const d of allDevices) {
    if (!d.serialNumber) continue
    const group = serialGroups.get(d.serialNumber) ?? []
    group.push(d)
    serialGroups.set(d.serialNumber, group)
  }
  const duplicateSerials = [...serialGroups.values()].filter(g => g.length > 1).flat()

  function toName(customerId: number): string {
    return customers.find(c => c.customerId === customerId)?.name ?? `ID ${customerId}`
  }

  const { data: timeline } = await supabase
    .from('device_sync_snapshots')
    .select('snapshot_id, customer_name, estado, created_at, device_id, serial_number')
    .gte('created_at', daysAgo(30).toISOString())
    .order('created_at', { ascending: false })

  return new Response(
    JSON.stringify({
      alertCards: {
        noContact24h: noContact24h.length,
        noContact7d: noContact7d.length,
        neverContacted: neverContacted.length,
        duplicateSerials: duplicateSerials.length,
      },
      tables: {
        noContact24h: noContact24h.slice(0, 100).map(d => ({
          customer_name: toName(d.customerId),
          serial_number: d.serialNumber,
          model: d.extendedFields?.model ?? null,
          last_contact: d.lastContact,
          monitor_status: d.monitorStatus,
          ip_address: d.ipAddress,
        })),
        noContact7d: noContact7d.slice(0, 100).map(d => ({
          customer_name: toName(d.customerId),
          serial_number: d.serialNumber,
          model: d.extendedFields?.model ?? null,
          last_contact: d.lastContact,
          monitor_status: d.monitorStatus,
          ip_address: d.ipAddress,
        })),
        neverContacted: neverContacted.slice(0, 100).map(d => ({
          customer_name: toName(d.customerId),
          serial_number: d.serialNumber,
          model: d.extendedFields?.model ?? null,
          registered_date: d.registered,
          monitor_status: d.monitorStatus,
          ip_address: d.ipAddress,
        })),
        duplicateSerials: duplicateSerials.slice(0, 100).map(d => ({
          serial_number: d.serialNumber,
          customer_name: toName(d.customerId),
          device_id: d.deviceId,
          model: d.extendedFields?.model ?? null,
          manufacturer: d.extendedFields?.manufacturer ?? null,
        })),
      },
      timeline: timeline ?? [],
    }),
    { headers: { 'content-type': 'application/json' } },
  )
}

export const config = {
  path: '/api/dashboard',
}
