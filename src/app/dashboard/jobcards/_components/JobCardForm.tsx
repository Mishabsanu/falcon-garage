"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, User, Car, Save, ShieldCheck, Zap, History, FileText } from "lucide-react";
import { toast } from "sonner";

interface JobCardFormProps {
  mode: "create" | "edit";
  jobCardId?: string;
}

export default function JobCardForm({ mode, jobCardId }: JobCardFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creationMode, setCreationMode] = useState<"quotation" | "direct">("quotation");
  
  const [quotations, setQuotations] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    quotationId: "",
    customerId: "",
    vehicleId: "",
  });

  useEffect(() => {
    fetchData();
  }, [mode, jobCardId]);

  const fetchData = async () => {
    try {
      const [qRes, cRes, vRes] = await Promise.all([
        fetch("/api/quotations/list"),
        fetch("/api/customers/list"),
        fetch("/api/vehicles/list")
      ]);
      const [qData, cData, vData] = await Promise.all([
        qRes.json(), cRes.json(), vRes.json()
      ]);
      
      if (qData.success) setQuotations(qData.data);
      if (cData.success) setCustomers(cData.data);
      if (vData.success) setVehicles(vData.data);

      if (mode === "edit" && jobCardId) {
        const jRes = await fetch(`/api/jobcards/${jobCardId}`);
        const jData = await jRes.json();
        if (jData.success) {
          setFormData({
            quotationId: jData.data.quotationId?._id || jData.data.quotationId || "",
            customerId: jData.data.customerId?._id || jData.data.customerId || "",
            vehicleId: jData.data.vehicleId?._id || jData.data.vehicleId || "",
          });
          setCreationMode(jData.data.quotationId ? "quotation" : "direct");
        }
      }
    } catch (error) {
      toast.error("Failed to load required nodes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = mode === "edit" 
        ? "/api/jobcards/update" 
        : (creationMode === "quotation" ? "/api/jobcards/from-quotation" : "/api/jobcards/create-direct");
      
      const res = await fetch(endpoint, {
        method: mode === "edit" ? "PATCH" : "POST",
        body: JSON.stringify(mode === "edit" ? { id: jobCardId, ...formData } : formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(mode === "edit" ? "Job Card updated" : "Job Card deployed to the active queue");
        router.push("/dashboard/jobcards");
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
            Back to Queue
          </button>
          <div className="inline-flex items-center gap-2 border border-[#d8dee6] bg-white px-3 py-1 shadow-sm">
            <div className="h-1.5 w-1.5 bg-[#f59e0b]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#263238]">Service Node</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263238]">
            {mode === "edit" ? "Modify Job Card" : "Deploy Job Card"}
          </h1>
          <p className="text-sm font-medium text-[#64748b]/70">
            {mode === "edit" ? "Adjust the parameters of an existing service order." : "Initialize a new service node in the active workshop queue."}
          </p>
        </div>
      </div>

      {/* Main Document-Style Form */}
      <div className="overflow-hidden border border-[#d8dee6] bg-white shadow-[0_30px_60px_rgba(5,91,101,0.06)]">
        <div className="bg-[#263238] px-10 py-12 text-white">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/10 shadow-inner ring-1 ring-white/20">
              <ClipboardList className="text-[#f59e0b]" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Operational Manifest</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f59e0b]">Service Order & Resource Allocation</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-12">
          {mode === "create" && (
            <div className="flex p-1.5 bg-[#f7f4ef] rounded-md border border-[#d8dee6] w-full md:max-w-md mx-auto">
              <button 
                type="button"
                onClick={() => setCreationMode("quotation")}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded transition-all ${creationMode === 'quotation' ? 'bg-[#263238] text-white shadow-lg' : 'text-[#64748b]'}`}
              >
                From Proposal
              </button>
              <button 
                type="button"
                onClick={() => setCreationMode("direct")}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded transition-all ${creationMode === 'direct' ? 'bg-[#f59e0b] text-[#263238] shadow-lg' : 'text-[#64748b]'}`}
              >
                Direct Asset Order
              </button>
            </div>
          )}

          {/* Section 1: Binding */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Node Linkage</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>

            {creationMode === 'quotation' ? (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <FileText size={14} className="text-[#f59e0b]" /> Reference Proposal
                </label>
                <select
                  required
                  value={formData.quotationId}
                  onChange={(e) => setFormData({ ...formData, quotationId: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] appearance-none"
                >
                  <option value="">Select Target Proposal...</option>
                  {quotations.filter(q => q.status === 'draft' || q.status === 'approved').map(q => (
                    <option key={q._id} value={q._id}>{q.quotationNumber} - {q.customerId?.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                    <User size={14} className="text-[#f59e0b]" /> Target Customer
                  </label>
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] appearance-none"
                  >
                    <option value="">Select Customer...</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                    <Car size={14} className="text-[#f59e0b]" /> Asset Reference
                  </label>
                  <select
                    required
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] appearance-none"
                  >
                    <option value="">Select Vehicle...</option>
                    {vehicles.filter(v => (v.customerId?._id || v.customerId) === formData.customerId).map(v => (
                      <option key={v._id} value={v._id}>{v.vehicleNumber} ({v.model})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Details */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Operational Context</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>
            
            <div className="p-8 bg-[#f7f4ef] border border-dashed border-[#d8dee6] rounded-md text-center">
               <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em]">Service nodes are initialized with default parameters.</p>
               <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em] mt-1">Detailed task allocation available after deployment.</p>
            </div>
          </div>

          {/* Footer Actions Structure matching Quotations */}
          <div className="flex flex-col gap-6 pt-12 md:flex-row md:items-center md:justify-between border-t border-[#d8dee6]">
            <div className="flex items-center gap-4 text-[#64748b]/50 italic">
               <ShieldCheck size={18} />
               <p className="text-[10px] font-bold uppercase tracking-widest">Queue Integrity Protocol Active</p>
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
                {saving ? "Deploying..." : mode === "edit" ? "Commit Changes" : "Initialize Order"}
                <Save size={16} className="text-[#f59e0b]" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
