# Minority Game mathematical model

## Population and actions

There are (N) agents, with odd (N). At round (t), agent (i) chooses (a_i(t) \in \{-1,+1\}). Attendance is

`A(t) = sum_i a_i(t)`.

Since (N) is odd, (A(t)) cannot be zero. The minority action is (w(t)=-sign(A(t))), and the winning population count is `(N - |A(t)|) / 2` when the majority action is positive (equivalently compute the count for the selected minority sign).

## Public information

Memory `m` defines `2^m` public information states. The state is a rolling bit representation of the most recent minority outcomes. Each strategy is a deterministic lookup table from every state to one of the two actions.

## Strategy selection and virtual scores

Each agent owns `S` strategies. At each round it selects a strategy with the highest virtual score; ties are resolved deterministically by strategy index. Every strategy is scored counterfactually: it gains one point if its recommendation for the observed state would have joined the minority, whether or not the agent selected it.

## Population vector observables

The engine exposes attendance force `F(t)=A(t)/N`, polarization `P(t)=|A(t)|/N`, action entropy `H(t)=-p_+ ln(p_+)-p_- ln(p_-)`, and attendance volatility `sigma_A=sqrt(E[A^2]-E[A]^2)`. These are descriptive observables, not predictions.

## Reproducibility

A seed initializes the strategy tables and initial public state. Given identical configuration and seed, the engine returns identical observations. Compare multiple independent seeds for robust experiments.

## Scope

This is a canonical baseline with homogeneous agents and common public history. Network coupling, heterogeneous learning rates, finite score memory, strategy mutation, transaction-like costs and external signals belong in separately versioned experimental models, not hidden changes to the baseline.
