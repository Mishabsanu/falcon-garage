"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Save, ShieldCheck, Database, Globe, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface VendorFormProps {
  mode: "create" | "edit";
  vendorId?: string;
}

export default function VendorForm({ mode, vendorId }: VendorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    gstNumber: ""
  });

  useEffect(() => {
    if (mode === "edit" && vendorId) {
      fetchVendor();
    }
  }, [mode, vendorId]);

  const fetchVendor = async () => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}`);
      const data = await res.json();
      if (data.success) {
        setFormData({
          name: data.data.name || "",
          contactPerson: data.data.contactPerson || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
          address: data.data.address || "",
          category: data.data.category || "",
          gstNumber: data.data.gstNumber || ""
        });
      }
    } catch (error) {
      toast.error("Failed to load vendor data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = mode === "edit" ? `/api/vendors` : "/api/vendors/create";
      const method = mode === "edit" ? "PATCH" : "POST";
      const body = mode === "edit" ? { id: vendorId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(mode === "edit" ? "Vendor profile updated" : "New vendor registered successfully");
        router.push("/dashboard/vendors");
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
            Back to Vendors
          </button>
          <div className="inline-flex items-center gap-2 border border-[#d8dee6] bg-white px-3 py-1 shadow-sm">
            <div className="h-1.5 w-1.5 bg-[#f59e0b]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#263238]">Procurement Node</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263238]">
            {mode === "edit" ? "Edit Vendor Profile" : "Register New Vendor"}
          </h1>
          <p className="text-sm font-medium text-[#64748b]/70">
            {mode === "edit" ? "Modify existing supplier parameters and contact nodes." : "Onboard a new supplier to the procurement ecosystem."}
          </p>
        </div>
      </div>

      {/* Main Document-Style Form */}
      <div className="overflow-hidden border border-[#d8dee6] bg-white shadow-[0_30px_60px_rgba(5,91,101,0.06)]">
        <div className="bg-[#263238] px-10 py-12 text-white">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/10 shadow-inner ring-1 ring-white/20">
              <Building2 className="text-[#f59e0b]" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Vendor Manifest</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f59e0b]">Supplier Registration & Compliance</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-12">
          {/* Section 1: Business Profile */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Business Identity</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                <Building2 size={14} className="text-[#f59e0b]" /> Registered Company Name
              </label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                placeholder="e.g. Apex Auto Components Ltd."
              />
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <Database size={14} className="text-[#f59e0b]" /> Supplier Category
                </label>
                <input
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                  placeholder="e.g. Spare Parts / Lubricants"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <CreditCard size={14} className="text-[#f59e0b]" /> Tax ID / GST Number
                </label>
                <input
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20 font-mono"
                  placeholder="GSTIN/1234567890"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Matrix */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Contact Matrix</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <User size={14} className="text-[#f59e0b]" /> Primary Representative
                </label>
                <input
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                  placeholder="Person name"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <Phone size={14} className="text-[#f59e0b]" /> Contact Number
                </label>
                <input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <Mail size={14} className="text-[#f59e0b]" /> Official Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                  placeholder="contact@vendor.com"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <MapPin size={14} className="text-[#f59e0b]" /> Operational Headquarters
                </label>
                <input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                  placeholder="Full business address"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions Structure matching Quotations */}
          <div className="flex flex-col gap-6 pt-12 md:flex-row md:items-center md:justify-between border-t border-[#d8dee6]">
            <div className="flex items-center gap-4 text-[#64748b]/50 italic">
               <ShieldCheck size={18} />
               <p className="text-[10px] font-bold uppercase tracking-widest">Vendor Integrity Protocol Active</p>
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
                {saving ? "Deploying..." : mode === "edit" ? "Commit Changes" : "Register Vendor"}
                <Save size={16} className="text-[#f59e0b]" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
