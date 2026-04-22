export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { TB_EMAIL, TB_PASSWORD, TB_DEVICE_ID } = process.env;
  const TBURL = 'https://thingsboard.cloud';

  const { relay, state } = req.body; // relay: 1 or 2, state: true/false

  const loginRes = await fetch(`${TBURL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: TB_EMAIL, password: TB_PASSWORD }),
  });
  if (!loginRes.ok) return res.status(502).json({ error: 'Login failed' });
  const { token } = await loginRes.json();

  const method = relay === 1 ? 'setRelay1' : 'setRelay2';

  const rpcRes = await fetch(
    `${TBURL}/api/plugins/rpc/oneway/${TB_DEVICE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ method, params: state }),
    }
  );

  if (!rpcRes.ok) {
    const text = await rpcRes.text();
    return res.status(rpcRes.status).json({ error: text });
  }
  return res.status(200).json({ ok: true });
}