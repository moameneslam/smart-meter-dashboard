import { colors } from '../theme';

const TABS = ['Overview', 'Loads', 'Analytics', 'Settings'] as const;
export type Tab = typeof TABS[number];

interface TopNavProps {
  active: Tab;
  onTabChange: (tab: Tab) => void;
  espOnline: boolean;
  lastSync: string;
}

export function TopNav({ active, onTabChange, espOnline, lastSync }: TopNavProps) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      height: 52,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 24,
      paddingRight: 24,
      gap: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 32, flexShrink: 0 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: colors.accent }} />
        <span style={{ color: colors.white, fontWeight: 600, fontSize: 14 }}>NexaGrid</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'stretch', height: 52, flex: 1 }}>
        {TABS.map(tab => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                position: 'relative',
                padding: '0 20px',
                background: isActive ? `${colors.accent}0f` : 'transparent',
                border: 'none',
                color: isActive ? colors.accent : colors.muted,
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'color 0.15s, background 0.15s',
              }}
            >
              {tab}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: colors.accent,
                  borderRadius: '2px 2px 0 0',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ESP Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: espOnline ? colors.green : colors.red,
          boxShadow: `0 0 6px ${espOnline ? colors.green : colors.red}`,
        }} />
        <span style={{ color: espOnline ? colors.green : colors.red, fontSize: 11 }}>
          ESP32 {espOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </nav>
  );
}
