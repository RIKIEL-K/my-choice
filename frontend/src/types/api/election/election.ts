// Types for the Election microservice API
// Update these to match the actual OpenAPI schema once the service is live.

export interface ElectionCandidate {
    id: string;
    name: string;
    description?: string;
    avatar_url?: string;
}

export interface Election {
    id: string;
    title: string;
    description: string;
    start_date: string;    // ISO 8601
    end_date: string;      // ISO 8601
    status: "draft" | "active" | "closed";
    total_voters: number;
    vote_count: number;
    candidates: ElectionCandidate[];
}

export interface ElectionStats {
    active_count: number;
    registered_voters: number;
    average_participation: number;  // 0-100
    votes_today: number;
}

export interface ElectionListResponse {
    items: Election[];
    total: number;
    page: number;
    size: number;
}
