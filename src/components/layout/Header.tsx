"use client";

import { Bell, Search, Settings, ChevronDown, Command, Zap, Activity } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  
  useEffect(() => {
    const name = document.cookie
      .split("; ")
      .find((row) => row.startsWith("name="))
      ?.split("=")[1];

    if (name) {
      setUserName(decodeURIComponent(name));
    }
  }, []);

  const getPageTitle = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "Operations Console";
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  };

  return (
    <header className="h-20 bg-[#fbfcfc]/80 backdrop-blur-2xl border-b border-[#e0e5e9] sticky top-0 z-40 px-10 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5 px-4 py-2 bg-[#055b65] rounded-xl text-[#1bd488] shadow-lg shadow-[#055b65]/20 border border-[#1bd488]/20">
           <Zap size={16} strokeWidth={3} fill="currentColor" />
           <span className="text-[10px] font-bold uppercase tracking-widest italic">Live Mode</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold text-[#055b65] tracking-tight uppercase italic">{getPageTitle()}</h1>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* REFINED SEARCH */}
        <div className="hidden xl:flex items-center bg-[#e0e5e9]/40 border border-[#e0e5e9] rounded-[1.25rem] px-5 py-2.5 w-96 group focus-within:bg-white focus-within:shadow-xl focus-within:shadow-[#055b65]/5 transition-all duration-500">
          <Search size={16} className="text-[#45828b]/60 group-focus-within:text-[#1bd488]" />
          <input 
            type="text" 
            placeholder="Execute system search..." 
            className="bg-transparent border-none focus:outline-none ml-3.5 text-xs w-full text-[#055b65] font-bold placeholder:text-[#45828b]/30 uppercase tracking-tight"
          />
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-[#e0e5e9] text-[9px] font-bold text-[#055b65]/30 ml-2 shadow-sm">
             <Command size={10} />
             <span>SHIFT + S</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3.5 rounded-2xl bg-white border border-[#e0e5e9] text-[#45828b]/60 hover:text-[#055b65] hover:border-[#1bd488] transition-all relative shadow-sm">
            <Bell size={20} />
            <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-[#1bd488] rounded-full ring-4 ring-white animate-pulse shadow-[0_0_8px_#1bd488]"></span>
          </button>
          
          <button className="p-3.5 rounded-2xl bg-white border border-[#e0e5e9] text-[#45828b]/60 hover:text-[#055b65] hover:border-[#1bd488] transition-all shadow-sm">
            <Settings size={20} />
          </button>
        </div>

        <div className="h-10 w-px bg-[#e0e5e9] mx-1"></div>

        {/* ACCESS CONTROL - Dynamic User Name */}
        <button className="flex items-center gap-4 pl-4 pr-1.5 py-1.5 rounded-[1.25rem] bg-white border border-[#e0e5e9] hover:border-[#1bd488] hover:shadow-xl transition-all group">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-bold text-[#055b65] uppercase italic leading-none truncate max-w-[120px]">
              {userName || "Synchronizing..."}
            </p>
            <p className="text-[9px] font-bold text-[#1bd488] mt-1.5 uppercase tracking-widest">Active Node</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#055b65] text-white border-2 border-[#1bd488]/20 flex items-center justify-center font-bold text-sm italic shadow-lg uppercase">
            {userName ? userName.charAt(0) : "U"}
          </div>
        </button>
      </div>
    </header>
  );
}
