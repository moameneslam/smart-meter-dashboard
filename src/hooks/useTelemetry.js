function mapKeys(raw) {
  return {
    voltage:      raw['voltage']          ?? 0,
    current:     (raw['current_L1']       ?? 0) + (raw['current_L2'] ?? 0),
    power:       ((raw['power_L1']        ?? 0) + (raw['power_L2']   ?? 0)) / 1000,
    frequency:    raw['frequency']        ?? 50,
    powerFactor: (raw['power_factor_L1']  ?? 0 + (raw['power_factor_L2'] ?? 0)) / 2,
    energy:      (raw['energy_L1']        ?? 0) + (raw['energy_L2']  ?? 0),
    load1Power:   (raw['power_L1']        ?? 0) / 1000,
    load2Power:   (raw['power_L2']        ?? 0) / 1000,
    load1Current:  raw['current_L1']      ?? 0,
    load2Current:  raw['current_L2']      ?? 0,
    load1PF:       raw['power_factor_L1'] ?? 0,
    load2PF:       raw['power_factor_L2'] ?? 0,
    load1Energy:   raw['energy_L1']       ?? 0,
    load2Energy:   raw['energy_L2']       ?? 0,
  }
}