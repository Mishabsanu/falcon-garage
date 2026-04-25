"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Package, 
  Truck, 
  ArrowLeft,
  ChevronDown,
  Activity,
  Zap,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface PurchaseFormProps {
  purchaseId?: string;
}

export default function PurchaseForm({ purchaseId }: PurchaseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [parts, setParts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    vendorName: "",
    items: [{ partId: "", qty: 1, costPrice: 0 }],
  });

  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    try {
      const [sRes, vRes] = await Promise.all([
        fetch("/api/stock/list"),
        fetch("/api/vendors/list"),
      ]);
      const [sData, vData] = await Promise.all([
        sRes.json(),
        vRes.json(),
      ]);

      if (sData.success) setParts(sData.data);
      if (vData.success) setVendors(vData.data);

      if (purchaseId) {
        const pRes = await fetch(`/api/purchases/${purchaseId}`);
        const pData = await pRes.json();
        if (pData.success) {
          setFormData({
            vendorName: pData.data.vendorName,
            items: pData.data.items.map((i: any) => ({
              partId: i.partId?._id || i.partId,
              qty: i.qty,
              costPrice: i.costPrice
            }))
          });
        }
      }
    } catch (error) {
      toast.error("Telemetry sync failure");
    } finally {
      setFetchingData(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { partId: "", qty: 1, costPrice: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-suggest cost price if part is selected
    if (field === "partId") {
      const part = parts.find(p => p._id === value);
      if (part) {
        newItems[index].costPrice = part.costPrice || 0;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorName) return toast.error("Vendor node required");
    if (formData.items.some(i => !i.partId || i.qty <= 0)) return toast.error("Validate item parameters");

    setLoading(true);
    try {
      const processedItems = formData.items.map((item) => ({
        ...item,
        name: parts.find((p) => p._id === item.partId)?.name || "Unknown",
        total: item.qty * item.costPrice,
        receivedQty: 0,
      }));

      const url = purchaseId ? `/api/purchases/${purchaseId}` : "/api/purchases";
      const method = purchaseId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: JSON.stringify({ ...formData, items: processedItems }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(purchaseId ? "Procurement node updated" : "Purchase order initialized");
        router.push("/dashboard/purchases");
      }
    } catch (error) {
      toast.error("Operation failure");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) return <LoadingSpinner label="Calibrating Supply Chain..." />;

  const totalCost = formData.items.reduce((sum, item) => sum + (item.qty * item.costPrice), 0);

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#64748b] hover:text-[#263238] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Ledger
          </button>
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 bg-[#263238] rounded-xl flex items-center justify-center text-amber-500 shadow-xl shadow-[#263238]/20">
                <ShoppingCart size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-[#263238] uppercase italic tracking-tighter">
                  {purchaseId ? "Modify" : "Initialize"} <span className="text-amber-500">Procurement</span>
                </h1>
                <p className="text-[10px] font-bold text-[#64748b]/60 uppercase tracking-[0.2em] mt-1">
                  Secure Stock Acquisition Interface v2.4
                </p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button
             onClick={() => router.push("/dashboard/purchases")}
             className="px-6 py-3 border border-[#d8dee6] text-[#263238] rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-[#f7f4ef] transition-all"
           >
             Abort
           </button>
           <button
             onClick={handleSubmit}
             disabled={loading}
             className="flex items-center gap-3 px-8 py-3 bg-[#263238] text-white rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-[#64748b] transition-all shadow-xl shadow-[#263238]/30"
           >
             {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save size={16} className="text-amber-500" />}
             <span>Deploy Order</span>
           </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN: VENDOR & META */}
        <div className="space-y-8">
           <div className="bg-white border border-[#d8dee6] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#263238] px-6 py-4 flex items-center gap-3">
                 <Truck size={16} className="text-amber-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Vendor Selection</span>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#64748b]">Select Supplier</label>
                    <div className="relative">
                       <select
                         value={formData.vendorName}
                         onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                         className="w-full bg-[#f7f4ef] border border-[#d8dee6] rounded-md px-4 py-3.5 text-xs font-bold text-[#263238] focus:outline-none focus:border-amber-500/50 appearance-none transition-all"
                       >
                         <option value="">Select Vendor Node...</option>
                         {vendors.map(v => (
                           <option key={v._id} value={v.name}>{v.name}</option>
                         ))}
                       </select>
                       <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b]/40 pointer-events-none" />
                    </div>
                 </div>

                 <div className="pt-6 border-t border-[#d8dee6]/50">
                    <div className="flex items-center gap-3 text-amber-600 bg-amber-50 rounded-lg p-4 border border-amber-100">
                       <Zap size={18} className="fill-amber-600" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-tight leading-none">Automated Stock Sync</span>
                          <span className="text-[9px] font-medium text-amber-700/60 mt-1">Inventory will update upon receipt confirmation.</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-[#f7f4ef]/50 border border-dashed border-[#d8dee6] rounded-xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#64748b]">Procurement Summary</span>
                 <Activity size={14} className="text-amber-500" />
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-[#64748b]/60 uppercase">Line Items</span>
                    <span className="text-xl font-black text-[#263238] italic">{formData.items.length} <span className="text-[10px] uppercase not-italic text-[#64748b]">Units</span></span>
                 </div>
                 <div className="h-px bg-[#d8dee6]"></div>
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-[#64748b]/60 uppercase">Estimated Total</span>
                    <span className="text-3xl font-black text-amber-500 italic">QAR {totalCost.toLocaleString()}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: ITEMS */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border border-[#d8dee6] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#263238] px-6 py-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Package size={16} className="text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Supply Inventory Registry</span>
                 </div>
                 <button 
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-[#263238] rounded-md font-black text-[9px] uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                 >
                    <Plus size={12} /> Add Component Node
                 </button>
              </div>

              <div className="p-0">
                 <table className="w-full border-collapse">
                    <thead className="bg-[#f7f4ef] border-b border-[#d8dee6]">
                       <tr>
                          <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-[#64748b]">Node Index</th>
                          <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-[#64748b]">Component Parameter</th>
                          <th className="px-8 py-4 text-center text-[9px] font-black uppercase tracking-[0.2em] text-[#64748b]">Quantity</th>
                          <th className="px-8 py-4 text-right text-[9px] font-black uppercase tracking-[0.2em] text-[#64748b]">Unit Cost (QAR)</th>
                          <th className="px-8 py-4 text-right text-[9px] font-black uppercase tracking-[0.2em] text-[#64748b]">Subtotal</th>
                          <th className="px-8 py-4 text-center text-[9px] font-black uppercase tracking-[0.2em] text-[#64748b]"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d8dee6]/50">
                       {formData.items.map((item, index) => (
                         <tr key={index} className="group/row hover:bg-[#f7f4ef]/30 transition-colors">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <Hash size={12} className="text-amber-500/40" />
                                  <span className="text-[10px] font-black text-[#263238]">{String(index + 1).padStart(2, '0')}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="relative min-w-[200px]">
                                  <select
                                    value={item.partId}
                                    onChange={(e) => handleItemChange(index, "partId", e.target.value)}
                                    className="w-full bg-[#fcfcfc] border border-[#d8dee6] rounded-md px-4 py-3 text-[11px] font-bold text-[#263238] focus:outline-none focus:border-amber-500/50 appearance-none"
                                  >
                                    <option value="">Select Component...</option>
                                    {parts.map(p => (
                                      <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                  </select>
                                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]/40 pointer-events-none" />
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <input
                                 type="number"
                                 value={item.qty}
                                 onChange={(e) => handleItemChange(index, "qty", parseFloat(e.target.value))}
                                 className="w-24 bg-[#fcfcfc] border border-[#d8dee6] rounded-md px-4 py-3 text-[11px] font-black text-center text-[#263238] focus:outline-none focus:border-amber-500/50"
                               />
                            </td>
                            <td className="px-8 py-6 text-right">
                               <input
                                 type="number"
                                 value={item.costPrice}
                                 onChange={(e) => handleItemChange(index, "costPrice", parseFloat(e.target.value))}
                                 className="w-32 bg-[#fcfcfc] border border-[#d8dee6] rounded-md px-4 py-3 text-[11px] font-black text-right text-[#263238] focus:outline-none focus:border-amber-500/50"
                               />
                            </td>
                            <td className="px-8 py-6 text-right">
                               <span className="text-[11px] font-black text-[#263238] italic">
                                  {(item.qty * item.costPrice).toLocaleString()}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-center">
                               <button 
                                 type="button"
                                 onClick={() => handleRemoveItem(index)}
                                 className="p-2.5 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                               >
                                  <Trash2 size={16} />
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>

                 <div className="p-8 bg-[#f7f4ef]/30 border-t border-[#d8dee6]">
                    <div className="flex justify-end items-center gap-12">
                       <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#64748b] mb-1">Tax Calculation (0%)</p>
                          <p className="text-xs font-bold text-[#263238]">QAR 0.00</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500 mb-1 italic">Total Commitment</p>
                          <p className="text-2xl font-black text-[#263238] italic leading-none">QAR {totalCost.toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}
