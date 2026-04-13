import { useState, useEffect, useRef, useCallback } from 'react';

export interface Telemetry {
  // Electrical
  voltage: number;       // V RMS
  current: number;       // A RMS
  power: number;         // kW active
  frequency: number;     // Hz
  powerFactor: number;   // 0–1
  energy: number;        // kWh today
  // Load split (if your ESP publishes per-load keys)
  load1Power: number;
  load2Power: number;
  load1Current: number;
  load2Current: number;
  // Status
  espOnline: boolean;
  lastUpdated: Date | null;
}

const DEFAULT: Telemetry = {
  voltage: 0, current: 0, power: 0, frequency: 0,
  powerFactor: 0, energy: 0,
  load1Power: 0, load2Power: 0,
  load1Current: 0, load2Current: 0,
  espOnline: false, lastUpdated: null,
};

/**
 * Maps Thingsboard telemetry key names to our Telemetry fields.
 * Adjust these to match whatever keys your ESP32 firmware publishes.
 */
function mapKeys(raw: Record<string, number>): Partial<Telemetry> {
  return {
    voltage:      raw['rms_voltage']    ?? raw['voltage']      ?? 0,
    current:      raw['rms_current']    ?? raw['current']      ?? 0,
    power:        (raw['active_power']  ?? raw['power']        ?? 0) / 1000, // W → kW
    frequency:    raw['frequency']      ?? 50,
    powerFactor:  raw['power_factor']   ?? raw['pf']           ?? 0,
    energy:       raw['energy_kwh']     ?? raw['energy']       ?? 0,
    load1Power:   (raw['load1_power']   ?? raw['load1_w']      ?? 0) / 1000,
    load2Power:   (raw['load2_power']   ?? raw['load2_w']      ?? 0) / 1000,
    load1Current: raw['load1_current']  ?? raw['load1_a']      ?? 0,
    load2Current: raw['load2_current']  ?? raw['load2_a']      ?? 0,
  };
}

export function useTelemetry(intervalMs = 2000) {
  const [data, setData] = useState<Telemetry>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/telemetry');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // Thingsboard returns { keyName: [{ ts, value }] }
      // Flatten to { keyName: latestValue }
      const flat: Record<string, number> = {};
      for (const [key, entries] of Object.entries(json as Record<string, Array<{ ts: number; value: string }>>)) {
        if (Array.isArray(entries) && entries.length > 0) {
          flat[key] = parseFloat(entries[0].value);
        }
      }

      setData(prev => ({
        ...prev,
        ...mapKeys(flat),
        espOnline: true,
        lastUpdated: new Date(),
      }));
      setError(null);
    } catch (e: any) {
      setError(e.message ?? 'Fetch failed');
      setData(prev => ({ ...prev, espOnline: false }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchData, intervalMs]);

  return { data, loading, error, refetch: fetchData };
}

// ── History hook (last 24 h for the chart) ──────────────────────────────────
export interface HistoryPoint {
  time: string;
  load1: number;
  load2: number;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const endTs   = Date.now();
        const startTs = endTs - 24 * 60 * 60 * 1000;
        const params  = new URLSearchParams({
          keys: 'load1_power,load2_power',
          startTs: String(startTs),
          endTs:   String(endTs),
          interval: String(60 * 60 * 1000), // 1-hour buckets
          agg: 'AVG',
          limit: '24',
        });
        const res  = await fetch(`/api/telemetry/history?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Build time series — merge load1 and load2 by timestamp
        const l1: Record<number, number> = {};
        const l2: Record<number, number> = {};
        (json.load1_power ?? []).forEach((p: { ts: number; value: string }) => {
          l1[p.ts] = parseFloat(p.value) / 1000;
        });
        (json.load2_power ?? []).forEach((p: { ts: number; value: string }) => {
          l2[p.ts] = parseFloat(p.value) / 1000;
        });

        const timestamps = Array.from(new Set([...Object.keys(l1), ...Object.keys(l2)]))
          .map(Number).sort();

        const points = timestamps.map(ts => ({
          time: new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          load1: +(l1[ts] ?? 0).toFixed(2),
          load2: +(l2[ts] ?? 0).toFixed(2),
        }));

        setHistory(points);
      } catch {
        // Keep empty — chart stays blank until data arrives
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { history, loading };
}
