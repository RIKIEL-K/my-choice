import type { FC, ReactNode } from "react";
import { useUser } from "@/features/hooks/swr/fetcher/user/useUser";
import { useAuth } from "@/features/hooks/context/useAuth";
import { Loading } from "@/components/ui/Loading";
import { Navigate } from "react-router-dom";

type AdminRouteProps = {
  children: ReactNode;
};

export const AdminRoute: FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading, isError } = useUser();
  const { role } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  // If the auth service is unreachable or token expired → go to signin
  if (isError) {
    return <Navigate to="/signin" replace />;
  }

  if (!user) {
    return null;
  }

  // Redirect non-admins to the home page
  if (role !== "admin" && role !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  // AdminShell is its own full-screen layout — no ProtectedLayout wrapper needed
  return <>{children}</>;
};
