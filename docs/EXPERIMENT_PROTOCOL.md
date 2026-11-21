# Experiment protocol

1. Record model version, agent count, memory, strategies per agent, rounds and seed.
2. Run multiple independent seeds for every parameter point.
3. Report mean attendance, volatility, mean absolute attendance, minority win rate, strategy diversity, action entropy and polarization.
4. Plot volatility against population size and memory ratio; retain raw run metadata and histograms.
5. Separate baseline results from extensions such as network coupling, heterogeneous agents or alternative learning rules.
6. Do not compare parameter sets with different run lengths without reporting the difference.
7. Treat simulation outputs as model-conditional observations, not empirical claims about real groups.
