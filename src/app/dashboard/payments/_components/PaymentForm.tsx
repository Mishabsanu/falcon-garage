"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Wallet, 
  Receipt, 
  Save, 
  ShieldCheck, 
  Banknote, 
  Smartphone, 
  CreditCard, 
  Building2,
  FileText
} from "lucide-react";
import { toast } from "sonner";

interface PaymentFormProps {
  mode: "create" | "edit";
  paymentId?: string;
}

export default function PaymentForm({ mode, paymentId }: PaymentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    invoiceId: "",
    amount: 0,
    method: "cash",
    note: ""
  });

  useEffect(() => {
    fetchInvoices();
    if (mode === "edit" && paymentId) {
      fetchPayment();
    }
  }, [mode, paymentId]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices/list");
      const data = await res.json();
      if (data.success) setInvoices(data.data);
    } catch (error) {
      toast.error("Failed to load invoices");
    }
  };

  const fetchPayment = async () => {
    try {
      const res = await fetch(`/api/payments/${paymentId}`);
      const data = await res.json();
      if (data.success) {
        setFormData({
          invoiceId: data.data.invoiceId?._id || data.data.invoiceId || "",
          amount: data.data.amount || 0,
          method: data.data.method || "cash",
          note: data.data.note || ""
        });
      }
    } catch (error) {
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = mode === "edit" ? `/api/payments` : "/api/payments/create";
      const method = mode === "edit" ? "PATCH" : "POST";
      const body = mode === "edit" ? { id: paymentId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(mode === "edit" ? "Payment record updated" : "Settlement recorded successfully");
        router.push("/dashboard/payments");
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'upi': return <Smartphone size={18} />;
      case 'card': return <CreditCard size={18} />;
      case 'bank': return <Building2 size={18} />;
      default: return <Banknote size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d8dee6] border-t-[#f59e0b]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Structure matching Quotations */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <button 
            onClick={() => router.back()}
            className="group mb-2 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#64748b] hover:text-[#263238] transition-colors"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to Payments
          </button>
          <div className="inline-flex items-center gap-2 border border-[#d8dee6] bg-white px-3 py-1 shadow-sm">
            <div className="h-1.5 w-1.5 bg-[#f59e0b]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#263238]">Revenue Node</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263238]">
            {mode === "edit" ? "Adjust Settlement" : "Record Collection"}
          </h1>
          <p className="text-sm font-medium text-[#64748b]/70">
            {mode === "edit" ? "Modify parameters of an existing transaction record." : "Synchronize incoming revenue with the billing cluster."}
          </p>
        </div>
      </div>

      {/* Main Document-Style Form */}
      <div className="overflow-hidden border border-[#d8dee6] bg-white shadow-[0_30px_60px_rgba(5,91,101,0.06)]">
        <div className="bg-[#263238] px-10 py-12 text-white">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/10 shadow-inner ring-1 ring-white/20">
              <Wallet className="text-[#f59e0b]" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Settlement Voucher</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f59e0b]">Financial Collection & Audit Trace</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-12">
          {/* Section 1: Source */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Source Identification</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                <Receipt size={14} className="text-[#f59e0b]" /> Target Billing Node
              </label>
              <select
                required
                value={formData.invoiceId}
                onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] appearance-none"
              >
                <option value="">Select Invoice...</option>
                {invoices.map(i => (
                  <option key={i._id} value={i._id}>{i.invoiceNumber} - {i.customerId?.name} (Balance: ₹{i.balanceAmount})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Financials */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Collection Parameters</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <span className="text-[#f59e0b] font-black">Rs.</span> Collection Valuation
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-2xl font-black text-[#f59e0b] outline-none transition-all focus:border-[#f59e0b]"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <FileText size={14} className="text-[#f59e0b]" /> Audit Note / Log
                </label>
                <input
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                  placeholder="e.g. Transaction Ref #..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                Settlement Channel Selection
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['cash', 'upi', 'card', 'bank'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData({ ...formData, method: m })}
                    className={`flex flex-col items-center gap-4 p-6 rounded-lg border transition-all ${
                      formData.method === m 
                        ? "bg-[#263238] text-white border-[#263238] shadow-xl shadow-[#263238]/20" 
                        : "bg-white text-[#64748b]/60 border-[#d8dee6] hover:border-[#f59e0b] hover:bg-[#f7f4ef]"
                    }`}
                  >
                    <div className={`${formData.method === m ? 'text-[#f59e0b]' : 'text-[#263238]'}`}>
                      {getMethodIcon(m)}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{m}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions Structure matching Quotations */}
          <div className="flex flex-col gap-6 pt-12 md:flex-row md:items-center md:justify-between border-t border-[#d8dee6]">
            <div className="flex items-center gap-4 text-[#64748b]/50 italic">
               <ShieldCheck size={18} />
               <p className="text-[10px] font-bold uppercase tracking-widest">Financial Integrity Protocol Active</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#64748b] hover:text-[#263238] transition-colors"
              >
                Abort Changes
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-3 bg-[#263238] px-10 py-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-2xl shadow-[#263238]/30 transition-all hover:bg-[#64748b] active:scale-95 disabled:opacity-50"
              >
                {saving ? "Deploying..." : mode === "edit" ? "Commit Changes" : "Synchronize Settlement"}
                <Save size={16} className="text-[#f59e0b]" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
