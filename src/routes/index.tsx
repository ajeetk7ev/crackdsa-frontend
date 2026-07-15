import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

// Import skeletal page representations (implemented below)
import { LandingPage } from "@/pages/landing";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password";
import { ResetPasswordPage } from "@/pages/auth/reset-password";
import { DashboardPage } from "@/pages/dashboard";
import { ProblemsPage } from "@/pages/problem";
import { BookmarksPage } from "@/pages/bookmarks";
import { ProblemDetailsPage } from "@/pages/problem/details";
import { RevisionPage } from "@/pages/revision";
import { CollectionsPage } from "@/pages/collections";
import { ReportsPage } from "@/pages/reports";
import { ProfilePage } from "@/pages/profile";
import { SettingsPage } from "@/pages/settings";
import { AdminDashboardPage } from "@/pages/admin/dashboard";
import { AdminProblemsPage } from "@/pages/admin/problems";
import { AdminUsersPage } from "@/pages/admin/users";
import { AdminAnalyticsPage } from "@/pages/admin/analytics";
import { NotFoundPage } from "@/pages/not-found";

export function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Routes Group */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* 2. Authentication Flow Group */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="" element={<Navigate to="login" replace />} />
      </Route>

      {/* 3. Protected Dashboard Space */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/problems/:id" element={<ProblemDetailsPage />} />
        <Route path="/revision" element={<RevisionPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 4. Protected Admin Space */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/problems" element={<AdminProblemsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      </Route>

      {/* 5. 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
