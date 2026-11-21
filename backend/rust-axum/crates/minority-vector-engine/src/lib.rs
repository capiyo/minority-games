//! Deterministic, side-effect-free Minority Game simulation engine.

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationConfig {
    pub agents: usize,
    pub memory: usize,
    pub strategies_per_agent: usize,
    pub rounds: usize,
    pub seed: u64,
}

impl Default for SimulationConfig {
    fn default() -> Self {
        Self { agents: 101, memory: 3, strategies_per_agent: 2, rounds: 500, seed: 7 }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoundObservation {
    pub round: usize,
    pub history: usize,
    pub attendance: i64,
    pub minority_side: i8,
    pub minority_count: usize,
    pub polarization: f64,
    pub population_force: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationMetrics {
    pub mean_attendance: f64,
    pub volatility: f64,
    pub mean_minority_share: f64,
    pub mean_absolute_attendance: f64,
    pub strategy_diversity: f64,
    pub mean_action_entropy: f64,
    pub mean_polarization: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationResult {
    pub config: SimulationConfig,
    pub observations: Vec<RoundObservation>,
    pub metrics: SimulationMetrics,
    pub attendance_histogram: Vec<AttendanceBucket>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttendanceBucket {
    pub attendance: i64,
    pub count: usize,
}

#[derive(Debug, Error, PartialEq)]
pub enum SimulationError {
    #[error("agent count must be odd and in 3..=10001")]
    InvalidAgentCount,
    #[error("memory must be in 1..=16")]
    InvalidMemory,
    #[error("strategies per agent must be in 2..=16")]
    InvalidStrategyCount,
    #[error("rounds must be in 1..=100000")]
    InvalidRounds,
}

#[derive(Clone)]
struct Strategy {
    actions: Vec<i8>,
    virtual_score: i64,
}

#[derive(Clone)]
struct Agent {
    strategies: Vec<Strategy>,
}

#[derive(Clone, Copy)]
struct SplitMix64(u64);

impl SplitMix64 {
    fn next(&mut self) -> u64 {
        self.0 = self.0.wrapping_add(0x9E3779B97F4A7C15);
        let mut z = self.0;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58476D1CE4E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D049BB133111EB);
        z ^ (z >> 31)
    }
}

pub fn simulate(config: SimulationConfig) -> Result<SimulationResult, SimulationError> {
    validate(&config)?;
    let states = 1usize << config.memory;
    let mut rng = SplitMix64(config.seed);
    let mut agents = Vec::with_capacity(config.agents);

    for _ in 0..config.agents {
        let mut strategies = Vec::with_capacity(config.strategies_per_agent);
        for _ in 0..config.strategies_per_agent {
            let actions = (0..states)
                .map(|_| if rng.next() & 1 == 0 { -1 } else { 1 })
                .collect();
            strategies.push(Strategy { actions, virtual_score: 0 });
        }
        agents.push(Agent { strategies });
    }

    let mut history = (config.seed as usize) & (states - 1);
    let mut observations = Vec::with_capacity(config.rounds);
    let mut histogram = std::collections::BTreeMap::<i64, usize>::new();
    let mut attendance_sum = 0.0;
    let mut attendance_sq_sum = 0.0;
    let mut abs_sum = 0.0;
    let mut polarization_sum = 0.0;
    let mut minority_share_sum = 0.0;
    let mut entropy_sum = 0.0;
    let mut selected = std::collections::BTreeSet::<(usize, usize)>::new();

    for round in 0..config.rounds {
        let mut actions = Vec::with_capacity(config.agents);
        let mut selected_indices = Vec::with_capacity(config.agents);
        let mut attendance = 0i64;

        for (agent_index, agent) in agents.iter().enumerate() {
            let best = agent.strategies.iter().enumerate()
                .max_by(|(ia, a), (ib, b)| a.virtual_score.cmp(&b.virtual_score).then_with(|| ib.cmp(ia)))
                .map(|(index, _)| index)
                .expect("validated non-empty strategy set");
            let action = agent.strategies[best].actions[history];
            actions.push(action);
            selected_indices.push(best);
            attendance += i64::from(action);
            selected.insert((agent_index, best));
        }

        // Odd population guarantees a non-zero attendance and a unique minority side.
        let minority_side = if attendance > 0 { -1 } else { 1 };
        let minority_count = if minority_side == 1 {
            ((config.agents as i64 + attendance) / 2) as usize
        } else {
            ((config.agents as i64 - attendance) / 2) as usize
        };

        for agent in &mut agents {
            for strategy in &mut agent.strategies {
                if strategy.actions[history] == minority_side {
                    strategy.virtual_score += 1;
                }
            }
        }

        let positive = actions.iter().filter(|&&a| a == 1).count() as f64;
        let negative = config.agents as f64 - positive;
        let p = positive / config.agents as f64;
        let q = negative / config.agents as f64;
        let entropy = [p, q].iter().filter(|&&v| v > 0.0).map(|&v| -v * v.ln()).sum::<f64>();
        let polarization = (attendance.unsigned_abs() as f64) / config.agents as f64;
        let force = attendance as f64 / config.agents as f64;

        observations.push(RoundObservation {
            round, history, attendance, minority_side, minority_count,
            polarization, population_force: force,
        });
        *histogram.entry(attendance).or_insert(0) += 1;
        attendance_sum += attendance as f64;
        attendance_sq_sum += (attendance as f64).powi(2);
        abs_sum += attendance.unsigned_abs() as f64;
        polarization_sum += polarization;
        minority_share_sum += minority_count as f64 / config.agents as f64;
        entropy_sum += entropy;
        history = ((history << 1) | usize::from(minority_side == 1)) & (states - 1);
        let _ = selected_indices;
    }

    let n = config.rounds as f64;
    let mean = attendance_sum / n;
    let variance = (attendance_sq_sum / n - mean * mean).max(0.0);
    let diversity_denominator = (config.agents * config.strategies_per_agent) as f64;
    let metrics = SimulationMetrics {
        mean_attendance: mean,
        volatility: variance.sqrt(),
        mean_minority_share: minority_share_sum / n,
        mean_absolute_attendance: abs_sum / n,
        strategy_diversity: selected.len() as f64 / diversity_denominator,
        mean_action_entropy: entropy_sum / n,
        mean_polarization: polarization_sum / n,
    };
    let attendance_histogram = histogram.into_iter()
        .map(|(attendance, count)| AttendanceBucket { attendance, count })
        .collect();

    Ok(SimulationResult { config, observations, metrics, attendance_histogram })
}

fn validate(config: &SimulationConfig) -> Result<(), SimulationError> {
    if !(3..=10_001).contains(&config.agents) || config.agents % 2 == 0 {
        return Err(SimulationError::InvalidAgentCount);
    }
    if !(1..=16).contains(&config.memory) {
        return Err(SimulationError::InvalidMemory);
    }
    if !(2..=16).contains(&config.strategies_per_agent) {
        return Err(SimulationError::InvalidStrategyCount);
    }
    if !(1..=100_000).contains(&config.rounds) {
        return Err(SimulationError::InvalidRounds);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn seeded_runs_are_identical() {
        let config = SimulationConfig { rounds: 100, ..SimulationConfig::default() };
        let a = simulate(config.clone()).unwrap();
        let b = simulate(config).unwrap();
        assert_eq!(a.observations.iter().map(|x| x.attendance).collect::<Vec<_>>(),
                   b.observations.iter().map(|x| x.attendance).collect::<Vec<_>>());
        assert_eq!(a.metrics.volatility, b.metrics.volatility);
    }

    #[test]
    fn attendance_is_odd_and_minority_is_strict() {
        let result = simulate(SimulationConfig::default()).unwrap();
        assert!(result.observations.iter().all(|r| r.attendance.abs() % 2 == 1));
        assert!(result.observations.iter().all(|r| r.minority_count < 51));
    }

    #[test]
    fn rejects_even_population() {
        let config = SimulationConfig { agents: 100, ..SimulationConfig::default() };
        assert_eq!(simulate(config).unwrap_err(), SimulationError::InvalidAgentCount);
    }
}
