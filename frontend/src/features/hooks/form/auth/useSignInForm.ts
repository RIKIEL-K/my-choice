import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSignInMutation } from "@/features/hooks/swr/mutation/useSignInMutation";
import type { SignInValues } from "@/components/forms/AuthForm";
import { parseAxiosErrorMessage } from "@/lib/parseAxiosErrorMessage";
import { useAuth } from "@/features/hooks/context/useAuth";

export function useSignInForm() {
  const navigate = useNavigate();
  const { trigger, isMutating } = useSignInMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const { setIsLoggedIn } = useAuth();

  const onSubmitSignIn = async (data: SignInValues) => {
    try {
      await trigger({
        username: data.email,
        password: data.password,
        scope: "",
        grant_type: "password",
      });
      // After login, fetch the basic user data to navigate to the correct page immediately
      const user = await import("@/features/hooks/swr/fetcher/fetcher").then(m => m.fetcher("/users/me"));
      
      setIsLoggedIn(true);
      const userRole = (user as any)?.role || "user";
      
      if (userRole === "admin" || userRole === "superadmin") {
        navigate("/admin", {
          state: { successMessage: "Logged in successfully as admin" },
        });
      } else {
        navigate("/", {
          state: { successMessage: "Logged in successfully" },
        });
      }
    } catch (error) {
      setErrorMessage(parseAxiosErrorMessage(error));
    }
  };

  return {
    onSubmitSignIn,
    errorMessage,
    isMutating,
  };
}
