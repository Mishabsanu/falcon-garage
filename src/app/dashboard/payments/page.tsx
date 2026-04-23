"use client";

import { useEffect, useState } from "react";
import { 
  Wallet, 
  Search, 
  Plus, 
  MoreVertical, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Calendar,
  Receipt
} from "lucide-react";
import { toast } from "sonner";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newPayment, setNewPayment] = useState({
    invoiceId: "",
    amount: 0,
    method: "cash",
    note: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, iRes] = await Promise.all([
        fetch("/api/payments/list"), // I'll create this
        fetch("/api/invoices/list")
      ]);
      const [pData, iData] = await Promise.all([
        pRes.json(), iRes.json()
      ]);
      
      if (pData.success) setPayments(pData.data);
      if (iData.success) setInvoices(iData.data);
    } catch (error) {
      toast.error("Collection synchronization failure");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/payments/create", { // I'll create this
        method: "POST",
        body: JSON.stringify(newPayment),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settlement recorded successfully");
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Collection recording failed");
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'upi': return <Smartphone size={16} className="text-[#1bd488]" />;
      case 'card': return <CreditCard size={16} className="text-[#055b65]" />;
      case 'bank': return <Building2 size={16} className="text-[#45828b]" />;
      default: return <Banknote size={16} className="text-[#1bd488]" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e0e5e9] rounded-full shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#1bd488] rounded-full"></div>
             <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-widest">Revenue Node</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#055b65] tracking-tight">Payment Settlements</h1>
          <p className="text-[#45828b]/70 text-sm font-medium">Synchronize and audit all incoming financial transactions and collections.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all shadow-xl shadow-[#055b65]/20"
        >
          <Plus size={18} className="text-[#1bd488]" />
          Record New Collection
        </button>
      </div>

      {/* TRANSACTION LIST */}
      <div className="bg-white rounded-[2.5rem] border border-[#e0e5e9] shadow-[0_20px_50_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#e0e5e9]/20 text-[#45828b]/60 text-[9px] font-bold uppercase tracking-[0.25em]">
                <th className="px-8 py-5">Transaction Timestamp</th>
                <th className="px-8 py-5">Source Node (Invoice)</th>
                <th className="px-8 py-5">Settlement Channel</th>
                <th className="px-8 py-5">Valuation</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e5e9]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Auditing Transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-[#45828b]/40">No transactions recorded in the current cluster.</p>
                  </td>
                </tr>
              ) : payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-[#1bd488]/5 transition-colors group cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <Calendar size={14} className="text-[#45828b]/40" />
                       <span className="text-xs font-bold text-[#055b65]">{new Date(payment.paidAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <Receipt size={14} className="text-[#1bd488]" />
                       <span className="text-sm font-bold text-[#055b65]">#{payment.invoiceId?.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl w-fit">
                       {getMethodIcon(payment.method)}
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#055b65]">{payment.method}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-[#1bd488] italic">₹{payment.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2.5 rounded-xl hover:bg-white hover:shadow-md transition-all text-[#45828b]">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#055b65]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
             <div className="bg-[#055b65] p-8 text-white">
                <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Revenue Settlement</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Record Payment against Active Billing Node</p>
             </div>
             
             <form onSubmit={handleCreate} className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Target Billing Node</label>
                   <select 
                     required
                     value={newPayment.invoiceId}
                     onChange={(e) => setNewPayment({...newPayment, invoiceId: e.target.value})}
                     className="w-full px-5 py-4 bg-[#fbfcfc] border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50 appearance-none transition-all"
                   >
                     <option value="">Select Unpaid Invoice...</option>
                     {invoices.filter(i => i.status !== 'paid').map(i => (
                       <option key={i._id} value={i._id}>{i.invoiceNumber} - {i.customerId?.name} (Due: ₹{i.balanceAmount})</option>
                     ))}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Collection Valuation (₹)</label>
                   <input 
                     type="number"
                     required
                     value={newPayment.amount}
                     onChange={(e) => setNewPayment({...newPayment, amount: Number(e.target.value)})}
                     className="w-full px-5 py-4 bg-[#fbfcfc] border border-[#e0e5e9] rounded-2xl text-lg font-black text-[#1bd488] outline-none focus:border-[#1bd488]/50" 
                     placeholder="0.00"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Settlement Channel</label>
                   <div className="grid grid-cols-4 gap-3">
                      {['cash', 'upi', 'card', 'bank'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setNewPayment({...newPayment, method: m})}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                            newPayment.method === m 
                              ? "bg-[#055b65] text-white border-[#055b65] shadow-lg shadow-[#055b65]/20" 
                              : "bg-white text-[#45828b]/60 border-[#e0e5e9] hover:border-[#1bd488]"
                          }`}
                        >
                           {getMethodIcon(m)}
                           <span className="text-[8px] font-black uppercase tracking-widest">{m}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Internal Log (Optional)</label>
                   <input 
                     value={newPayment.note}
                     onChange={(e) => setNewPayment({...newPayment, note: e.target.value})}
                     className="w-full px-5 py-4 bg-[#fbfcfc] border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                     placeholder="Reference Number / Details"
                   />
                </div>

                <div className="pt-6 flex gap-4">
                   <button 
                     type="button"
                     onClick={() => setIsModalOpen(false)}
                     className="flex-1 px-6 py-4 border border-[#e0e5e9] text-[#45828b] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#fbfcfc]"
                   >
                     Abort
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] flex items-center justify-center gap-3 shadow-xl shadow-[#055b65]/10"
                   >
                     Synchronize Settlement <ArrowRight size={18} className="text-[#1bd488]" />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
