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

const routes = [
  { path: "/", element: <HomePage />, isPrivate: true },
  { path: "/signin", element: <SigninPage />, isPrivate: false },
  { path: "/signup", element: <SignupPage />, isPrivate: false },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
    isPrivate: false,
  },
  {
    path: "/sent-reset-password-mail",
    element: <SentResetPasswordMailPage />,
    isPrivate: false,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPasswordPage />,
    isPrivate: false,
  },
  { path: "/not-verified", element: <NotVerifiedPage />, isPrivate: true },
  {
    path: "/verify-token/:token",
    element: <VerifyTokenPage />,
    isPrivate: true,
  },
  {
    path: "/me/edit",
    element: <EditUserPage />,
    isPrivate: true,
  },
  {
    path: "/elections/:id/vote",
    element: <VotePage />,
    isPrivate: true,
  },
  {
    path: "/elections/candidates",
    element: <CandidatesPage />,
    isPrivate: true,
  },
  {
    path: "/elections/candidates/:id/program",
    element: <CandidateProgramPage />,
    isPrivate: true,
  },
  {
    path: "/admin",
    element: <AdminDashboardPage />,
    isAdmin: true,
  },
];

function App() {
  return (
    <div className="max-w-[1200px] mx-auto w-full">
      <ToastMessageHandler />
      <Routes>
        {routes.map((route) => {
          let element;
          if (route.isAdmin) {
            element = <AdminRoute>{route.element}</AdminRoute>;
          } else if (route.isPrivate) {
            element = <ProtectedRoute>{route.element}</ProtectedRoute>;
          } else {
            element = <PublicOnlyRoute>{route.element}</PublicOnlyRoute>;
          }
          return <Route key={route.path} path={route.path} element={element} />;
        })}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
