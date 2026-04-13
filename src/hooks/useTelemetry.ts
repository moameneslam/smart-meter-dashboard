import { useState, useEffect, useRef, useCallback } from 'react';

export interface Telemetry {
  // Electrical
  voltage: number;       // V RMS
  current: number;       // A RMS
  power: number;         // kW active
  frequency: number;     // Hz
  powerFactor: number;   // 0–1
  energy: number;        // kWh today
  // Load split
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
 */
function mapKeys(raw: Record<string, number>): Partial<Telemetry> {
  const v = raw['voltage'] ?? 0;
  const pL1 = raw['power_L1'] ?? 0;
  const pL2 = raw['power_L2'] ?? 0;
  
  return {
    voltage:      v,
    frequency:    raw['frequency'] ?? 50,
    current:      (raw['current_L1'] ?? 0) + (raw['current_L2'] ?? 0),
    power:        (pL1 + pL2) / 1000, 
    energy:       (raw['energy_L1'] ?? 0) + (raw['energy_L2'] ?? 0),
    powerFactor:  ((raw['power_factor_L1'] ?? 0) + (raw['power_factor_L2'] ?? 0)) / 2,
    load1Power:   pL1 / 1000,
    load2Power:   pL2 / 1000,
    load1Current: raw['current_L1'] ?? 0,
    load2Current: raw['current_L2'] ?? 0,
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

      const flat: Record<string, number> = {};
      let latestTs = 0;

      for (const [key, entries] of Object.entries(json as Record<string, Array<{ ts: number; value: string }>>)) {
        if (Array.isArray(entries) && entries.length > 0) {
          flat[key] = parseFloat(entries[0].value);
          // Find the newest timestamp among all the data points
          if (entries[0].ts > latestTs) {
            latestTs = entries[0].ts;
          }
        }
      }

      const timeDiff = Date.now() - latestTs;
      const isFresh = timeDiff > -60000 && timeDiff < 60000;

      // Add this debug log:
      console.log("Telemetry Debug:", {
        currentTime: new Date(Date.now()).toLocaleTimeString(),
        dataTime: new Date(latestTs).toLocaleTimeString(),
        timeDifferenceMs: timeDiff,
        isFresh: isFresh
      });

      if (isFresh) {
        setData(prev => ({
          ...prev,
          ...mapKeys(flat),
          espOnline: true,
          lastUpdated: new Date(latestTs),
        }));
      } else {
        // If data is stale, zero out all metrics using DEFAULT
        setData(prev => ({
          ...DEFAULT,
          espOnline: false,
          lastUpdated: latestTs > 0 ? new Date(latestTs) : null,
        }));
      }
      
      setError(null);
    } catch (e: any) {
      setError(e.message ?? 'Fetch failed');
      // Zero out on complete fetch failure as well
      setData(prev => ({ ...DEFAULT, espOnline: false, lastUpdated: prev.lastUpdated }));
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
          keys: 'power_L1,power_L2', 
          startTs: String(startTs),
          endTs:   String(endTs),
          interval: String(60 * 60 * 1000),
          agg: 'AVG',
          limit: '24',
        });
        const res  = await fetch(`/api/telemetry-history?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const l1: Record<number, number> = {};
        const l2: Record<number, number> = {};
        
        (json.power_L1 ?? []).forEach((p: { ts: number; value: string }) => {
          l1[p.ts] = parseFloat(p.value) / 1000;
        });
        (json.power_L2 ?? []).forEach((p: { ts: number; value: string }) => {
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
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { history, loading };
}