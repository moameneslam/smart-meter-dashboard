export default async function handler(req, res) {
  const EMAIL = process.env.TB_EMAIL;
  const PASSWORD = process.env.TB_PASSWORD;
  const DEVICE_ID = process.env.TB_DEVICE_ID;
  const KEYS = "voltage,current_L1,current_L2,power_L1,power_L2,energy_L1,energy_L2,power_factor_L1,power_factor_L2,frequency";

  try {
    const loginRes = await fetch("https://thingsboard.cloud/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: EMAIL, password: PASSWORD })
    });
    const { token } = await loginRes.json();

    const { startTs, endTs } = req.query;
    let url = `https://thingsboard.cloud/api/plugins/telemetry/DEVICE/${DEVICE_ID}/values/timeseries?keys=${KEYS}`;
    if (startTs && endTs) url += `&startTs=${startTs}&endTs=${endTs}&limit=20&agg=NONE`;

    const dataRes = await fetch(url, {
      headers: { "X-Authorization": `Bearer ${token}` }
    });
    const data = await dataRes.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}