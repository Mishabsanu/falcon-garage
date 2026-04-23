"use client";

import {
    Activity,
    Banknote,
    BarChart3,
    Bell,
    ClipboardList,
    Database,
    FileText,
    LayoutDashboard,
    LogOut,
    Package,
    Settings,
    ShoppingCart,
    Terminal,
    Truck,
    Users,
    Wallet,
    Wrench
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Role-based visibility mapping
const ROLE_VISIBILITY: Record<string, string[]> = {
  "/dashboard/technicians": ["ADMIN"],
  "/dashboard/inventory": ["ADMIN", "STORE_MANAGER"],
  "/dashboard/invoices": ["ADMIN", "ACCOUNTANT"],
  "/dashboard/payments": ["ADMIN", "ACCOUNTANT"],
  "/dashboard/settings": ["ADMIN"],
};

const menuGroups = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Alerts", path: "/dashboard/notifications", icon: Bell },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Job Cards", path: "/dashboard/jobcards", icon: ClipboardList },
      { name: "Quotations", path: "/dashboard/quotations", icon: FileText },
      { name: "Financials", path: "/dashboard/invoices", icon: Wallet },
      { name: "Payments", path: "/dashboard/payments", icon: Wallet },
    ],
  },
  {
    label: "Resources",
    items: [
      { name: "Customers", path: "/dashboard/customers", icon: Users },
      { name: "Vehicles", path: "/dashboard/vehicles", icon: Activity },
      { name: "Inventory", path: "/dashboard/inventory", icon: Package },
      { name: "Component Master", path: "/dashboard/items", icon: Database },
      { name: "Suppliers", path: "/dashboard/vendors", icon: Truck },
      { name: "Procurement", path: "/dashboard/purchases", icon: ShoppingCart },
      { name: "Technicians", path: "/dashboard/technicians", icon: Wrench },
      { name: "Workforce", path: "/dashboard/salaries", icon: Banknote },
    ],
  },
];

function getJwtPayload(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const role = document.cookie
      .split("; ")
      .find((row) => row.startsWith("role="))
      ?.split("=")[1];

    if (role) {
      setUserRole(role);
    }

    // Initial fetch
    fetchNotificationCount();
    
    // Polling for notifications
    const interval = setInterval(fetchNotificationCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        const unread = data.data.filter((n: any) => !n.isRead).length;
        setNotificationCount(unread);
      }
    } catch (error) {
      console.error("Alert sync failed");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Also clear non-httpOnly cookies manually as a backup
      document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback redirect
      window.location.href = "/login";
    }
  };

  const isVisible = (path: string) => {
    if (!userRole) return true; // Default to visible while loading
    const allowedRoles = ROLE_VISIBILITY[path];
    if (!allowedRoles) return true; // Public dashboard routes
    return allowedRoles.includes(userRole);
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-[#055b65] text-white/70 h-screen sticky top-0 shadow-2xl z-50 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#1bd488]/10 blur-[60px] pointer-events-none"></div>
      
      <div className="flex flex-col h-full relative z-10">
        <div className="p-7 pb-10">
          <Link href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-[#1bd488] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1bd488]/20 group-hover:scale-105 transition-all duration-500">
              <Terminal className="text-[#055b65]" size={20} strokeWidth={2.5} />
            </div>
            <div>
               <h2 className="text-lg font-extrabold text-white tracking-tight leading-none">Garage</h2>
               <p className="text-[9px] font-bold text-[#1bd488] uppercase tracking-[0.25em] mt-1.5 italic">Smart Systems</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-10 overflow-y-auto hide-scrollbar pb-10">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter((item) => isVisible(item.path));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label}>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-5 px-4">
                  {group.label}
                </p>
                <ul className="space-y-1.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 border border-transparent ${
                            isActive 
                              ? "bg-white/10 text-white border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]" 
                              : "text-white/50 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <Icon size={18} className={isActive ? "text-[#1bd488]" : "text-white/30 group-hover:text-[#1bd488] transition-colors"} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[12px] font-bold uppercase tracking-tight ${isActive ? "text-white" : ""}`}>
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                             {item.name === "Alerts" && notificationCount > 0 && (
                               <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#1bd488] text-[#055b65] text-[10px] font-black shadow-[0_0_10px_rgba(27,212,136,0.3)] animate-pulse">
                                 {notificationCount}
                               </span>
                             )}
                             {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1bd488] shadow-[0_0_10px_#1bd488]" />
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

        <div className="p-6 mt-auto border-t border-white/5 bg-black/10">
           <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center gap-4 mb-6 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-[#1bd488]/20 flex items-center justify-center text-[#1bd488]">
                 <Activity size={18} />
              </div>
              <div className="flex-1 overflow-hidden">
                 <p className="text-[11px] font-bold text-white uppercase leading-none truncate">{userRole || "Loading..."}</p>
                 <p className="text-[9px] text-[#1bd488] font-bold mt-1 uppercase tracking-tighter">SECURED NODE</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center p-3.5 rounded-xl bg-white/5 text-white/30 hover:bg-white/10 hover:text-white transition-all border border-white/10">
                 <Settings size={18} />
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center p-3.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
              >
                 <LogOut size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
