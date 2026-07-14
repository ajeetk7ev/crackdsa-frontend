import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  User as UserIcon,
  Lock,
  Paintbrush,
  Bell,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "password" | "preferences" | "notifications" | "danger";

export function SettingsPage() {
  const authUser = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);
  const addToast = useNotificationStore((state: any) => state.addToast);

  const { theme, setTheme } = useThemeStore();

  // Active Tab state Binds
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile States Binds
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [leetcodeUser, setLeetcodeUser] = useState("");

  // Password States Binds
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notifications States Binds
  const [dailyStreak, setDailyStreak] = useState(true);
  const [revisionReminder, setRevisionReminder] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(false);

  // Modal Dialog states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Load Settings database Binds
  useEffect(() => {
    const savedName = localStorage.getItem("profile_name") || authUser?.name || "Alex Miller";
    const savedUser = localStorage.getItem("profile_username") || "alex_miller";
    const savedBio = localStorage.getItem("profile_bio") || "SDE Prep | Targeting Mid-Level placement boards";
    const savedLC = localStorage.getItem("profile_leetcode_username") || "alex_leetcode";

    setFullName(savedName);
    setUsername(savedUser);
    setBio(savedBio);
    setLeetcodeUser(savedLC);

    // Notifications Binds
    const notifyStr = localStorage.getItem("crackdsa_settings_notifications");
    if (notifyStr) {
      const parsed = JSON.parse(notifyStr);
      setDailyStreak(!!parsed.dailyStreak);
      setRevisionReminder(!!parsed.revisionReminder);
      setWeeklyReport(!!parsed.weeklyReport);
      setMonthlyReport(!!parsed.monthlyReport);
    }
  }, [authUser]);

  // 1. Update Profile Settings
  const handleSaveProfile = async () => {
    if (!fullName.trim() || !username.trim()) {
      addToast("Full Name and Username cannot be empty.", "warning");
      return;
    }

    try {
      localStorage.setItem("profile_name", fullName);
      localStorage.setItem("profile_username", username);
      localStorage.setItem("profile_bio", bio);
      localStorage.setItem("profile_leetcode_username", leetcodeUser);

      // Trigger store action
      await updateProfile(fullName);
      addToast("Profile settings saved successfully.", "success");
    } catch {
      addToast("Failed to update profile settings.", "error");
    }
  };

  // 2. Change Password Binds
  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast("Please fill in all password fields.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("New Password and Confirmation do not match.", "error");
      return;
    }
    if (newPassword.length < 6) {
      addToast("Password should be at least 6 characters.", "warning");
      return;
    }

    // Success Mock Trigger
    addToast("Password changed successfully.", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // 3. Save Preferences Notifications
  const handleSaveNotifications = () => {
    const payload = { dailyStreak, revisionReminder, weeklyReport, monthlyReport };
    localStorage.setItem("crackdsa_settings_notifications", JSON.stringify(payload));
    addToast("Notification preferences updated.", "success");
  };

  // 4. Delete Account simulated trigger
  const handleDeleteAccount = () => {
    setIsDeleteOpen(false);
    addToast("Account deleted successfully. We hope to see you back!", "info");
    
    // Clear storage database indices
    localStorage.removeItem("crackdsa-token");
    localStorage.removeItem("crackdsa-user");
    localStorage.removeItem("mock_submissions");
    localStorage.removeItem("mock_revisions");
    localStorage.removeItem("mock_collections");
    localStorage.removeItem("mock_streaks");
    localStorage.removeItem("mock_notes");
    localStorage.removeItem("profile_name");
    localStorage.removeItem("profile_username");
    localStorage.removeItem("profile_bio");
    localStorage.removeItem("profile_leetcode_username");
    
    // Trigger logout redirection
    logout();
  };

  const tabsList = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "password", label: "Password", icon: Lock },
    { id: "preferences", label: "Preferences", icon: Paintbrush },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "danger", label: "Danger Zone", icon: Trash2 },
  ] as const;

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left">
      
      {/* Header */}
      <div>
        <Typography variant="h1" className="font-semibold text-foreground">
          Account Settings
        </Typography>
        <Typography variant="muted">
          Configure profile details, theme visual styles, and spacing reminders.
        </Typography>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Left Column Sidebar Tabs Binds */}
        <div className="w-full md:w-64 bg-card border border-border rounded-xl p-2 shrink-0 space-y-1">
          {tabsList.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left cursor-pointer",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className={cn("size-4 shrink-0", isActive ? "text-primary" : "")} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Content Panels */}
        <div className="flex-1 w-full bg-card border border-border rounded-xl p-6 shadow-sm min-h-[400px]">
          
          {/* A. PROFILE TAB CONFIGURATIONS */}
          {activeTab === "profile" && (
            <div className="space-y-6 max-w-xl">
              <div>
                <Typography variant="title" className="text-foreground">
                  👤 Public Profile Details
                </Typography>
                <p className="text-xs text-muted-foreground mt-0.5">Settings visible on achievements cards and dashboards.</p>
              </div>

              {/* Avatar simulated view */}
              <div className="flex items-center gap-4 py-2 border-b border-border/40 pb-4">
                <div className="size-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-2xl uppercase select-none">
                  {fullName?.[0] || "A"}
                </div>
                <div className="space-y-1">
                  <Button variant="outline" size="xs" onClick={() => addToast("Profile picture uploads connected in Phase 10.", "info")} className="text-[10px] h-7 cursor-pointer shadow-sm">
                    Update Profile Picture
                  </Button>
                  <p className="text-[10px] text-muted-foreground">Supported file formats: PNG, JPEG up to 2MB.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Full Name:
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Username:
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  LeetCode Username:
                </label>
                <input
                  type="text"
                  value={leetcodeUser}
                  onChange={(e) => setLeetcodeUser(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Short Biography:
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="text-xs h-24"
                  placeholder="Curate bio lines..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Joined Date:
                </label>
                <input
                  type="text"
                  value="July 14, 2026"
                  disabled
                  className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-xs shadow-sm text-muted-foreground select-none cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <Button onClick={handleSaveProfile} className="text-xs px-5 shadow-sm cursor-pointer">
                  Save Profile Details
                </Button>
              </div>
            </div>
          )}

          {/* B. PASSWORD TAB CONFIGURATIONS */}
          {activeTab === "password" && (
            <div className="space-y-6 max-w-xl">
              <div>
                <Typography variant="title" className="text-foreground">
                  🔑 Change Password
                </Typography>
                <p className="text-xs text-muted-foreground mt-0.5">Ensure account safety logs are updated regularly.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Current Password:
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    New Password:
                  </label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Confirm New Password:
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
                  />
                </div>

                <div className="pt-2">
                  <Button onClick={handleChangePassword} className="text-xs px-5 shadow-sm cursor-pointer">
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* C. PREFERENCES TAB CONFIGURATIONS */}
          {activeTab === "preferences" && (
            <div className="space-y-6 max-w-xl">
              <div>
                <Typography variant="title" className="text-foreground">
                  🎨 Theme Customization
                </Typography>
                <p className="text-xs text-muted-foreground mt-0.5">Switch default dark mode styling configurations.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "p-5 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all cursor-pointer shadow-sm",
                    theme === "light"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background hover:bg-muted/40"
                  )}
                >
                  <div className="size-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-800 text-sm">
                    ☀️
                  </div>
                  <span className="text-xs font-semibold">Light Mode</span>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "p-5 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all cursor-pointer shadow-sm",
                    theme === "dark"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background hover:bg-muted/40"
                  )}
                >
                  <div className="size-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 text-sm">
                    🌙
                  </div>
                  <span className="text-xs font-semibold">Dark Mode</span>
                </button>
              </div>
            </div>
          )}

          {/* D. NOTIFICATIONS TAB CONFIGURATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6 max-w-xl">
              <div>
                <Typography variant="title" className="text-foreground">
                  🔔 Push & Email Notifications
                </Typography>
                <p className="text-xs text-muted-foreground mt-0.5">Configure spaced-repetition timing reminders.</p>
              </div>

              <div className="space-y-4">
                <Checkbox
                  checked={dailyStreak}
                  onChange={(e) => setDailyStreak(e.target.checked)}
                  label="Daily Streak Safety Reminders"
                />
                <p className="text-[10px] text-muted-foreground pl-6 -mt-3">Notify me if streak count flags are due to expire in 4 hours.</p>

                <Checkbox
                  checked={revisionReminder}
                  onChange={(e) => setRevisionReminder(e.target.checked)}
                  label="Daily Spaced Revisions Notification"
                />
                <p className="text-[10px] text-muted-foreground pl-6 -mt-3">Pings alert notifications listing problems scheduled for revision today.</p>

                <Checkbox
                  checked={weeklyReport}
                  onChange={(e) => setWeeklyReport(e.target.checked)}
                  label="Weekly SDE Performance Report"
                />
                <p className="text-[10px] text-muted-foreground pl-6 -mt-3">Curate weekly statistics summaries of accuracy and playlists checks.</p>

                <Checkbox
                  checked={monthlyReport}
                  onChange={(e) => setMonthlyReport(e.target.checked)}
                  label="Monthly Consistency Newsletter digest"
                />
                <p className="text-[10px] text-muted-foreground pl-6 -mt-3">Monthly digests calculating global percentile tier jumps.</p>

                <div className="pt-2 border-t border-border/40">
                  <Button onClick={handleSaveNotifications} className="text-xs px-5 shadow-sm cursor-pointer">
                    Save Notification Binds
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* E. DANGER ZONE TAB */}
          {activeTab === "danger" && (
            <div className="space-y-6 max-w-xl">
              <div className="p-4 rounded-xl border border-destructive bg-destructive/5 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-5 text-destructive shrink-0" />
                  <div className="space-y-1">
                    <Typography variant="title" className="text-destructive font-semibold">
                      Danger Zone: Delete Account
                    </Typography>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Deletes all persistent statistics, streaks, database correct submissions, custom study collections, and recall timelines. Once deleted, data recovery is impossible.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-destructive/20">
                  <Button
                    onClick={() => setIsDeleteOpen(true)}
                    variant="outline"
                    className="h-9 text-xs text-destructive hover:bg-destructive hover:text-white border-destructive cursor-pointer"
                  >
                    Delete Account Permanently
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* CONFIRM DELETE MODAL */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Permanent Account Deletion"
        description="Are you absolutely certain? This operation completely purges your DSA preparation databases."
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-muted-foreground">
            Your streaks progress, SRS schedules, connected LeetCode profile ratios, and Curated playlists will be deleted from the database files.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              size="sm"
              className="text-xs bg-destructive text-white hover:bg-destructive-hover cursor-pointer"
            >
              Purge Database & Exit
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
