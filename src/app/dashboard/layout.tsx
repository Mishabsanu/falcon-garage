"use client";

import { useState } from "react";
import { Menu, Wrench, X } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#f7f4ef] font-sans antialiased text-[#263238]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#263238]/55 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="h-full w-[18rem] bg-[#263238] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute right-5 top-5 lg:hidden">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-[#f59e0b] transition-colors hover:text-white"
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="hidden lg:block shrink-0 shadow-sm z-50">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#d8dee6] bg-white/90 px-5 shadow-sm backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#263238]">
              <Wrench className="text-[#f59e0b]" size={17} />
            </div>
            <span className="text-sm font-black uppercase tracking-tight text-[#263238]">Garage ERP</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md border border-[#d8dee6] bg-[#f7f4ef] p-2 text-[#263238] transition-colors hover:border-[#f59e0b]"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="hidden lg:block">
          <Header />
        </div>

        <main className="garage-workspace flex-1 overflow-y-auto overflow-x-hidden p-5 scroll-smooth md:p-7 lg:p-8">
          <div className="mx-auto max-w-[1500px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {children}
          </div>
          <div className="h-8" />
        </main>
      </div>
    </div>
  );
}
