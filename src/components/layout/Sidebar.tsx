"use client";

import {
  Activity,
  Banknote,
  Bell,
  ClipboardList,
  Database,
  FileText,
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShoppingCart,
  Terminal,
  Truck,
  Users,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/**
 * ADVANCED ROLE-BASED ACCESS CONTROL (RBAC)
 * - ADMIN: Ultimate control over all telemetry and financial hubs.
 * - SERVICE_ADVISOR: Operational focus (Quotations, Jobs, Invoicing).
 * - TECHNICIAN: Workshop queue and job execution nodes.
 * - ACCOUNTANT: Financial auditing and payment settlements.
 * - STORE_MANAGER: Inventory, Procurement, and Vendor nodes.
 */
const ROLE_VISIBILITY: Record<string, string[]> = {
  "/dashboard": ["ADMIN", "SERVICE_ADVISOR", "ACCOUNTANT", "STORE_MANAGER"],
  "/dashboard/notifications": ["ADMIN", "SERVICE_ADVISOR", "TECHNICIAN"],
  "/dashboard/quotations": ["ADMIN", "SERVICE_ADVISOR"],
  "/dashboard/jobcards": ["ADMIN", "SERVICE_ADVISOR", "TECHNICIAN"],
  "/dashboard/invoices": ["ADMIN", "SERVICE_ADVISOR", "ACCOUNTANT"],
  "/dashboard/payments": ["ADMIN", "ACCOUNTANT", "SERVICE_ADVISOR"],
  "/dashboard/customers": ["ADMIN", "SERVICE_ADVISOR"],
  "/dashboard/vehicles": ["ADMIN", "SERVICE_ADVISOR"],
  "/dashboard/inventory": ["ADMIN", "STORE_MANAGER"],
  "/dashboard/items": ["ADMIN", "STORE_MANAGER"],
  "/dashboard/vendors": ["ADMIN", "STORE_MANAGER"],
  "/dashboard/purchases": ["ADMIN", "STORE_MANAGER", "SERVICE_ADVISOR"],
  "/dashboard/staff": ["ADMIN"],
  "/dashboard/salaries": ["ADMIN"],
  "/dashboard/settings": ["ADMIN"],
};

const menuGroups = [
  {
    label: "Intelligence Hub",
    items: [
      { name: "Global Overview", path: "/dashboard", icon: LayoutDashboard },
      { name: "Live Alerts", path: "/dashboard/notifications", icon: Bell },
    ],
  },
  {
    label: "Operations Console",
    items: [
      { name: "Service Quotes", path: "/dashboard/quotations", icon: FileText },
      { name: "Job Card Queue", path: "/dashboard/jobcards", icon: ClipboardList },
      { name: "Billing Registry", path: "/dashboard/invoices", icon: Wallet },
      { name: "Payment Ledger", path: "/dashboard/payments", icon: Receipt },
    ],
  },
  {
    label: "Asset & Supply",
    items: [
      { name: "Customer Base", path: "/dashboard/customers", icon: Users },
      { name: "Vehicle Fleet", path: "/dashboard/vehicles", icon: Activity },
      { name: "Inventory Stock", path: "/dashboard/inventory", icon: Package },
      { name: "Part Master", path: "/dashboard/items", icon: Database },
      { name: "Supplier Nodes", path: "/dashboard/vendors", icon: Truck },
      { name: "Procurement", path: "/dashboard/purchases", icon: ShoppingCart },
    ],
  },
  {
    label: "Command Center",
    isAdminOnly: true,
    items: [
      { name: "Staff Management", path: "/dashboard/staff", icon: Users },
      { name: "Workforce Payroll", path: "/dashboard/salaries", icon: Banknote },
    ],
  },
];

import { Receipt } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const role = document.cookie
        .split("; ")
        .find((row) => row.startsWith("role="))
        ?.split("=")[1] ?? "TECHNICIAN"; // Default to safest operational role
      setUserRole(role);
    }
  }, []);

  const fetchNotificationCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        const unread = data.data.filter((n: any) => !n.isRead).length;
        setNotificationCount(unread);
      }
    } catch {
      console.error("Alert sync failure");
    }
  }, []);

  useEffect(() => {
    const initialSync = window.setTimeout(fetchNotificationCount, 0);
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => {
      window.clearTimeout(initialSync);
      clearInterval(interval);
    };
  }, [fetchNotificationCount]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/login";
    }
  };

  const isVisible = (path: string) => {
    if (!userRole) return true;
    if (userRole === "ADMIN") return true; // ADMIN SEES EVERYTHING

    const restrictedPaths = Object.keys(ROLE_VISIBILITY).sort((a, b) => b.length - a.length);
    const matchedPath = restrictedPaths.find(p => path.startsWith(p));
    
    if (!matchedPath) return true;
    return ROLE_VISIBILITY[matchedPath].includes(userRole);
  };

  return (
    <aside className="sticky top-0 z-50 flex h-screen w-[18.5rem] flex-col overflow-hidden bg-[#263238] border-r border-white/5 shadow-2xl">
      {/* BRANDING AREA */}
      <div className="relative px-6 py-10 flex flex-col items-center">
         <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none"></div>
         <Link href="/dashboard" className="relative z-10 w-full group">
            <div className="h-20 w-full transition-transform duration-500 group-hover:scale-105">
              <img src="/logo-1.png" alt="Falcon Garage" className="h-full w-full object-contain" />
            </div>
         </Link>
         <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-black/20 rounded-full border border-white/5">
            <ShieldCheck size={10} className="text-amber-500" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50">{userRole} AUTHENTICATED</span>
         </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-8 overflow-y-auto px-5 py-4 hide-scrollbar">
        {menuGroups.map((group) => {
          if (group.isAdminOnly && userRole !== "ADMIN") return null;
          const visibleItems = group.items.filter((item) => isVisible(item.path));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="space-y-3">
              <p className="px-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/30 italic flex items-center gap-2">
                {group.isAdminOnly && <Terminal size={10} className="text-amber-500" />}
                {group.label}
              </p>
              <ul className="space-y-1.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === "/dashboard" 
                    ? pathname === "/dashboard" 
                    : pathname.startsWith(item.path);

                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`group flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-300 ${
                          isActive
                            ? "bg-white text-[#263238] shadow-xl shadow-black/20"
                            : "text-white/50 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Icon size={18} className={isActive ? "text-amber-500" : "text-white/20 group-hover:text-amber-500"} strokeWidth={isActive ? 2.5 : 2} />
                          <span className="text-[11px] font-black uppercase tracking-tight">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.name === "Live Alerts" && notificationCount > 0 && (
                            <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-md px-1.5 text-[10px] font-black ${
                              isActive ? "bg-amber-500 text-[#263238]" : "bg-white/10 text-white"
                            }`}>
                              {notificationCount}
                            </span>
                          )}
                          {isActive && (
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* FOOTER AREA */}
      <div className="mt-auto border-t border-white/5 bg-black/20 p-2">
         <div className="flex flex-col items-center gap-2 opacity-30">
            <ShieldCheck size={20} className="text-[#f59e0b]" />
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">System Secured</p>
         </div>
      </div>
    </aside>
  );
}
