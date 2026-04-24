"use client";

import { Bell, Command, Search, Settings, Wrench, ShieldCheck, Zap, LogOut, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName] = useState<string | null>(() => {
    if (typeof document === "undefined") return null;
    const name = document.cookie
      .split("; ")
      .find((row) => row.startsWith("name="))
      ?.split("=")[1];

    return name ? decodeURIComponent(name) : null;
  });

  const [userRole] = useState<string | null>(() => {
    if (typeof document === "undefined") return null;
    return document.cookie.split("; ").find(r => r.startsWith("role="))?.split("=")[1] || null;
  });

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchNotificationCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.slice(0, 5));
        const unread = data.data.filter((n: any) => !n.isRead).length;
        setNotificationCount(unread);
      }
    } catch {
      console.error("Header notification sync failed");
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
      toast.success("Session Purged Successfully");
      router.push("/login");
    } catch (error) {
      router.push("/login");
    }
  };

  const getPageTitle = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "Workshop Overview";
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
  };

  return (
    <header className="sticky top-0 z-40 flex h-[4.75rem] items-center justify-between border-b border-[#d8dee6] bg-white/85 px-8 shadow-sm backdrop-blur-xl">
      {/* LEFT: BRANDING & TITLE */}
      <div className="flex min-w-0 items-center gap-8">
        <div className="flex items-center gap-3">
           <img src="/logo-1.png" alt="Falcon Garage" className="h-10 w-auto" />
           <div className="h-8 w-px bg-[#d8dee6] hidden md:block"></div>
           <div className="hidden md:block">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#263238] italic">Falcon <span className="text-[#f59e0b]">Garage</span></h2>
              <p className="text-[8px] font-bold uppercase text-[#64748b] leading-none mt-1">Intelligence Hub</p>
           </div>
        </div>

        <div className="flex flex-col">
          <h1 className="truncate text-lg font-black uppercase tracking-tight text-[#263238] italic">{getPageTitle()}</h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#64748b]/60">
            Node Control / {pathname.replace('/dashboard/', '').toUpperCase()}
          </p>
        </div>
      </div>

      {/* CENTER & RIGHT ACTIONS */}
      <div className="flex items-center gap-6">
        {/* SEARCH HUB (HIDDEN ON MOBILE) */}
        <div className="hidden w-64 items-center rounded-md border border-[#d8dee6] bg-[#f7f4ef] px-4 py-2 transition-all duration-300 group focus-within:border-[#f59e0b]/60 focus-within:bg-white lg:flex">
          <Search size={14} className="text-[#64748b]/60" />
          <input
            type="text"
            placeholder="Telemetery Search..."
            className="ml-3 w-full border-none bg-transparent text-[10px] font-black uppercase tracking-tight text-[#263238] placeholder:text-[#64748b]/35 focus:outline-none"
          />
        </div>

        {/* NOTIFICATIONS & SETTINGS */}
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-md border border-[#d8dee6] transition-all ${isNotificationOpen ? 'bg-[#263238] text-white' : 'bg-white text-[#263238] hover:bg-[#f7f4ef]'}`}
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#f59e0b] px-1 text-[9px] font-black text-[#263238]">
                {notificationCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-[#d8dee6] rounded-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
               {/* Notification content here... same as before */}
               <div className="bg-[#263238] px-5 py-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Recent Alerts</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-[#d8dee6]/30">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center"><p className="text-[9px] font-bold text-[#64748b]/40 uppercase">No new alerts</p></div>
                ) : notifications.map(n => (
                  <div key={n._id} className="p-4 hover:bg-[#f7f4ef]/50">
                    <p className="text-[10px] font-black text-[#263238] uppercase">{n.title}</p>
                    <p className="text-[9px] text-[#64748b] mt-1 line-clamp-1">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link href="/dashboard/settings" className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d8dee6] bg-white text-[#64748b]/70 hover:text-[#263238] transition-all">
            <Settings size={18} />
          </Link>
        </div>

        <div className="mx-1 h-8 w-px bg-[#d8dee6]"></div>

        {/* USER PROFILE & LOGOUT DROPDOWN */}
        <div className="relative profile-node">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`group flex items-center gap-4 rounded-md border py-1 pl-4 pr-1.5 transition-all ${isProfileOpen ? 'bg-[#263238] border-[#263238]' : 'bg-white border-[#d8dee6] hover:border-[#f59e0b]'}`}
          >
            <div className="text-right hidden sm:block">
              <p className={`max-w-[100px] truncate text-[10px] font-black uppercase leading-none ${isProfileOpen ? 'text-white' : 'text-[#263238]'}`}>
                {userName || "Operator"}
              </p>
              <div className="mt-1 flex items-center gap-1 justify-end">
                 <ShieldCheck size={8} className="text-[#f59e0b]" />
                 <p className="text-[8px] font-bold uppercase tracking-widest text-[#f59e0b]">{userRole}</p>
              </div>
            </div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-md border-2 border-[#f59e0b] ${isProfileOpen ? 'bg-white text-[#263238]' : 'bg-[#263238] text-white'} text-xs font-black`}>
              {userName ? userName.charAt(0) : "U"}
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-white' : 'text-[#64748b]'}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-14 w-56 bg-white border border-[#d8dee6] rounded-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="p-4 bg-[#f8fafc] border-b border-[#d8dee6]">
                  <p className="text-[9px] font-black text-[#64748b] uppercase tracking-widest">Active Identity</p>
                  <p className="text-sm font-black text-[#263238] uppercase mt-1">{userName}</p>
                  <p className="text-[8px] font-bold text-amber-600 uppercase mt-0.5">{userRole} Access Tier</p>
               </div>
               <div className="p-2">
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest text-[#263238] hover:bg-[#f7f4ef] transition-all">
                     <Settings size={14} className="text-[#64748b]" /> System Preferences
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all border-t border-[#d8dee6] mt-2 pt-4"
                  >
                     <LogOut size={14} /> Purge Session
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
