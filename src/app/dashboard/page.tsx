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
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Box,
  Target
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/overview")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      });
  }, []);

  if (!data) return <LoadingSpinner label="Decoding Garage Telemetry..." />;

  const stats = [
    { 
      title: "Daily Revenue", 
      value: `QAR ${data.todayRevenue.toLocaleString()}`, 
      icon: Wallet, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10",
      trend: "Peak Hours", 
      trendUp: true 
    },
    { 
      title: "Active Orders", 
      value: data.activeJobs, 
      icon: Layers, 
      color: "text-[#263238]", 
      bg: "bg-[#263238]/5",
      trend: `${data.activeJobs} Units In-Bay`, 
      trendUp: true 
    },
    { 
      title: "Stock Alert", 
      value: data.lowStockParts, 
      icon: AlertTriangle, 
      color: "text-rose-500", 
      bg: "bg-rose-500/10",
      trend: "Procurement Req", 
      trendUp: false 
    },
    { 
      title: "Period Revenue", 
      value: `QAR ${data.monthRevenue.toLocaleString()}`, 
      icon: Target, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10",
      trend: "Month-to-Date", 
      trendUp: true 
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white border border-[#d8dee6] rounded-md shadow-sm">
             <div className="w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-[#263238] uppercase tracking-[0.2em]">Active Control Node</span>
          </div>
          <h1 className="text-4xl font-black text-[#263238] tracking-tight uppercase italic">
            Garage <span className="text-[#f59e0b]">Intelligence</span> Hub
          </h1>
          <p className="text-[#64748b] text-sm font-medium tracking-tight">Real-time status monitor and operational telemetry across all service bays.</p>
        </div>
        
        <div className="flex items-center gap-6 p-6 bg-[#263238] rounded-md shadow-2xl">
           <div className="space-y-1">
              <p className="text-[9px] font-black text-[#f59e0b] uppercase tracking-widest">Inventory Valuation</p>
              <p className="text-2xl font-black text-white italic tracking-tighter">QAR {data.inventoryValuation.toLocaleString()}</p>
           </div>
           <div className="h-10 w-px bg-white/10"></div>
           <div className="flex flex-col items-center">
              <Activity size={24} className="text-emerald-500" />
              <p className="text-[8px] font-black text-white/40 uppercase mt-1">Live Feed</p>
           </div>
        </div>
      </div>

      {/* PRIMARY STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group bg-white p-8 border border-[#d8dee6] rounded-md shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div className={`p-4 rounded-md ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`text-[10px] font-black uppercase tracking-widest ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[#64748b] text-[10px] font-black uppercase tracking-widest opacity-40">{stat.title}</p>
              <p className="text-3xl font-black text-[#263238] italic tracking-tighter">{stat.value}</p>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 group-hover:scale-125 transition-transform duration-700">
               <stat.icon size={100} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* SERVICE QUEUE MONITOR */}
        <div className="lg:col-span-2 bg-white rounded-md border border-[#d8dee6] shadow-sm overflow-hidden flex flex-col">
           <div className="px-10 py-8 border-b border-[#d8dee6] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-[#263238] rounded-md flex items-center justify-center text-[#f59e0b] shadow-xl shadow-[#263238]/20">
                    <Layers size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-[#263238] uppercase italic">Active Service Queue</h3>
                    <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-[0.3em] mt-1">Real-time status monitor</p>
                 </div>
              </div>
              <Link href="/dashboard/jobcards" className="flex items-center gap-2 text-[10px] font-black uppercase text-[#f59e0b] hover:text-[#263238] transition-colors tracking-widest">
                 Full Dispatch Board <ArrowRight size={14} />
              </Link>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-[#d8dee6] text-[10px] font-black uppercase tracking-widest text-[#64748b]">
                       <th className="px-10 py-5">REF #</th>
                       <th className="px-10 py-5">Asset Information</th>
                       <th className="px-10 py-5">Workflow State</th>
                       <th className="px-10 py-5">Personnel</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-[#d8dee6]/50">
                    {data.recentJobs.map((job: any) => (
                       <tr key={job._id} className="hover:bg-[#f8fafc] transition-all group">
                          <td className="px-10 py-6">
                             <span className="text-sm font-black text-[#263238]">#{job.jobCardNumber}</span>
                          </td>
                          <td className="px-10 py-6">
                             <p className="text-sm font-black text-[#263238] uppercase">{job.vehicleModel}</p>
                             <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mt-1">{job.vehicleNumber}</p>
                          </td>
                          <td className="px-10 py-6">
                             <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                                job.status === 'completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                                job.status === 'in_progress' ? 'bg-amber-500 text-white' : 'bg-[#64748b] text-white'
                             }`}>
                                <div className={`h-1 w-1 rounded-full bg-white ${job.status === 'in_progress' ? 'animate-ping' : ''}`}></div>
                                {job.status?.replace('_', ' ')}
                             </div>
                          </td>
                          <td className="px-10 py-6">
                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-[#263238] rounded flex items-center justify-center text-[10px] font-black text-white uppercase">
                                   {job.technicians?.[0]?.name?.charAt(0) || '?'}
                                </div>
                                <span className="text-[11px] font-black text-[#263238] uppercase">{job.technicians?.[0]?.name || 'Unassigned'}</span>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* WORKLOAD & CAPACITY PANEL */}
        <div className="space-y-8">
           <div className="bg-[#263238] rounded-md p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Users size={120} />
              </div>
              <div className="relative z-10 space-y-10">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Workforce Loading</h3>
                    <BarChart3 size={20} className="text-[#f59e0b]" />
                 </div>

                 <div className="space-y-8">
                    {data.technicianSummary.map((tech: any, idx: number) => (
                       <div key={idx} className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60">
                             <span>{tech.name}</span>
                             <span className="text-[#f59e0b]">{tech.active} Orders</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-[#f59e0b] shadow-[0_0_10px_#f59e0b] transition-all duration-1000 ease-out" 
                               style={{ width: `${Math.min(100, (tech.active / 5) * 100)}%` }}
                             ></div>
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="pt-6 border-t border-white/10 space-y-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Efficiency Goal</p>
                          <p className="text-3xl font-black text-white italic">{data.performanceMetric}%</p>
                       </div>
                       <Gauge size={32} className="text-emerald-500" />
                    </div>
                    <button className="w-full py-4 bg-white text-[#263238] rounded-md text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#f59e0b] transition-all">
                       Optimize Queue
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-white border border-[#d8dee6] p-8 rounded-md space-y-6 shadow-sm">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="text-[#f59e0b]" size={20} />
                 <h4 className="text-[11px] font-black uppercase text-[#263238] tracking-widest">System Integrity</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase">DB Nodes</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">Synchronized</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase">API Gateway</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">Operational</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
