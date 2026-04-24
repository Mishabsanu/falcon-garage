"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserCheck, Mail, Shield, Save, ShieldCheck, Key, Users, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface StaffFormProps {
  userId?: string;
  mode: "create" | "edit";
}

export default function StaffForm({ userId, mode }: StaffFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "SERVICE_ADVISOR",
    baseSalary: 0,
  });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (mode === "edit" && userId) {
      fetch(`/api/users/${userId}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setData(result.data);
            setFormData({
              name: result.data.name || "",
              email: result.data.email || "",
              password: "", // Never populate password
              role: result.data.role || "SERVICE_ADVISOR",
              baseSalary: result.data.baseSalary || 0,
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [mode, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = mode === "edit" ? `/api/users/${userId}` : "/api/users";
      const method = mode === "edit" ? "PATCH" : "POST";
      
      const payload = { ...formData };
      if (mode === "edit" && !payload.password) {
        delete (payload as any).password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(`Staff record ${mode === "create" ? "created" : "updated"} successfully`);
      router.push("/dashboard/staff");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save staff record");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Retrieving Personnel Telemetry..." />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Structure matching Inventory/Quotations */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <button 
            onClick={() => router.back()}
            className="group mb-2 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#64748b] hover:text-[#263238] transition-colors"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to Registry
          </button>
          <div className="inline-flex items-center gap-2 border border-[#d8dee6] bg-white px-3 py-1 shadow-sm">
            <div className="h-1.5 w-1.5 bg-[#f59e0b]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#263238]">Workforce Authorization</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263238] uppercase italic">
            {mode === "edit" ? "Adjust Access" : "Deploy Personnel"}
          </h1>
          <p className="text-sm font-medium text-[#64748b]/70">
            {mode === "edit" ? "Modify authentication credentials and system authorization levels." : "Onboard a new member into the workshop ecosystem."}
          </p>
        </div>
      </div>

      {/* Main Document-Style Form */}
      <div className="overflow-hidden border border-[#d8dee6] bg-white shadow-[0_30px_60px_rgba(5,91,101,0.04)]">
        <div className="bg-[#263238] px-10 py-12 text-white relative overflow-hidden">
           <div className="absolute right-0 bottom-0 opacity-10">
              <Users size={200} className="translate-x-20 translate-y-20" />
           </div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/10 shadow-inner ring-1 ring-white/20">
              <UserCheck className="text-[#f59e0b]" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Personnel Manifest</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f59e0b]">Authentication & Identity Binding</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-16">
          {/* Section 1: Identity Binding */}
          <div className="space-y-12">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Credential Mapping</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <UserCheck size={14} className="text-[#f59e0b]" /> Full Name
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-4 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <Mail size={14} className="text-[#f59e0b]" /> Email Address (Login ID)
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-4 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                  placeholder="john@falcongarage.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <Key size={14} className="text-[#f59e0b]" /> {mode === "edit" ? "Reset Password (Optional)" : "Security Secret"}
                </label>
                <div className="relative group/pass">
                   <input
                     required={mode === "create"}
                     type={showPassword ? "text" : "password"}
                     value={formData.password}
                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                     className="w-full border-b-2 border-[#d8dee6] bg-transparent py-4 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20 pr-12"
                     placeholder={mode === "edit" ? "Leave blank to keep current" : "••••••••"}
                   />
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#64748b] hover:text-[#263238] transition-colors"
                   >
                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <Shield size={14} className="text-[#f59e0b]" /> Authorization Level
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full appearance-none border-b-2 border-[#d8dee6] bg-transparent py-4 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] cursor-pointer"
                  >
                    <option value="ADMIN">System Administrator</option>
                    <option value="SERVICE_ADVISOR">Service Advisor</option>
                    <option value="TECHNICIAN">Mechanic / Technician</option>
                    <option value="STORE_MANAGER">Store & Inventory Manager</option>
                    <option value="ACCOUNTANT">Accountant / Finance</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
 
          {/* Section 2: Payroll Parameters */}
          <div className="space-y-12">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Payroll Parameters</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>
 
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <span className="text-[#f59e0b] font-black">QAR</span> Base Salary (Monthly)
                </label>
                <input
                  type="number"
                  required
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-4 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b]"
                />
              </div>
 
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <ShieldCheck size={14} className="text-[#f59e0b]" /> Financial Protocol
                </label>
                <div className="py-4 text-sm font-medium text-[#64748b] italic">
                   Net payout will be calculated after adjusting verified advances.
                </div>
              </div>
            </div>
          </div>
 
          {/* Section 3: Advance Reconciliation (Edit Mode Only) */}
          {mode === "edit" && (
            <div className="space-y-12">
              <div className="flex items-center gap-4">
                 <div className="h-px flex-1 bg-[#d8dee6]"></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Advance Reconciliation</span>
                 <div className="h-px flex-1 bg-[#d8dee6]"></div>
              </div>

              <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                <div className="p-8 rounded-xl bg-rose-50 border border-rose-100 space-y-2">
                   <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Aggregate Advances</p>
                   <p className="text-3xl font-black text-rose-500 tracking-tighter italic">QAR {data?.totalAdvances?.toLocaleString() || '0'}</p>
                </div>

                <div className="md:col-span-2 space-y-6">
                   <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-[#263238] uppercase tracking-widest">Issue New Advance</h4>
                      <p className="text-[9px] font-bold text-[#64748b] italic">This will be adjusted in next payout cycle.</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="relative flex-1">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#64748b]">QAR</span>
                         <input 
                           id="advance-amount"
                           type="number"
                           placeholder="Amount"
                           className="w-full pl-12 pr-4 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-md font-black text-lg outline-none focus:border-rose-500 transition-all"
                         />
                      </div>
                      <button 
                        type="button"
                        onClick={async () => {
                           const amt = (document.getElementById('advance-amount') as HTMLInputElement).value;
                           if (!amt) return toast.error("Specify advance valuation");
                           try {
                              const res = await fetch('/api/staff/advances/create', {
                                 method: 'POST',
                                 body: JSON.stringify({
                                    staffId: userId,
                                    amount: Number(amt),
                                    reason: "Manual Advance Deployment",
                                    method: "cash"
                                 })
                              });
                              const result = await res.json();
                              if (result.success) {
                                 toast.success("Advance Protocol Finalized");
                                 (document.getElementById('advance-amount') as HTMLInputElement).value = '';
                                 router.refresh();
                                 // Refresh local data
                                 fetch(`/api/users/${userId}`).then(r => r.json()).then(d => {
                                    if (d.success) setData(d.data);
                                 });
                              }
                           } catch (e) {
                              toast.error("Advance sync failure");
                           }
                        }}
                        className="px-10 bg-rose-500 text-white rounded-md font-black text-[10px] uppercase italic tracking-widest hover:bg-rose-600 transition-all"
                      >
                         Deploy Advance
                      </button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions Structure matching Inventory */}
          <div className="flex flex-col gap-6 pt-12 md:flex-row md:items-center md:justify-between border-t border-[#d8dee6]">
            <div className="flex items-center gap-4 text-[#64748b]/50 italic">
               <ShieldCheck size={18} />
               <p className="text-[10px] font-bold uppercase tracking-widest">Authorization Integrity Active</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#64748b] hover:text-[#263238] transition-colors"
              >
                Abort Deployment
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-3 bg-[#263238] px-12 py-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-2xl shadow-[#263238]/30 transition-all hover:bg-[#64748b] active:scale-95 disabled:opacity-50"
              >
                {saving ? "Deploying..." : mode === "edit" ? "Commit Changes" : "Grant Access"}
                <Save size={16} className="text-[#f59e0b]" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
