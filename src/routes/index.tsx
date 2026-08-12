import { Routes, Route } from "react-router-dom";
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
import { GoogleSuccessPage } from "@/pages/auth/google-success";
import { DashboardPage } from "@/pages/dashboard";
import { ProblemsPage } from "@/pages/problem";
import { BookmarksPage } from "@/pages/bookmarks";
import { ProblemDetailsPage } from "@/pages/problem/details";
import { RevisionPage } from "@/pages/revision";
import { CollectionsPage } from "@/pages/collections";
import { ContestsPage } from "@/pages/contests";
import { ReportsPage } from "@/pages/reports";
import { ProfilePage } from "@/pages/profile";
import { SettingsPage } from "@/pages/settings";
import { SheetsPage } from "@/pages/sheets";
import { SheetDetailsPage } from "@/pages/sheets/details";
import { MockTestsPage } from "@/pages/mock-tests";
import { MockTestActivePage } from "@/pages/mock-tests/test";
import { MockTestResultPage } from "@/pages/mock-tests/result";
import { MockTestLeaderboardPage } from "@/pages/mock-tests/leaderboard";
import { AdminSheetsPage } from "@/pages/admin/sheets";
import { AdminSheetsFormPage } from "@/pages/admin/sheets/form";
import { AdminMockTestsPage } from "@/pages/admin/mock-tests";
import { AdminMockTestFormPage } from "@/pages/admin/mock-tests/form";
import { AdminMockTestAnalyticsPage } from "@/pages/admin/mock-tests/analytics";
import { AdminDashboardPage } from "@/pages/admin/dashboard";
import { AdminProblemsPage } from "@/pages/admin/problems";
import { AdminUsersPage } from "@/pages/admin/users";
import { AdminAnalyticsPage } from "@/pages/admin/analytics";
import { NotFoundPage } from "@/pages/not-found";

import { PublicProfilePage } from "@/pages/profile/public";


export function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Routes Group */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/u/:username" element={<PublicProfilePage />} />
      </Route>

      {/* 2. Authentication Flow Group */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/google/success" element={<GoogleSuccessPage />} />
        <Route path="/auth/google/success" element={<GoogleSuccessPage />} />
      </Route>

      {/* 3. Protected Dashboard Space */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/problems/:id" element={<ProblemDetailsPage />} />
        <Route path="/revision" element={<RevisionPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/contests" element={<ContestsPage />} />
        <Route path="/mock-tests" element={<MockTestsPage />} />
        <Route path="/mock-tests/:id/test" element={<MockTestActivePage />} />
        <Route path="/mock-tests/:id/result" element={<MockTestResultPage />} />
        <Route path="/mock-tests/:id/leaderboard" element={<MockTestLeaderboardPage />} />
        <Route path="/sheets" element={<SheetsPage />} />
        <Route path="/sheets/:id" element={<SheetDetailsPage />} />
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
        <Route path="/admin/sheets" element={<AdminSheetsPage />} />
        <Route path="/admin/sheets/new" element={<AdminSheetsFormPage />} />
        <Route path="/admin/sheets/edit/:id" element={<AdminSheetsFormPage />} />
        <Route path="/admin/mock-tests" element={<AdminMockTestsPage />} />
        <Route path="/admin/mock-tests/new" element={<AdminMockTestFormPage />} />
        <Route path="/admin/mock-tests/edit/:id" element={<AdminMockTestFormPage />} />
        <Route path="/admin/mock-tests/:id/analytics" element={<AdminMockTestAnalyticsPage />} />
      </Route>

      {/* 5. 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
