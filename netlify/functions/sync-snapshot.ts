import { createClient } from '@supabase/supabase-js';

interface DeviceRestDTO {
  customerId: number;
  serialNumber?: string;
  lastContact?: string;
  deviceId: number;
  ipAddress?: string;
  extendedFields?: {
    manufacturer?: string;
    model?: string;
    zone?: string;
  };
  registered?: string;
  discoveryDate?: string;
}

interface CustomerRestDTO {
  customerId: number;
  name: string;
  status: string;
}

function computeConnectivity(lastContact?: string | null): 'Online' | 'Offline' | 'Unknown' {
  if (!lastContact) return 'Unknown';
  const elapsed = Date.now() - new Date(lastContact).getTime();
  if (elapsed < 48 * 3_600_000) return 'Online';
  return 'Offline';
}

async function getSdsToken(apiKey: string, apiSecret: string): Promise<string> {
  const basic = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const res = await fetch('https://hp-sds-latam.insightportal.net/PortalAPI/login', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) throw new Error(`SDS Auth failed: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

interface SDSDeviceWithStatus extends DeviceRestDTO {
  connectivity: 'Online' | 'Offline' | 'Unknown';
}

const syncSnapshots = async () => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
  const sdsApiKey = process.env.SDS_API_KEY || '';
  const sdsApiSecret = process.env.SDS_API_SECRET || '';

  if (!supabaseUrl || !supabaseKey || !sdsApiKey || !sdsApiSecret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing env vars' }), headers: { 'content-type': 'application/json' } };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = await getSdsToken(sdsApiKey, sdsApiSecret);

    // 1. Traer TODOS los clientes (ACTIVE + EXPIRED)
    const allCustomersRes = await fetch('https://hp-sds-latam.insightportal.net/PortalAPI/api/customers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!allCustomersRes.ok) throw new Error(`Failed to fetch customers: ${allCustomersRes.statusText}`);
    const allCustomers: CustomerRestDTO[] = await allCustomersRes.json() as CustomerRestDTO[];

    const activeCustomers = allCustomers.filter(c => c.status === 'ACTIVE');
    const expiredCustomers = allCustomers.filter(c => c.status === 'EXPIRED');

    const today = new Date().toISOString().split('T')[0];
    const deviceSnapshots: Array<{
      customer_name: string;
      customer_id: number;
      device_id: number;
      serial_number: string | null;
      last_contact: string | null;
      snapshot_date: string;
      estado: string;
    }> = [];

    const allActiveDevices: SDSDeviceWithStatus[] = [];

    for (const customer of activeCustomers) {
      const devicesRes = await fetch(
        `https://hp-sds-latam.insightportal.net/PortalAPI/api/devices?customerId=${customer.customerId}&includeExtendedFields=true`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!devicesRes.ok) {
        console.warn(`Skipping customer ${customer.customerId}: ${devicesRes.statusText}`);
        continue;
      }
      const devices: DeviceRestDTO[] = await devicesRes.json() as DeviceRestDTO[];

      for (const device of devices) {
        const connectivity = computeConnectivity(device.lastContact);
        allActiveDevices.push({ ...device, connectivity });
        deviceSnapshots.push({
          customer_name: customer.name,
          customer_id: customer.customerId,
          device_id: device.deviceId,
          serial_number: device.serialNumber || null,
          last_contact: device.lastContact || null,
          snapshot_date: today,
          estado: connectivity === 'Online' ? 'Sincronizado' : 'Desincronizado',
        });
      }
    }

    // 2. Insertar snapshots de dispositivos
    if (deviceSnapshots.length > 0) {
      const { error } = await supabase.from('device_sync_snapshots').insert(deviceSnapshots);
      if (error) throw new Error(`Supabase insert error: ${error.message}`);
    }

    // 3. Calcular KPIs agregados
    const totalDevices = allActiveDevices.length;
    const online = allActiveDevices.filter(d => d.connectivity === 'Online').length;
    const offline = allActiveDevices.filter(d => d.connectivity === 'Offline').length;
    const onlinePct = totalDevices ? Math.round((online / totalDevices) * 100) : 0;
    const offlinePct = totalDevices ? Math.round((offline / totalDevices) * 100) : 0;

    const thirtyDaysAgo = Date.now() - 30 * 86_400_000;
    const discovered30d = allActiveDevices.filter(d => d.discoveryDate && new Date(d.discoveryDate).getTime() >= thirtyDaysAgo).length;

    const coverageClients = activeCustomers.filter(c => allActiveDevices.some(d => d.customerId === c.customerId && d.lastContact)).length;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 3_600_000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000);

    const noContact24h = allActiveDevices.filter(d => d.lastContact && new Date(d.lastContact) < oneDayAgo).length;
    const noContact7d = allActiveDevices.filter(d => d.lastContact && new Date(d.lastContact) < sevenDaysAgo).length;
    const neverContacted = allActiveDevices.filter(d => !d.lastContact).length;

    const serialGroups = new Map<string, typeof allActiveDevices>();
    for (const d of allActiveDevices) {
      if (!d.serialNumber) continue;
      const group = serialGroups.get(d.serialNumber) ?? [];
      group.push(d);
      serialGroups.set(d.serialNumber, group);
    }
    const duplicateSerials = [...serialGroups.values()].filter(g => g.length > 1).reduce((sum, g) => sum + g.length, 0);

    // 4. Insertar snapshot de KPIs agregados
    const { error: kpiError } = await supabase.from('dashboard_snapshots').insert({
      snapshot_date: today,
      total_clients: allCustomers.length,
      active_clients: activeCustomers.length,
      expired_clients: expiredCustomers.length,
      total_devices: totalDevices,
      online_pct: onlinePct,
      offline_pct: offlinePct,
      coverage_clients: coverageClients,
      discovered_30d: discovered30d,
      no_contact_24h: noContact24h,
      no_contact_7d: noContact7d,
      never_contacted: neverContacted,
      duplicate_serials: duplicateSerials,
    });
    if (kpiError) throw new Error(`Supabase KPI insert error: ${kpiError.message}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Sync completed',
        snapshotsInserted: deviceSnapshots.length,
        kpisSaved: true,
      }),
      headers: { 'content-type': 'application/json' },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      headers: { 'content-type': 'application/json' },
    };
  }
};

export const handler = syncSnapshots;
