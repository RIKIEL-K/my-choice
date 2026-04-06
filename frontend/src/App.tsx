import { Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { SigninPage } from "@/pages/SigninPage";
import { SignupPage } from "@/pages/SIgnupPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { SentResetPasswordMailPage } from "@/pages/SentResetPasswordMailPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { NotVerifiedPage } from "@/pages/NotVerifiedPage";
import { VerifyTokenPage } from "@/pages/VerifyTokenPage";
import { EditUserPage } from "@/pages/EditUserPage";
import { VotePage } from "@/pages/VotePage";
import { CandidatesPage } from "@/pages/CandidatesPage";
import { CandidateProgramPage } from "@/pages/CandidateProgramPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/routes/PublicOnlyRoute";
import { AdminRoute } from "@/components/routes/AdminRoute";
import { ToastMessageHandler } from "@/components/common/ToastMessageHandler";

// Routes that live inside the standard constrained layout
const standardRoutes = [
  { path: "/", element: <HomePage />, isPrivate: true },
  { path: "/signin", element: <SigninPage />, isPrivate: false },
  { path: "/signup", element: <SignupPage />, isPrivate: false },
  { path: "/forgot-password", element: <ForgotPasswordPage />, isPrivate: false },
  { path: "/sent-reset-password-mail", element: <SentResetPasswordMailPage />, isPrivate: false },
  { path: "/reset-password/:token", element: <ResetPasswordPage />, isPrivate: false },
  { path: "/not-verified", element: <NotVerifiedPage />, isPrivate: true },
  { path: "/verify-token/:token", element: <VerifyTokenPage />, isPrivate: true },
  { path: "/me/edit", element: <EditUserPage />, isPrivate: true },
  { path: "/elections/:id/vote", element: <VotePage />, isPrivate: true },
  { path: "/elections/candidates", element: <CandidatesPage />, isPrivate: true },
  { path: "/elections/candidates/:id/program", element: <CandidateProgramPage />, isPrivate: true },
];

function App() {
  return (
    <>
      <ToastMessageHandler />
      <Routes>
        {/* Admin dashboard — full-screen, no width constraint */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        {/* Standard constrained layout */}
        <Route
          path="/*"
          element={
            <div className="max-w-[1200px] mx-auto w-full">
              <Routes>
                {standardRoutes.map((route) => {
                  const element = route.isPrivate
                    ? <ProtectedRoute>{route.element}</ProtectedRoute>
                    : <PublicOnlyRoute>{route.element}</PublicOnlyRoute>;
                  return <Route key={route.path} path={route.path} element={element} />;
                })}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
