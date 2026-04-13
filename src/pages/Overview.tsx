import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { useTelemetry, useHistory } from '../hooks/useTelemetry';
import { colors } from '../theme';

const STATIC_DATA = [
  { time: '00:00', load1: 1.2, load2: 0.3 },
  { time: '04:00', load1: 0.9, load2: 0.2 },
  { time: '08:00', load1: 1.4, load2: 0.5 },
  { time: '12:00', load1: 2.1, load2: 0.8 },
  { time: '16:00', load1: 2.2, load2: 0.85 },
  { time: '20:00', load1: 2.0, load2: 0.75 },
  { time: '23:59', load1: 1.2, load2: 0.35 },
];

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ color: colors.muted, fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontSize: 12, margin: '2px 0' }}>
          {p.name}: <strong>{p.value} kW</strong>
        </p>
      ))}
    </div>
  );
};

function fmt(val: number, d = 2) { return isNaN(val) || val === 0 ? '—' : val.toFixed(d); }
function pfLabel(pf: number) {
  if (pf >= 0.95) return 'Excellent';
  if (pf >= 0.90) return 'Good';
  if (pf >= 0.80) return 'Fair';
  return 'Poor';
}

export function Overview() {
  const { data, loading } = useTelemetry(2000);
  const { history } = useHistory();
  const chartData = history.length > 0 ? history : STATIC_DATA;

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <MetricCard label="Total Power"  value={loading ? '…' : fmt(data.power)}      unit="kW"  sub={`PF ${fmt(data.powerFactor, 2)}`}                                           accentColor={colors.accent} />
        <MetricCard label="Voltage"      value={loading ? '…' : fmt(data.voltage, 1)} unit="V"   sub={data.voltage >= 207 && data.voltage <= 253 ? 'Grid nominal' : '⚠ Out of range'} accentColor={colors.green}  />
        <MetricCard label="Frequency"    value={loading ? '…' : fmt(data.frequency, 2)} unit="Hz" sub={Math.abs(data.frequency - 50) < 0.5 ? 'Stable' : '⚠ Deviation'}            accentColor={colors.orange} />
        <MetricCard label="Energy Today" value={loading ? '…' : fmt(data.energy, 2)}  unit="kWh" sub={data.lastUpdated ? `Sync ${data.lastUpdated.toLocaleTimeString('en-GB')}` : 'Waiting…'} accentColor={colors.yellow} />
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '14px 16px', minWidth: 0 }}>
          <p style={{ color: colors.white, fontWeight: 600, fontSize: 14, margin: 0 }}>Power Over Time</p>
          <p style={{ color: colors.muted, fontSize: 11, margin: '4px 0 16px' }}>Load 1 + Load 2 · 24h</p>
          <ResponsiveContainer width="100%" height={440}>
            <AreaChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: -20 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.accent} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={colors.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.yellow} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={colors.yellow} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: colors.muted, fontSize: 9 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.muted, fontSize: 9 }} unit=" kW" />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="load1" name="Load 1" stroke={colors.accent} strokeWidth={2.5} fill="url(#g1)" dot={false} />
              <Area type="monotone" dataKey="load2" name="Load 2" stroke={colors.yellow} strokeWidth={2} fill="url(#g2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ color: colors.muted, fontSize: 11, margin: '0 0 8px' }}>Power Factor</p>
            <p style={{ color: colors.green, fontWeight: 700, fontSize: 36, margin: '0 0 4px' }}>{loading ? '…' : fmt(data.powerFactor, 2)}</p>
            <p style={{ color: colors.green, fontSize: 11, fontWeight: 500, margin: '0 0 10px' }}>{pfLabel(data.powerFactor)}</p>
            <div style={{ height: 6, borderRadius: 3, background: colors.border, overflow: 'hidden' }}>
              <div style={{ width: `${Math.round(data.powerFactor * 100)}%`, height: '100%', background: colors.green, borderRadius: 3, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ color: colors.muted, fontSize: 11, margin: '0 0 12px' }}>Load Breakdown</p>
            {[
              { color: colors.accent, name: 'Load 1', value: loading ? '…' : `${fmt(data.load1Power)} kW` },
              { color: colors.yellow, name: 'Load 2', value: loading ? '…' : `${fmt(data.load2Power)} kW` },
            ].map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, marginRight: 8, flexShrink: 0 }} />
                <span style={{ color: colors.muted, fontSize: 11, flex: 1 }}>{item.name}</span>
                <span style={{ color: colors.white, fontSize: 11, fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
            <div style={{ height: 1, background: colors.border, margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.muted, fontSize: 11 }}>Total</span>
              <span style={{ color: colors.accent, fontSize: 11, fontWeight: 600 }}>{loading ? '…' : `${fmt(data.power)} kW`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
