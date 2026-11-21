import { useState } from "react";
import type { SimulationConfig, SimulationResult } from "@minority/core";

const initial: SimulationConfig = {
  agents: 101, memory: 3, strategies_per_agent: 2, rounds: 500, seed: 7
};
const api = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8081";

export default function App() {
  const [config, setConfig] = useState(initial);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function change(key: keyof SimulationConfig, value: number) {
    setConfig(current => ({ ...current, [key]: value }));
  }

  async function run() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${api}/api/v1/simulations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(config)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? `Simulation failed (${response.status})`);
      setResult(payload as SimulationResult);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to reach the simulation API");
    } finally {
      setBusy(false);
    }
  }

  const maxAbs = result ? Math.max(1, ...result.observations.map(row => Math.abs(row.attendance))) : 1;

  return <main className="shell">
    <header className="topbar"><div className="mark">MG</div><div><strong>MINORITY GAMES</strong><span>POPULATION DYNAMICS LAB</span></div><div className="status">RESEARCH ENGINE</div></header>
    <section className="intro">
      <p className="eyebrow">COMPLEX SYSTEMS / ADAPTIVE AGENTS</p>
      <h1>When the crowd moves,<br/><em>the minority wins.</em></h1>
      <p className="lede">Explore emergent coordination, adaptation and volatility in a population of competing strategies. Every run is deterministic from its seed.</p>
    </section>
    <section className="workspace">
      <aside className="panel controls">
        <div className="panel-heading"><span>01 / EXPERIMENT</span><small>MODEL PARAMETERS</small></div>
        <label>Population <b>{config.agents}</b><input type="range" min="3" max="501" step="2" value={config.agents} onChange={e => change("agents", Number(e.target.value))}/></label>
        <label>Public memory <b>{config.memory}</b><input type="range" min="1" max="8" value={config.memory} onChange={e => change("memory", Number(e.target.value))}/></label>
        <label>Strategies per agent <b>{config.strategies_per_agent}</b><input type="range" min="2" max="8" value={config.strategies_per_agent} onChange={e => change("strategies_per_agent", Number(e.target.value))}/></label>
        <label>Rounds <b>{config.rounds}</b><input type="range" min="100" max="5000" step="100" value={config.rounds} onChange={e => change("rounds", Number(e.target.value))}/></label>
        <label>Random seed <input className="seed" type="number" min="0" value={config.seed} onChange={e => change("seed", Number(e.target.value))}/></label>
        <button onClick={run} disabled={busy}>{busy ? "SIMULATING…" : "RUN SIMULATION ↗"}</button>
        {error && <p className="error">{error}</p>}
        <p className="hint">Odd population is enforced so every round has one unambiguous minority side.</p>
      </aside>
      <section className="results">
        <div className="panel chart-panel">
          <div className="panel-heading"><span>02 / POPULATION FORCE</span><small>{result ? `${result.observations.length} ROUNDS` : "AWAITING RUN"}</small></div>
          {result ? <div className="chart">
            <div className="zero"></div>
            {result.observations.map(row => <div key={row.round} title={`Round ${row.round}: attendance ${row.attendance}`} className={row.attendance > 0 ? "bar positive" : "bar negative"} style={{height: `${Math.max(2, Math.abs(row.attendance) / maxAbs * 48)}%`}} />)}
          </div> : <div className="empty"><div className="pulse">↗</div><p>Run an experiment to observe<br/>the population's changing force.</p></div>}
          <div className="axis"><span>MINORITY −</span><span>ZERO ATTENDANCE</span><span>MAJORITY +</span></div>
        </div>
        <div className="metrics">
          {[
            ["VOLATILITY", result?.metrics.volatility.toFixed(3) ?? "—", "σ attendance"],
            ["MEAN |A|", result?.metrics.mean_absolute_attendance.toFixed(2) ?? "—", "absolute attendance"],
            ["STRATEGY DIVERSITY", result ? (result.metrics.strategy_diversity * 100).toFixed(1) + "%" : "—", "unique agent-strategy pairs"],
            ["ACTION ENTROPY", result?.metrics.mean_action_entropy.toFixed(3) ?? "—", "nats per round"]
          ].map(([name, value, note]) => <article className="metric" key={name}><span>{name}</span><strong>{value}</strong><small>{note}</small></article>)}
        </div>
        {result && <div className="panel summary"><div className="panel-heading"><span>03 / RUN SUMMARY</span><small>SEED {result.config.seed}</small></div><p>Across {result.config.agents} agents and {result.config.rounds} rounds, mean signed attendance was <b>{result.metrics.mean_attendance.toFixed(2)}</b>. The average minority population was <b>{(result.observations.reduce((sum, row) => sum + row.minority_count, 0) / result.observations.length).toFixed(1)}</b> agents.</p></div>}
      </section>
    </section>
    <footer>MINORITY GAMES / DETERMINISTIC BASELINE MODEL <span>NOT AN EMPIRICAL FORECAST</span></footer>
  </main>;
}
