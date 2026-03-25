// Types for the Election microservice API
// Matches the actual OpenAPI schema of election-service running on port 8001.

export type ElectionStatus = "draft" | "active" | "closed";

export interface ElectionCandidate {
    id: string;
    election_id: string;
    user_id: string;
    display_name: string;
    bio?: string | null;
    avatar_url?: string | null;
    program?: string | null;
    position?: string | null;
    slogan?: string | null;
    priorities?: string[];
    vote_count: number;
    created_at: string; // ISO 8601
}

export interface Election {
    id: string;
    title: string;
    description?: string | null;
    start_date: string;
    end_date: string;
    status: ElectionStatus;
    total_voters: number;
    vote_count: number;
    participation: number;
    candidates: ElectionCandidate[];
    created_at: string;
    has_voted: boolean; // True if the current user already voted in this election
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


export interface ElectionCreate {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    total_voters?: number;
    status?: ElectionStatus;
}

export interface ElectionUpdate {
    title?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    total_voters?: number;
    status?: ElectionStatus;
}

export interface CandidateCreate {
    display_name: string;
    bio?: string;
    avatar_url?: string;
    program?: string;
    position?: string;
    slogan?: string;
    priorities?: string[];
}

export interface CandidateUpdate {
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    program?: string;
    position?: string;
    slogan?: string;
    priorities?: string[];
}

export interface VoteCreate {
    candidate_id: string;
}
