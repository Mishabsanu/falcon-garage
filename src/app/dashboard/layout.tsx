"use client";

import { useState } from "react";
import { Menu, X, Terminal } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#fbfcfc] font-sans antialiased text-[#055b65] overflow-hidden">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="w-64 h-full bg-[#055b65] shadow-2xl transition-transform duration-300 transform translate-x-0"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="absolute top-5 right-5 lg:hidden">
               <button onClick={() => setSidebarOpen(false)} className="p-2 text-[#1bd488] hover:text-white">
                 <X size={20} />
               </button>
             </div>
             <Sidebar />
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block shrink-0 shadow-sm z-50">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {/* MOBILE HEADER */}
        <div className="lg:hidden h-14 px-6 bg-white border-b border-[#e0e5e9] flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#055b65] rounded-lg flex items-center justify-center">
               <Terminal className="text-[#1bd488]" size={16} />
            </div>
            <span className="font-bold tracking-tight text-sm text-[#055b65] uppercase">Garage</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-[#055b65] hover:bg-slate-50 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* DESKTOP HEADER */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-[1440px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {children}
          </div>
          <div className="h-10" />
        </main>
      </div>
    </div>
  );
}
