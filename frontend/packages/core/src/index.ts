export interface SimulationConfig {
  agents: number;
  memory: number;
  strategies_per_agent: number;
  rounds: number;
  seed: number;
}
export interface RoundObservation {
  round: number;
  history: number;
  attendance: number;
  minority_side: -1 | 1;
  minority_count: number;
  polarization: number;
  population_force: number;
}
export interface SimulationMetrics {
  mean_attendance: number;
  volatility: number;
  minority_win_rate: number;
  mean_absolute_attendance: number;
  strategy_diversity: number;
  mean_action_entropy: number;
  mean_polarization: number;
}
export interface SimulationResult {
  config: SimulationConfig;
  observations: RoundObservation[];
  metrics: SimulationMetrics;
  attendance_histogram: Array<{ attendance: number; count: number }>;
}
