import { useState } from 'react';
import { colors } from '../theme';

function SettingsCard({ title, accentColor, children }: {
  title: string; accentColor: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: colors.card, border: `1px solid ${colors.border}`,
      borderRadius: 10, overflow: 'hidden',
    }}>
      <div style={{ height: 3, background: accentColor }} />
      <div style={{ padding: '14px 16px' }}>
        <p style={{ color: colors.white, fontWeight: 600, fontSize: 13, margin: '0 0 16px' }}>{title}</p>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange?: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ color: colors.muted, fontSize: 10, margin: '0 0 6px' }}>{label}</p>
      <input
        value={value}
        onChange={e => onChange?.(e.target.value)}
        readOnly={!onChange}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: colors.surface, border: `1px solid ${colors.border}`,
          borderRadius: 6, padding: '8px 10px',
          color: colors.white, fontSize: 12, fontFamily: 'Inter, sans-serif',
          outline: 'none',
        }}
      />
    </div>
  );
}

function Toggle({ label, sublabel, checked, onChange }: {
  label: string; sublabel?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  const c = checked ? colors.green : colors.border;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 16,
    }}>
      <div>
        <p style={{ color: colors.white, fontSize: 12, fontWeight: 500, margin: 0 }}>{label}</p>
        {sublabel && <p style={{ color: colors.muted, fontSize: 10, margin: '2px 0 0' }}>{sublabel}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10, border: 'none',
          background: c, cursor: 'pointer', position: 'relative',
          flexShrink: 0, marginLeft: 12,
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 2,
          left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: colors.white,
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}

function CurrencyPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p style={{ color: colors.muted, fontSize: 10, margin: '0 0 6px' }}>Currency</p>
      <div style={{ display: 'flex', gap: 6 }}>
        {['USD', 'EGP', 'EUR'].map(c => {
          const active = c === value;
          return (
            <button
              key={c}
              onClick={() => onChange(c)}
              style={{
                flex: 1, height: 28, borderRadius: 6,
                background: active ? `${colors.accent}18` : colors.surface,
                border: `1px solid ${active ? colors.accent : colors.border}`,
                color: active ? colors.accent : colors.muted,
                fontSize: 11, fontWeight: active ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Settings() {
  const [deviceId, setDeviceId] = useState('smart-meter-esp32');
  const [broker, setBroker] = useState('mqtt.thingsboard.cloud');
  const [polling, setPolling] = useState('1s');
  const [vMax, setVMax] = useState('240');
  const [iMax, setIMax] = useState('20');
  const [pfMin, setPfMin] = useState('0.90');

  const [pushNotif, setPushNotif] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [mqttAlert, setMqttAlert] = useState(true);
  const [overloadAlert, setOverloadAlert] = useState(true);

  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [currency, setCurrency] = useState('EGP');

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Device */}
        <SettingsCard title="Device" accentColor={colors.accent}>
          <Field label="Device ID"       value={deviceId} onChange={setDeviceId} />
          <Field label="MQTT Broker"     value={broker}   onChange={setBroker} />
          <Field label="Polling Interval" value={polling}  onChange={setPolling} />
        </SettingsCard>

        {/* Thresholds */}
        <SettingsCard title="Thresholds" accentColor={colors.yellow}>
          <Field label="Voltage Max (V)"  value={vMax}  onChange={setVMax} />
          <Field label="Current Max (A)"  value={iMax}  onChange={setIMax} />
          <Field label="PF Minimum"       value={pfMin} onChange={setPfMin} />
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard title="Notifications" accentColor={colors.orange}>
          <Toggle label="Push Notifications"  sublabel="Browser & mobile alerts"     checked={pushNotif}     onChange={setPushNotif} />
          <Toggle label="Email Digest"        sublabel="Daily usage summary"          checked={emailDigest}   onChange={setEmailDigest} />
          <Toggle label="MQTT Disconnect"     sublabel="Alert when ESP goes offline"  checked={mqttAlert}     onChange={setMqttAlert} />
          <Toggle label="Overload Alerts"     sublabel="Immediate current spike"      checked={overloadAlert} onChange={setOverloadAlert} />
        </SettingsCard>

        {/* Display */}
        <SettingsCard title="Display & Data" accentColor={colors.blue}>
          <Toggle label="Dark Mode"    sublabel="Current theme"    checked={darkMode}    onChange={setDarkMode} />
          <Toggle label="Compact View" sublabel="Reduced spacing"  checked={compactView} onChange={setCompactView} />
          <div style={{ height: 1, background: colors.border, margin: '8px 0 14px' }} />
          <CurrencyPicker value={currency} onChange={setCurrency} />
        </SettingsCard>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{
          padding: '10px 28px', borderRadius: 8,
          background: `${colors.accent}18`,
          border: `1px solid ${colors.accent}`,
          color: colors.accent, fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          transition: 'background 0.15s',
        }}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
