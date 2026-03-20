import React, { useState, useMemo, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<"user" | "admin" | "superadmin" | null>(null);

  // 1) when the component mounts, check localStorage
  useEffect(() => {
    const stored = localStorage.getItem("isLoggedIn");
    if (stored === "true") {
      setIsLoggedIn(true);
    }
    const storedRole = localStorage.getItem("userRole");
    if (storedRole === "user" || storedRole === "admin" || storedRole === "superadmin") {
      setRole(storedRole);
    }
  }, []);

  // 2) when isLoggedIn changes, save to localStorage
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn ? "true" : "false");
  }, [isLoggedIn]);

  // 3) when role changes, save or clear in localStorage
  useEffect(() => {
    if (role) {
      localStorage.setItem("userRole", role);
    } else {
      localStorage.removeItem("userRole");
    }
  }, [role]);

  const value = useMemo(
    () => ({ isLoggedIn, setIsLoggedIn, role, setRole }),
    [isLoggedIn, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
