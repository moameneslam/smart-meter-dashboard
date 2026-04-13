// api/telemetry-history.js
// Proxies Thingsboard timeseries history requests to avoid CORS and hide credentials.
// Deploy alongside your existing api/telemetry.js on Vercel.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { TB_EMAIL, TB_PASSWORD, TB_DEVICE_ID } = process.env;
  const TBURL = 'https://thingsboard.cloud';

  // Step 1 – get a JWT token
  const loginRes = await fetch(`${TBURL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: TB_EMAIL, password: TB_PASSWORD }),
  });
  if (!loginRes.ok) {
    return res.status(502).json({ error: 'Thingsboard login failed' });
  }
  const { token } = await loginRes.json();

  // Step 2 – proxy the timeseries history request
  const { keys, startTs, endTs, interval, agg, limit } = req.query;
  const params = new URLSearchParams({ keys, startTs, endTs, interval, agg, limit });

  const tbRes = await fetch(
    `${TBURL}/api/plugins/telemetry/DEVICE/${TB_DEVICE_ID}/values/timeseries?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!tbRes.ok) {
    return res.status(tbRes.status).json({ error: 'Thingsboard request failed' });
  }

  const data = await tbRes.json();
  return res.status(200).json(data);
}
