"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, DollarSign, Calendar, Save, ShieldCheck, Briefcase, CreditCard, Banknote, History } from "lucide-react";
import { toast } from "sonner";

interface SalaryFormProps {
  mode: "create" | "edit";
  salaryId?: string;
}

export default function SalaryForm({ mode, salaryId }: SalaryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    staffId: "",
    amount: 0,
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    type: "salary", // salary, advance, bonus
    paymentMethod: "cash",
    note: ""
  });

  useEffect(() => {
    fetchData();
  }, [mode, salaryId]);

  const fetchData = async () => {
    try {
      const sRes = await fetch("/api/users");
      const sData = await sRes.json();
      if (sData.success) setStaff(sData.data);

      if (mode === "edit" && salaryId) {
        const res = await fetch(`/api/salaries/${salaryId}`);
        const data = await res.json();
        if (data.success) {
          setFormData({
            staffId: data.data.staffId?._id || data.data.staffId || "",
            amount: data.data.amount || 0,
            month: data.data.month || new Date().toISOString().slice(0, 7),
            type: data.data.type || "salary",
            paymentMethod: data.data.paymentMethod || "cash",
            note: data.data.note || ""
          });
        }
      }
    } catch (error) {
      toast.error("Failed to load data nodes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = "/api/salaries";
      const method = mode === "edit" ? "PATCH" : "POST";
      const body = mode === "edit" ? { id: salaryId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(mode === "edit" ? "Payroll record updated" : "Payroll dispersed successfully");
        router.push("/dashboard/salaries");
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
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
            Back to Payroll
          </button>
          <div className="inline-flex items-center gap-2 border border-[#d8dee6] bg-white px-3 py-1 shadow-sm">
            <div className="h-1.5 w-1.5 bg-[#f59e0b]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#263238]">Finance Node</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263238]">
            {mode === "edit" ? "Adjust Payroll Entry" : "Disperse Compensation"}
          </h1>
          <p className="text-sm font-medium text-[#64748b]/70">
            {mode === "edit" ? "Modify existing payroll transaction and allocation parameters." : "Initialize a new compensation dispersal for the current cycle."}
          </p>
        </div>
      </div>

      {/* Main Document-Style Form */}
      <div className="overflow-hidden border border-[#d8dee6] bg-white shadow-[0_30px_60px_rgba(5,91,101,0.06)]">
        <div className="bg-[#263238] px-10 py-12 text-white">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/10 shadow-inner ring-1 ring-white/20">
              <DollarSign className="text-[#f59e0b]" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Compensation Voucher</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f59e0b]">Workforce Disbursement & Audit Trace</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-12">
          {/* Section 1: Personnel */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Personnel Allocation</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <User size={14} className="text-[#f59e0b]" /> Target Employee Node
                </label>
                <select
                  required
                  value={formData.staffId}
                  onChange={(e) => {
                    const sId = e.target.value;
                    const selected = staff.find(s => s._id === sId);
                    setFormData({ 
                      ...formData, 
                      staffId: sId,
                      amount: selected ? (selected.baseSalary || 0) - (selected.totalAdvances || 0) : 0
                    });
                  }}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] appearance-none"
                >
                  <option value="">Select Personnel...</option>
                  {staff.map(s => <option key={s._id} value={s._id}>{s.name} ({s.role})</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <Calendar size={14} className="text-[#f59e0b]" /> Billing Cycle (Month)
                </label>
                <input
                  type="month"
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Compensation Details */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Valuation Parameters</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <Briefcase size={14} className="text-[#f59e0b]" /> Dispersal Type
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] appearance-none"
                >
                  <option value="salary">Standard Salary</option>
                  <option value="advance">Capital Advance</option>
                  <option value="bonus">Performance Bonus</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <span className="text-[#f59e0b] font-black">Rs.</span> Dispersal Valuation
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
                  <CreditCard size={14} className="text-[#f59e0b]" /> Transfer Channel
                </label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] appearance-none"
                >
                  <option value="cash">Liquid Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="upi">UPI Protocol</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                <History size={14} className="text-[#f59e0b]" /> Audit Remark
              </label>
              <input
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                placeholder="e.g. Full settlement for March cycle"
              />
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
                {saving ? "Deploying..." : mode === "edit" ? "Commit Changes" : "Initialize Dispersal"}
                <Save size={16} className="text-[#f59e0b]" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
