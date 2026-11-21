#include <drogon/drogon.h>
#include <cstdlib>
#include <string>

int main() {
    const char* configured = std::getenv("MINORITY_AXUM_URL");
    const std::string axum = configured ? configured : "http://127.0.0.1:8081";

    drogon::app().registerHandler(
        "/health",
        [](const drogon::HttpRequestPtr&, std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
            auto client = drogon::HttpClient::newHttpClient(
                std::getenv("MINORITY_AXUM_URL") ? std::getenv("MINORITY_AXUM_URL") : "http://127.0.0.1:8081");
            auto request = drogon::HttpRequest::newHttpRequest();
            request->setMethod(drogon::Get);
            request->setPath("/health");
            client->sendRequest(request, [callback = std::move(callback)](drogon::ReqResult result, const drogon::HttpResponsePtr& response) mutable {
                if (result != drogon::ReqResult::Ok || !response) {
                    auto error = drogon::HttpResponse::newHttpJsonResponse(Json::Value{{"error", "Axum unavailable"}});
                    error->setStatusCode(drogon::k502BadGateway);
                    callback(error);
                    return;
                }
                callback(response);
            });
        });

    drogon::app().registerHandler(
        "/api/v1/simulations",
        [axum](const drogon::HttpRequestPtr& incoming, std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
            auto client = drogon::HttpClient::newHttpClient(axum);
            auto request = drogon::HttpRequest::newHttpJsonRequest(incoming->getJsonObject() ? *incoming->getJsonObject() : Json::Value{});
            request->setMethod(drogon::Post);
            request->setPath("/api/v1/simulations");
            client->sendRequest(request, [callback = std::move(callback)](drogon::ReqResult result, const drogon::HttpResponsePtr& response) mutable {
                if (result != drogon::ReqResult::Ok || !response) {
                    auto error = drogon::HttpResponse::newHttpJsonResponse(Json::Value{{"error", "Axum unavailable"}});
                    error->setStatusCode(drogon::k502BadGateway);
                    callback(error);
                    return;
                }
                callback(response);
            });
        });

    const char* port = std::getenv("MINORITY_DROGON_PORT");
    drogon::app().addListener("127.0.0.1", port ? std::stoi(port) : 8080).run();
}
