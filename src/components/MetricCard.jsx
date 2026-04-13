import { colors } from '../theme';

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  sub?: string;
  accentColor: string;
}

export function MetricCard({ label, value, unit, sub, accentColor }: MetricCardProps) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: 10,
      overflow: 'hidden',
      flex: 1,
      minWidth: 0,
      padding: '14px 16px 12px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: accentColor, borderRadius: '2px 2px 0 0',
      }} />
      <p style={{ color: colors.muted, fontSize: 11, margin: 0, marginTop: 4 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, margin: '8px 0 4px' }}>
        <span style={{ color: colors.white, fontWeight: 700, fontSize: 28 }}>{value}</span>
        <span style={{ color: colors.muted, fontSize: 13 }}>{unit}</span>
      </div>
      {sub && <p style={{ color: colors.muted, fontSize: 11, margin: 0 }}>{sub}</p>}
    </div>
  );
}
