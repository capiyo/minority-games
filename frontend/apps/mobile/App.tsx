import { useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, Pressable, StyleSheet, View } from "react-native";
import type { SimulationConfig, SimulationResult } from "@minority/core";

const defaults: SimulationConfig = { agents: 101, memory: 3, strategies_per_agent: 2, rounds: 500, seed: 7 };
const api = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8081";

export default function App() {
  const [config, setConfig] = useState(defaults);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch(`${api}/api/v1/simulations`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(config) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Simulation failed");
      setResult(body as SimulationResult);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "API unavailable"); }
    finally { setBusy(false); }
  };
  const field = (label: string, key: keyof SimulationConfig) => <View style={styles.field} key={key}>
    <Text style={styles.label}>{label}</Text>
    <TextInput keyboardType="numeric" value={String(config[key])} onChangeText={value => setConfig(current => ({ ...current, [key]: Number(value) }))} style={styles.input}/>
  </View>;
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.kicker}>COMPLEX SYSTEMS / RESEARCH</Text>
    <Text style={styles.title}>MINORITY{"\n"}GAMES</Text>
    <Text style={styles.copy}>A population of adaptive agents. One minority side wins each round.</Text>
    <View style={styles.panel}><Text style={styles.section}>EXPERIMENT PARAMETERS</Text>
      {field("Odd population size", "agents")}{field("Public memory", "memory")}{field("Strategies per agent", "strategies_per_agent")}{field("Rounds", "rounds")}{field("Seed", "seed")}
      <Pressable style={styles.button} onPress={run} disabled={busy}><Text style={styles.buttonText}>{busy ? "SIMULATING…" : "RUN SIMULATION"}</Text></Pressable>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
    {result && <View style={styles.panel}><Text style={styles.section}>RESULTS / {result.config.rounds} ROUNDS</Text>
      <Text style={styles.metric}>{result.metrics.volatility.toFixed(3)}<Text style={styles.metricLabel}>  VOLATILITY</Text></Text>
      <Text style={styles.metric}>{result.metrics.mean_absolute_attendance.toFixed(2)}<Text style={styles.metricLabel}>  MEAN |A|</Text></Text>
      <Text style={styles.metric}>{(result.metrics.strategy_diversity * 100).toFixed(1)}%<Text style={styles.metricLabel}>  STRATEGY DIVERSITY</Text></Text>
      <Text style={styles.section}>LATEST ATTENDANCE</Text>
      {result.observations.slice(-12).map(row => <View key={row.round} style={styles.row}><Text style={styles.label}>ROUND {row.round + 1}</Text><Text style={styles.value}>{row.attendance > 0 ? "+" : ""}{row.attendance}  /  MINORITY {row.minority_side}</Text></View>)}
    </View>}
    <Text style={styles.footer}>DETERMINISTIC BASELINE MODEL · NOT AN EMPIRICAL FORECAST</Text>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#101820" }, page: { padding: 22, gap: 18 },
  kicker: { color: "#9bd7a9", fontSize: 10, letterSpacing: 2, marginTop: 24 },
  title: { color: "#e8eee9", fontSize: 52, fontWeight: "700", lineHeight: 54, letterSpacing: -2 },
  copy: { color: "#a6b4aa", fontSize: 15, lineHeight: 23, marginBottom: 8 },
  panel: { backgroundColor: "#17241f", borderColor: "#314139", borderWidth: 1, borderRadius: 5, padding: 18, gap: 14 },
  section: { color: "#b9e7c2", fontSize: 10, letterSpacing: 1.5, marginBottom: 5 },
  field: { gap: 7 }, label: { color: "#aab9ae", fontSize: 12 },
  input: { color: "#e8eee9", borderColor: "#40564a", borderWidth: 1, padding: 11, borderRadius: 3, fontSize: 15 },
  button: { backgroundColor: "#a4dfaf", padding: 15, alignItems: "center", marginTop: 6 },
  buttonText: { color: "#102018", fontWeight: "700", letterSpacing: 1, fontSize: 11 },
  error: { color: "#ff9c8f", fontSize: 12 }, metric: { color: "#b2e8bc", fontSize: 28, fontWeight: "600" },
  metricLabel: { color: "#91a398", fontSize: 10, letterSpacing: 1 }, row: { flexDirection: "row", justifyContent: "space-between", borderTopColor: "#314139", borderTopWidth: 1, paddingTop: 10 },
  value: { color: "#d9f1dc", fontSize: 12 }, footer: { color: "#829287", fontSize: 9, lineHeight: 16, marginTop: 12 }
});
