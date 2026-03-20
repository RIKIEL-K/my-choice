import { useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/features/hooks/swr/fetcher/fetcher";
import type { UserRead } from "@/types/api/user/user";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/hooks/context/useAuth";

export function useUser() {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<UserRead>("/users/me", fetcher);
  const navigate = useNavigate();
  const { setIsLoggedIn, setRole } = useAuth();

  useEffect(() => {
    if (user?.role) {
      setRole(user.role as "user" | "admin" | "superadmin");
    }
  }, [user?.role, setRole]);

  if (!isLoading && error) {
    if (error.status === 401) {
      setIsLoggedIn(false);
      setRole(null);
      navigate("/signin", {
        state: { errorMessage: "You must be logged in to access this page." },
      });
    }
  }

  return {
    user,
    isLoading,
    isError: error,
    mutate,
  };
}
