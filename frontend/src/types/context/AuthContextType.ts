export type AuthContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  role: "user" | "admin" | "superadmin" | null;
  setRole: React.Dispatch<React.SetStateAction<"user" | "admin" | "superadmin" | null>>;
};
