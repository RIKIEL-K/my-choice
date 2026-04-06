/**
 * Admin hooks for the auth-service (users + settings).
 * All endpoints under /admin/... on authClient (port 8000).
 */
import useSWR from "swr";
import { client } from "@/lib/client";
import type {
  AdminUserListResponse,
  UserAdminRead,
  PlatformSettings,
  PlatformSettingsUpdate,
} from "@/types/api/user/user";

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await client.get<T>(url);
  return res.data;
};

// ─── Users ────────────────────────────────────────────────────────────────────

export function useAdminUsers(params?: {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.size) query.append("size", String(params.size));
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);

  const key = `/admin/users?${query.toString()}`;
  const { data, error, isLoading, mutate } = useSWR<AdminUserListResponse>(
    key,
    fetcher
  );

  return {
    users: data?.items ?? [],
    total: data?.total ?? 0,
    counts: data?.counts ?? { total: 0, active: 0, suspended: 0, pending: 0 },
    isLoading,
    isError: error,
    mutate,
  };
}

export async function updateUserStatus(
  userId: string,
  action: "suspend" | "activate" | "validate"
): Promise<UserAdminRead> {
  const res = await client.patch<UserAdminRead>(`/admin/users/${userId}/status`, {
    action,
  });
  return res.data;
}

export async function exportUsersCSV(): Promise<void> {
  const res = await client.get("/admin/users/export", {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "users_export.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ─── Platform settings ────────────────────────────────────────────────────────

export function useAdminSettings() {
  const { data, error, isLoading, mutate } = useSWR<PlatformSettings>(
    "/admin/settings",
    fetcher
  );
  return { settings: data ?? null, isLoading, isError: error, mutate };
}

export async function updateAdminSettings(
  payload: PlatformSettingsUpdate
): Promise<PlatformSettings> {
  const res = await client.patch<PlatformSettings>("/admin/settings", payload);
  return res.data;
}
