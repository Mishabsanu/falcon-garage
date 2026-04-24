"use client";

import {
   AlertCircle,
   ArrowLeft,
   ArrowRight,
   Car,
   CheckCircle2,
   Clock,
   CreditCard,
   Download,
   Printer,
   Receipt,
   ShieldCheck,
   User,
   Wallet
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setPaymentAmount(result.data.balanceAmount);
        setDiscountAmount(0); // Reset after fetch
      }
    } catch (error) {
      toast.error("Accounting sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        body: JSON.stringify({ 
          invoiceId: id, 
          amount: paymentAmount,
          discount: discountAmount,
          paymentMethod: "cash",
          reference: `PAY-${Date.now()}`
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Settlement protocol verified");
        fetchInvoice();
      }
    } catch (error) {
      toast.error("Payment protocol failure");
    }
  };

  if (loading) return <LoadingSpinner label="Synchronizing Financial Node..." />;

  if (!data) return <div className="text-center py-20 font-bold text-[#263238]">Invoice node not found.</div>;

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* NAVIGATION & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Link href="/dashboard/invoices" className="inline-flex items-center gap-2 text-[#64748b] hover:text-[#263238] transition-all font-black text-[9px] uppercase tracking-[0.2em] group">
          <div className="p-2 rounded-md bg-white border border-[#d8dee6] group-hover:border-[#f59e0b] shadow-sm transition-all group-hover:-translate-x-1">
            <ArrowLeft size={14} />
          </div>
          Back to Settlement Registry
        </Link>
        <div className="flex gap-3 w-full md:w-auto">
           <button 
             onClick={() => window.print()}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-[#d8dee6] text-[#263238] rounded-md font-black text-[9px] uppercase tracking-widest hover:border-[#f59e0b]/50 transition-all shadow-sm"
           >
              <Printer size={14} /> Print
           </button>
           <button 
             onClick={() => window.open(`/api/invoices/pdf/${id}`, "_blank")}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#263238] text-white rounded-md font-black text-[9px] uppercase italic tracking-widest hover:bg-[#64748b] transition-all shadow-xl"
           >
              <Download size={14} className="text-[#f59e0b]" /> Export PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* PRIMARY INVOICE DOCUMENT */}
        <div className="xl:col-span-2 bg-white rounded-md border border-[#d8dee6] shadow-sm overflow-hidden relative">

           
           <div className="p-8 md:p-10 border-b border-[#f0f3f5] flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f59e0b]/5 border border-[#f59e0b]/10 rounded-md">
                    <ShieldCheck size={12} className="text-[#f59e0b]" />
                    <span className="text-[8px] font-black text-[#f59e0b] uppercase tracking-[0.2em]">Verified Node</span>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[8px] font-black text-[#64748b]/40 uppercase tracking-[0.4em]">Transaction Identifier</p>
                    <h1 className="text-3xl font-black text-[#263238] tracking-tighter flex items-baseline gap-2">
                       {data.invoiceNumber}
                       <span className="text-sm font-bold text-[#64748b]/20 tracking-widest uppercase">QAR</span>
                    </h1>
                 </div>
                 <div className="flex items-center gap-4">
                    <div>
                       <p className="text-[8px] font-black text-[#64748b]/40 uppercase tracking-widest mb-0.5">Timestamp</p>
                       <p className="text-[10px] font-bold text-[#263238]">{new Date(data.createdAt).toLocaleDateString()} {new Date(data.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-[#64748b]/40 uppercase tracking-widest mb-0.5">Ref</p>
                       <p className="text-[10px] font-bold text-[#263238]">#{data.jobCardId?._id?.slice(-8).toUpperCase()}</p>
                    </div>
                 </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                 <div className={`px-4 py-2 rounded-md text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm flex items-center gap-2 ${
                    data.status === 'paid' ? 'bg-emerald-500 text-white border-emerald-600' : 
                    data.status === 'partial' ? 'bg-amber-500 text-white border-amber-600' : 'bg-rose-500 text-white border-rose-600'
                 }`}>
                    {data.status === 'paid' ? <CheckCircle2 size={12} /> : data.status === 'partial' ? <Clock size={12} /> : <AlertCircle size={12} />}
                    {data.status}
                 </div>
                 {data.status === 'paid' && (
                    <div className="rotate-[-8deg] border-2 border-emerald-500/20 px-3 py-1 rounded text-emerald-500/20 text-lg font-black uppercase tracking-widest">
                       PAID
                    </div>
                 )}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#f0f3f5]">
              <div className="p-8 bg-white space-y-4">
                 <h4 className="text-[8px] font-black text-[#64748b] uppercase tracking-[0.3em] flex items-center gap-2">
                    <User size={12} className="text-[#f59e0b]" /> Recipient
                 </h4>
                 <div className="space-y-1">
                    <p className="text-lg font-black text-[#263238] tracking-tight">{data.customerId?.name}</p>
                    <p className="text-xs font-bold text-[#64748b]">{data.customerId?.phone}</p>
                    <p className="text-[10px] font-medium text-[#64748b]/50 leading-relaxed italic">{data.customerId?.address}</p>
                 </div>
              </div>
              <div className="p-8 bg-white space-y-4">
                 <h4 className="text-[8px] font-black text-[#64748b] uppercase tracking-[0.3em] flex items-center gap-2">
                    <Car size={12} className="text-[#f59e0b]" /> Asset
                 </h4>
                 <div className="space-y-1">
                    <p className="text-lg font-black text-[#263238] tracking-tight">{data.vehicleId?.brand} {data.vehicleId?.model}</p>
                    <p className="text-xs font-bold text-[#64748b] tracking-[0.1em]">{data.vehicleId?.vehicleNumber}</p>
                    <p className="text-[9px] font-black text-[#f59e0b]/50 uppercase tracking-widest">VIN: {data.vehicleId?.vin || 'N/A'}</p>
                 </div>
              </div>
           </div>

           <div className="p-8">
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="text-[8px] font-black text-[#64748b]/40 uppercase tracking-[0.3em] border-b border-[#f0f3f5]">
                          <th className="py-4 text-left">Node Description</th>
                          <th className="py-4 text-center w-20">Qty</th>
                          <th className="py-4 text-right w-32">Unit Value</th>
                          <th className="py-4 text-right w-32">Total Value</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f3f5]">
                       {data.items?.map((item: any, i: number) => (
                          <tr key={i} className="group hover:bg-[#f7f4ef]/30 transition-colors">
                             <td className="py-4">
                                <p className="text-[11px] font-black text-[#263238] uppercase">{item.name}</p>
                             </td>
                             <td className="py-4 text-center">
                                <span className="text-xs font-black text-[#263238]">{item.qty}</span>
                             </td>
                             <td className="py-4 text-right font-mono text-[10px] text-[#64748b]">
                                {item.price.toLocaleString()}
                             </td>
                             <td className="py-4 text-right font-mono text-xs font-black text-[#263238]">
                                {item.total.toLocaleString()}
                             </td>
                          </tr>
                       ))}
                       {data.laborCost > 0 && (
                          <tr className="bg-gray-50/30">
                             <td className="py-4 px-2">
                                <p className="text-[10px] font-black text-[#263238] uppercase">Labor Protocol</p>
                             </td>
                             <td></td>
                             <td></td>
                             <td className="py-4 px-2 text-right font-mono text-xs font-black text-[#263238]">{data.laborCost?.toLocaleString()}</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>

              <div className="mt-8 flex flex-col md:flex-row justify-between items-start gap-8 pt-8 border-t-2 border-dashed border-[#f0f3f5]">
                 <p className="text-[8px] text-[#64748b]/40 leading-relaxed italic max-w-[200px]">
                    Authenticated digital ledger. QAR standardization protocol active.
                 </p>
                 <div className="w-full md:w-64 space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-[#64748b]">
                       <span className="uppercase tracking-widest">Aggregate</span>
                       <span>QAR {data.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-[#f59e0b]">
                       <span className="uppercase tracking-widest">Tax (18%)</span>
                       <span>+ QAR {data.gstAmount?.toLocaleString()}</span>
                    </div>
                    {data.discount > 0 && (
                      <div className="flex justify-between text-[10px] font-bold text-rose-500">
                         <span className="uppercase tracking-widest">Rebate</span>
                         <span>- QAR {data.discount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t-2 border-[#263238] flex justify-between items-center">
                       <span className="text-[10px] font-black text-[#263238] uppercase italic">Grand Final</span>
                       <span className="text-xl font-black text-[#263238] tracking-tighter">QAR {data.grandTotal?.toLocaleString()}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* SETTLEMENT SIDEBAR */}
        <div className="space-y-6">
           <div className="bg-white rounded-md p-8 border border-[#d8dee6] shadow-sm relative overflow-hidden group">
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center justify-between pb-4 border-b border-[#f0f3f5]">
                    <h3 className="text-[10px] font-black text-[#263238] uppercase tracking-[0.3em] flex items-center gap-2">
                       <ShieldCheck size={14} className="text-[#f59e0b]" /> Settlement Status
                    </h3>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${data.balanceAmount === 0 ? 'bg-emerald-500' : 'bg-[#f59e0b]'}`}></div>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    <div className="p-5 rounded-md bg-[#f8fafc] border border-[#e2e8f0] flex justify-between items-center">
                       <p className="text-[9px] font-black text-[#64748b] uppercase tracking-widest">Settled</p>
                       <p className="text-xl font-black text-[#263238] tracking-tighter">QAR {data.paidAmount?.toLocaleString()}</p>
                    </div>
                    <div className="p-5 rounded-md bg-white border border-[#e2e8f0] flex justify-between items-center shadow-sm">
                       <p className="text-[9px] font-black text-[#64748b] uppercase tracking-widest">Outstanding</p>
                       <p className="text-xl font-black text-rose-500 tracking-tighter">QAR {data.balanceAmount?.toLocaleString()}</p>
                    </div>
                 </div>

                 {data.balanceAmount > 0 && (
                    <div className="space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[8px] font-black text-[#64748b] uppercase tracking-widest ml-1">Payment</label>
                             <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#64748b]">QAR</span>
                                <input 
                                  type="number"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                  className="w-full pl-10 pr-3 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] text-[#263238] rounded-md font-black text-sm outline-none focus:border-[#f59e0b] focus:ring-4 focus:ring-[#f59e0b]/10 transition-all"
                                />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black text-rose-500 uppercase tracking-widest ml-1">Rebate</label>
                             <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-rose-500">QAR</span>
                                <input 
                                  type="number"
                                  value={discountAmount}
                                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                                  className="w-full pl-10 pr-3 py-2.5 bg-rose-50/30 border border-rose-100 text-rose-500 rounded-md font-black text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-500/10 transition-all"
                                />
                             </div>
                          </div>
                       </div>
                       <button 
                         onClick={handlePayment}
                         className="w-full py-4 bg-[#263238] text-white rounded-md font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#455a64] transition-all flex items-center justify-center gap-3 group/pay"
                       >
                          Verify & Settle <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                       </button>
                    </div>
                 )}
                 
                 {data.balanceAmount === 0 && (
                    <div className="py-8 bg-emerald-50/50 rounded-md border border-emerald-100 text-center space-y-2">
                       <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
                       <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600">Protocol Finalized</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="bg-white rounded-md p-8 border border-[#d8dee6] shadow-sm space-y-6">
              <h3 className="text-[9px] font-black text-[#263238] uppercase tracking-widest flex items-center gap-2">
                 <Receipt size={14} /> Audit Trail
              </h3>
              <div className="space-y-4">
                 <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded bg-[#f7f4ef] flex items-center justify-center text-[#263238]">
                       <Wallet size={12} />
                    </div>
                    <div className="flex-1">
                       <p className="text-[9px] font-black text-[#263238] uppercase">Generated</p>
                       <p className="text-[8px] text-[#64748b]/60 font-bold uppercase">{new Date(data.createdAt).toLocaleDateString()}</p>
                    </div>
                 </div>
                 {data.paidAmount > 0 && (
                    <div className="flex gap-3 items-center">
                       <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white">
                          <CreditCard size={12} />
                       </div>
                       <div className="flex-1">
                          <p className="text-[9px] font-black text-[#263238] uppercase">Verified</p>
                          <p className="text-[8px] text-emerald-500 font-bold uppercase">Success</p>
                       </div>
                       <p className="text-[10px] font-black text-[#263238]">QAR {data.paidAmount.toLocaleString()}</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
