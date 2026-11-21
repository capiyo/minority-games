# State of repository

## Baseline

The repository began empty. This initial implementation establishes the Rust workspace, pure simulation crate, Axum API, optional Drogon forwarding gateway, versioned API contracts and mathematical documentation.

## Implemented

- Seeded deterministic strategy-table generation.
- Binary minority game with odd population and rolling public history.
- Virtual scoring of all strategies each round.
- Round observations and aggregate descriptive metrics.
- Axum simulation endpoint with invalid-input handling.
- Unit tests for deterministic replay and population validation.

## Not yet implemented

- MongoDB persistence and experiment registry.
- React web research console and React Native app.
- Streaming/WebSocket simulation updates.
- Parameter sweeps, batch execution and statistical confidence intervals.
- Networked agents, heterogeneous learning and alternative strategy-selection models.
- CI workflows, container images and deployment hardening.

No live external system or real-world decision process is connected.
