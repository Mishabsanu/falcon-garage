"use client";

import { useEffect, useState, use } from "react";
import { 
  User, 
  DollarSign, 
  Calendar, 
  ArrowLeft, 
  Edit3, 
  History, 
  CreditCard, 
  Briefcase,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  ChevronRight,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  Plus,
  X,
  Wallet
} from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import Link from "next/link";

export default function StaffViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Advance Modal State
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceReason, setAdvanceReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [id]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/staff/${id}/history`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error("Telemetry sync failure");
      }
    } catch (error) {
      toast.error("Network synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGiveAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceAmount || Number(advanceAmount) <= 0) return toast.error("Specify a valid advance valuation");
    
    setProcessing(true);
    try {
      const res = await fetch('/api/staff/advances/create', {
        method: 'POST',
        body: JSON.stringify({
          staffId: id,
          amount: Number(advanceAmount),
          reason: advanceReason || "Manual Advance Deployment",
          method: "cash"
        })
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Advance Protocol Finalized");
        setIsAdvanceModalOpen(false);
        setAdvanceAmount("");
        setAdvanceReason("");
        fetchHistory(); // Refresh the ledger
      } else {
        toast.error(result.message || "Advance deployment failed");
      }
    } catch (error) {
      toast.error("Network failure during deployment");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner label="Decoding Personnel Telemetry..." />;
  if (!data) return <div className="p-20 text-center font-black uppercase text-[#64748b]/20 italic">Node Not Found</div>;

  const { user, advances, salaries, reconciliation } = data;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <button 
            onClick={() => router.push("/dashboard/staff")}
            className="group mb-2 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#64748b] hover:text-[#263238] transition-colors"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to Registry
          </button>
          <div className="inline-flex items-center gap-2 border border-[#d8dee6] bg-white px-3 py-1 shadow-sm">
            <div className="h-1.5 w-1.5 bg-[#f59e0b]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#263238]">Personnel Profile</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263238] uppercase italic">
            {user.name} <span className="text-[#f59e0b]/50">[{user.role}]</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <button 
             onClick={() => setIsAdvanceModalOpen(true)}
             className="flex items-center gap-3 px-6 py-4 bg-rose-600 text-white rounded-md font-black text-[10px] uppercase italic tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20"
           >
             <Plus size={16} />
             Give Advance
           </button>
           <Link 
             href={`/dashboard/salaries/new`}
             className="flex items-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-md font-black text-[10px] uppercase italic tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
           >
             <DollarSign size={16} />
             Pay Salary
           </Link>
           <Link 
             href={`/dashboard/staff/${id}/edit`}
             className="flex items-center gap-3 px-6 py-4 bg-[#263238] text-white rounded-md font-black text-[10px] uppercase italic tracking-widest hover:bg-[#64748b] transition-all shadow-xl shadow-[#263238]/20"
           >
             <Edit3 size={16} className="text-[#f59e0b]" />
             Edit Profile
           </Link>
        </div>
      </div>

      {/* MONTHLY RECONCILIATION STATEMENT */}
      <div className="bg-white border border-[#d8dee6] overflow-hidden shadow-2xl shadow-[#263238]/5">
         <div className="bg-[#263238] px-10 py-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <Receipt className="text-[#f59e0b]" size={20} />
                  <h2 className="text-xl font-black uppercase italic tracking-tighter">Monthly Reconciliation Ledger</h2>
               </div>
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Current Cycle: {reconciliation.month}</p>
            </div>
            
            <div className="flex items-center gap-12 text-right">
               <div>
                  <p className="text-[10px] font-black text-[#f59e0b] uppercase tracking-widest">Opening Entitlement</p>
                  <p className="text-2xl font-black italic">QAR {reconciliation.grossEntitlement.toLocaleString()}</p>
               </div>
               <div className="h-10 w-px bg-white/10"></div>
               <div>
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Current Balance Due</p>
                  <p className="text-4xl font-black italic text-[#f59e0b]">QAR {reconciliation.remainingBalance.toLocaleString()}</p>
               </div>
            </div>
         </div>

         <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-4">
               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#64748b]">
                  <span>Gross Salary</span>
                  <ArrowUpCircle size={14} className="text-emerald-500" />
               </div>
               <div className="p-6 bg-[#f8fafc] border border-[#d8dee6] rounded-md">
                  <p className="text-2xl font-black text-[#263238]">QAR {reconciliation.grossEntitlement.toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-[#64748b] uppercase mt-1">Full Monthly Base</p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#64748b]">
                  <span>Advance Deductions</span>
                  <ArrowDownCircle size={14} className="text-rose-500" />
               </div>
               <div className="p-6 bg-[#f8fafc] border border-[#d8dee6] rounded-md">
                  <p className="text-2xl font-black text-rose-500">(- QAR {reconciliation.advanceDeductions.toLocaleString()})</p>
                  <p className="text-[9px] font-bold text-[#64748b] uppercase mt-1">Isolating Cycle Advances</p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#64748b]">
                  <span>Net Dispersed</span>
                  <Zap size={14} className="text-amber-500" />
               </div>
               <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-md">
                  <p className="text-2xl font-black text-emerald-700">QAR {reconciliation.totalDispersed.toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1">Calculated Cycle Payments</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN: HISTORY LEDGERS */}
        <div className="lg:col-span-2 space-y-12">
           {/* ADVANCE HISTORY */}
           <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#d8dee6] pb-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#263238] flex items-center gap-3">
                    <History size={16} className="text-[#f59e0b]" /> Advance Audit Trail
                 </h3>
                 <span className="text-[9px] font-bold text-[#64748b] uppercase italic">Total Aggregate: QAR {user.totalAdvances?.toLocaleString() || '0'}</span>
              </div>
              <div className="space-y-3">
                 {advances.length === 0 ? (
                    <div className="p-10 text-center border border-dashed border-[#d8dee6] rounded-md opacity-30">No history nodes</div>
                 ) : advances.map((adv: any) => (
                    <div key={adv._id} className="p-5 bg-white border border-[#d8dee6] rounded-md flex items-center justify-between hover:border-[#f59e0b] transition-all group">
                       <div className="flex items-center gap-5">
                          <div className="h-10 w-10 bg-[#263238] rounded-md flex items-center justify-center text-[#f59e0b]">
                             <Calendar size={16} />
                          </div>
                          <div>
                             <p className="text-xs font-black uppercase text-[#263238]">{adv.reason || "Manual Advance"}</p>
                             <p className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest mt-1">
                                {new Date(adv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                             </p>
                          </div>
                       </div>
                       <p className="text-lg font-black text-rose-500 italic">- QAR {adv.amount.toLocaleString()}</p>
                    </div>
                 ))}
              </div>
           </div>

           {/* SALARY HISTORY */}
           <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#d8dee6] pb-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#263238] flex items-center gap-3">
                    <CreditCard size={16} className="text-[#f59e0b]" /> Compensation History
                 </h3>
                 <span className="text-[9px] font-bold text-[#64748b] uppercase italic">{salaries.length} Records Found</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {salaries.length === 0 ? (
                    <div className="col-span-2 p-10 text-center border border-dashed border-[#d8dee6] rounded-md opacity-30">No history nodes</div>
                 ) : salaries.map((sal: any) => (
                    <div key={sal._id} className="p-6 bg-white border border-[#d8dee6] rounded-md hover:border-emerald-500 transition-all">
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase text-[#64748b] tracking-widest">{sal.month}</span>
                          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                             sal.status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                          }`}>
                             {sal.status}
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-xl font-black text-[#263238]">QAR {sal.netSalary?.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-[#64748b] uppercase">Dispersed Net Value</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: NODE INFO */}
        <div className="space-y-8">
           <div className="bg-[#f8fafc] border border-[#d8dee6] rounded-md p-8 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#263238] border-b border-[#d8dee6] pb-4">Core Infrastructure</h3>
              <div className="space-y-4">
                 <div>
                    <p className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Electronic Mail</p>
                    <p className="text-sm font-black text-[#263238] break-all">{user.email}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Access Tier</p>
                    <p className="text-sm font-black text-[#263238]">{user.role}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Node Status</p>
                    <div className="flex items-center gap-2 mt-1">
                       <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                       <p className="text-[10px] font-black text-[#263238] uppercase">Active Deployment</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* GIVE ADVANCE MODAL */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div 
             className="absolute inset-0 bg-[#263238]/80 backdrop-blur-md animate-in fade-in duration-300"
             onClick={() => !processing && setIsAdvanceModalOpen(false)}
           ></div>
           <div className="bg-white w-full max-w-lg rounded-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-rose-600 p-8 text-white flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/10 rounded-md flex items-center justify-center">
                       <Wallet size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase italic tracking-tighter">Advance Deployment</h3>
                       <p className="text-[10px] font-bold text-rose-200 uppercase tracking-widest mt-0.5">Personnel: {user.name}</p>
                    </div>
                 </div>
                 <button onClick={() => setIsAdvanceModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleGiveAdvance} className="p-8 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#263238]">Advance Valuation (QAR)</label>
                    <input 
                      required
                      type="number"
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#d8dee6] rounded-md px-6 py-5 text-3xl font-black text-rose-600 outline-none focus:border-rose-500 transition-all"
                      placeholder="0.00"
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#263238]">Audit Reason / Memo</label>
                    <input 
                      type="text"
                      value={advanceReason}
                      onChange={(e) => setAdvanceReason(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#d8dee6] rounded-md px-6 py-4 text-sm font-bold text-[#263238] outline-none focus:border-rose-500 transition-all"
                      placeholder="e.g. Medical emergency, Loan installment..."
                    />
                 </div>

                 <div className="pt-4 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsAdvanceModalOpen(false)}
                      className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-[#64748b]"
                    >
                       Abort
                    </button>
                    <button 
                      type="submit"
                      disabled={processing}
                      className="flex-2 px-10 py-4 bg-rose-600 text-white rounded-md font-black text-[10px] uppercase italic tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 disabled:opacity-50"
                    >
                       {processing ? "Finalizing..." : "Confirm Deployment"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
