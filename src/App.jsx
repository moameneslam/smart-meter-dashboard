import { useState } from 'react';
import { TopNav, type Tab } from './components/TopNav';
import { Overview }  from './pages/Overview';
import { Loads }     from './pages/Loads';
import { Analytics } from './pages/Analytics';
import { Settings }  from './pages/Settings';
import { useTelemetry } from './hooks/useTelemetry';
import { colors } from './theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const { data } = useTelemetry(2000);

  const renderTab = () => {
    switch (activeTab) {
      case 'Overview':  return <Overview />;
      case 'Loads':     return <Loads />;
      case 'Analytics': return <Analytics />;
      case 'Settings':  return <Settings />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: 'Inter, system-ui, sans-serif', color: colors.white }}>
      <TopNav active={activeTab} onTabChange={setActiveTab} espOnline={data.espOnline} lastSync={data.lastUpdated ? data.lastUpdated.toLocaleTimeString('en-GB') : '—'} />

      <main style={{ paddingTop: 52 + 16, paddingBottom: 48 + 16, paddingLeft: 24, paddingRight: 24 }}>
        {renderTab()}
      </main>

      <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 48, background: colors.surface, borderTop: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <span style={{ color: colors.muted, fontSize: 11 }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · Last sync {data.lastUpdated ? data.lastUpdated.toLocaleTimeString('en-GB') : '—'}
        </span>
        <span style={{ color: colors.muted, fontSize: 11 }}>
          smart-meter-esp32 · Thingsboard Cloud · MQTT
        </span>
      </footer>
    </div>
  );
}
