import type { components } from "@/types/api/base";

export type UserRead = components["schemas"]["UserRead"] & {
  role: "user" | "admin" | "superadmin";
};

export type UserUpdate = components["schemas"]["UserUpdate"];

export type UserStatus = "active" | "suspended" | "pending";

export interface UserAdminRead {
  id: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  is_active: boolean;
  is_verified: boolean;
  is_locked: boolean;
  created_at?: string;
  // computed
  status: UserStatus;
}

export interface AdminUserListResponse {
  items: UserAdminRead[];
  total: number;
  page: number;
  size: number;
  counts: {
    total: number;
    active: number;
    suspended: number;
    pending: number;
  };
}

export interface PlatformSettings {
  school_name: string;
  school_email_domain: string;
  max_election_duration_days: number;
  allow_candidate_self_registration: boolean;
  require_candidate_approval: boolean;
  sms_enabled: boolean;
  sms_provider: string;
  sms_sender: string;
  maintenance_mode: boolean;
  maintenance_message: string;
}

export type PlatformSettingsUpdate = Partial<PlatformSettings>;
