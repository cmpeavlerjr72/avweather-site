import { API_BASE_URL } from "../../config/env";

function toAbsoluteMapUrl(mapUrl: string) {
  if (!mapUrl) return "";
  if (mapUrl.startsWith("http://") || mapUrl.startsWith("https://")) return mapUrl;

  // If backend returns "/maps/abc.html" or "maps/abc.html"
  const base = API_BASE_URL.replace(/\/+$/, "");
  const path = mapUrl.startsWith("/") ? mapUrl : `/${mapUrl}`;
  return `${base}${path}`;
}

export default function MapEmbed({ mapUrl }: { mapUrl: string }) {
  const src = toAbsoluteMapUrl(mapUrl);

  if (!src) {
    return (
      <div className="card">
        <h2>Route Map</h2>
        <div className="error">⚠️ No map URL returned from server.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Route Map</h2>

      <div className="map-container">
        <iframe
          src={src}
          title="Route Weather Map"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
        />
      </div>

      <a href={src} target="_blank" rel="noopener noreferrer">
        Open map in new tab
      </a>
    </div>
  );
}
