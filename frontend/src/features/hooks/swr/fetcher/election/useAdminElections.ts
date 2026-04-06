/**
 * Admin hooks for the election-service.
 * All endpoints under /admin/... on electionClient (port 8001).
 */
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { electionClient } from "@/lib/electionClient";
import type {
  AdminDashboardStats,
  Election,
  ElectionListResponse,
  ElectionCreate,
  ElectionUpdate,
  ElectionCandidate,
  ApprovalStatus,
} from "@/types/api/election/election";

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await electionClient.get<T>(url);
  return res.data;
};

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export function useAdminStats() {
  const { data, error, isLoading, mutate } = useSWR<AdminDashboardStats>(
    "/admin/stats",
    fetcher,
    { refreshInterval: 30_000 }
  );
  return { stats: data ?? null, isLoading, isError: error, mutate };
}

// ─── Elections CRUD ───────────────────────────────────────────────────────────

export function useAdminElections(statusFilter?: string) {
  const query = statusFilter ? `?status=${statusFilter}` : "";
  const { data, error, isLoading, mutate } = useSWR<ElectionListResponse>(
    `/admin/elections${query}`,
    fetcher
  );
  return {
    elections: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: error,
    mutate,
  };
}

export async function createElection(data: ElectionCreate): Promise<Election> {
  const res = await electionClient.post<Election>("/admin/elections", data);
  return res.data;
}

export async function updateElection(id: string, data: ElectionUpdate): Promise<Election> {
  const res = await electionClient.patch<Election>(`/admin/elections/${id}`, data);
  return res.data;
}

export async function deleteElection(id: string): Promise<void> {
  await electionClient.delete(`/admin/elections/${id}`);
}

// ─── Candidates ───────────────────────────────────────────────────────────────

export function useAdminCandidates(params?: { election_id?: string; approval_status?: ApprovalStatus }) {
  const query = new URLSearchParams();
  if (params?.election_id) query.append("election_id", params.election_id);
  if (params?.approval_status) query.append("approval_status", params.approval_status);

  const { data, error, isLoading, mutate } = useSWR<ElectionCandidate[]>(
    `/admin/candidates?${query.toString()}`,
    fetcher
  );
  return {
    candidates: data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

export async function approveCandidate(id: string): Promise<ElectionCandidate> {
  const res = await electionClient.patch<ElectionCandidate>(`/admin/candidates/${id}/approve`);
  return res.data;
}

export async function rejectCandidate(id: string): Promise<ElectionCandidate> {
  const res = await electionClient.patch<ElectionCandidate>(`/admin/candidates/${id}/reject`);
  return res.data;
}

export async function deleteCandidate(id: string): Promise<void> {
  await electionClient.delete(`/admin/candidates/${id}`);
}
