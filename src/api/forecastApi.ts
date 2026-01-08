import { API_BASE_URL } from "../config/env";
import type { ForecastRequest, ForecastResponse } from "../types/forecast";

function joinUrl(base: string, path: string) {
  return base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}

export async function fetchForecast(
  payload: ForecastRequest,
  timeoutMs = 90_000
): Promise<ForecastResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const url = joinUrl(API_BASE_URL, "/api/forecast");

  console.log("POST", url, payload);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // Try to parse JSON if possible (FastAPI often returns {detail: ...})
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!res.ok) {
      if (isJson) {
        const body = await res.json().catch(() => null);

        // FastAPI commonly: { detail: "..." } or { detail: [{msg: "..."}] }
        const detail = body?.detail;
        if (typeof detail === "string") throw new Error(detail);
        if (Array.isArray(detail) && detail[0]?.msg) throw new Error(detail[0].msg);

        throw new Error(`Request failed (${res.status})`);
      } else {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed (${res.status})`);
      }
    }

    const data = (isJson ? await res.json() : null) as ForecastResponse | null;
    if (!data) throw new Error("Unexpected response from server.");

    // basic shape check
    if (!data.briefing || !data.map_url) {
      throw new Error("Server returned an incomplete forecast.");
    }

    return data;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("Forecast timed out. Try again, or use Calm mode.");
    }
    throw new Error(err?.message || "Network error. Check your connection.");
  } finally {
    clearTimeout(timeout);
  }
}
