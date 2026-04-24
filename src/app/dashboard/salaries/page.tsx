"use client";

import { useEffect, useState } from "react";
import { 
  User, 
  Plus, 
  ArrowRight,
  Calendar,
  Filter,
  Pencil,
  Trash2,
  DollarSign,
  Briefcase,
  ShieldCheck,
  Zap,
  Receipt
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ListPagination from "@/components/ui/ListPagination";
import ListToolbar from "@/components/ui/ListToolbar";
import usePaginatedData from "@/hooks/usePaginatedData";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function SalariesPage() {
  const router = useRouter();
  const [salaries, setSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const res = await fetch("/api/salaries");
      const data = await res.json();
      if (data.success) {
        setSalaries(data.data);
      } else {
        toast.error(data.message || "Fetch failure");
      }
    } catch (error) {
      toast.error("Payroll synchronization failure");
    } finally {
      setLoading(false);
    }
  };

  const filteredSalaries = salaries.filter((salary) => {
    const query = searchQuery.toLowerCase();
    const employeeName = salary.employeeId?.name?.toLowerCase() || "";
    const month = salary.month?.toLowerCase() || "";
    const status = salary.status?.toLowerCase() || "";
    
    return employeeName.includes(query) || month.includes(query) || status.includes(query);
  });

  const { page, pageCount, pageSize, paginatedItems, setPage } = usePaginatedData(filteredSalaries);

  if (loading) return <LoadingSpinner label="Auditing Payroll Ledger..." />;

  const totalLiability = filteredSalaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);
  const totalAdvances = filteredSalaries.reduce((sum, s) => sum + (s.advanceTaken || 0), 0);
  const totalDispersed = filteredSalaries.reduce((sum, s) => sum + (s.paymentHistory?.reduce((pSum: number, p: any) => pSum + p.amount, 0) || 0), 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#d8dee6] rounded-md shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-md"></div>
             <span className="text-[10px] font-bold text-[#263238] uppercase tracking-widest">Finance Node</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#263238] tracking-tight uppercase italic">
            Payroll <span className="text-[#f59e0b]">Dispersals</span>
          </h1>
          <p className="text-[#64748b]/70 text-sm font-medium">Synchronize and audit workforce compensation and performance incentives.</p>
        </div>
        
        <Link 
          href="/dashboard/salaries/new"
          className="flex items-center gap-3 px-6 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] transition-all shadow-xl shadow-[#263238]/20"
        >
          <Plus size={18} className="text-[#f59e0b]" />
          Disperse Compensation
        </Link>
      </div>

      {/* TOP METRICS WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-[#263238] rounded-md text-white space-y-2 shadow-2xl shadow-[#263238]/20 border border-white/5 group hover:border-[#f59e0b] transition-all">
           <p className="text-[10px] font-black text-[#f59e0b] uppercase tracking-[0.3em]">Total Net Liability</p>
           <p className="text-3xl font-black italic tracking-tighter">QAR {totalLiability.toLocaleString()}</p>
        </div>
        <div className="p-8 bg-white border border-[#d8dee6] rounded-md space-y-2 shadow-sm group hover:border-rose-500 transition-all">
           <p className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.3em]">Advances Outstanding</p>
           <p className="text-3xl font-black text-rose-500 italic tracking-tighter">QAR {totalAdvances.toLocaleString()}</p>
        </div>
        <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-md space-y-2 shadow-sm group hover:border-emerald-500 transition-all">
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Total Dispersed</p>
           <p className="text-3xl font-black text-emerald-700 italic tracking-tighter">QAR {totalDispersed.toLocaleString()}</p>
        </div>
      </div>

      {/* SEARCH HUB */}
      <ListToolbar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search payroll by employee name, month, or status..."
        searchClassName="md:max-w-2xl"
      />

      {/* PAYROLL REGISTRY TABLE */}
      <div className="overflow-hidden border border-[#d8dee6] bg-white shadow-[0_30px_60px_rgba(5,91,101,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#d8dee6]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#64748b]">Personnel Node</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#64748b]">Billing Cycle</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#64748b]">Net Liability</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#64748b]">Audit Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#64748b] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dee6]/50">
              {filteredSalaries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-[#64748b]/30 italic uppercase tracking-widest">No payroll nodes detected</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((salary) => (
                  <tr key={salary._id} className="hover:bg-[#f8fafc]/50 transition-colors group">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-[#263238] flex items-center justify-center text-[#f59e0b] shadow-lg shadow-[#263238]/20">
                             <User size={16} />
                          </div>
                          <div>
                             <p className="text-sm font-black text-[#263238] uppercase">{salary.employeeId?.name || "Terminated Node"}</p>
                             <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">{salary.employeeId?.role || "RESTRICTED"}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <Calendar size={14} className="text-[#f59e0b]" />
                          <span className="text-sm font-black text-[#263238]">{salary.month}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-sm font-black text-[#263238]">QAR {(salary.netSalary || 0).toLocaleString()}</p>
                       <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Calculated Payout</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                          salary.status === 'paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                          salary.status === 'partially_paid' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                          'bg-rose-50 border-rose-100 text-rose-500'
                       }`}>
                          <div className={`h-1 w-1 rounded-full ${
                             salary.status === 'paid' ? 'bg-emerald-500' :
                             salary.status === 'partially_paid' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></div>
                          {salary.status?.replace('_', ' ')}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/dashboard/salaries/${salary._id}/slip`}
                            className="p-2.5 rounded-md bg-[#263238] text-white hover:bg-[#64748b] transition-all"
                            title="Generate Pay Slip"
                          >
                             <Receipt size={16} />
                          </Link>
                          <Link 
                            href={`/dashboard/salaries/${salary._id}/edit`}
                            className="p-2.5 rounded-md bg-white border border-[#d8dee6] text-[#263238] hover:border-[#263238] transition-all"
                          >
                             <Pencil size={16} />
                          </Link>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <ListPagination page={page} pageCount={pageCount} pageSize={pageSize} total={filteredSalaries.length} onPageChange={setPage} />
      </div>
    </div>
  );
}
