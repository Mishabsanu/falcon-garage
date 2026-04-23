"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  Search, 
  MoreVertical,
  Banknote,
  Calendar,
  CreditCard,
  ArrowRight,
  ArrowUpRight,
  UserPlus,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  
  const [newSalary, setNewSalary] = useState({
    employeeId: "",
    month: new Date().toISOString().slice(0, 7),
    baseSalary: 0
  });

  const [advanceData, setAdvanceData] = useState({
    salaryId: "",
    amount: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, tRes] = await Promise.all([
        fetch("/api/salaries/list"),
        fetch("/api/users/technicians")
      ]);
      const [sData, tData] = await Promise.all([sRes.json(), tRes.json()]);
      
      if (sData.success) setSalaries(sData.data);
      if (tData.success) setTechnicians(tData.data);
    } catch (error) {
      toast.error("Human capital sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/salaries", {
        method: "POST",
        body: JSON.stringify(newSalary),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payroll record initialized");
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Initialization failed");
    }
  };

  const handleAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/salaries/advance", {
        method: "POST",
        body: JSON.stringify(advanceData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Salary advance processed successfully");
        setIsAdvanceModalOpen(false);
        setAdvanceData({ salaryId: "", amount: 0 });
        fetchData();
      }
    } catch (error) {
      toast.error("Advance deployment failed");
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white border border-[#e0e5e9] rounded-full shadow-sm">
             <div className="w-2 h-2 bg-[#1bd488] rounded-full animate-pulse"></div>
             <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-[0.2em]">Workforce Node</span>
          </div>
          <h1 className="text-4xl font-black text-[#055b65] tracking-tight italic uppercase">Workforce Compensation</h1>
          <p className="text-[#45828b]/60 text-sm font-medium max-w-xl">
             Manage payroll cycles, individual salary advances, and automated net settlement calculations.
          </p>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={() => setIsAdvanceModalOpen(true)}
             className="flex items-center gap-4 px-8 py-5 border-2 border-[#e0e5e9] text-[#055b65] rounded-[2rem] font-black text-xs uppercase italic tracking-tighter hover:bg-white transition-all shadow-sm"
           >
             <Banknote size={20} className="text-[#1bd488]" />
             Process Advance
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-4 px-8 py-5 bg-[#055b65] text-white rounded-[2rem] font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all shadow-2xl shadow-[#055b65]/30"
           >
             <UserPlus size={20} className="text-[#1bd488]" />
             Initialize Payroll
           </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-[#e0e5e9] shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[10px] font-bold text-[#45828b]/60 uppercase tracking-widest mb-1">Total Payroll (Month)</p>
               <h4 className="text-2xl font-black text-[#055b65]">Rs.{(salaries.reduce((acc, curr) => acc + curr.baseSalary, 0)).toLocaleString()}</h4>
            </div>
            <div className="w-14 h-14 bg-[#055b65]/5 rounded-2xl flex items-center justify-center text-[#055b65]">
               <Wallet size={24} />
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-[#e0e5e9] shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[10px] font-bold text-[#45828b]/60 uppercase tracking-widest mb-1">Active Advances</p>
               <h4 className="text-2xl font-black text-rose-500">Rs.{(salaries.reduce((acc, curr) => acc + curr.advanceTaken, 0)).toLocaleString()}</h4>
            </div>
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
               <TrendingDown size={24} />
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-[#e0e5e9] shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[10px] font-bold text-[#45828b]/60 uppercase tracking-widest mb-1">Net Payable</p>
               <h4 className="text-2xl font-black text-[#1bd488]">Rs.{(salaries.reduce((acc, curr) => acc + curr.netSalary, 0)).toLocaleString()}</h4>
            </div>
            <div className="w-14 h-14 bg-[#1bd488]/10 rounded-2xl flex items-center justify-center text-[#1bd488]">
               <CheckCircle2 size={24} />
            </div>
         </div>
      </div>

      {/* SALARY LEDGER */}
      <div className="bg-white rounded-[3rem] border border-[#e0e5e9] shadow-[0_20px_60px_-15px_rgba(5,91,101,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#e0e5e9]/20 text-[#45828b]/60 text-[9px] font-black uppercase tracking-[0.25em]">
                <th className="px-10 py-6">Employee Resource</th>
                <th className="px-10 py-6">Month Cycle</th>
                <th className="px-10 py-6">Base Valuation</th>
                <th className="px-10 py-6">Advance Balance</th>
                <th className="px-10 py-6">Settlement Amount</th>
                <th className="px-10 py-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e5e9]/30">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-12 h-12 border-4 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
                       <p className="text-[10px] font-black text-[#45828b]/40 uppercase tracking-[0.3em] animate-pulse">Auditing Payroll Cluster...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                salaries.map((salary) => (
                  <tr key={salary._id} className="hover:bg-[#1bd488]/5 transition-colors group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-2xl bg-[#055b65] flex items-center justify-center text-[#1bd488] text-xs font-black shadow-lg shadow-[#055b65]/20">
                            {salary.employeeId?.name.charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <p className="text-sm font-black text-[#055b65] uppercase tracking-tight">{salary.employeeId?.name}</p>
                            <p className="text-[9px] font-bold text-[#45828b]/40 uppercase tracking-widest">{salary.employeeId?.role || "Technician"}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-2 text-xs font-black text-[#055b65] bg-[#fbfcfc] px-4 py-2 rounded-xl border border-[#e0e5e9] w-fit">
                         <Calendar size={14} className="text-[#45828b]" />
                         {salary.month}
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className="text-sm font-black text-[#055b65]">Rs.{salary.baseSalary.toLocaleString()}</span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="space-y-1">
                         <span className="text-sm font-black text-rose-500">Rs.{salary.advanceTaken.toLocaleString()}</span>
                         <p className="text-[8px] font-bold text-rose-500/40 uppercase tracking-tighter">Deducted from settlement</p>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className="text-lg font-black text-[#1bd488] italic tracking-tighter">Rs.{salary.netSalary.toLocaleString()}</span>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        salary.status === 'paid' ? 'bg-[#1bd488]/10 text-[#1bd488] border-[#1bd488]/20' : 'bg-amber-50 text-amber-500 border-amber-100'
                      }`}>
                        {salary.status === 'paid' ? <ShieldCheck size={12} /> : <Clock size={12} />}
                        {salary.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYROLL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#055b65]/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500 border border-white/20">
             <div className="bg-[#055b65] p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1bd488]/10 blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-3">Initialize Payroll</h3>
                   <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Mapping monthly compensation nodes</p>
                </div>
             </div>
             
             <form onSubmit={handleCreate} className="p-12 space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-[#055b65] uppercase tracking-widest ml-1">Personnel Resource</label>
                   <select 
                     required
                     value={newSalary.employeeId}
                     onChange={(e) => setNewSalary({...newSalary, employeeId: e.target.value})}
                     className="w-full px-6 py-4 bg-[#fbfcfc] border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488] transition-all appearance-none cursor-pointer"
                   >
                      <option value="">Select Employee...</option>
                      {technicians.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#055b65] uppercase tracking-widest ml-1">Month Cycle</label>
                      <input 
                        type="month"
                        required
                        value={newSalary.month}
                        onChange={(e) => setNewSalary({...newSalary, month: e.target.value})}
                        className="w-full px-6 py-4 bg-[#fbfcfc] border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488] transition-all"
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#055b65] uppercase tracking-widest ml-1">Base Salary (₹)</label>
                      <input 
                        type="number"
                        required
                        value={newSalary.baseSalary}
                        onChange={(e) => setNewSalary({...newSalary, baseSalary: Number(e.target.value)})}
                        className="w-full px-6 py-4 bg-[#fbfcfc] border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488] transition-all"
                        placeholder="0.00"
                      />
                   </div>
                </div>

                <div className="pt-6 flex gap-5">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-5 border-2 border-[#e0e5e9] text-[#055b65] rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#fbfcfc] transition-all">
                     Abort
                   </button>
                   <button type="submit" className="flex-1 px-8 py-5 bg-[#055b65] text-white rounded-[2rem] font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-[#055b65]/20">
                     Activate Payroll <ArrowRight size={20} className="text-[#1bd488]" />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* ADVANCE MODAL */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-rose-900/40 backdrop-blur-md" onClick={() => setIsAdvanceModalOpen(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500 border border-white/20">
             <div className="bg-rose-500 p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10 flex items-center gap-6">
                   <div className="w-16 h-16 bg-white/20 rounded-[2rem] flex items-center justify-center">
                      <Banknote size={32} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-3">Salary Advance</h3>
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">Deploying mid-cycle capital liquidity</p>
                   </div>
                </div>
             </div>
             
             <form onSubmit={handleAdvance} className="p-12 space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-[#055b65] uppercase tracking-widest ml-1">Target Payroll Ledger</label>
                   <select 
                     required
                     value={advanceData.salaryId}
                     onChange={(e) => setAdvanceData({...advanceData, salaryId: e.target.value})}
                     className="w-full px-6 py-4 bg-[#fbfcfc] border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:border-rose-500 transition-all appearance-none cursor-pointer"
                   >
                      <option value="">Select Employee Record...</option>
                      {salaries.filter(s => s.status !== 'paid').map(s => (
                        <option key={s._id} value={s._id}>
                           {s.employeeId?.name} - {s.month} (Max: ₹{s.baseSalary})
                        </option>
                      ))}
                   </select>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-[#055b65] uppercase tracking-widest ml-1">Advance Amount (₹)</label>
                   <div className="relative">
                      <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 text-[#45828b]/40" size={20} />
                      <input 
                        type="number"
                        required
                        value={advanceData.amount}
                        onChange={(e) => setAdvanceData({...advanceData, amount: Number(e.target.value)})}
                        className="w-full pl-16 pr-6 py-4 bg-[#fbfcfc] border border-[#e0e5e9] rounded-2xl text-lg font-black text-[#055b65] outline-none focus:border-rose-500 transition-all"
                        placeholder="0.00"
                      />
                   </div>
                   <p className="text-[9px] font-bold text-[#45828b]/40 italic ml-1">
                      Note: This amount will be automatically deducted from the final net payable settlement.
                   </p>
                </div>

                <div className="pt-6 flex gap-5">
                   <button type="button" onClick={() => setIsAdvanceModalOpen(false)} className="flex-1 px-8 py-5 border-2 border-[#e0e5e9] text-[#055b65] rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#fbfcfc] transition-all">
                     Cancel
                   </button>
                   <button type="submit" className="flex-1 px-8 py-5 bg-rose-500 text-white rounded-[2rem] font-black text-xs uppercase italic tracking-tighter hover:bg-rose-600 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-rose-500/20">
                     Deploy Advance <ArrowUpRight size={20} />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
