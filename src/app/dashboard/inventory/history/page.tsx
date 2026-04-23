"use client";

import { useEffect, useState } from "react";
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Clock, 
  Hash,
  Database,
  FileText,
  ShoppingCart,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

export default function StockHistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/stock/history");
      const data = await res.json();
      if (data.success) setLogs(data.data);
    } catch (error) {
      toast.error("Audit trail sync failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e0e5e9] rounded-full shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#055b65] rounded-full animate-pulse"></div>
             <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-widest">Immutable Ledger</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#055b65] tracking-tight italic uppercase">Full Audit Trail</h1>
          <p className="text-[#45828b]/70 text-sm font-medium">Trace every single component movement within the workshop cluster.</p>
        </div>
      </div>

      {/* LOG LIST */}
      <div className="bg-white rounded-[2.5rem] border border-[#e0e5e9] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#e0e5e9]/20 text-[#45828b]/60 text-[9px] font-bold uppercase tracking-[0.25em]">
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Component Node</th>
                <th className="px-8 py-5">Transaction Type</th>
                <th className="px-8 py-5">Magnitude</th>
                <th className="px-8 py-5">Reference Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e5e9]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Querying Ledger...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log._id} className="hover:bg-[#fbfcfc] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#45828b] uppercase">
                       <Clock size={14} className="text-[#1bd488]" />
                       {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-[#055b65]/5 flex items-center justify-center text-[#055b65]">
                          <Database size={16} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-[#055b65]">{log.partId?.name}</p>
                          <p className="text-[9px] font-black text-[#45828b]/40 uppercase tracking-widest">{log.partId?.sku}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      log.type === 'IN' ? 'bg-[#1bd488]/10 text-[#1bd488] border-[#1bd488]/20' : 'bg-rose-50 text-rose-500 border-rose-100'
                    }`}>
                      {log.type === 'IN' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                      {log.type === 'IN' ? 'Stock Inbound' : 'Stock Consumption'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-sm font-black ${log.type === 'IN' ? 'text-[#1bd488]' : 'text-rose-500'}`}>
                       {log.type === 'IN' ? '+' : '-'}{log.quantity} UNITS
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-[#fbfcfc] border border-[#e0e5e9] flex items-center justify-center text-[#45828b]">
                          {log.referenceType === 'purchase' ? <ShoppingCart size={14} /> : <FileText size={14} />}
                       </div>
                       <div>
                          <p className="text-[9px] font-bold text-[#45828b]/40 uppercase tracking-widest leading-none mb-1">{log.referenceType}</p>
                          <p className="text-[11px] font-black text-[#055b65]">#{log.referenceId}</p>
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
