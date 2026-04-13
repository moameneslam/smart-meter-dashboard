import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { colors } from '../theme';

const monthlyData = [
  { month: 'Oct', load1: 750, load2: 620, cost: 237 },
  { month: 'Nov', load1: 780, load2: 640, cost: 248 },
  { month: 'Dec', load1: 850, load2: 690, cost: 265 },
  { month: 'Jan', load1: 900, load2: 720, cost: 295 },
  { month: 'Feb', load1: 860, load2: 680, cost: 270 },
  { month: 'Mar', load1: 800, load2: 650, cost: 255 },
];

// Heatmap data: 7 days × 24 hours
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const baseIntensity = [
  0.15, 0.1, 0.1, 0.1, 0.2, 0.35, 0.55, 0.7,
  0.65, 0.55, 0.5, 0.45, 0.5, 0.55, 0.6, 0.65,
  0.75, 0.85, 0.9, 0.8, 0.7, 0.55, 0.4, 0.25,
];
const dayFactors = [1.0, 0.95, 1.05, 0.9, 1.1, 0.85, 0.75];

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: colors.surface, border: `1px solid ${colors.border}`,
      borderRadius: 8, padding: '10px 14px',
    }}>
      <p style={{ color: colors.muted, fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill, fontSize: 12, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}{p.unit || ''}</strong>
        </p>
      ))}
    </div>
  );
};

export function Analytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 12 }}>
        <MetricCard label="Avg Daily Usage"    value="52.3" unit="kWh" sub="↓ 8% from last month"    accentColor={colors.accent} />
        <MetricCard label="Peak Demand"        value="5.2"  unit="kW"  sub="Between 06:00–08:00"      accentColor={colors.orange} />
        <MetricCard label="Est. Monthly Cost"  value="142"  unit="EGP" sub="At current rate"           accentColor={colors.yellow} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'flex', gap: 16 }}>
        {/* 6-month consumption bar chart */}
        <div style={{
          flex: 1, background: colors.card, border: `1px solid ${colors.border}`,
          borderRadius: 10, padding: '14px 16px', minWidth: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <p style={{ color: colors.white, fontWeight: 600, fontSize: 14, margin: 0 }}>6-Month Consumption</p>
              <p style={{ color: colors.muted, fontSize: 11, margin: '4px 0 0' }}>Load 1 vs Load 2 · kWh per month</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ color: colors.accent, label: 'Load 1' }, { color: colors.yellow, label: 'Load 2' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                  <span style={{ color: colors.muted, fontSize: 10 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }} barGap={2} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: colors.muted, fontSize: 9 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.muted, fontSize: 9 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="load1" name="Load 1" fill={`${colors.accent}cc`} radius={[3, 3, 0, 0]} />
              <Bar dataKey="load2" name="Load 2" fill={`${colors.yellow}cc`} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly cost chart */}
        <div style={{
          width: 220, flexShrink: 0, background: colors.card,
          border: `1px solid ${colors.border}`, borderRadius: 10, padding: '14px 16px',
        }}>
          <p style={{ color: colors.white, fontWeight: 600, fontSize: 13, margin: 0 }}>Monthly Cost</p>
          <p style={{ color: colors.muted, fontSize: 9, margin: '4px 0 12px' }}>EGP / month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: colors.muted, fontSize: 8 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.muted, fontSize: 8 }} domain={[0, 320]} ticks={[0, 100, 200, 300]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '8px 12px' }}>
                      <p style={{ color: colors.muted, fontSize: 10, margin: 0 }}>{label}</p>
                      <p style={{ color: colors.green, fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{payload[0].value} EGP</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="cost" name="Cost" radius={[3, 3, 0, 0]}>
                {monthlyData.map((entry, i) => (
                  <Cell key={i} fill={`${colors.green}cc`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{
        background: colors.card, border: `1px solid ${colors.border}`,
        borderRadius: 10, padding: '14px 16px',
      }}>
        <p style={{ color: colors.white, fontWeight: 600, fontSize: 14, margin: 0 }}>Usage Heatmap · 24h</p>
        <p style={{ color: colors.muted, fontSize: 11, margin: '4px 0 12px' }}>Hour-by-hour load intensity · darker = higher</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {DAYS.map((day, di) => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: colors.muted, fontSize: 9, width: 24, flexShrink: 0, textAlign: 'right' }}>{day}</span>
              <div style={{ display: 'flex', gap: 2, flex: 1 }}>
                {HOURS.map(h => {
                  const opacity = Math.min(0.92, baseIntensity[h] * dayFactors[di] * 0.85 + 0.05);
                  return (
                    <div
                      key={h}
                      title={`${day} ${String(h).padStart(2, '0')}:00`}
                      style={{
                        flex: 1,
                        height: 22,
                        borderRadius: 3,
                        background: colors.accent,
                        opacity,
                        cursor: 'default',
                        transition: 'opacity 0.15s',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* X-axis labels */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <div style={{ width: 24, flexShrink: 0 }} />
            <div style={{ display: 'flex', flex: 1 }}>
              {[0, 3, 6, 9, 12, 15, 18, 21, 23].map(h => (
                <div key={h} style={{
                  position: 'relative',
                  left: `${(h / 23) * 100}%`,
                  marginLeft: h === 0 ? 0 : undefined,
                }}>
                  <span style={{
                    color: [0, 6, 12, 18].includes(h) ? colors.white : colors.muted,
                    fontSize: 8,
                    whiteSpace: 'nowrap',
                  }}>
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, paddingLeft: 30 }}>
            <span style={{ color: colors.muted, fontSize: 8 }}>Low</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} style={{
                  width: 10, height: 8, borderRadius: 1,
                  background: colors.accent,
                  opacity: (i / 15) * 0.85 + 0.08,
                }} />
              ))}
            </div>
            <span style={{ color: colors.muted, fontSize: 8 }}>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
