import { useState } from 'react';
import { useTelemetry } from '../hooks/useTelemetry';
import { colors } from '../theme';

type LoadState = 'online' | 'overload' | 'offline';
type EspState  = 'online' | 'offline';

function LedDot({ color, active }: { color: string; active: boolean }) {
  return (
    <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
      {active && <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: color, opacity: 0.22 }} />}
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, opacity: active ? 1 : 0.18, boxShadow: active ? `0 0 6px ${color}` : 'none' }} />
    </div>
  );
}

function Toggle({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  const c = isOn ? colors.green : colors.red;
  return (
    <button onClick={onToggle} style={{ width: '100%', height: 42, background: `${c}18`, border: `1.5px solid ${c}`, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', transition: 'all 0.2s' }}>
      <div style={{ width: 36, height: 20, borderRadius: 10, background: isOn ? colors.green : colors.border, position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
        <div style={{ position: 'absolute', top: 2, left: isOn ? 16 : 2, width: 16, height: 16, borderRadius: '50%', background: colors.white, transition: 'left 0.2s' }} />
      </div>
      <span style={{ color: c, fontWeight: 600, fontSize: 14 }}>{isOn ? 'Turn OFF' : 'Turn ON'}</span>
    </button>
  );
}

interface LoadCardProps {
  num: number;
  state: LoadState;
  espState: EspState;
  isOn: boolean;
  onToggle: () => void;
  voltage: string;
  current: string;
  power: string;
  frequency: string;
  pf: string;
  pfLabel: string;
  loading: boolean;
}

function LoadCard({ num, state, espState, isOn, onToggle, voltage, current, power, frequency, pf, pfLabel, loading }: LoadCardProps) {
  const stateColor = { online: colors.green, overload: colors.yellow, offline: colors.red }[state];
  const stateLabel = { online: 'Online', overload: 'Overload', offline: 'Offline' }[state];

  return (
    <div style={{ flex: 1, background: colors.card, border: `1px solid ${stateColor}66`, borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 3, background: stateColor }} />
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: colors.white, fontWeight: 600, fontSize: 18, margin: 0 }}>Load {num}</p>
            <p style={{ color: colors.muted, fontSize: 10, margin: '2px 0 0' }}>Circuit {num} · 220V AC</p>
          </div>
          <div style={{ padding: '4px 10px', borderRadius: 6, background: `${stateColor}18`, border: `1px solid ${stateColor}` }}>
            <span style={{ color: stateColor, fontSize: 10, fontWeight: 600 }}>● {stateLabel}</span>
          </div>
        </div>

        <div style={{ background: colors.surface, borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 0 }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: colors.muted, fontSize: 9, fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Load Status</p>
            {([
              { color: colors.red,    label: 'Offline',  active: state === 'offline' },
              { color: colors.yellow, label: 'Overload', active: state === 'overload' },
              { color: colors.green,  label: 'Online',   active: state === 'online' },
            ] as const).map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <LedDot color={l.color} active={l.active} />
                <span style={{ color: l.active ? l.color : '#50606A', fontSize: 10, fontWeight: l.active ? 500 : 400 }}>{l.label}</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, paddingLeft: 12, borderLeft: `1px solid ${colors.border}` }}>
            <p style={{ color: colors.muted, fontSize: 9, fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>ESP32</p>
            {([
              { color: colors.orange, label: 'Offline', active: espState === 'offline' },
              { color: colors.blue,   label: 'Online',  active: espState === 'online' },
            ] as const).map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <LedDot color={l.color} active={l.active} />
                <span style={{ color: l.active ? l.color : colors.muted, fontSize: 10, fontWeight: l.active ? 500 : 400 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {[{ label: 'Voltage', value: voltage }, { label: 'Current', value: current }, { label: 'Power', value: power }].map(m => (
            <div key={m.label} style={{ flex: 1, background: colors.surface, borderRadius: 6, padding: '8px 10px' }}>
              <p style={{ color: colors.muted, fontSize: 9, margin: '0 0 4px' }}>{m.label}</p>
              <p style={{ color: loading ? colors.muted : colors.white, fontSize: 13, fontWeight: 600, margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: colors.surface, borderRadius: 6, padding: '8px 10px' }}>
            <p style={{ color: colors.muted, fontSize: 9, margin: '0 0 4px' }}>Frequency</p>
            <p style={{ color: colors.orange, fontSize: 13, fontWeight: 600, margin: 0 }}>{frequency}</p>
          </div>
          <div style={{ flex: 1, background: colors.surface, borderRadius: 6, padding: '8px 10px' }}>
            <p style={{ color: colors.muted, fontSize: 9, margin: '0 0 4px' }}>Power Factor</p>
            <p style={{ color: colors.green, fontSize: 13, fontWeight: 600, margin: 0 }}>{pf}</p>
            <p style={{ color: colors.green, fontSize: 9, margin: '2px 0 0' }}>{pfLabel}</p>
          </div>
        </div>

        <Toggle isOn={isOn} onToggle={onToggle} />
      </div>
    </div>
  );
}

function getPfLabel(pf: number) {
  if (pf >= 0.95) return 'Excellent';
  if (pf >= 0.90) return 'Good';
  if (pf >= 0.80) return 'Fair';
  return 'Poor';
}

function getLoadState(current: number, maxCurrent = 16): LoadState {
  if (current <= 0) return 'offline';
  if (current > maxCurrent * 0.9) return 'overload';
  return 'online';
}

function fmt(val: number, d = 2, unit = '') {
  if (isNaN(val) || val === 0) return '—';
  return `${val.toFixed(d)}${unit ? ' ' + unit : ''}`;
}

export function Loads() {
  const { data, loading } = useTelemetry(2000);
  const [load1On, setLoad1On] = useState(true);
  const [load2On, setLoad2On] = useState(true);

  const espState: 'online' | 'offline' = data.espOnline ? 'online' : 'offline';

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <LoadCard
        num={1}
        state={getLoadState(data.load1Current)}
        espState={espState}
        isOn={load1On}
        onToggle={() => setLoad1On(v => !v)}
        voltage={fmt(data.voltage, 1, 'V')}
        current={fmt(data.load1Current, 2, 'A')}
        power={fmt(data.load1Power, 2, 'kW')}
        frequency={fmt(data.frequency, 2, 'Hz')}
        pf={fmt(data.powerFactor, 2)}
        pfLabel={getPfLabel(data.powerFactor)}
        loading={loading}
      />
      <LoadCard
        num={2}
        state={getLoadState(data.load2Current)}
        espState={espState}
        isOn={load2On}
        onToggle={() => setLoad2On(v => !v)}
        voltage={fmt(data.voltage, 1, 'V')}
        current={fmt(data.load2Current, 2, 'A')}
        power={fmt(data.load2Power, 2, 'kW')}
        frequency={fmt(data.frequency, 2, 'Hz')}
        pf={fmt(data.powerFactor, 2)}
        pfLabel={getPfLabel(data.powerFactor)}
        loading={loading}
      />
    </div>
  );
}
