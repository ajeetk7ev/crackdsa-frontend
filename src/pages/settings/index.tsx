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

import { api } from "@/lib/axios";

type SettingsTab = "profile" | "password" | "danger";

export function SettingsPage() {
  const authUser = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);
  const addToast = useNotificationStore((state: any) => state.addToast);


  // Active Tab state Binds
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile States Binds
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [leetcodeUser, setLeetcodeUser] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Password States Binds
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Saving states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Modal Dialog states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Load Settings database Binds
  useEffect(() => {
    if (authUser) {
      setFirstName(authUser.firstname || "");
      setLastName(authUser.lastname || "");
      setUsername(authUser.username || "");
      setBio(authUser.bio || "");
      setLeetcodeUser(authUser.leetcodeUsername || "");
      setAvatarPreview(authUser.avatar || "");
    }
  }, [authUser]);

  // 1. Update Profile Settings
  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !username.trim()) {
      addToast("First Name, Last Name, and Username are required.", "warning");
      return;
    }

    try {
      setSavingProfile(true);
      const formData = new FormData();
      formData.append("firstname", firstName.trim());
      formData.append("lastname", lastName.trim());
      formData.append("username", username.trim());
      formData.append("bio", bio.trim());
      formData.append("leetcodeUsername", leetcodeUser.trim());
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await api.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Update auth store user context
      useAuthStore.getState().setUser(response.data.data.user);
      addToast("Profile settings saved successfully.", "success");
      setAvatarFile(null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to update profile settings.";
      addToast(errorMsg, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Change Password Binds
  const handleChangePassword = async () => {
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

    try {
      setSavingPassword(true);
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword
      });
      addToast("Password changed successfully.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to change password.";
      addToast(errorMsg, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  // 3. Reset All Progress
  const handleResetProgress = async () => {
    try {
      await api.delete("/progress/reset");
      addToast("All solve progress logs reset successfully.", "success");
      setIsResetOpen(false);
      window.location.reload();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to reset progress.";
      addToast(errorMsg, "error");
    }
  };

  // 4. Delete Account permanently
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "delete my account") {
      addToast("Please type the confirmation phrase exactly.", "warning");
      return;
    }
    try {
      await api.delete("/auth/delete-account");
      addToast("Account deleted successfully. We hope to see you back!", "info");
      setIsDeleteOpen(false);
      logout();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to delete account.";
      addToast(errorMsg, "error");
    }
  };

  const tabsList = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "password", label: "Password", icon: Lock },
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
          Configure profile details, credentials safety, and account state settings.
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

              {/* Avatar file upload */}
              <div className="flex items-center gap-4 py-2 border-b border-border/40 pb-4">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="profile image"
                    className="size-16 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="size-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-2xl uppercase select-none">
                    {firstName?.[0] || "A"}
                  </div>
                )}
                <div className="space-y-1">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setAvatarFile(e.target.files[0]);
                        setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                    className="text-[10px] h-7 cursor-pointer shadow-sm"
                  >
                    Update Profile Picture
                  </Button>
                  <p className="text-[10px] text-muted-foreground">Supported formats: PNG, JPEG up to 5MB.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    First Name <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Last Name <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Username <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  LeetCode Username:
                </label>
                <input
                  type="text"
                  value={leetcodeUser}
                  onChange={(e) => setLeetcodeUser(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1 text-left">
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

              <div className="space-y-1 text-left">
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
                <Button onClick={handleSaveProfile} disabled={savingProfile} className="text-xs px-5 shadow-sm cursor-pointer">
                  {savingProfile ? "Saving Profile..." : "Save Profile Details"}
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
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Current Password <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    New Password <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Confirm New Password <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                  />
                </div>

                <div className="pt-2">
                  <Button onClick={handleChangePassword} disabled={savingPassword} className="text-xs px-5 shadow-sm cursor-pointer">
                    {savingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* C. DANGER ZONE TAB */}
          {activeTab === "danger" && (
            <div className="space-y-6 max-w-xl text-left">
              <div>
                <Typography variant="title" className="text-destructive font-semibold">
                  ⚠️ Workspace Danger Zone
                </Typography>
                <p className="text-xs text-muted-foreground mt-0.5">Destructive actions relating to study data and profile credentials.</p>
              </div>

              {/* Action 1: Reset workspace progress */}
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      Reset Solve Logs & Revision Spacings
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      This will reset all coding solves records, spaced repetitions SM2 queue intervals, consistency heatmaps, and target goals. Your account login credentials and profile metadata will be kept.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-500/10">
                  <Button
                    onClick={() => setIsResetOpen(true)}
                    variant="outline"
                    className="h-8 text-[11px] text-amber-600 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                  >
                    Reset Progress Only
                  </Button>
                </div>
              </div>

              {/* Action 2: Purge Account permanently */}
              <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="size-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-destructive">
                      Delete Account Permanently
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Completely purge your profile, username records, biography logs, and all dsa progress tables. This action is irreversible.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-destructive/10">
                  <Button
                    onClick={() => {
                      setDeleteConfirmText("");
                      setIsDeleteOpen(true);
                    }}
                    variant="default"
                    className="h-8 text-[11px] bg-destructive hover:bg-destructive-hover text-white cursor-pointer shadow-sm"
                  >
                    Delete Profile & Purge Data
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* RESET CONFIRMATION MODAL */}
      <Dialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Confirm Spaced Revision Reset"
        description="Are you sure you want to clear your solve statistics?"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-muted-foreground leading-relaxed">
            All database correct solve logs, SM-2 next recall schedules, streaks history, and today's goals lists will be wiped out. You will start with a fresh blank canvas dashboard.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setIsResetOpen(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleResetProgress}
              size="sm"
              className="text-xs bg-amber-600 text-white hover:bg-amber-700 cursor-pointer shadow-sm"
            >
              Reset Solve Logs
            </Button>
          </div>
        </div>
      </Dialog>

      {/* CONFIRM DELETE ACCOUNT MODAL */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete CrackDSA Profile Permanently"
        description="Are you absolutely sure? This operation purges all your credentials and databases."
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Type <span className="font-semibold text-foreground select-none">"delete my account"</span> in the confirmation input field below to verify:
          </p>

          <input
            type="text"
            placeholder="Type 'delete my account'"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-destructive focus:border-destructive text-foreground"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              size="sm"
              disabled={deleteConfirmText !== "delete my account"}
              className="text-xs bg-destructive text-white hover:bg-destructive-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm font-semibold"
            >
              Confirm Account Deletion
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
