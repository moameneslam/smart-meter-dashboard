import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

async function fetchLatest() {
  const res = await fetch(`/api/telemetry`);
  return res.json();
}

async function fetchHistory() {
  const endTs = Date.now();
  const startTs = endTs - 60 * 60 * 1000;
  const res = await fetch(`/api/telemetry?startTs=${startTs}&endTs=${endTs}`);
  return res.json();
}

function StatCard({ title, value, unit, color }) {
  return (
    <div className={`bg-white rounded-2xl shadow p-5 border-l-4 ${color}`}>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">
        {value ?? "..."} <span className="text-lg font-medium text-gray-400">{unit}</span>
      </p>
    </div>
  );
}

export default function App() {
  const [live, setLive] = useState({});
  const [history, setHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const loadLatest = async () => {
    try {
      const data = await fetchLatest();
      setLive({
        voltage:    parseFloat(data.voltage?.[0]?.value ?? 0).toFixed(1),
        current_L1: parseFloat(data.current_L1?.[0]?.value ?? 0).toFixed(2),
        current_L2: parseFloat(data.current_L2?.[0]?.value ?? 0).toFixed(2),
        power_L1:   parseFloat(data.power_L1?.[0]?.value ?? 0).toFixed(1),
        power_L2:   parseFloat(data.power_L2?.[0]?.value ?? 0).toFixed(1),
        energy_L1:  parseFloat(data.energy_L1?.[0]?.value ?? 0).toFixed(3),
        energy_L2:  parseFloat(data.energy_L2?.[0]?.value ?? 0).toFixed(3),
      });
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError("Failed to fetch data from Thingsboard");
    }
  };

  const loadHistory = async () => {
    try {
      const data = await fetchHistory();
      const power_L1 = data.power_L1 ?? [];
      const power_L2 = data.power_L2 ?? [];
      const merged = power_L1.map((p, i) => ({
        time: new Date(p.ts).toLocaleTimeString(),
        power_L1: parseFloat(p.value).toFixed(1),
        power_L2: parseFloat(power_L2[i]?.value ?? 0).toFixed(1),
      })).reverse();
      setHistory(merged);
    } catch (err) {
      console.error("History fetch failed", err);
    }
  };

  useEffect(() => {
    loadLatest();
    loadHistory();
    const interval = setInterval(() => {
      loadLatest();
      loadHistory();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalPower = (parseFloat(live.power_L1 ?? 0) + parseFloat(live.power_L2 ?? 0)).toFixed(1);
  const totalEnergy = (parseFloat(live.energy_L1 ?? 0) + parseFloat(live.energy_L2 ?? 0)).toFixed(3);

  const loadComparison = [
    { name: "Load 1", power: parseFloat(live.power_L1 ?? 0), energy: parseFloat(live.energy_L1 ?? 0) },
    { name: "Load 2", power: parseFloat(live.power_L2 ?? 0), energy: parseFloat(live.energy_L2 ?? 0) },
  ];

  if (!lastUpdated && !error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚡</div>
          <p className="text-gray-500 text-lg">Connecting to NexaGrid...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">⚡ NexaGrid Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {error
              ? <span className="text-red-500">{error}</span>
              : `Last updated: ${lastUpdated}`}
          </p>
        </div>
        <button
          onClick={() => { loadLatest(); loadHistory(); }}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Voltage"        value={live.voltage}   unit="V"  color="border-yellow-400" />
        <StatCard title="Total Power"    value={totalPower}     unit="W"  color="border-blue-500" />
        <StatCard title="Power — Load 1" value={live.power_L1}  unit="W"  color="border-green-500" />
        <StatCard title="Power — Load 2" value={live.power_L2}  unit="W"  color="border-purple-500" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Current — Load 1" value={live.current_L1} unit="A"   color="border-green-400" />
        <StatCard title="Current — Load 2" value={live.current_L2} unit="A"   color="border-purple-400" />
        <StatCard title="Energy — Load 1"  value={live.energy_L1}  unit="kWh" color="border-orange-400" />
        <StatCard title="Energy — Load 2"  value={live.energy_L2}  unit="kWh" color="border-red-400" />
      </div>

      <div className="bg-white rounded-2xl shadow p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Total Energy Consumed</p>
          <p className="text-4xl font-bold text-gray-800 mt-1">
            {totalEnergy} <span className="text-xl text-gray-400">kWh</span>
          </p>
        </div>
        <div className="text-6xl">🔋</div>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📈 Power History (last 1 hour)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="power_L1" stroke="#22c55e" name="Load 1 (W)" dot={false} />
            <Line type="monotone" dataKey="power_L2" stroke="#a855f7" name="Load 2 (W)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📊 Load Comparison</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={loadComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="power"  fill="#3b82f6" name="Power (W)" />
            <Bar dataKey="energy" fill="#f97316" name="Energy (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}