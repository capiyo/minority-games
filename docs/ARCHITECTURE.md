# Architecture

## Design rule

The Rust domain engine is the only authority for game mathematics and state transitions. HTTP handlers, gateways, clients and persistence adapters may validate, transport or store data, but must not reimplement agent selection, scoring, minority resolution or metrics.

## Services

1. **Vector engine (Rust library):** deterministic and side-effect-free. It owns agents, strategy tables, virtual scores, public history, round transitions and aggregate measurements.
2. **Axum application:** validates requests, runs simulations and exposes versioned HTTP contracts. It is the sole application orchestrator.
3. **Drogon gateway (C++):** optional edge/API gateway. It forwards requests to Axum; it must not calculate game outcomes.
4. **MongoDB:** planned durable storage for experiment definitions, seeds, run metadata, metrics and optionally round observations. Persistence is deliberately separated from the pure engine.
5. **React web / React Native:** clients configure experiments and visualize returned observations. They never calculate authoritative outcomes.
6. **Shared contracts:** OpenAPI and JSON Schema define stable request/response boundaries.

## Data flow

`Client -> Drogon (optional) -> Axum -> Vector Engine -> Axum -> MongoDB (when enabled) -> Client`

For local research, clients may call Axum directly. Public deployments should expose the gateway and keep Axum private.

## Qoin patterns intentionally reused

- Clear frontend/backend/shared/docs boundaries.
- Pure Rust computation crate separated from the Axum service.
- One authoritative decision owner.
- C++ gateway as transport only.
- Versioned contracts and reproducible configuration.
- Research experiments are explicit and repeatable.

## Domain differences

Market instruments, broker adapters, orders, risk controls and trading signals are not copied. Minority Games has agents, strategy lookup tables, virtual scores, public history, attendance, minority outcomes, adaptation and population-level observables.

## Persistence boundary

The first milestone runs simulations in memory. The persistence interface and MongoDB schema are a subsequent integration; no fake persistence or misleading saved-run endpoint is exposed.
