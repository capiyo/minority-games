use axum::{extract::Path, http::StatusCode, routing::{get, post}, Json, Router};
use minority_vector_engine::{simulate, SimulationConfig, SimulationResult};
use serde::Serialize;
use std::{env, net::SocketAddr};
use tracing_subscriber::EnvFilter;

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

async fn health() -> &'static str { "ok" }

async fn run_simulation(
    Json(config): Json<SimulationConfig>,
) -> Result<Json<SimulationResult>, (StatusCode, Json<ErrorResponse>)> {
    simulate(config)
        .map(Json)
        .map_err(|error| (StatusCode::UNPROCESSABLE_ENTITY,
            Json(ErrorResponse { error: error.to_string() })))
}

async fn simulation_info(Path(id): Path<String>) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "simulation_id": id,
        "status": "not_persisted",
        "message": "This endpoint becomes available when the persistence adapter is enabled."
    }))
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .init();

    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/simulations", post(run_simulation))
        .route("/api/v1/simulations/:id", get(simulation_info));

    let address: SocketAddr = env::var("MINORITY_AXUM_ADDR")
        .unwrap_or_else(|_| "127.0.0.1:8081".to_string())
        .parse().expect("MINORITY_AXUM_ADDR must be a valid socket address");
    let listener = tokio::net::TcpListener::bind(address).await.expect("bind Axum listener");
    tracing::info!(%address, "minority-games Axum API listening");
    axum::serve(listener, app).await.expect("serve Axum API");
}
