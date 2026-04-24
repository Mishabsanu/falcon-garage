"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, Mail, MapPin, ShieldCheck, CreditCard, Save } from "lucide-react";
import { toast } from "sonner";

interface CustomerFormProps {
  mode: "create" | "edit";
  customerId?: string;
}

export default function CustomerForm({ mode, customerId }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    customerType: "cash"
  });

  useEffect(() => {
    if (mode === "edit" && customerId) {
      fetchCustomer();
    }
  }, [mode, customerId]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      const data = await res.json();
      if (data.success) {
        setFormData({
          name: data.data.name || "",
          phone: data.data.phone || "",
          email: data.data.email || "",
          address: data.data.address || "",
          customerType: data.data.customerType || "cash"
        });
      }
    } catch (error) {
      toast.error("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = mode === "edit" ? `/api/customers` : "/api/customers";
      const method = mode === "edit" ? "PATCH" : "POST";
      const body = mode === "edit" ? { id: customerId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(mode === "edit" ? "Customer record updated" : "New customer enrolled successfully");
        router.push("/dashboard/customers");
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
            Back to Directory
          </button>
          <div className="inline-flex items-center gap-2 border border-[#d8dee6] bg-white px-3 py-1 shadow-sm">
            <div className="h-1.5 w-1.5 bg-[#f59e0b]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#263238]">Profile Node</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263238]">
            {mode === "edit" ? "Modify Identity" : "Enroll Personnel"}
          </h1>
          <p className="text-sm font-medium text-[#64748b]/70">
            {mode === "edit" ? "Update existing customer credentials and preferences." : "Initialize a new customer entry in the master database."}
          </p>
        </div>
      </div>

      {/* Main Document-Style Form */}
      <div className="overflow-hidden border border-[#d8dee6] bg-white shadow-[0_30px_60px_rgba(5,91,101,0.06)]">
        <div className="bg-[#263238] px-10 py-12 text-white">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/10 shadow-inner ring-1 ring-white/20">
              <User className="text-[#f59e0b]" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Identity Manifest</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f59e0b]">Customer Classification & Linkages</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-12">
          {/* Section 1: Basic Credentials */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Core Identification</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <User size={14} className="text-[#f59e0b]" /> Full Name
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                  placeholder="e.g. Johnathan Miller"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <Phone size={14} className="text-[#f59e0b]" /> Primary Contact
                </label>
                <input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                  placeholder="e.g. +971 50 XXX XXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <Mail size={14} className="text-[#f59e0b]" /> Electronic Mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                  placeholder="e.g. contact@domain.sys"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <CreditCard size={14} className="text-[#f59e0b]" /> Settlement Type
                </label>
                <div className="flex items-center gap-6 py-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="customerType"
                      value="cash"
                      checked={formData.customerType === "cash"}
                      onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                      className="h-4 w-4 accent-[#f59e0b]"
                    />
                    <span className="text-xs font-black uppercase tracking-widest text-[#263238]">Cash Only</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="customerType"
                      value="credit"
                      checked={formData.customerType === "credit"}
                      onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                      className="h-4 w-4 accent-[#263238]"
                    />
                    <span className="text-xs font-black uppercase tracking-widest text-[#263238]">Credit Facility</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Geospatial Mapping */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Geospatial Routing</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                <MapPin size={14} className="text-[#f59e0b]" /> Operational Address
              </label>
              <textarea
                required
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20 resize-none"
                placeholder="Unit / Street / Industrial Area / City"
              />
            </div>
          </div>

          {/* Footer Actions Structure matching Quotations */}
          <div className="flex flex-col gap-6 pt-12 md:flex-row md:items-center md:justify-between border-t border-[#d8dee6]">
            <div className="flex items-center gap-4 text-[#64748b]/50 italic">
               <ShieldCheck size={18} />
               <p className="text-[10px] font-bold uppercase tracking-widest">Master Data Security Protocol Active</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#64748b] hover:text-[#263238] transition-colors"
              >
                Cancel Changes
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-3 bg-[#263238] px-10 py-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-2xl shadow-[#263238]/30 transition-all hover:bg-[#64748b] active:scale-95 disabled:opacity-50"
              >
                {saving ? "Deploying..." : mode === "edit" ? "Commit Changes" : "Deploy Profile"}
                <Save size={16} className="text-[#f59e0b]" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
