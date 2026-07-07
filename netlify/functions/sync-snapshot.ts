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

export default async () => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
  const sdsApiKey = process.env.SDS_API_KEY || '';
  const sdsApiSecret = process.env.SDS_API_SECRET || '';

  if (!supabaseUrl || !supabaseKey || !sdsApiKey || !sdsApiSecret) {
    return new Response(
      JSON.stringify({ error: 'Missing env vars' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = await getSdsToken(sdsApiKey, sdsApiSecret);

    const customersRes = await fetch('https://hp-sds-latam.insightportal.net/PortalAPI/api/customers?status=ACTIVE', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!customersRes.ok) throw new Error(`Failed to fetch customers: ${customersRes.statusText}`);
    const customers: CustomerRestDTO[] = await customersRes.json() as CustomerRestDTO[];

    const today = new Date().toISOString().split('T')[0];
    const snapshots: Array<{
      customer_name: string;
      customer_id: number;
      device_id: number;
      serial_number: string | null;
      last_contact: string | null;
      snapshot_date: string;
      estado: string;
      estado_conectividad: string;
      manufacturer: string | null;
      model: string | null;
    }> = [];

    for (const customer of customers) {
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
        const estado = computeConnectivity(device.lastContact);
        snapshots.push({
          customer_name: customer.name,
          customer_id: customer.customerId,
          device_id: device.deviceId,
          serial_number: device.serialNumber || null,
          last_contact: device.lastContact || null,
          snapshot_date: today,
          estado: estado === 'Online' ? 'Sincronizado' : 'Desincronizado',
          estado_conectividad: estado,
          manufacturer: device.extendedFields?.manufacturer || null,
          model: device.extendedFields?.model || null,
        });
      }
    }

    if (snapshots.length > 0) {
      const { error } = await supabase.from('device_sync_snapshots').insert(snapshots);
      if (error) throw new Error(`Supabase insert error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ message: 'Sync completed', customersProcessed: customers.length, snapshotsInserted: snapshots.length }),
      { headers: { 'content-type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
};
