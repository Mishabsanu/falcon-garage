"use client";

import ListPagination from "@/components/ui/ListPagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import usePaginatedData from "@/hooks/usePaginatedData";
import {
   ArrowRight,
   ArrowUpRight,
   Calendar,
   CheckCircle2,
   Clock,
   Edit3,
   Filter,
   Hash,
   Layers,
   Package,
   Search,
   ShoppingCart,
   Truck,
   Users,
   X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
   const [poHistory, setPoHistory] = useState<any[]>([]);
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

   const { page, pageCount, pageSize, paginatedItems, setPage } = usePaginatedData(filteredPurchases);

   const openReceiptModal = async (po: any) => {
      setSelectedPO(po);
      setPoHistory([]);

      // Fetch transaction history for this PO
      try {
         const res = await fetch(`/api/stock/history?referenceId=${po.purchaseNumber}`);
         const data = await res.json();
         if (data.success) setPoHistory(data.data);
      } catch (error) {
         console.error("Failed to fetch PO history", error);
      }

      setReceiptData(
         po.items.map((i: any) => ({
            partId: i.partId?._id || i.partId,
            name: i.name,
            qty: 0,
            totalOrdered: i.qty,
            alreadyReceived: i.receivedQty || 0,
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
                        paginatedItems.map((po) => (
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
                                 <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${po.status === 'received' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                       po.status === 'partial' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                          'bg-slate-50 border-slate-100 text-slate-500'
                                    }`}>
                                    <div className={`h-1 w-1 rounded-full ${po.status === 'received' ? 'bg-emerald-500' :
                                          po.status === 'partial' ? 'bg-amber-500' : 'bg-slate-400'
                                       }`}></div>
                                    {po.status}
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex items-center justify-end gap-2 transition-opacity">
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
            <ListPagination
               page={page}
               pageCount={pageCount}
               pageSize={pageSize}
               total={filteredPurchases.length}
               onPageChange={setPage}
            />
         </div>

         {/* RECEIPT MODAL - Stock Synchronization Protocol v4.0 */}
         {isReceiptModalOpen && selectedPO && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-2">
               <div
                  className="absolute inset-0 bg-[#263238]/80 backdrop-blur-md animate-in fade-in duration-300"
                  onClick={() => setIsReceiptModalOpen(false)}
               ></div>
               <div className="bg-white w-[98vw] h-[96vh] rounded-xl shadow-[0_80px_150px_-20px_rgba(0,0,0,0.3)] relative z-10 overflow-hidden animate-in slide-in-from-bottom-12 duration-700 border border-white/10 flex flex-col">

                  {/* TOP COMMAND BAR */}
                  <div className="bg-white border-b border-[#d8dee6] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                     <div className="flex items-center gap-5">
                        <div className="p-3 bg-[#263238] rounded-xl text-[#f59e0b] shadow-2xl shadow-[#263238]/20 flex-shrink-0">
                           <ShoppingCart size={28} />
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <div className="w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse"></div>
                              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#64748b]">Synchronization Protocol v4.0</span>
                           </div>
                           <h3 className="text-3xl font-black italic uppercase tracking-tighter text-[#263238] leading-none">
                              Reference: <span className="text-[#f59e0b]">{selectedPO.purchaseNumber}</span>
                           </h3>
                           <p className="text-[9px] font-bold text-[#64748b]/60 uppercase tracking-widest mt-2 flex items-center gap-2">
                              <Users size={11} className="text-[#f59e0b]" /> Vendor: {selectedPO.vendorName} <span className="mx-2 text-[#d8dee6]">|</span>
                              <Calendar size={11} className="text-[#f59e0b]" /> Session: {new Date().toLocaleDateString()}
                           </p>
                        </div>
                     </div>

                     {/* HEADER SUMMARY METRICS */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="px-5 py-3 bg-[#f8fafc] border border-[#d8dee6] rounded-xl">
                           <p className="text-[8px] font-black text-[#64748b] uppercase tracking-widest mb-0.5">Lines</p>
                           <p className="text-lg font-black text-[#263238]">{receiptData.length}</p>
                        </div>
                        <div className="px-5 py-3 bg-[#f8fafc] border border-[#d8dee6] rounded-xl">
                           <p className="text-[8px] font-black text-[#64748b] uppercase tracking-widest mb-0.5">Ordered</p>
                           <p className="text-lg font-black text-[#263238]">{receiptData.reduce((acc, i) => acc + i.totalOrdered, 0)}</p>
                        </div>
                        <div className="px-5 py-3 bg-[#f8fafc] border border-[#d8dee6] rounded-xl border-l-4 border-l-emerald-500">
                           <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Fulfilled</p>
                           <p className="text-lg font-black text-emerald-700">{receiptData.reduce((acc, i) => acc + i.alreadyReceived, 0)}</p>
                        </div>
                        <div className="px-5 py-3 bg-[#f8fafc] border border-[#d8dee6] rounded-xl border-l-4 border-l-[#f59e0b]">
                           <p className="text-[8px] font-black text-[#f59e0b] uppercase tracking-widest mb-0.5">Pending</p>
                           <p className="text-lg font-black text-[#263238]">{receiptData.reduce((acc, i) => acc + i.max, 0)}</p>
                        </div>
                     </div>

                     <button
                        onClick={() => setIsReceiptModalOpen(false)}
                        className="p-4 bg-white border border-[#d8dee6] text-[#263238] rounded-xl hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                     >
                        <X size={24} />
                     </button>
                  </div>

                  <form onSubmit={handleProcessReceipt} className="flex-1 overflow-hidden flex flex-col">
                     <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                        {/* MAIN SYNCHRONIZATION TABLE */}
                        <div className="bg-white rounded-xl border border-[#d8dee6] shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
                           <table className="w-full text-left">
                              <thead>
                                 <tr className="bg-[#263238] text-white">
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em]">ID</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em]">Component Description</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-center">Ordered</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-center">Fulfilled</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-center">Pending</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-center bg-white/10">Synchronize New</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-right">Actions</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-[#d8dee6]/50">
                                 {receiptData.map((item, index) => (
                                    <tr key={index} className={`group hover:bg-[#f8fafc] transition-colors ${item.max === 0 ? 'opacity-40' : ''}`}>
                                       <td className="px-6 py-4">
                                          <span className="text-[10px] font-black text-[#64748b] bg-[#f8fafc] px-2 py-0.5 rounded border border-[#d8dee6]">
                                             {String(index + 1).padStart(2, '0')}
                                          </span>
                                       </td>
                                       <td className="px-6 py-4">
                                          <div>
                                             <p className="text-sm font-black text-[#263238] uppercase tracking-tight">{item.name}</p>
                                             <p className="text-[8px] font-bold text-[#64748b]/60 uppercase tracking-widest mt-0.5">{item.max > 0 ? 'Active' : 'Complete'}</p>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                          <span className="text-sm font-bold text-[#263238]">{item.totalOrdered}</span>
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                          <span className="text-sm font-black text-emerald-600">{item.alreadyReceived}</span>
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                          <span className={`text-sm font-black ${item.max > 0 ? 'text-[#f59e0b]' : 'text-emerald-500'}`}>
                                             {item.max}
                                          </span>
                                       </td>
                                       <td className="px-6 py-4 text-center bg-[#263238]/5">
                                          {item.max > 0 ? (
                                             <div className="flex items-center justify-center">
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
                                                   className="w-20 px-3 py-2 bg-[#263238] text-white text-center text-lg font-black italic outline-none rounded-lg border-4 border-transparent focus:border-[#f59e0b] transition-all shadow-xl"
                                                />
                                             </div>
                                          ) : (
                                             <div className="flex items-center justify-center text-emerald-500">
                                                <CheckCircle2 size={20} />
                                             </div>
                                          )}
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          {item.max > 0 && (
                                             <button
                                                type="button"
                                                onClick={() => {
                                                   const nd = [...receiptData];
                                                   nd[index].qty = item.max;
                                                   setReceiptData(nd);
                                                }}
                                                className="px-5 py-2.5 bg-white border border-[#d8dee6] text-[#263238] rounded-lg font-black text-[9px] uppercase italic tracking-tighter hover:bg-[#263238] hover:text-white transition-all shadow-sm group-hover:border-[#263238]"
                                             >
                                                Fulfill
                                             </button>
                                          )}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>

                        {/* SYNCHRONIZATION HISTORY */}
                        <div className="space-y-4 pb-4">
                           <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-[#263238] rounded text-[#f59e0b]">
                                 <Layers size={16} />
                              </div>
                              <div>
                                 <h4 className="text-base font-black text-[#263238] uppercase italic tracking-tight">Sync History Ledger</h4>
                                 <p className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest">Incoming stock audit trail</p>
                              </div>
                           </div>

                           {poHistory.length === 0 ? (
                              <div className="py-8 text-center border-2 border-dashed border-[#d8dee6] rounded-xl bg-[#f8fafc]">
                                 <p className="text-[9px] font-bold text-[#64748b]/40 uppercase tracking-[0.3em] italic">No prior transaction records</p>
                              </div>
                           ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                 {poHistory.map((h, i) => (
                                    <div key={i} className="bg-white border border-[#d8dee6] rounded-xl p-4 flex items-start gap-4 hover:shadow-md transition-all group">
                                       <div className="w-10 h-10 rounded-lg bg-[#f8fafc] border border-[#d8dee6] flex items-center justify-center text-[#f59e0b] group-hover:bg-[#263238] group-hover:border-[#263238] transition-all flex-shrink-0">
                                          <Package size={18} />
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-start mb-1 gap-2">
                                             <p className="text-[10px] font-black text-[#263238] uppercase tracking-tight truncate">{h.partId?.name}</p>
                                             <span className="text-[11px] font-black text-emerald-600">+{h.quantity}</span>
                                          </div>
                                          <div className="flex items-center gap-3">
                                             <p className="text-[8px] font-bold text-[#64748b] uppercase tracking-widest flex items-center gap-1">
                                                <Calendar size={8} /> {new Date(h.createdAt).toLocaleDateString()}
                                             </p>
                                             <p className="text-[8px] font-bold text-[#64748b]/60 uppercase tracking-widest flex items-center gap-1 italic">
                                                <Clock size={8} /> {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                             </p>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>

                     {/* FOOTER ACTIONS */}
                     <div className="p-5 bg-white border-t border-[#d8dee6] flex flex-col sm:flex-row gap-6 shadow-[0_-20px_50px_rgba(0,0,0,0.03)]">
                        <div className="flex-1 space-y-1 hidden xl:block">
                           <p className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.3em]">Operational Protocol</p>
                           <p className="text-[11px] font-bold text-[#263238] italic">Validating batch integrity and syncing metadata to central warehouse ledger.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                           <button
                              type="button"
                              onClick={() => setIsReceiptModalOpen(false)}
                              className="px-10 py-5 border border-[#d8dee6] text-[#64748b] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#f8fafc] hover:text-[#263238] transition-all"
                           >
                              Abort
                           </button>
                           <button
                              type="submit"
                              disabled={processing}
                              className="px-12 py-5 bg-[#263238] text-white rounded-2xl font-black text-[11px] uppercase italic tracking-[0.2em] hover:bg-[#64748b] transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl shadow-[#263238]/30 group min-w-[300px]"
                           >
                              {processing ? (
                                 <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                              ) : (
                                 <>
                                    Commit Manifest to Ledger
                                    <div className="p-2 bg-[#f59e0b] rounded-lg text-[#263238] group-hover:scale-110 transition-transform">
                                       <ArrowRight size={20} />
                                    </div>
                                 </>
                              )}
                           </button>
                        </div>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
