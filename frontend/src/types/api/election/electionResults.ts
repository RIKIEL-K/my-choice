// Types for election results & real-time stats
// These match the expected API shape – the backend implementation will provide the data.

/** Per-candidate result within a specific election */
export interface CandidateResult {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  slogan?: string | null;
  vote_count: number;
  /** Vote percentage (0-100) computed server-side */
  vote_percentage: number;
  /** Rank within this election (1 = leading) */
  rank: number;
}

/** A single trend data-point (time-series) */
export interface TrendPoint {
  /** ISO-8601 timestamp or label (e.g. "14h", "2026-04-14T14:00") */
  timestamp: string;
  /** Total cumulative votes at this point */
  total_votes: number;
  /** Breakdown per candidate at this point */
  candidates: {
    candidate_id: string;
    display_name: string;
    votes: number;
  }[];
}

/** Participation rate over time */
export interface ParticipationTrend {
  timestamp: string;
  participation: number; // 0-100
}

/** Full election results payload returned by the API */
export interface ElectionResultsData {
  election_id: string;
  election_title: string;
  status: "draft" | "active" | "closed";
  total_voters: number;
  total_votes: number;
  participation: number; // 0-100
  /** Ordered list of candidates (by rank / vote_count desc) */
  candidates: CandidateResult[];
  /** Votes over time – for the trend chart */
  vote_trends: TrendPoint[];
  /** Participation rate evolution */
  participation_trends: ParticipationTrend[];
  /** Last update timestamp (ISO-8601) */
  last_updated: string;
}
