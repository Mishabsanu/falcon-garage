"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ClipboardList, 
  Wallet, 
  AlertTriangle,
  ArrowRight,
  Zap,
  BarChart3,
  Activity,
  Gauge,
  Clock,
  Layers,
  ArrowUpRight
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/overview")
      .then((res) => res.json())
      .then((res) => setData(res.data));
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <Zap size={16} className="text-[#1bd488] animate-pulse" />
        </div>
      </div>
    </div>
  );

  const stats = [
    { 
      title: "Daily Revenue", 
      value: `₹${data.todayRevenue.toLocaleString()}`, 
      icon: Wallet, 
      color: "text-[#1bd488]", 
      bg: "bg-[#1bd488]/5",
      shadow: "shadow-[#1bd488]/10",
      trend: "+12.5%", 
      trendUp: true 
    },
    { 
      title: "Active Orders", 
      value: data.activeJobs, 
      icon: ClipboardList, 
      color: "text-[#055b65]", 
      bg: "bg-[#055b65]/5",
      shadow: "shadow-[#055b65]/10",
      trend: "4 pending", 
      trendUp: true 
    },
    { 
      title: "Balance Due", 
      value: `₹${data.pendingPayments.toLocaleString()}`, 
      icon: TrendingDown, 
      color: "text-[#45828b]", 
      bg: "bg-[#45828b]/5",
      shadow: "shadow-[#45828b]/10",
      trend: "-3.2%", 
      trendUp: false 
    },
    { 
      title: "Stock Alert", 
      value: data.lowStockParts, 
      icon: AlertTriangle, 
      color: "text-rose-500", 
      bg: "bg-rose-500/5",
      shadow: "shadow-rose-500/10",
      trend: "Urgent", 
      trendUp: false 
    },
  ];

  return (
    <div className="space-y-12">
      {/* HEADER SECTION - Enhanced Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e0e5e9] rounded-full shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#1bd488] rounded-full animate-pulse shadow-[0_0_8px_#1bd488]"></div>
             <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-widest">Garage Telemetry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#055b65] tracking-tight">Garage Overview</h1>
          <p className="text-[#45828b]/70 text-sm font-medium">Real-time performance monitoring across all service units.</p>
        </div>
        
        <div className="flex items-center gap-4 p-1.5 bg-white rounded-2xl shadow-[0_10px_40px_rgba(5,91,101,0.06)] border border-[#e0e5e9] pr-8">
           <div className="flex -space-x-3 ml-2">
             {[1, 2, 3].map((i) => (
               <div key={i} className="w-10 h-10 rounded-2xl border-4 border-white bg-[#b2c9c5] flex items-center justify-center text-[10px] font-bold text-[#055b65]">
                 T{i}
               </div>
             ))}
           </div>
           <div className="h-8 w-px bg-[#e0e5e9]"></div>
           <div className="flex flex-col">
              <p className="text-xs font-bold text-[#055b65]">Live Workforce</p>
              <p className="text-[10px] font-semibold text-[#1bd488] uppercase tracking-tight">Active Now</p>
           </div>
        </div>
      </div>

      {/* STATS GRID - Glass & Glow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className={`group bg-white rounded-[2rem] p-7 border border-[#e0e5e9] hover:border-[#1bd488]/40 transition-all duration-500 shadow-sm hover:shadow-2xl ${stat.shadow} relative overflow-hidden`}>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                <stat.icon size={22} strokeWidth={2.5} />
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold ${
                stat.trendUp ? "bg-[#1bd488]/10 text-[#1bd488]" : "bg-rose-50 text-rose-500"
              }`}>
                {stat.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.trend}
              </div>
            </div>
            <div className="relative z-10 space-y-1">
              <p className="text-[#45828b]/50 text-[10px] font-bold uppercase tracking-widest">{stat.title}</p>
              <p className="text-3xl font-extrabold text-[#055b65] tracking-tight">
                {stat.value}
              </p>
            </div>
            {/* GLOW DECOR */}
            <div className={`absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none ${stat.color}`}>
              <stat.icon size={120} strokeWidth={1} />
            </div>
          </div>
        ))}
      </div>

      {/* DETAILED CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* RECENT JOBS - Clean Industrial */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-[#e0e5e9] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-[#e0e5e9]/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-11 h-11 bg-[#055b65] rounded-2xl flex items-center justify-center text-[#1bd488] shadow-lg shadow-[#055b65]/20">
                  <Layers size={22} />
               </div>
               <div>
                  <h3 className="text-lg font-extrabold text-[#055b65] tracking-tight">Active Service Queue</h3>
                  <p className="text-[10px] text-[#45828b]/50 font-bold uppercase tracking-widest">Real-time status monitor</p>
               </div>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#fbfcfc] border border-[#e0e5e9] text-[11px] font-bold text-[#055b65] hover:bg-white hover:shadow-md transition-all">
              Manage Orders <ArrowUpRight size={16} className="text-[#1bd488]" />
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#e0e5e9]/20 text-[#45828b]/60 text-[9px] font-bold uppercase tracking-[0.25em]">
                  <th className="px-8 py-5">Reference</th>
                  <th className="px-8 py-5">Asset Class</th>
                  <th className="px-8 py-5">Current State</th>
                  <th className="px-8 py-5">Personnel</th>
                  <th className="px-8 py-5 text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e5e9]/30">
                {data.recentJobs.map((job: any) => (
                  <tr key={job._id} className="hover:bg-[#1bd488]/5 transition-colors group cursor-pointer">
                    <td className="px-8 py-6">
                       <span className="text-sm font-bold text-[#055b65]">#{job.jobCardNumber}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-0.5">
                         <p className="text-sm font-bold text-[#45828b]">{job.vehicleModel}</p>
                         <p className="text-[10px] font-bold text-[#b2c9c5] uppercase tracking-tighter">{job.vehicleNumber}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${
                        job.status === 'completed' ? 'bg-[#1bd488]/10 text-[#1bd488] border-[#1bd488]/20 group-hover:bg-[#1bd488] group-hover:text-white' : 
                        job.status === 'in_progress' ? 'bg-[#45828b]/10 text-[#45828b] border-[#45828b]/20' : 'bg-[#e0e5e9]/30 text-[#45828b]/50 border-[#e0e5e9]/60'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          job.status === 'completed' ? 'bg-[#1bd488] shadow-[0_0_8px_#1bd488] group-hover:bg-white' : 
                          job.status === 'in_progress' ? 'bg-[#45828b] animate-pulse' : 'bg-[#b2c9c5]'
                        }`}></div>
                        {job.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#055b65] flex items-center justify-center text-white text-[10px] font-bold">
                             {job.technicians?.[0]?.name?.charAt(0) || '?'}
                          </div>
                          <span className="text-xs font-semibold text-[#45828b]">
                            {job.technicians?.[0]?.name || 'Pending'}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <p className="text-xs font-bold text-[#055b65]">{new Date(job.createdAt).toLocaleDateString()}</p>
                       <p className="text-[9px] text-[#45828b]/40 font-bold mt-1.5 uppercase tracking-tighter italic">Processed</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* WORKLOAD PANEL - Gradient & Depth */}
        <div className="bg-[#055b65] rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden shadow-2xl shadow-[#055b65]/20">
          <div className="flex items-center justify-between mb-12 relative z-10">
             <h3 className="text-xl font-bold text-white tracking-tight italic">Workforce Capacity</h3>
             <BarChart3 size={24} className="text-[#1bd488]" />
          </div>
          
          <div className="space-y-10 flex-1 relative z-10">
            {data.technicianSummary.map((tech: any, i: number) => (
              <div key={i} className="space-y-4 group">
                <div className="flex justify-between items-end px-1">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white/50 group-hover:border-[#1bd488] group-hover:text-[#1bd488] transition-all">
                       {tech.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-[#1bd488] transition-colors">{tech.name}</p>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mt-1">{tech.active} Orders Active</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-[#1bd488] italic">{Math.round((tech.active / (tech.assigned || 1)) * 100)}%</p>
                </div>
                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden p-[2px] border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#1bd488]/40 to-[#1bd488] rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_#1bd488]" 
                    style={{ width: `${Math.min(100, (tech.active / (tech.assigned || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-14 p-8 bg-white rounded-[2rem] relative overflow-hidden group shadow-2xl">
            <div className="relative z-10 space-y-2">
              <p className="text-[10px] text-[#45828b] font-bold uppercase tracking-[0.2em]">Efficiency Goal</p>
              <div className="flex items-baseline gap-2 mb-8">
                <p className="text-5xl font-extrabold text-[#055b65] tracking-tighter italic leading-none">98.4</p>
                <div className="px-2 py-0.5 bg-[#1bd488] text-white rounded text-[8px] font-bold uppercase italic tracking-tighter">Peak</div>
              </div>
              <button className="w-full bg-[#055b65] text-white py-4 rounded-2xl font-bold text-xs hover:bg-[#45828b] hover:shadow-xl transition-all flex items-center justify-center gap-3">
                 System Diagnostics <Zap size={16} fill="currentColor" className="text-[#1bd488]" />
              </button>
            </div>
            <Activity size={120} className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-all duration-700 pointer-events-none text-[#055b65]" />
          </div>
          
          {/* BG GLOW */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1bd488]/10 blur-[80px] pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
