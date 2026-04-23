"use client";

import { useEffect, useState, use } from "react";
import { 
  FileText, 
  User, 
  Car, 
  CreditCard, 
  Wallet, 
  ArrowLeft, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Zap,
  TrendingUp,
  Receipt,
  Mail,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState(0);

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
          paymentMethod: "cash", // Simple for now
          reference: `PAY-${Date.now()}`
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Liquidity verified & updated");
        fetchInvoice();
      }
    } catch (error) {
      toast.error("Payment protocol failure");
    }
  };

  if (loading) return (
    <div className="py-20 text-center flex flex-col items-center gap-4">
       <div className="w-10 h-10 border-2 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
       <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Compiling Billing Data...</p>
    </div>
  );

  if (!data) return <div className="text-center py-20 font-bold text-[#055b65]">Invoice node not found.</div>;

  return (
    <div className="space-y-10 pb-20">
      {/* NAVIGATION */}
      <div className="flex justify-between items-center">
        <Link href="/dashboard/invoices" className="inline-flex items-center gap-2 text-[#45828b] hover:text-[#055b65] transition-colors font-bold text-xs uppercase tracking-widest group">
          <div className="p-2 rounded-lg bg-white border border-[#e0e5e9] group-hover:border-[#1bd488] transition-all">
            <ArrowLeft size={16} />
          </div>
          Back to Billing Registry
        </Link>
        <div className="flex gap-4">
           <button className="flex items-center gap-3 px-6 py-3 bg-white border border-[#e0e5e9] text-[#055b65] rounded-xl font-bold text-xs uppercase tracking-widest hover:border-[#1bd488]/50 transition-all">
              <Printer size={16} /> Print Receipt
           </button>
           <button className="flex items-center gap-3 px-6 py-3 bg-[#055b65] text-white rounded-xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all shadow-xl shadow-[#055b65]/20">
              <Download size={16} className="text-[#1bd488]" /> Export Ledger
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* INVOICE DISPLAY */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-[#e0e5e9] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden relative">
           <div className="absolute top-0 left-0 w-2 h-full bg-[#055b65]"></div>
           
           {/* INVOICE HEADER */}
           <div className="p-12 border-b border-[#f0f3f5] flex justify-between items-start">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1bd488]/5 border border-[#1bd488]/10 rounded-full">
                    <Zap size={12} className="text-[#1bd488] fill-[#1bd488]" />
                    <span className="text-[10px] font-black text-[#1bd488] uppercase tracking-[0.2em]">Verified Transaction</span>
                 </div>
                 <h1 className="text-4xl font-black text-[#055b65] tracking-tight lowercase">inv://{data.invoiceNumber}</h1>
                 <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Timestamp: {new Date(data.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right space-y-2">
                 <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    data.status === 'paid' ? 'bg-[#1bd488]/10 text-[#1bd488] border-[#1bd488]/20' : 
                    data.status === 'partial' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                 }`}>
                    {data.status === 'paid' ? <CheckCircle2 size={12} /> : data.status === 'partial' ? <Clock size={12} /> : <AlertCircle size={12} />}
                    {data.status}
                 </span>
                 <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest mt-2 italic">Ref: ORDER-{data.jobCardId?._id?.slice(-8)}</p>
              </div>
           </div>

           {/* BILLING PARTIES */}
           <div className="grid grid-cols-2 gap-12 p-12 bg-[#fbfcfc]/50">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-[#45828b] uppercase tracking-[0.25em] flex items-center gap-2">
                    <User size={14} className="text-[#1bd488]" /> Recipient Node
                 </h4>
                 <div className="space-y-2 pl-6 border-l-2 border-[#1bd488]/20">
                    <p className="text-lg font-black text-[#055b65]">{data.customerId?.name}</p>
                    <p className="text-xs font-bold text-[#45828b]/60">{data.customerId?.phone}</p>
                    <p className="text-xs font-medium text-[#45828b]/40 max-w-[200px] leading-relaxed italic">{data.customerId?.address}</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-[#45828b] uppercase tracking-[0.25em] flex items-center gap-2">
                    <Car size={14} className="text-[#1bd488]" /> Asset Unit
                 </h4>
                 <div className="space-y-2 pl-6 border-l-2 border-[#1bd488]/20">
                    <p className="text-lg font-black text-[#055b65]">{data.vehicleId?.brand} {data.vehicleId?.model}</p>
                    <p className="text-xs font-bold text-[#45828b]/60">{data.vehicleId?.vehicleNumber}</p>
                    <p className="text-[10px] font-black text-[#1bd488] uppercase tracking-widest">Asset ID: {data.vehicleId?._id?.slice(-12)}</p>
                 </div>
              </div>
           </div>

           {/* TRANSACTION ITEMS */}
           <div className="p-12">
              <table className="w-full">
                 <thead>
                    <tr className="text-[10px] font-black text-[#45828b]/40 uppercase tracking-[0.3em] border-b border-[#f0f3f5]">
                       <th className="py-4 text-left">Item Description</th>
                       <th className="py-4 text-center">Qty</th>
                       <th className="py-4 text-right">Unit Price</th>
                       <th className="py-4 text-right">Valuation</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-[#f0f3f5]">
                    {data.items?.map((item: any, i: number) => (
                       <tr key={i} className="group">
                          <td className="py-6">
                             <p className="text-xs font-black text-[#055b65] uppercase group-hover:text-[#1bd488] transition-colors">{item.name}</p>
                          </td>
                          <td className="py-6 text-center">
                             <p className="text-xs font-bold text-[#45828b]">{item.qty}</p>
                          </td>
                          <td className="py-6 text-right font-mono text-xs text-[#45828b]">
                             ₹{item.price.toLocaleString()}
                          </td>
                          <td className="py-6 text-right font-mono text-sm font-black text-[#055b65]">
                             ₹{item.total.toLocaleString()}
                          </td>
                       </tr>
                    ))}
                    <tr>
                       <td className="py-6 italic text-[10px] font-bold text-[#45828b]/30 uppercase tracking-widest">Labor Service Component</td>
                       <td></td>
                       <td></td>
                       <td className="py-6 text-right font-mono text-sm font-black text-[#055b65]">₹{data.laborCost?.toLocaleString()}</td>
                    </tr>
                 </tbody>
              </table>

              {/* TOTALS */}
              <div className="mt-12 flex justify-end">
                 <div className="w-full max-w-[300px] space-y-4">
                    <div className="flex justify-between text-xs font-bold text-[#45828b]">
                       <span className="uppercase tracking-widest">Raw Valuation</span>
                       <span>₹{data.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-[#1bd488]">
                       <span className="uppercase tracking-widest">Tax Component (18%)</span>
                       <span>+ ₹{data.gstAmount?.toLocaleString()}</span>
                    </div>
                    {data.discount > 0 && (
                      <div className="flex justify-between text-xs font-bold text-rose-500">
                         <span className="uppercase tracking-widest">Applied Rebate</span>
                         <span>- ₹{data.discount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t-2 border-[#055b65] flex justify-between items-center text-xl font-black text-[#055b65]">
                       <span className="uppercase italic tracking-tighter text-sm">Grand Total</span>
                       <span className="tracking-tighter italic">₹{data.grandTotal?.toLocaleString()}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* SIDEBAR: SETTLEMENT CORE */}
        <div className="space-y-10">
           {/* PAYMENT CONSOLE */}
           <div className="bg-[#055b65] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <TrendingUp size={200} className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10 space-y-10">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold italic tracking-tight uppercase">Settlement Unit</h3>
                    <ShieldCheck size={20} className="text-[#1bd488]" />
                 </div>

                 <div className="space-y-6">
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Total Paid Intensity</p>
                       <p className="text-3xl font-black text-[#1bd488] tracking-tighter italic">₹{data.paidAmount?.toLocaleString()}</p>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                       <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Remaining Exposure</p>
                       <p className="text-3xl font-black text-white tracking-tighter italic">₹{data.balanceAmount?.toLocaleString()}</p>
                    </div>
                 </div>

                 {data.balanceAmount > 0 && (
                    <div className="space-y-6 pt-10 border-t border-white/10">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Input Settlement Volume</label>
                          <input 
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            className="w-full px-6 py-4 bg-white text-[#055b65] rounded-2xl font-black text-lg outline-none focus:ring-4 focus:ring-[#1bd488]/30 transition-all"
                          />
                       </div>
                       <button 
                         onClick={handlePayment}
                         className="w-full py-5 bg-[#1bd488] text-[#055b65] rounded-[1.5rem] font-black text-xs uppercase italic tracking-tighter hover:brightness-110 shadow-2xl shadow-[#1bd488]/20 transition-all flex items-center justify-center gap-3"
                       >
                          Finalize Liquidity Transfer <CreditCard size={18} />
                       </button>
                    </div>
                 )}
                 
                 {data.balanceAmount === 0 && (
                    <div className="py-10 text-center space-y-4">
                       <div className="w-16 h-16 rounded-full bg-[#1bd488]/20 border-2 border-[#1bd488] flex items-center justify-center mx-auto text-[#1bd488] animate-bounce">
                          <CheckCircle2 size={32} />
                       </div>
                       <p className="text-xs font-black uppercase tracking-widest">Accounting Loop Closed</p>
                    </div>
                 )}
              </div>
           </div>

           {/* LEDGER SNAPSHOT */}
           <div className="bg-white rounded-[2.5rem] p-10 border border-[#e0e5e9] shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                 <Receipt size={18} className="text-[#055b65]" />
                 <h3 className="text-xs font-black text-[#055b65] uppercase tracking-widest">Transaction Log</h3>
              </div>
              <div className="space-y-4">
                 {/* This would be populated from Payment models, but for now we list the status */}
                 <div className="p-4 rounded-2xl bg-[#fbfcfc] border border-[#e0e5e9] flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#1bd488]/10 flex items-center justify-center text-[#1bd488]">
                       <Wallet size={16} />
                    </div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black text-[#055b65] uppercase">Invoice Initialization</p>
                       <p className="text-[9px] text-[#45828b]/60 font-bold">{new Date(data.createdAt).toLocaleDateString()}</p>
                    </div>
                 </div>
                 {data.paidAmount > 0 && (
                   <div className="p-4 rounded-2xl bg-[#1bd488]/5 border border-[#1bd488]/20 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[#1bd488] flex items-center justify-center text-white">
                         <CreditCard size={16} />
                      </div>
                      <div className="flex-1">
                         <p className="text-[10px] font-black text-[#055b65] uppercase">Partial/Full Settlement Recorded</p>
                         <p className="text-[9px] text-[#45828b]/60 font-bold">Successfully Verified</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-[#1bd488]">₹{data.paidAmount.toLocaleString()}</p>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
