import type { FC, ReactNode } from "react";
import { useUser } from "@/features/hooks/swr/fetcher/user/useUser";
import { useAuth } from "@/features/hooks/context/useAuth";
import { Loading } from "@/components/ui/Loading";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { Navigate } from "react-router-dom";

type AdminRouteProps = {
  children: ReactNode;
};

export const AdminRoute: FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading, isError } = useUser();
  const { role } = useAuth();

  if (isLoading) {
    return <Loading />;
  } else if (isError) {
    return <ErrorDisplay status={404} errorMessage="User is not found" />;
  } else if (!user) {
    return null;
  }

  // Redirect non-admins to the home page
  if (role !== "admin" && role !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  return <ProtectedLayout>{children}</ProtectedLayout>;
};
