import type { FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { useLogout } from "@/features/hooks/auth/useLogout";
import { serviceName } from "@/config";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export const ProtectedLayout: FC<ProtectedLayoutProps> = ({ children }) => {
  const { onLogout } = useLogout();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        title={serviceName}
        onEditProfile={() => navigate("/me/edit")}
        onLogout={onLogout}
      />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
