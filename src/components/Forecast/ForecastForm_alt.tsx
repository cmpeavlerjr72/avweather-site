import { useMemo, useState } from "react";
import type { ForecastRequest } from "../../types/forecast";


type FormPayload = Omit<ForecastRequest, "cruise_fl" | "embed">;

interface Props {
  onSubmit: (payload: FormPayload) => void;
  disabled?: boolean;
}

function normalizeIcao(v: string) {
  return v.trim().toUpperCase();
}

function isValidIcao(v: string) {
  return /^[A-Z0-9]{4}$/.test(v);
}

export default function ForecastForm({ onSubmit, disabled }: Props) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [cruiseFL, setCruiseFL] = useState("");
  const [calm, setCalm] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const originNorm = useMemo(() => normalizeIcao(origin), [origin]);
  const destNorm = useMemo(() => normalizeIcao(destination), [destination]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (!isValidIcao(originNorm)) {
      setLocalError("Origin must be a valid 4-character ICAO (e.g., KATL).");
      return;
    }
    if (!isValidIcao(destNorm)) {
      setLocalError("Destination must be a valid 4-character ICAO (e.g., KDEN).");
      return;
    }
    if (originNorm === destNorm) {
      setLocalError("Origin and destination must be different.");
      return;
    }

    let cruise_fl: number | undefined = undefined;
    if (cruiseFL.trim() !== "") {
      const n = Number(cruiseFL);
      if (!Number.isFinite(n) || n < 0 || n > 450) {
        setLocalError("Cruise FL must be between 0 and 450 (e.g., 340).");
        return;
      }
      cruise_fl = Math.round(n);
    }

    const payload: FormPayload = {
      origin: originNorm,
      destination: destNorm,
      calm,
    };

    onSubmit(payload);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label>Origin ICAO</label>
          <input
            placeholder="e.g., KATL"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            maxLength={4}
            required
            disabled={disabled}
          />
        </div>

        <div className="field">
          <label>Destination ICAO</label>
          <input
            placeholder="e.g., KDEN"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            maxLength={4}
            required
            disabled={disabled}
          />
        </div>

        <div className="field">
          <label>Cruise Flight Level</label>
          <input value="FL340 (fixed for now)" disabled />
        </div>
      </div>


      <div className="row">
        <div className="pill">
          <strong>Mode:</strong> {calm ? "Calm / passenger-friendly" : "Standard"}
        </div>

        <div className="toggle">
          <div
            className={`switch ${calm ? "on" : ""}`}
            role="switch"
            aria-checked={calm}
            tabIndex={0}
            onClick={() => setCalm((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setCalm((v) => !v);
            }}
          />
          <span style={{ color: "var(--muted)", fontSize: 13 }}>
            Calm briefing
          </span>
        </div>
      </div>

      {localError && <div className="error">⚠️ {localError}</div>}

      <button className="btn" type="submit" disabled={disabled}>
        {disabled ? "Generating…" : "Generate Forecast"}
      </button>
    </form>
  );
}
