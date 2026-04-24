"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Edit3,
  Hash,
  Layers,
  Search,
  ShoppingCart,
  Truck,
  Filter,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

export default function PurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [receiptData, setReceiptData] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/purchases/list");
      const data = await res.json();
      if (data.success) setPurchases(data.data);
    } catch (error) {
      toast.error("Supply chain sync failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter(po => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        (po.purchaseNumber?.toLowerCase() || "").includes(query) ||
        (po.vendorName?.toLowerCase() || "").includes(query);
      
      const matchesStatus = statusFilter === "all" || po.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [purchases, searchQuery, statusFilter]);

  const openReceiptModal = (po: any) => {
    setSelectedPO(po);
    setReceiptData(
      po.items.map((i: any) => ({
        partId: i.partId?._id || i.partId,
        name: i.name,
        qty: 0,
        max: (i.qty || 0) - (i.receivedQty || 0),
      })),
    );
    setIsReceiptModalOpen(true);
  };

  const handleProcessReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await fetch("/api/purchases/process-receipt", {
        method: "POST",
        body: JSON.stringify({
          id: selectedPO._id,
          receivedItems: receiptData.filter((d) => d.qty > 0),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Inventory synchronized: ${data.status.toUpperCase()}`);
        setIsReceiptModalOpen(false);
        fetchData();
      } else {
        toast.error(data.message || "Sync failure");
      }
    } catch (error) {
      toast.error("Network failure");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner label="Synchronizing Procurement Ledger..." />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Structure matching standardized List Pages */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 border border-[#d8dee6] bg-white px-3 py-1 shadow-sm">
            <div className="h-1.5 w-1.5 bg-[#f59e0b]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#263238]">Supply Chain Node</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263238] uppercase italic">
            Stock <span className="text-[#f59e0b]">Acquisitions</span>
          </h1>
          <p className="text-sm font-medium text-[#64748b]/70">
            Manage corporate procurement lifecycles, vendor settlements, and automated stock fulfillment.
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard/purchases/create")}
          className="group relative flex items-center gap-4 px-8 py-4 bg-[#263238] text-white rounded-md font-black text-[10px] uppercase italic tracking-tighter hover:bg-[#64748b] transition-all shadow-2xl shadow-[#263238]/30 overflow-hidden"
        >
          <ShoppingCart size={16} className="text-[#f59e0b]" />
          <span>Initialize Procurement</span>
          <ArrowUpRight size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* FILTER HUB */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative group col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]/40 group-focus-within:text-[#f59e0b] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search acquisitions by PO Number or Vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-[#d8dee6] bg-white py-4 pl-12 pr-4 text-sm font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] focus:shadow-xl focus:shadow-[#263238]/5"
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]/40 group-focus-within:text-[#f59e0b] transition-colors" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none rounded-md border border-[#d8dee6] bg-white py-4 pl-12 pr-10 text-sm font-bold text-[#263238] outline-none transition-all focus:border-[#f59e0b] focus:shadow-xl focus:shadow-[#263238]/5"
          >
            <option value="all">All Fulfillment Nodes</option>
            <option value="pending">Pending Orders</option>
            <option value="partial">Partial Receipts</option>
            <option value="received">Fully Synchronized</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden border border-[#d8dee6] bg-white shadow-[0_30px_60px_rgba(5,91,101,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#d8dee6]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#64748b]">PO Reference</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#64748b]">Vendor / Source</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#64748b]">Valuation</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#64748b]">Fulfillment Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#64748b] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dee6]/50">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-[#64748b]/30 italic uppercase tracking-widest">No procurement nodes detected</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => (
                  <tr key={po._id} className="hover:bg-[#f8fafc]/50 transition-colors group">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-[#263238] flex items-center justify-center text-[#f59e0b]">
                             <Hash size={14} />
                          </div>
                          <div>
                             <p className="text-sm font-black text-[#263238] uppercase">{po.purchaseNumber}</p>
                             <p className="text-[10px] font-bold text-[#64748b]">{new Date(po.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <Truck size={16} className="text-[#64748b]" />
                          <div>
                             <p className="text-sm font-bold text-[#263238]">{po.vendorName}</p>
                             <p className="text-[10px] font-medium text-[#64748b]">{po.items?.length || 0} Components Registered</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-sm font-black text-[#263238]">QAR {po.totalAmount?.toLocaleString()}</p>
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Calculated Net</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                          po.status === 'received' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                          po.status === 'partial' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                          'bg-slate-50 border-slate-100 text-slate-500'
                       }`}>
                          <div className={`h-1 w-1 rounded-full ${
                             po.status === 'received' ? 'bg-emerald-500' :
                             po.status === 'partial' ? 'bg-amber-500' : 'bg-slate-400'
                          }`}></div>
                          {po.status}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openReceiptModal(po)}
                            className="p-2 hover:bg-[#f59e0b] hover:text-[#263238] text-[#64748b] rounded-md transition-all"
                            title="Acknowledge Receipt"
                          >
                             <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => router.push(`/dashboard/purchases/${po._id}/edit`)}
                            className="p-2 hover:bg-[#263238] hover:text-white text-[#64748b] rounded-md transition-all"
                            title="Edit Manifest"
                          >
                             <Edit3 size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT MODAL */}
      {isReceiptModalOpen && selectedPO && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#263238]/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsReceiptModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-2xl rounded-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="bg-[#263238] p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -mr-32 -mt-32"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2">
                     Acknowledge Inventory
                   </h3>
                   <p className="text-[#f59e0b] text-[10px] font-bold uppercase tracking-[0.3em]">
                     PO Node: {selectedPO.purchaseNumber}
                   </p>
                </div>
                <button onClick={() => setIsReceiptModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                   <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleProcessReceipt} className="p-10 space-y-8">
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {receiptData.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-[#f8fafc] border border-[#d8dee6] rounded-md gap-6"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-black text-[#263238] uppercase tracking-tight">
                        {item.name}
                      </p>
                      <span className="text-[10px] font-bold text-[#64748b]/60 uppercase tracking-widest">
                        Pending: {item.max} UNITS
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.max > 0 ? (
                        <input
                          type="number"
                          min="0"
                          max={item.max}
                          value={item.qty}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                            const nd = [...receiptData];
                            nd[index].qty = Math.min(item.max, val);
                            setReceiptData(nd);
                          }}
                          className="w-28 px-2 py-2 bg-white text-center text-xl font-black text-[#263238] outline-none rounded-md border border-[#d8dee6] focus:border-[#f59e0b] transition-all"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <CheckCircle2 size={18} />
                          <span className="text-[10px] font-black uppercase">Fulfilled</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 flex gap-4 border-t border-[#d8dee6]">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="flex-1 px-8 py-4 border border-[#d8dee6] text-[#263238] rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-[#f8fafc] transition-all"
                >
                  Abort Transaction
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-8 py-4 bg-[#263238] text-white rounded-md font-black text-[10px] uppercase italic tracking-tighter hover:bg-[#64748b] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {processing ? "Deploying..." : "Confirm Sync"}
                  <ArrowRight size={16} className="text-[#f59e0b]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
