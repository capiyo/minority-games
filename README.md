# Minority Games — Adaptive Population Simulation

A research and simulation platform for Minority Games, built around a deterministic Rust vector engine. Agents repeatedly choose between two actions; the less-populated side wins. The system studies adaptation, crowding, strategy diversity, volatility and emergent coordination.

This repository adopts Qoin's separation of concerns: a pure Rust decision/simulation engine is authoritative, Axum owns orchestration and state transitions, C++/Drogon is an optional HTTP gateway, MongoDB is the planned durable store, and web/mobile clients are presentation layers. No client implements game mathematics.

## Initial implementation

The first milestone is a reproducible, seeded simulation engine and an Axum API. The engine is deterministic for a given configuration and seed. It reports round-level attendance and minority outcomes plus aggregate volatility, average minority share, strategy diversity and attendance distribution.

## Architecture

- `backend/rust-axum/crates/minority-vector-engine`: pure domain model and simulation; no HTTP, database or runtime dependencies.
- `backend/rust-axum`: Axum API and application orchestration; sole owner of simulation execution.
- `backend/cpp-drogon`: optional gateway that forwards requests to Axum and never duplicates game logic.
- `frontend/apps/web`: React + TypeScript + Vite research console.
- `frontend/apps/mobile`: Expo / React Native client scaffold.
- `frontend/packages/core`: shared TypeScript API contracts and client utilities.
- `shared/contracts`: versioned JSON Schema and OpenAPI contracts.
- `docs`: architecture, mathematical model, experiment protocol and operational runbook.

## Minority Game model

Each agent owns a finite set of strategies. A strategy maps the public history (the last `m` minority outcomes) to an action in `{-1,+1}`. Agents select their highest-scoring strategy, the aggregate attendance is `A_t = sum_i a_i(t)`, and the minority side is `-sign(A_t)`. Every strategy receives a virtual point when its recommendation would have joined the minority. Public history then advances by the winning minority outcome.

The implementation is research software, not a claim that the model predicts real populations. Compare runs across seeds and parameter sweeps; do not infer causal or real-world policy conclusions from a single simulation.

## Requirements

- Rust stable (2021 edition)
- Node.js 20+ and pnpm 9 for the web workspace
- C++17, CMake and Drogon only when building the optional gateway
- MongoDB 7+ when persistence is enabled

## Run the Rust API

```bash
cargo run -p minority-api
```

The API listens on `127.0.0.1:8081` by default. Set `MINORITY_AXUM_ADDR` to change the bind address.

## Run the web research console

```bash
pnpm install
pnpm dev:web
```

Set `VITE_API_URL` when the API is not at `http://127.0.0.1:8081`. The mobile client reads `EXPO_PUBLIC_API_URL`.

## Validate

```bash
cargo test --workspace
pnpm build:web
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/MATHEMATICAL_MODEL.md](docs/MATHEMATICAL_MODEL.md) before extending the engine.
