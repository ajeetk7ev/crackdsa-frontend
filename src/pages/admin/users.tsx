import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { UserDetailModal } from "@/components/admin/UserDetailModal";

import {
  Plus,
  Trash2,
  UserCheck,
  Shield,
  CheckCircle2,
  XCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "admin" | "student" | string;
  status?: "active" | "blocked" | string;
  avatar?: string;
  createdAt?: string;
  solvedCount?: number;
}

const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export function AdminUsersPage() {
  const addToast = useNotificationStore((state: any) => state.addToast);

  // Core Data States
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals Visibility
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form Fields Binds
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"admin" | "student">("student");

  // Deletion Target
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadAdminUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data?.data || []);
    } catch {
      addToast("Failed to fetch admin users directory.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminUsers();
  }, []);

  // Compute Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role?.toLowerCase() === "admin").length;
    const students = users.filter((u) => u.role?.toLowerCase() === "student" || u.role?.toLowerCase() === "user").length;
    const blocked = users.filter((u) => u.status === "blocked").length;
    return { total, admins, students, blocked };
  }, [users]);

  // Filtered List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);

      const matchRole =
        filterRole === "All" ||
        (filterRole === "admin" && u.role?.toLowerCase() === "admin") ||
        (filterRole === "student" && (u.role?.toLowerCase() === "student" || u.role?.toLowerCase() === "user"));

      const matchStatus =
        filterStatus === "All" ||
        (filterStatus === "active" && u.status === "active") ||
        (filterStatus === "blocked" && u.status === "blocked");

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  // Pagination Compute
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page index on filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterStatus]);

  // Toggle user role Action Binds
  const handleToggleRole = async (id: string) => {
    try {
      await api.put(`/admin/users/${id}/role`);
      addToast("User role toggled successfully.", "success");
      loadAdminUsers();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || "Failed to update user role.";
      addToast(errMsg, "error");
    }
  };

  // Toggle user status Action Binds
  const handleToggleBlock = async (id: string) => {
    try {
      await api.put(`/admin/users/${id}/status`);
      addToast("User account status toggled.", "info");
      loadAdminUsers();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || "Failed to update user status.";
      addToast(errMsg, "error");
    }
  };

  // Manual Add User Action Binds
  const handleAddUserSubmit = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword) {
      addToast("All fields are required.", "warning");
      return;
    }

    const nameParts = formName.trim().split(/\s+/);
    const firstname = nameParts[0] || "User";
    const lastname = nameParts.slice(1).join(" ") || "Name";
    const backendRole = formRole === "admin" ? "ADMIN" : "USER";

    try {
      await api.post("/admin/users", {
        firstname,
        lastname,
        email: formEmail,
        password: formPassword,
        role: backendRole,
      });
      addToast(`Account created for ${formName}.`, "success");
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setFormRole("student");
      setIsAddOpen(false);
      loadAdminUsers();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || "Failed to create user account.";
      addToast(errMsg, "error");
    }
  };

  // Open Delete modal
  const handleOpenDelete = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteOpen(true);
  };

  // Confirm delete Action Binds
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/admin/users/${deleteTargetId}`);
      addToast("User account permanently deleted.", "info");
      setIsDeleteOpen(false);
      setDeleteTargetId(null);
      loadAdminUsers();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || "Failed to delete user.";
      addToast(errMsg, "error");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-xs font-semibold">
        Loading admin users database directory...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <Typography variant="h1" className="font-semibold text-foreground">
            User Account Management
          </Typography>
          <Typography variant="muted">
            Manage user roles, inspect candidate progress, or register users manually.
          </Typography>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="h-9 text-xs cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Plus className="size-4" /> Add User
        </Button>
      </div>

      {/* STATISTICS CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-left">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Total Users</span>
          <span className="text-xl font-bold text-foreground">{stats.total}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-left">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Administrator Binds</span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{stats.admins}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-left">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Students</span>
          <span className="text-xl font-bold text-foreground">{stats.students}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-left">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Blocked Access</span>
          <span className="text-xl font-bold text-rose-500">{stats.blocked}</span>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <SearchInput
            placeholder="Search by Name or Email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-xs h-9"
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium select-none"
            >
              <option value="All">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="student">Students</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium select-none"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* USER CMS TABLE */}
      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground select-none">
                <th className="px-4 py-3 w-16 text-center">Status</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3 text-center">Solved</th>
                <th className="px-4 py-3 w-28">Role</th>
                <th className="px-4 py-3 w-28">Join Date</th>
                <th className="px-4 py-3 text-center w-52">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="max-w-md mx-auto space-y-2">
                      <Users className="size-8 text-muted-foreground/60 mx-auto" />
                      <p className="font-semibold text-foreground">No Users Found</p>
                      <p className="text-xs">Adjust search parameters or create a new user profile.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((item) => {
                  const isBlocked = item.status === "blocked";
                  const joinDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jul 12, 2026";

                  return (
                    <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3.5 text-center" title={isBlocked ? "Blocked" : "Active"}>
                        {isBlocked ? (
                          <XCircle className="size-4 text-rose-500 mx-auto" />
                        ) : (
                          <CheckCircle2 className="size-4 text-emerald-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground uppercase overflow-hidden shrink-0 shadow-sm">
                            {item.avatar ? (
                              <img
                                src={item.avatar}
                                alt={item.name}
                                className="size-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              getInitials(item.name)
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground block truncate">{item.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono block truncate mt-0.5">ID: {item.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {item.email}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {item.solvedCount ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {item.role?.toLowerCase() === "admin" ? (
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 select-none">
                            <Shield className="size-3" /> Admin
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-zinc-600 bg-zinc-500/10 px-2 py-0.5 rounded-full select-none dark:text-zinc-300">
                            Student
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {joinDate}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          
                          <button
                            onClick={() => {
                              setSelectedUserId(item.id);
                              setIsDetailOpen(true);
                            }}
                            className="h-7 px-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer shadow-sm inline-flex items-center gap-1"
                            title="View Candidate Progress"
                          >
                            <BarChart2 className="size-3" /> Progress
                          </button>

                          <button
                            onClick={() => handleToggleRole(item.id)}
                            className="h-7 px-2 rounded-lg border border-border bg-background hover:bg-muted/50 text-[10px] font-semibold text-foreground cursor-pointer shadow-sm inline-flex items-center gap-1"
                            title="Toggle Role"
                          >
                            <UserCheck className="size-3 text-indigo-500" /> Role
                          </button>

                          <button
                            onClick={() => handleToggleBlock(item.id)}
                            className={cn(
                              "h-7 px-2 rounded-lg border text-[10px] font-semibold cursor-pointer shadow-sm inline-flex items-center gap-1",
                              isBlocked 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20"
                                : "bg-rose-500/10 border-rose-500/20 text-rose-600 hover:bg-rose-500/20"
                            )}
                            title={isBlocked ? "Unblock Account" : "Block Account"}
                          >
                            <ShieldAlert className="size-3" /> {isBlocked ? "Unblock" : "Block"}
                          </button>

                          <button
                            onClick={() => handleOpenDelete(item.id)}
                            className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="size-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground">
        <span>Showing page {currentPage} of {totalPages} ({filteredUsers.length} results)</span>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 px-3 rounded-lg border border-border bg-background text-foreground hover:bg-muted/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <ChevronLeft className="size-3.5" /> Previous
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 px-3 rounded-lg border border-border bg-background text-foreground hover:bg-muted/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            Next <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ===================================================
          MODAL INTERFACES
          =================================================== */}

      {/* 1. Add User Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New User Account"
        description="Manually catalogue administrator or student credentials."
      >
        <div className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Full Name:
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Robin Hood"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Email Address:
            </label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="user@example.com"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Password Binds:
            </label>
            <input
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Role Authority:
            </label>
            <select
              value={formRole}
              onChange={(e: any) => setFormRole(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium select-none w-full"
            >
              <option value="student">Student Practice account</option>
              <option value="admin">Admin CMS controls</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleAddUserSubmit} size="sm" className="text-xs cursor-pointer shadow-sm">
              Create User
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 2. Confirm Delete User Dialog */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm User Account Deletion"
        description="This action cannot be undone. Are you sure you want to delete this profile?"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-muted-foreground">
            Deleting this user will revoke dashboard access and purge progress details.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              size="sm"
              className="text-xs bg-destructive text-white hover:bg-destructive-hover cursor-pointer"
            >
              Delete User
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 3. User Detailed Analytics & Progress Modal */}
      <UserDetailModal
        userId={selectedUserId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

    </div>
  );
}
