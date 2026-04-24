"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  Shield,
  Edit2,
  Trash2,
  Filter,
  X,
  UserCheck,
  Mail,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import ListPagination from "@/components/ui/ListPagination";
import ListToolbar from "@/components/ui/ListToolbar";
import usePaginatedData from "@/hooks/usePaginatedData";

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const roleFilters = ["all", "ADMIN", "SERVICE_ADVISOR", "TECHNICIAN", "ACCOUNTANT", "STORE_MANAGER"];

import LoadingSpinner from "@/components/ui/LoadingSpinner";
 
export default function StaffPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
 
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch {
      toast.error("Failed to load staff records");
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
 
  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to revoke access and remove this staff member?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Staff record removed");
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to remove staff");
      }
    } catch {
      toast.error("Failed to remove staff");
    }
  };
 
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);
 
  const { page, pageCount, pageSize, paginatedItems, setPage } = usePaginatedData(filteredUsers);
 
  if (loading) return <LoadingSpinner label="Syncing Workforce Registry..." />;
 
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Structure matching Quotations */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 border border-[#d8dee6] bg-white px-3 py-1 shadow-sm">
            <div className="h-1.5 w-1.5 bg-[#f59e0b]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#263238]">Workforce Console</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263238] uppercase italic">
            Personnel <span className="text-[#f59e0b]">Registry</span>
          </h1>
          <p className="text-sm font-medium text-[#64748b]/70">Securely manage workshop staff and authorization levels.</p>
        </div>

        <Link
          href="/dashboard/staff/create"
          className="inline-flex items-center justify-center gap-3 bg-[#263238] px-6 py-4 text-xs font-black uppercase italic tracking-tight text-white shadow-xl shadow-[#263238]/20 transition-all hover:bg-[#64748b]"
        >
          <Plus size={18} className="text-[#f59e0b]" strokeWidth={3} />
          Onboard Staff
        </Link>
      </div>

      {/* Toolbar & Filters matching Quotations */}
      <div className="space-y-3">
        <ListToolbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search personnel by name, email or role..."
          searchClassName="md:max-w-2xl"
          rightSlot={
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className={`inline-flex h-11 w-11 items-center justify-center border transition-all ${
                showFilters
                  ? "border-[#f59e0b] bg-[#f59e0b] text-white"
                  : "border-[#d8dee6] bg-white text-[#263238] hover:bg-[#f7f4ef]"
              }`}
            >
              {showFilters ? <X size={18} /> : <Filter size={18} />}
            </button>
          }
        />

        {showFilters && (
          <div className="dashboard-surface flex flex-wrap items-center gap-2 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {roleFilters.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setRoleFilter(role);
                  setPage(1);
                }}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  roleFilter === role
                    ? "bg-[#263238] text-white"
                    : "border border-[#d8dee6] bg-white text-[#64748b] hover:text-[#263238]"
                }`}
              >
                {role.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Registry Table matching Quotations Table */}
      <div className="overflow-hidden border border-[#d8dee6] bg-white shadow-[0_20px_50px_rgba(5,91,101,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#d8dee6] bg-[#f7f4ef]/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b]">Personnel Member</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b]">Credentials</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b]">Access Role</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b]">Joined</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b]">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dee6]/30">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <Shield className="h-12 w-12 text-[#64748b]/20" />
                       <p className="text-sm font-bold text-[#64748b]/40">No personnel records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((user) => (
                  <tr key={user._id}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#263238] text-sm font-black text-white group-hover:bg-[#f59e0b] group-hover:text-[#263238] transition-all">
                          {user.name.charAt(0)}
                        </div>
                        <div className="space-y-1">
                           <p className="text-sm font-black uppercase tracking-tight text-[#263238]">{user.name}</p>
                           <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#64748b]/60">
                              <UserCheck size={10} className="text-[#f59e0b]" />
                              Active Personnel
                           </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-sm font-bold text-[#64748b]">
                          <Mail size={14} className="text-[#64748b]/40" />
                          {user.email}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-2 border border-[#263238]/20 bg-[#263238]/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#263238]">
                        <Shield size={10} className="text-[#f59e0b]" />
                        {user.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-[11px] font-bold text-[#64748b]">
                          <Calendar size={14} className="text-[#64748b]/40" />
                          {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/staff/${user._id}`}
                          className="flex h-10 w-10 items-center justify-center bg-[#263238]/5 text-[#263238] transition-all hover:bg-[#263238] hover:text-white"
                          title="View Profile Telemetry"
                        >
                          <Users size={16} />
                        </Link>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="flex h-10 w-10 items-center justify-center text-rose-500 transition-all hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <ListPagination page={page} pageCount={pageCount} pageSize={pageSize} total={filteredUsers.length} onPageChange={setPage} />
      </div>
    </div>
  );
}


