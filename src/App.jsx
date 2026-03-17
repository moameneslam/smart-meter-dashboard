import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// --- Fake data for now (we'll replace with Thingsboard API later) ---
const generateFakeHistory = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    time: `${i * 2}:00`,
    voltage: (220 + Math.random() * 10 - 5).toFixed(1),
    current_L1: (2 + Math.random()).toFixed(2),
    current_L2: (1.5 + Math.random()).toFixed(2),
    power_L1: (440 + Math.random() * 50).toFixed(1),
    power_L2: (330 + Math.random() * 50).toFixed(1),
  }));
};

// --- Stat Card Component ---
function StatCard({ title, value, unit, color }) {
  return (
    <div className={`bg-white rounded-2xl shadow p-5 border-l-4 ${color}`}>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">
        {value} <span className="text-lg font-medium text-gray-400">{unit}</span>
      </p>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [live, setLive] = useState({
    voltage: 220.4,
    current_L1: 2.31,
    current_L2: 1.85,
    power_L1: 508.2,
    power_L2: 407.0,
    energy_L1: 0.142,
    energy_L2: 0.098,
  });

  const [history, setHistory] = useState(generateFakeHistory());

  // Simulate live updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLive({
        voltage: (220 + Math.random() * 10 - 5).toFixed(1),
        current_L1: (2 + Math.random()).toFixed(2),
        current_L2: (1.5 + Math.random()).toFixed(2),
        power_L1: (440 + Math.random() * 50).toFixed(1),
        power_L2: (330 + Math.random() * 50).toFixed(1),
        energy_L1: (0.1 + Math.random() * 0.1).toFixed(3),
        energy_L2: (0.08 + Math.random() * 0.1).toFixed(3),
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalPower = (parseFloat(live.power_L1) + parseFloat(live.power_L2)).toFixed(1);
  const totalEnergy = (parseFloat(live.energy_L1) + parseFloat(live.energy_L2)).toFixed(3);

  const loadComparison = [
    { name: "Load 1", power: parseFloat(live.power_L1), energy: parseFloat(live.energy_L1) },
    { name: "Load 2", power: parseFloat(live.power_L2), energy: parseFloat(live.energy_L2) },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">⚡ Smart Meter Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Live monitoring — updates every 3 seconds</p>
      </div>

      {/* Live Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Voltage" value={live.voltage} unit="V" color="border-yellow-400" />
        <StatCard title="Total Power" value={totalPower} unit="W" color="border-blue-500" />
        <StatCard title="Power — Load 1" value={live.power_L1} unit="W" color="border-green-500" />
        <StatCard title="Power — Load 2" value={live.power_L2} unit="W" color="border-purple-500" />
      </div>

      {/* Current Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Current — Load 1" value={live.current_L1} unit="A" color="border-green-400" />
        <StatCard title="Current — Load 2" value={live.current_L2} unit="A" color="border-purple-400" />
        <StatCard title="Energy — Load 1" value={live.energy_L1} unit="kWh" color="border-orange-400" />
        <StatCard title="Energy — Load 2" value={live.energy_L2} unit="kWh" color="border-red-400" />
      </div>

      {/* Total Energy */}
      <div className="bg-white rounded-2xl shadow p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Total Energy Consumed</p>
          <p className="text-4xl font-bold text-gray-800 mt-1">
            {totalEnergy} <span className="text-xl text-gray-400">kWh</span>
          </p>
        </div>
        <div className="text-6xl">🔋</div>
      </div>

      {/* Historical Chart */}
      <div className="bg-white rounded-2xl shadow p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📈 Power History</h2>
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

      {/* Load Comparison */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📊 Load Comparison</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={loadComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="power" fill="#3b82f6" name="Power (W)" />
            <Bar dataKey="energy" fill="#f97316" name="Energy (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}