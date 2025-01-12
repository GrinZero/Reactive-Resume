import {
  createBrowserRouter,
  createHashRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";

// import { BackupOtpPage } from "../pages/auth/backup-otp/page";
// import { ForgotPasswordPage } from "../pages/auth/forgot-password/page";
// import { AuthLayout } from "../pages/auth/layout";
// import { LoginPage } from "../pages/auth/login/page";
// import { RegisterPage } from "../pages/auth/register/page";
// import { ResetPasswordPage } from "../pages/auth/reset-password/page";
// import { VerifyEmailPage } from "../pages/auth/verify-email/page";
// import { VerifyOtpPage } from "../pages/auth/verify-otp/page";
import { BuilderLayout } from "../pages/builder/layout";
import { builderLoader, BuilderPage } from "../pages/builder/page";
import { BrainPage } from "../pages/dashboard/brain/page";
import { DashboardLayout } from "../pages/dashboard/layout";
import { ResumesPage } from "../pages/dashboard/resumes/page";
import { SettingsPage } from "../pages/dashboard/settings/page";
import { HomeLayout } from "../pages/home/layout";
import { PrivacyPolicyPage } from "../pages/home/meta/privacy-policy/page";
import { HomePage } from "../pages/home/page";
import { publicLoader, PublicResumePage } from "../pages/public/page";
import { Providers } from "../providers";
import { AuthGuard } from "./guards/auth";
// import { GuestGuard } from "./guards/guest";
// import { authLoader } from "./loaders/auth";

export const routes = createRoutesFromElements(
  <Route element={<Providers />}>
    <Route element={<HomeLayout />}>
      <Route path="" element={<HomePage />} />

      <Route path="meta">
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route index element={<Navigate replace to="" />} />
      </Route>
    </Route>

    <Route path="dashboard">
      <Route element={<AuthGuard />}>
        <Route element={<DashboardLayout />}>
          <Route path="brain" element={<BrainPage />} />
          <Route path="resumes" element={<ResumesPage />} />
          <Route path="settings" element={<SettingsPage />} />

          <Route index element={<Navigate replace to="/dashboard/brain" />} />
        </Route>
      </Route>
    </Route>

    <Route path="builder">
      <Route element={<AuthGuard />}>
        <Route element={<BuilderLayout />}>
          <Route path=":id" loader={builderLoader} element={<BuilderPage />} />

          <Route index element={<Navigate replace to="/dashboard/resumes" />} />
        </Route>
      </Route>
    </Route>

    {/* Public Routes */}
    <Route path=":username">
      <Route path=":slug" loader={publicLoader} element={<PublicResumePage />} />
    </Route>
  </Route>,
);

const createAppRouter = import.meta.env.DEV ? createBrowserRouter : createHashRouter;
export const router = createAppRouter(routes);
