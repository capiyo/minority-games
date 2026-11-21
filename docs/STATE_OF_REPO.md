# State of repository

## Baseline

The repository began empty. The initial implementation establishes the Rust workspace, pure simulation crate, Axum API, optional Drogon forwarding gateway, React web research console, Expo/React Native client scaffold, shared TypeScript contracts, versioned API contracts and mathematical documentation.

## Implemented

- Seeded deterministic strategy-table generation.
- Binary minority game with odd population and rolling public history.
- Virtual scoring of all strategies each round.
- Round observations and aggregate descriptive metrics.
- Axum simulation endpoint with invalid-input handling.
- Unit tests for deterministic replay, strict minority resolution, invalid population and bounded workload.
- React + Vite web console that runs simulations and visualizes attendance and aggregate metrics.
- Expo / React Native client scaffold consuming the same Axum contract.
- GitHub Actions workflow for Rust tests and web builds.

## Not yet implemented

- MongoDB persistence and experiment registry.
- Streaming/WebSocket simulation updates.
- Parameter sweeps, batch execution and statistical confidence intervals.
- Networked agents, heterogeneous learning and alternative strategy-selection models.
- Container images and deployment hardening.

No live external system or real-world decision process is connected.
