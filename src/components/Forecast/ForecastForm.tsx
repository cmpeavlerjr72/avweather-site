import { useEffect, useMemo, useRef, useState } from "react";
import type { ForecastRequest } from "../../types/forecast";

type FormPayload = Omit<ForecastRequest, "cruise_fl" | "embed">;

interface Props {
  onSubmit: (payload: FormPayload) => void;
  disabled?: boolean;
}



// ---- Autocomplete types ----
// Expect your backend to return: { results: AirportSuggestion[] }
// (If your shape differs, tweak `fetchSuggestions` parsing below.)
type AirportSuggestion = {
  icao: string; // "KATL"
  iata?: string; // "ATL" (optional)
  name?: string; // "Hartsfield–Jackson Atlanta International Airport"
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
    // from backend AirportSearchResult
  type?: string;              // "large_airport", "heliport", etc.
  scheduled_service?: boolean;
};

function normalizeIcao(v: string) {
  return v.trim().toUpperCase();
}

function isValidIcao(v: string) {
  return /^[A-Z0-9]{4}$/.test(v);
}

function formatSuggestion(a: AirportSuggestion) {
  const bits = [
    a.name,
    [a.city, a.state].filter(Boolean).join(", "),
    a.country,
  ].filter(Boolean);

  const right = bits.length ? ` — ${bits.join(" · ")}` : "";
  const iata = a.iata ? ` (${a.iata})` : "";
  return `${a.icao}${iata}${right}`;
}

// Relative by default (works behind same domain / proxy)
// If you use a separate backend domain, set VITE_API_BASE_URL.
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";


function isUsableAirport(a: AirportSuggestion) {
  // Exclude heliports explicitly
  if (a.type?.toLowerCase() === "heliport") return false;

  // Also catch cases where type is missing but name contains "heliport"
  if (a.name && /heliport/i.test(a.name)) return false;

  return true;
}


async function fetchSuggestions(q: string, signal: AbortSignal) {
  const url = `${API_BASE}/api/airports/search?q=${encodeURIComponent(q)}&limit=10`;

  const res = await fetch(url, { signal });
  if (!res.ok) return [] as AirportSuggestion[];

  const data = await res.json();

  // Backend returns a plain list
  const results: AirportSuggestion[] = Array.isArray(data)
    ? data.filter(isUsableAirport)
    : [];



  // Normalize ICAO casing just in case
  return results
    .map((a) => ({ ...a, icao: normalizeIcao(a.icao || "") }))
    .filter((a) => a.icao.length > 0);
}

type AutoFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  setValue: (v: string) => void;
  disabled?: boolean;
  otherIcao?: string; // to optionally de-emphasize duplicates (UX)
};

function AirportAutocompleteField({
  label,
  placeholder,
  value,
  setValue,
  disabled,
  otherIcao,
}: AutoFieldProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AirportSuggestion[]>([]);
  const [highlight, setHighlight] = useState<number>(-1);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const valueNorm = useMemo(() => normalizeIcao(value), [value]);
  const query = useMemo(() => valueNorm, [valueNorm]);

  // Fetch suggestions (debounced)
  useEffect(() => {
    if (disabled) return;

    // Only search when there’s something to search
    // ICAO searches are most useful at 2+ chars.
    if (query.length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setOpen(true);

    const t = window.setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const results = await fetchSuggestions(query, ac.signal);
        setItems(results);
        setHighlight(results.length ? 0 : -1);
      } catch {
        // ignore abort/fetch errors in UI
        setItems([]);
        setHighlight(-1);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => window.clearTimeout(t);
  }, [query, disabled]);

  // Close on click outside
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function choose(a: AirportSuggestion) {
    setValue(normalizeIcao(a.icao));
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && e.key === "ArrowDown" && items.length) {
      setOpen(true);
      setHighlight(0);
      return;
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(items.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      // If a suggestion is highlighted, pick it.
      if (highlight >= 0 && highlight < items.length) {
        e.preventDefault();
        choose(items[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown =
    !disabled && open && (loading || (items && items.length > 0)) && query.length >= 2;

  return (
    <div className="field" ref={wrapRef} style={{ position: "relative" }}>
      <label>{label}</label>
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          // Keep user typing fluid; we normalize on submit/select.
          setValue(e.target.value.toUpperCase());
          setOpen(true);
        }}
        onFocus={() => {
          if (query.length >= 2) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        maxLength={32} // allow typing airport name fragments if your backend supports it
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        inputMode="text"
      />

      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          {loading && (
            <div style={{ padding: "10px 12px", color: "var(--muted)", fontSize: 13 }}>
              Searching…
            </div>
          )}

          {!loading &&
            items.slice(0, 8).map((a, idx) => {
              const isDup = otherIcao && normalizeIcao(otherIcao) === normalizeIcao(a.icao);
              const active = idx === highlight;

              return (
                <div
                  key={`${a.icao}-${idx}`}
                  onMouseEnter={() => setHighlight(idx)}
                  onMouseDown={(e) => {
                    // Use mousedown so input doesn't lose focus before choose()
                    e.preventDefault();
                    choose(a);
                  }}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    background: active ? "rgba(169, 214, 229, 0.35)" : "transparent",
                    color: isDup ? "var(--muted)" : "var(--text)",
                    borderTop: idx === 0 ? "none" : "1px solid rgba(0,0,0,0.06)",
                    fontSize: 14,
                    lineHeight: 1.25,
                  }}
                  title={formatSuggestion(a)}
                >
                  <div style={{ fontWeight: 600 }}>
                    {a.icao}
                    {a.iata ? <span style={{ fontWeight: 500 }}> ({a.iata})</span> : null}
                    {isDup ? (
                      <span style={{ marginLeft: 8, fontSize: 12, color: "var(--muted)" }}>
                        (already selected)
                      </span>
                    ) : null}
                  </div>
                  {(a.name || a.city || a.state) && (
                    <div style={{ marginTop: 2, fontSize: 12, color: "var(--muted)" }}>
                      {[a.name, [a.city, a.state].filter(Boolean).join(", ")]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  )}
                </div>
              );
            })}

          {!loading && items.length === 0 && (
            <div style={{ padding: "10px 12px", color: "var(--muted)", fontSize: 13 }}>
              No matches.
            </div>
          )}
        </div>
      )}
    </div>
  );
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
        <AirportAutocompleteField
          label="Origin ICAO"
          placeholder="Type ICAO or airport name (e.g., KATL or Atlanta)"
          value={origin}
          setValue={setOrigin}
          disabled={disabled}
          otherIcao={destination}
        />

        <AirportAutocompleteField
          label="Destination ICAO"
          placeholder="Type ICAO or airport name (e.g., KDEN or Denver)"
          value={destination}
          setValue={setDestination}
          disabled={disabled}
          otherIcao={origin}
        />

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
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Calm briefing</span>
        </div>
      </div>

      {localError && <div className="error">⚠️ {localError}</div>}

      <button className="btn" type="submit" disabled={disabled}>
        {disabled ? "Generating…" : "Generate Forecast"}
      </button>
    </form>
  );
}
