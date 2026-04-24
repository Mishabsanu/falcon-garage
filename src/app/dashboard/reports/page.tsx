"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  Wallet, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  FileText,
  Calendar,
  Filter,
  Download
} from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/dashboard/reports");
      const data = await res.json();
      if (data.success) setReportData(data.data);
    } catch (error) {
      toast.error("Intelligence synchronization failure");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="py-20 text-center flex flex-col items-center gap-4">
       <div className="w-10 h-10 border-2 border-[#f59e0b]/10 border-t-[#f59e0b] rounded-md animate-spin"></div>
       <p className="text-[10px] font-bold text-[#64748b]/40 uppercase tracking-widest">Aggregating Intelligence...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#d8dee6] rounded-md shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-md"></div>
             <span className="text-[10px] font-bold text-[#263238] uppercase tracking-widest">Analytics Node</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#263238] tracking-tight">Workshop Intelligence</h1>
          <p className="text-[#64748b]/70 text-sm font-medium">Deep telemetry across financial, operational, and resource layers.</p>
        </div>
        
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-4 border border-[#d8dee6] text-[#263238] rounded-md font-bold text-xs uppercase tracking-widest hover:bg-[#f7f4ef]">
             <Filter size={16} /> Filter Date Range
           </button>
           <button className="flex items-center gap-2 px-6 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] shadow-xl shadow-[#263238]/20">
             <Download size={16} className="text-[#f59e0b]" /> Export Data Node
           </button>
        </div>
      </div>

      {/* FINANCIAL OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#263238] p-8 rounded-md text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#f59e0b]/10 rounded-md blur-2xl group-hover:bg-[#f59e0b]/20 transition-all"></div>
           <Wallet className="text-[#f59e0b] mb-6" size={32} />
           <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Total Valuation Engine</p>
           <h3 className="text-4xl font-black italic tracking-tighter mt-2">Rs.{reportData.financials.totalRevenue.toLocaleString()}</h3>
           <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-[#f59e0b]">
              <TrendingUp size={14} /> +12.5% from previous cycle
           </div>
        </div>

        <div className="bg-white p-8 rounded-md border border-[#d8dee6] shadow-sm flex flex-col justify-between">
           <div>
              <p className="text-[#64748b]/40 text-[10px] font-bold uppercase tracking-widest">Liquidity Settled</p>
              <h3 className="text-3xl font-black text-[#263238] mt-2">Rs.{reportData.financials.totalPaid.toLocaleString()}</h3>
           </div>
           <div className="w-full bg-[#f7f4ef] h-2 rounded-md mt-6 overflow-hidden">
              <div 
                className="bg-[#f59e0b] h-full rounded-md transition-all duration-1000" 
                style={{ width: `${(reportData.financials.totalPaid / reportData.financials.totalRevenue) * 100}%` }}
              ></div>
           </div>
           <p className="text-[9px] font-bold text-[#64748b]/60 uppercase mt-4">Collection Rate: {((reportData.financials.totalPaid / reportData.financials.totalRevenue) * 100).toFixed(1)}%</p>
        </div>

        <div className="bg-white p-8 rounded-md border border-[#d8dee6] shadow-sm flex flex-col justify-between">
           <div>
              <p className="text-rose-500/40 text-[10px] font-bold uppercase tracking-widest">Outstanding Exposure</p>
              <h3 className="text-3xl font-black text-rose-500 mt-2">Rs.{reportData.financials.totalPending.toLocaleString()}</h3>
           </div>
           <div className="flex items-center gap-4 mt-6">
              <div className="w-12 h-12 rounded-md bg-rose-50 flex items-center justify-center text-rose-500">
                 <AlertTriangle size={24} />
              </div>
              <p className="text-xs font-medium text-[#64748b]">High-risk credit nodes detected in registry.</p>
           </div>
        </div>
      </div>

      {/* OPERATIONAL TELEMETRY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-md border border-[#d8dee6] shadow-sm">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-lg font-black text-[#263238] uppercase italic tracking-tight">Service Queue Velocity</h3>
              <div className="p-3 bg-[#263238] rounded-md text-[#f59e0b]">
                 <Clock size={20} />
              </div>
           </div>
           
           <div className="space-y-8">
              {Object.entries(reportData.jobs).map(([status, count]: any) => (
                <div key={status} className="space-y-3">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">{status.replace('_', ' ')}</p>
                      <p className="text-sm font-black text-[#263238]">{count} Nodes</p>
                   </div>
                   <div className="w-full bg-[#f7f4ef] h-3 rounded-md overflow-hidden border border-[#d8dee6]/30">
                      <div 
                        className={`h-full rounded-md transition-all duration-1000 ${
                          status === 'completed' || status === 'closed' ? 'bg-[#f59e0b]' : 
                          status === 'in_progress' ? 'bg-[#263238]' : 'bg-[#d8dee6]'
                        }`}
                        style={{ width: `${(count / (Object.values(reportData.jobs) as number[]).reduce((a, b) => a + b, 0)) * 100}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="grid grid-rows-2 gap-8">
           <div className="bg-white p-8 rounded-md border border-[#d8dee6] shadow-sm flex items-center gap-8">
              <div className="w-20 h-20 rounded-md bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
                 <CheckCircle2 size={40} />
              </div>
              <div>
                 <p className="text-[#64748b]/40 text-[10px] font-bold uppercase tracking-widest">Proposal Conversion</p>
                 <h3 className="text-3xl font-black text-[#263238] mt-1">{reportData.quotations.approved} / {reportData.quotations.total}</h3>
                 <p className="text-[10px] font-bold text-[#f59e0b] uppercase mt-2">Conversion Efficiency: {((reportData.quotations.approved / reportData.quotations.total) * 100).toFixed(1)}%</p>
              </div>
           </div>

           <div className="bg-white p-8 rounded-md border border-[#d8dee6] shadow-sm flex items-center gap-8">
              <div className="w-20 h-20 rounded-md bg-rose-50 flex items-center justify-center text-rose-500">
                 <AlertTriangle size={40} />
              </div>
              <div>
                 <p className="text-rose-500/40 text-[10px] font-bold uppercase tracking-widest">Supply Chain Latency</p>
                 <h3 className="text-3xl font-black text-[#263238] mt-1">{reportData.inventory.lowStock} Modules</h3>
                 <p className="text-[10px] font-bold text-rose-500 uppercase mt-2">Critical Restock Required</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
