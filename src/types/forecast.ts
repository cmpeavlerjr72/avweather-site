export interface ForecastRequest {
  origin: string;
  destination: string;
  cruise_fl: number;
  calm: boolean;
  embed?: boolean;
}

export interface ForecastResponse {
  briefing: string;
  summary: Record<string, unknown>;
  map_url: string;
}
