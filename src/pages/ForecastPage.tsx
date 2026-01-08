import { useState } from "react";
import ForecastForm from "../components/Forecast/ForecastForm";
import BriefingCard from "../components/Forecast/BriefingCard";
import MapEmbed from "../components/Forecast/MapEmbed";
import ErrorBanner from "../components/Forecast/ErrorBanner";
import LoadingOverlay from "../components/Forecast/LoadingOverlay";
import { fetchForecast } from "../api/forecastApi";
import type { ForecastRequest, ForecastResponse } from "../types/forecast";
import windowIcon from "../components/Brand/window.png";


type FormPayload = Omit<ForecastRequest, "cruise_fl" | "embed">;

export default function ForecastPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ForecastResponse | null>(null);
  const docked = status !== "idle";

  const isLoading = status === "loading";

  async function handleSubmit(payload: FormPayload) {
    if (isLoading) return;

    const request: ForecastRequest = {
      ...payload,
      cruise_fl: 340, // hard-coded for now
      calm: payload.calm ?? true,
      embed: true,
    };

    setStatus("loading");
    setError(null);
    setData(null);

    try {
      const result = await fetchForecast(request);
      setData(result);
      setStatus("success");

      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (e: any) {
      setError(e?.message || "Request failed.");
      setStatus("error");
    }
  }

  return (
    <div className={`page ${docked ? "page--top" : "page--center"}`}>
      <div className="hero">
        <div className="header">
          <div className="brand">
            <img src={windowIcon} alt="BreezyBrief" className="brand-logo" />
            <h1 className="title">BreezyBrief</h1>
          </div>


          <p className="subtitle">
            A calm, passenger-friendly weather briefing for your route — designed to help nervous
            fliers know what to expect.
          </p>
        </div>

        <ForecastForm onSubmit={handleSubmit} disabled={isLoading} />
      </div>

      {isLoading && <LoadingOverlay />}
      {status === "error" && error && <ErrorBanner message={error} />}

      {data && (
        <div id="results">
          <BriefingCard briefing={data.briefing} />
          <MapEmbed mapUrl={data.map_url} />
        </div>
      )}
    </div>
  );
}
