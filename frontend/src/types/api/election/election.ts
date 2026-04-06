// Types for the Election microservice API
// Matches the actual OpenAPI schema of election-service running on port 8001.

export type ElectionStatus = "draft" | "active" | "closed";
export type ApprovalStatus = "pending" | "approved" | "rejected";

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
    approval_status: ApprovalStatus;
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
    has_voted: boolean;
}

export interface ElectionStats {
    active_count: number;
    registered_voters: number;
    average_participation: number;
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
    approval_status?: ApprovalStatus;
}

export interface VoteCreate {
    candidate_id: string;
}

// ─── Admin Types ──────────────────────────────────────────────────────────────

export interface VotesByHour {
    heure: string;
    votes: number;
}

export interface ElectionParticipation {
    election: string;
    participation: number;
}

export interface RecentActivity {
    action: string;
    detail: string;
    time: string;
    type: "vote" | "candidate" | "election" | "student" | "report";
}

export interface AdminAlert {
    text: string;
    severity: "warning" | "info";
    action: string;
    target: string;
}

export interface AdminDashboardStats {
    total_elections: number;
    active_elections: number;
    total_votes: number;
    votes_today: number;
    registered_voters: number;
    average_participation: number;
    votes_by_hour: VotesByHour[];
    elections_participation: ElectionParticipation[];
    recent_activity: RecentActivity[];
    alerts: AdminAlert[];
}
