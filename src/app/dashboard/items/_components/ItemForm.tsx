"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Box, Tag, Layers, Save, ShieldCheck, Database, Boxes } from "lucide-react";
import { toast } from "sonner";

interface ItemFormProps {
  mode: "create" | "edit";
  itemId?: string;
}

export default function ItemForm({ mode, itemId }: ItemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: 0,
    category: "",
    minStock: 5
  });

  useEffect(() => {
    if (mode === "edit" && itemId) {
      fetchItem();
    }
  }, [mode, itemId]);

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/parts/${itemId}`); // I'll assume this exists or create it
      const data = await res.json();
      if (data.success) {
        setFormData({
          name: data.data.name || "",
          sku: data.data.sku || "",
          price: data.data.price || 0,
          category: data.data.category || "",
          minStock: data.data.minStock || 5
        });
      }
    } catch (error) {
      toast.error("Failed to load component data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = mode === "edit" ? `/api/parts` : "/api/parts/create";
      const method = mode === "edit" ? "PATCH" : "POST";
      const body = mode === "edit" ? { id: itemId, ...formData } : { ...formData, stock: 0 };

      const res = await fetch(url, {
        method,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(mode === "edit" ? "Component SKU updated" : "New SKU synchronized with master database");
        router.push("/dashboard/items");
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
            Back to Registry
          </button>
          <div className="inline-flex items-center gap-2 border border-[#d8dee6] bg-white px-3 py-1 shadow-sm">
            <div className="h-1.5 w-1.5 bg-[#f59e0b]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#263238]">Master Data Node</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263238]">
            {mode === "edit" ? "Modify SKU Master" : "Define Component"}
          </h1>
          <p className="text-sm font-medium text-[#64748b]/70">
            {mode === "edit" ? "Update master catalog parameters for this component." : "Initialize a new component record in the system inventory."}
          </p>
        </div>
      </div>

      {/* Main Document-Style Form */}
      <div className="overflow-hidden border border-[#d8dee6] bg-white shadow-[0_30px_60px_rgba(5,91,101,0.04)]">
        <div className="bg-[#263238] px-10 py-12 text-white">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/10 shadow-inner ring-1 ring-white/20">
              <Box className="text-[#f59e0b]" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Component Specification</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f59e0b]">Stock Keeping Unit & Pricing</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-12">
          {/* Section 1: Item Identity */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Core Identification</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                <Database size={14} className="text-[#f59e0b]" /> Component Name
              </label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                placeholder="e.g. Synthetic Engine Oil 5W30"
              />
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <Tag size={14} className="text-[#f59e0b]" /> SKU Identifier
                </label>
                <input
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20 font-mono"
                  placeholder="e.g. OIL-001"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <Layers size={14} className="text-[#f59e0b]" /> Category
                </label>
                <input
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-lg font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] placeholder:text-[#64748b]/20"
                  placeholder="e.g. Consumables"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Economics */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Commercial Parameters</span>
               <div className="h-px flex-1 bg-[#d8dee6]"></div>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#263238]">
                  <span className="text-[#f59e0b] font-black">Rs.</span> Default Unit Price
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full border-b-2 border-[#d8dee6] bg-transparent py-3 text-xl font-black text-[#263238] outline-none transition-all focus:border-[#f59e0b]"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500">
                  <Boxes size={14} className="text-rose-500" /> Low Stock Warning Level
                </label>
                <input
                  type="number"
                  required
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                  className="w-full border-b-2 border-rose-100 bg-transparent py-3 text-xl font-black text-rose-500 outline-none transition-all focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions Structure matching Quotations */}
          <div className="flex flex-col gap-6 pt-12 md:flex-row md:items-center md:justify-between border-t border-[#d8dee6]">
            <div className="flex items-center gap-4 text-[#64748b]/50 italic">
               <ShieldCheck size={18} />
               <p className="text-[10px] font-bold uppercase tracking-widest">Global SKU Protocol Active</p>
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
                {saving ? "Synchronizing..." : mode === "edit" ? "Commit Changes" : "Deploy SKU"}
                <Save size={16} className="text-[#f59e0b]" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
