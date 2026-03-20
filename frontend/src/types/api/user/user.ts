import type { components } from "@/types/api/base";

export type UserRead = components["schemas"]["UserRead"] & {
  role: "user" | "admin" | "superadmin";
};

export type UserUpdate = components["schemas"]["UserUpdate"];
