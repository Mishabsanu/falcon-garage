"use client";

import { useEffect, useState, use } from "react";
import {
   ClipboardList,
   User,
   Car,
   Wrench,
   Clock,
   CheckCircle2,
   AlertTriangle,
   ArrowLeft,
   Plus,
   FileText,
   Wallet,
   Zap,
   Activity,
   ChevronRight,
   ShieldCheck,
   Timer,
   Calendar,
   Trash2,
   FilePlus2,
   ArrowRight
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function JobCardDetailPage({ params }: { params: Promise<{ id: string }> }) {
   const { id } = use(params);
   const [data, setData] = useState<any>(null);
   const [technicians, setTechnicians] = useState<any[]>([]);
   const [parts, setParts] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [lpo, setLpo] = useState("");

   const [showItemModal, setShowItemModal] = useState(false);
   const [showSubModal, setShowSubModal] = useState(false);
   const [newItem, setNewItem] = useState({ partId: "", name: "", qty: 1, price: 0 });
   const [subItems, setSubItems] = useState<any[]>([]);

   useEffect(() => {
      fetchJobCard();
      fetchTechnicians();
      fetchParts();
   }, [id]);

   const fetchParts = async () => {
      const res = await fetch("/api/stock/list");
      const result = await res.json();
      if (result.success) setParts(result.data);
   };

   const fetchJobCard = async () => {
      try {
         const res = await fetch(`/api/jobcards/${id}`);
         const result = await res.json();
         if (result.success) {
            setData(result.data);
            setLpo(result.data.lpoNumber || "");
         }
      } catch (error) {
         toast.error("Telemetry failure");
      } finally {
         setLoading(false);
      }
   };

   const fetchTechnicians = async () => {
      try {
         const res = await fetch("/api/users/technicians");
         const result = await res.json();
         if (result.success) setTechnicians(result.data);
      } catch (error) {
         console.error("Staff registry offline");
      }
   };

   const handleStatusUpdate = async (status: string) => {
      try {
         const res = await fetch("/api/jobcards/update-status", {
            method: "POST",
            body: JSON.stringify({ jobCardId: id, status }),
         });
         const result = await res.json();
         if (result.success) {
            toast.success(`Protocol updated to ${status}`);
            fetchJobCard();
         }
      } catch (error) {
         toast.error("Protocol update failure");
      }
   };

   const handleAssignTech = async (techId: string) => {
      try {
         const res = await fetch("/api/jobcards/assign-technician", {
            method: "POST",
            body: JSON.stringify({ jobCardId: id, technicianId: techId }),
         });
         const result = await res.json();
         if (result.success) {
            toast.success("Personnel deployed to node");
            fetchJobCard();
         }
      } catch (error) {
         toast.error("Deployment failure");
      }
   };

   const handleUpdateLPO = async () => {
      try {
         const res = await fetch("/api/jobcards/update-lpo", {
            method: "POST",
            body: JSON.stringify({ jobCardId: id, lpoNumber: lpo }),
         });
         const result = await res.json();
         if (result.success) toast.success("LPO Protocol Updated");
      } catch (error) {
         toast.error("LPO sync failure");
      }
   };

   const handleAddItem = async () => {
      try {
         const updatedItems = [...(data.items || []), newItem];
         const res = await fetch(`/api/jobcards/update-status`, { // Re-using status update for items for now or specialized endpoint
            method: "POST",
            body: JSON.stringify({ jobCardId: id, items: updatedItems }),
         });
         const result = await res.json();
         if (result.success) {
            toast.success("Inventory Node Added");
            setShowItemModal(false);
            fetchJobCard();
         }
      } catch (error) {
         toast.error("Node deployment failure");
      }
   };

   const handleRemoveItem = async (index: number) => {
      try {
         const updatedItems = data.items.filter((_: any, i: number) => i !== index);
         const res = await fetch(`/api/jobcards/update-status`, {
            method: "POST",
            body: JSON.stringify({ jobCardId: id, items: updatedItems }),
         });
         const result = await res.json();
         if (result.success) {
            toast.success("Node decommissioned");
            fetchJobCard();
         }
      } catch (error) {
         toast.error("Decommission failure");
      }
   };

   const handleDraftQuotation = async () => {
      try {
         const res = await fetch("/api/quotations", {
            method: "POST",
            body: JSON.stringify({
               customerId: data.customerId?._id,
               vehicleId: data.vehicleId?._id,
               jobCardId: id,
               items: data.items,
               laborCost: 2000, // Default
               gstPercent: 18,
               status: "draft"
            }),
         });
         const result = await res.json();
         if (result.success) {
            toast.success("Proposal Drafted from Active Node");
            fetchJobCard();
         }
      } catch (error) {
         toast.error("Drafting failure");
      }
   };

   const handleCreateSubQuotation = async () => {
      try {
         const res = await fetch("/api/quotations/sub/create", {
            method: "POST",
            body: JSON.stringify({
               customerId: data.customerId?._id,
               vehicleId: data.vehicleId?._id,
               jobCardId: id,
               items: subItems,
               laborCost: 1000,
               gstPercent: 18
            }),
         });
         const result = await res.json();
         if (result.success) {
            toast.success("Sub-Proposal Node Activated");
            setShowSubModal(false);
            setSubItems([]);
            fetchJobCard();
         }
      } catch (error) {
         toast.error("Sub-Proposal failure");
      }
   };

   const handleGenerateInvoice = async () => {
      try {
         const res = await fetch("/api/invoices/from-jobcard", {
            method: "POST",
            body: JSON.stringify({ jobCardId: id, laborCost: 2000, discount: 0 }),
         });
         const result = await res.json();
         if (result.success) {
            toast.success("Billing cycle finalized");
            window.location.href = `/dashboard/invoices/${result.data._id}`;
         }
      } catch (error) {
         toast.error("Billing sync failure");
      }
   };

   if (loading) return (
      <div className="py-20 text-center flex flex-col items-center gap-4">
         <div className="w-10 h-10 border-2 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
         <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Accessing Node Data...</p>
      </div>
   );

   if (!data) return <div className="text-center py-20 font-bold text-[#055b65]">Job Card registry not found.</div>;

   return (
      <div className="space-y-10 pb-20">
         {/* NAVIGATION */}
         <Link href="/dashboard/jobcards" className="inline-flex items-center gap-2 text-[#45828b] hover:text-[#055b65] transition-colors font-bold text-xs uppercase tracking-widest group">
            <div className="p-2 rounded-lg bg-white border border-[#e0e5e9] group-hover:border-[#1bd488] transition-all">
               <ArrowLeft size={16} />
            </div>
            Back to Operations List
         </Link>

         {/* TOP HEADER */}
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#055b65]/5 border border-[#055b65]/10 rounded-full">
                  <Zap size={12} className="text-[#1bd488] fill-[#1bd488]" />
                  <span className="text-[10px] font-black text-[#055b65] uppercase tracking-[0.2em]">Live Operation Node</span>
               </div>
               <h1 className="text-4xl font-black text-[#055b65] tracking-tight flex items-center gap-4">
                  #{data.jobCardNumber}
                  <span className={`text-[10px] px-4 py-1.5 rounded-full uppercase tracking-[0.25em] border italic ${data.status === 'closed' ? 'bg-[#1bd488]/10 text-[#1bd488] border-[#1bd488]/20' :
                        data.status === 'in_progress' ? 'bg-[#055b65] text-white border-[#055b65]' : 'bg-white text-[#45828b] border-[#e0e5e9]'
                     }`}>
                     {data.status}
                  </span>
               </h1>
               <div className="flex items-center gap-6 text-[10px] font-bold text-[#45828b]/60 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                     <Calendar size={14} className="text-[#1bd488]" />
                     Created: {new Date(data.createdAt).toLocaleString()}
                  </div>
                  {data.startTime && (
                     <div className="flex items-center gap-2 border-l border-[#e0e5e9] pl-6">
                        <Timer size={14} className="text-[#055b65]" />
                        Started: {new Date(data.startTime).toLocaleTimeString()}
                     </div>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-4">
               {data.status === 'open' && (
                  <button
                     onClick={() => handleStatusUpdate('in_progress')}
                     className="px-8 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] shadow-xl shadow-[#055b65]/20"
                  >
                     Start Workshop Protocol
                  </button>
               )}
               {data.status === 'in_progress' && (
                  <button
                     onClick={() => handleStatusUpdate('completed')}
                     className="px-8 py-4 bg-[#1bd488] text-[#055b65] rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:shadow-xl transition-all"
                  >
                     Signal Completion
                  </button>
               )}
               {data.status === 'completed' && (
                  <button
                     onClick={handleGenerateInvoice}
                     className="px-8 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] flex items-center gap-3 shadow-2xl"
                  >
                     Finalize & Bill Cycle <Wallet size={18} className="text-[#1bd488]" />
                  </button>
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LEFT COLUMN: CORE ASSETS */}
            <div className="lg:col-span-2 space-y-10">
               {/* ASSET & OWNER INFO */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-[#e0e5e9] shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 text-[#055b65]/5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                        <User size={120} />
                     </div>
                     <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between">
                           <h3 className="text-[10px] font-black text-[#45828b] uppercase tracking-widest">Asset Proprietor</h3>
                           <ShieldCheck size={18} className="text-[#1bd488]" />
                        </div>
                        <div>
                           <p className="text-xl font-black text-[#055b65] italic tracking-tight">{data.customerId?.name}</p>
                           <p className="text-xs font-bold text-[#45828b]/60 mt-1 uppercase tracking-widest">{data.customerId?.phone}</p>
                        </div>
                        <Link href={`/dashboard/customers/${data.customerId?._id}`} className="inline-flex items-center gap-2 text-[10px] font-bold text-[#1bd488] uppercase hover:gap-3 transition-all">
                           Examine Profile <ChevronRight size={14} />
                        </Link>
                        <div className="pt-4 border-t border-[#e0e5e9]/50 space-y-2">
                           <label className="text-[9px] font-black text-[#45828b]/50 uppercase tracking-widest">LPO Number (Credit Workflow)</label>
                           <div className="flex gap-2">
                              <input
                                 value={lpo}
                                 onChange={(e) => setLpo(e.target.value)}
                                 placeholder="Pending LPO Acquisition..."
                                 className="flex-1 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl px-4 py-2 text-xs font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50"
                              />
                              <button
                                 onClick={handleUpdateLPO}
                                 className="px-4 py-2 bg-[#055b65] text-white rounded-xl text-[9px] font-black uppercase hover:bg-[#45828b] transition-all"
                              >
                                 Update
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-[#e0e5e9] shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 text-[#055b65]/5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                        <Car size={120} />
                     </div>
                     <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between">
                           <h3 className="text-[10px] font-black text-[#45828b] uppercase tracking-widest">Target Asset</h3>
                           <Activity size={18} className="text-[#1bd488]" />
                        </div>
                        <div>
                           <p className="text-xl font-black text-[#055b65] italic tracking-tight">{data.vehicleId?.brand} {data.vehicleId?.model}</p>
                           <p className="text-xs font-bold text-[#45828b]/60 mt-1 uppercase tracking-widest">{data.vehicleId?.vehicleNumber}</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#1bd488] uppercase">
                           {data.mileage?.toLocaleString()} KM RECORDED
                        </div>
                     </div>
                  </div>
               </div>

               {/* COMPLAINTS & DIAGNOSTICS */}
               <div className="bg-white rounded-[3rem] border border-[#e0e5e9] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
                  <div className="p-8 border-b border-[#e0e5e9]/50 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#055b65] flex items-center justify-center text-[#1bd488]">
                           <AlertTriangle size={20} />
                        </div>
                        <h3 className="text-[12px] font-black text-[#055b65] uppercase tracking-widest italic">Fault Log & Diagnostics</h3>
                     </div>
                  </div>
                  <div className="p-10 space-y-6">
                     {data.complaints?.map((c: string, i: number) => (
                        <div key={i} className="flex gap-4 items-start p-6 rounded-2xl bg-[#fbfcfc] border border-[#e0e5e9] hover:border-[#1bd488]/40 transition-all group">
                           <div className="w-6 h-6 rounded-lg bg-white border border-[#e0e5e9] flex items-center justify-center text-[10px] font-black text-[#055b65] group-hover:bg-[#1bd488] group-hover:text-white transition-colors">
                              {i + 1}
                           </div>
                           <p className="text-sm font-bold text-[#45828b]">{c}</p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* NODE ITEMS & INVENTORY INTEGRATION */}
               <div className="bg-white rounded-[3rem] border border-[#e0e5e9] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
                  <div className="p-8 border-b border-[#e0e5e9]/50 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#055b65] flex items-center justify-center text-[#1bd488]">
                           <Wrench size={20} />
                        </div>
                        <h3 className="text-[12px] font-black text-[#055b65] uppercase tracking-widest italic">Node Itemization (Workshop Entry)</h3>
                     </div>
                     <button
                        onClick={() => setShowItemModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1bd488] text-[#055b65] rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                     >
                        <Plus size={14} /> Add Item
                     </button>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="text-[9px] font-black text-[#45828b]/40 uppercase tracking-widest bg-gray-50/50">
                              <th className="px-10 py-5">Item / Service</th>
                              <th className="px-4 py-5 text-center">Qty</th>
                              <th className="px-4 py-5 text-right">Valuation</th>
                              <th className="px-10 py-5 text-right">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {data.items?.length === 0 ? (
                              <tr>
                                 <td colSpan={4} className="px-10 py-10 text-center text-xs font-bold text-[#45828b]/30 italic">No direct items added to this node yet.</td>
                              </tr>
                           ) : data.items.map((item: any, i: number) => (
                              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                 <td className="px-10 py-5 text-xs font-bold text-[#055b65]">{item.name}</td>
                                 <td className="px-4 py-5 text-xs font-bold text-[#45828b] text-center">{item.qty}</td>
                                 <td className="px-4 py-5 text-xs font-black text-[#055b65] text-right">₹{item.price.toLocaleString()}</td>
                                 <td className="px-10 py-5 text-right">
                                    <button onClick={() => handleRemoveItem(i)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                       <Trash2 size={16} />
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* QUOTATION AUDIT TRAIL */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <h3 className="text-lg font-black text-[#055b65] uppercase italic tracking-tight">Financial Proposals (Estimates)</h3>
                     <FileText size={20} className="text-[#1bd488]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {data.quotationIds?.map((q: any) => (
                        <div key={q._id} className="bg-white p-8 rounded-[2.5rem] border border-[#e0e5e9] shadow-sm hover:shadow-xl transition-all group">
                           <div className="flex justify-between items-start mb-6">
                              <div className="space-y-1">
                                 <p className="text-sm font-bold text-[#055b65]">#{q.quotationNumber}</p>
                                 <p className="text-[9px] font-black text-[#1bd488] uppercase tracking-[0.2em] italic">
                                    {q.isSubQuotation ? "Sub-Quotation" : "Master Estimate"}
                                 </p>
                              </div>
                              <span className={`text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${q.status === 'approved' ? 'bg-[#1bd488]/10 text-[#1bd488] border-[#1bd488]/20' : 'bg-[#055b65]/5 text-[#055b65] border-[#055b65]/10'
                                 }`}>
                                 {q.status}
                              </span>
                           </div>
                           <div className="flex items-center justify-between pt-6 border-t border-[#e0e5e9]/50">
                              <p className="text-xl font-black text-[#055b65]">₹{q.grandTotal?.toLocaleString()}</p>
                              <Link href={`/dashboard/quotations`} className="p-2.5 rounded-xl bg-[#fbfcfc] border border-[#e0e5e9] text-[#055b65] hover:bg-[#1bd488] hover:text-white transition-all shadow-sm">
                                 <ChevronRight size={18} />
                              </Link>
                           </div>
                        </div>
                     ))}
                     <button
                        onClick={() => {
                           setSubItems([{ partId: "", name: "", qty: 1, price: 0 }]);
                           setShowSubModal(true);
                        }}
                        className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-2 border-dashed border-[#e0e5e9] text-[#45828b]/40 hover:border-[#1bd488]/50 hover:text-[#1bd488] transition-all group gap-4 min-h-[180px]"
                     >
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-all">
                           <Plus size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">New Sub-Proposal<br />(Additional Work)</span>
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* SUB-QUOTATION MODAL */}
         {showSubModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-[#055b65]/60 backdrop-blur-sm" onClick={() => setShowSubModal(false)}></div>
               <div className="bg-[#fbfcfc] w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
                  <div className="bg-[#055b65] p-8 text-white">
                     <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Active Sub-Proposal</h3>
                     <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Append supplementary items to Node #{data.jobCardNumber}</p>
                  </div>
                  <div className="p-10 overflow-y-auto space-y-6 flex-1">
                     <div className="space-y-4">
                        {subItems.map((item, index) => (
                           <div key={index} className="grid grid-cols-12 gap-4 items-end">
                              <div className="col-span-12 md:col-span-6 space-y-1.5">
                                 <label className="text-[9px] font-bold text-[#45828b]/50">Inventory / Service</label>
                                 <select
                                    value={item.partId}
                                    onChange={(e) => {
                                       const p = parts.find(x => x._id === e.target.value);
                                       const ni = [...subItems];
                                       ni[index] = { ...ni[index], partId: e.target.value, name: p?.name || "", price: p?.price || 0 };
                                       setSubItems(ni);
                                    }}
                                    className="w-full px-4 py-3 bg-white border border-[#e0e5e9] rounded-xl text-xs font-bold text-[#055b65] outline-none"
                                 >
                                    <option value="">Select Part...</option>
                                    {parts.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>)}
                                    <option value="custom">-- Custom Service --</option>
                                 </select>
                                 {item.partId === 'custom' && (
                                    <input
                                       value={item.name}
                                       onChange={(e) => {
                                          const ni = [...subItems];
                                          ni[index].name = e.target.value;
                                          setSubItems(ni);
                                       }}
                                       className="w-full px-4 py-3 mt-2 bg-white border border-[#e0e5e9] rounded-xl text-xs font-bold text-[#055b65] outline-none"
                                    />
                                 )}
                              </div>
                              <div className="col-span-4 md:col-span-2 space-y-1.5">
                                 <label className="text-[9px] font-bold text-[#45828b]/50">Qty</label>
                                 <input
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) => {
                                       const ni = [...subItems];
                                       ni[index].qty = Number(e.target.value);
                                       setSubItems(ni);
                                    }}
                                    className="w-full px-4 py-3 bg-white border border-[#e0e5e9] rounded-xl text-xs font-bold text-[#055b65] outline-none"
                                 />
                              </div>
                              <div className="col-span-8 md:col-span-3 space-y-1.5">
                                 <label className="text-[9px] font-bold text-[#45828b]/50">Valuation</label>
                                 <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => {
                                       const ni = [...subItems];
                                       ni[index].price = Number(e.target.value);
                                       setSubItems(ni);
                                    }}
                                    className="w-full px-4 py-3 bg-white border border-[#e0e5e9] rounded-xl text-xs font-bold text-[#055b65] outline-none"
                                 />
                              </div>
                              <div className="col-span-12 md:col-span-1 text-right">
                                 <button onClick={() => setSubItems(subItems.filter((_, i) => i !== index))} className="text-rose-400 hover:text-rose-600 transition-colors p-3">
                                    <Trash2 size={18} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                     <button
                        onClick={() => setSubItems([...subItems, { partId: "", name: "", qty: 1, price: 0 }])}
                        className="flex items-center gap-2 text-[10px] font-bold text-[#1bd488] uppercase tracking-widest hover:gap-3 transition-all"
                     >
                        <Plus size={14} /> Add Line Item
                     </button>
                     <div className="pt-6 flex gap-4">
                        <button onClick={() => setShowSubModal(false)} className="flex-1 px-6 py-4 border border-[#e0e5e9] text-[#45828b] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#fbfcfc]">Abort</button>
                        <button onClick={handleCreateSubQuotation} className="flex-[2] px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] flex items-center justify-center gap-4 shadow-2xl shadow-[#055b65]/20">Deploy Sub-Proposal <ArrowRight size={20} className="text-[#1bd488]" /></button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* RIGHT COLUMN: PERSONNEL & COMMAND */}
         <div className="space-y-10">
            {/* PERSONNEL DEPLOYMENT */}
            <div className="bg-[#055b65] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Wrench size={200} />
               </div>
               <div className="relative z-10 space-y-10">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-bold italic tracking-tight">Workshop Personnel</h3>
                     <Wrench size={20} className="text-[#1bd488]" />
                  </div>

                  <div className="space-y-6">
                     {data.technicians?.length === 0 ? (
                        <p className="text-sm font-bold text-white/30 italic">No personnel assigned to this node.</p>
                     ) : data.technicians.map((tech: any) => (
                        <div key={tech._id} className="flex items-center gap-4 group/tech p-1">
                           <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-bold text-[#1bd488] group-hover/tech:bg-[#1bd488] group-hover/tech:text-[#055b65] transition-all shadow-lg">
                              {tech.name.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-white uppercase tracking-tight">{tech.name}</p>
                              <p className="text-[9px] font-bold text-[#1bd488] uppercase tracking-widest mt-1 italic">Active Operator</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="pt-10 border-t border-white/10">
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6 px-1">Deploy New Specialist</p>
                     <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {technicians.filter(t => !data.technicians?.some((at: any) => at._id === t._id)).map((tech: any) => (
                           <button
                              key={tech._id}
                              onClick={() => handleAssignTech(tech._id)}
                              className="w-full flex items-center justify-between p-4 rounded-[1.5rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#1bd488]/40 transition-all group/btn"
                           >
                              <span className="text-xs font-bold uppercase tracking-tight">{tech.name}</span>
                              <Plus size={16} className="text-[#1bd488] group-hover/btn:scale-125 transition-transform" />
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* STATUS TRACKER */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-[#e0e5e9] shadow-sm space-y-8">
               <div className="flex items-center gap-3">
                  <Clock size={18} className="text-[#055b65]" />
                  <h3 className="text-xs font-black text-[#055b65] uppercase tracking-widest">Protocol Timeline</h3>
               </div>
               <div className="space-y-6 relative ml-4">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-[#e0e5e9]"></div>
                  {[
                     { label: 'Initialization', time: data.createdAt, active: true },
                     { label: 'Operator Assigned', time: data.technicians?.length > 0 ? data.updatedAt : null, active: data.technicians?.length > 0 },
                     { label: 'Work Commenced', time: data.startTime, active: !!data.startTime },
                     { label: 'Quality Control', time: data.status === 'completed' ? data.updatedAt : null, active: data.status === 'completed' || data.status === 'closed' },
                  ].map((step, i) => (
                     <div key={i} className="relative pl-8 group">
                        <div className={`absolute left-[-4px] top-1.5 w-2 h-2 rounded-full border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.1)] transition-all ${step.active ? 'bg-[#1bd488] shadow-[#1bd488]/50 scale-125' : 'bg-[#e0e5e9]'}`}></div>
                        <p className={`text-[11px] font-black uppercase tracking-widest leading-none ${step.active ? 'text-[#055b65]' : 'text-[#45828b]/40'}`}>{step.label}</p>
                        {step.time && <p className="text-[9px] font-bold text-[#45828b]/60 mt-1 italic">{new Date(step.time).toLocaleTimeString()}</p>}
                     </div>
                  ))}
                  {data.status === 'closed' && (
                     <div className="relative pl-8 group pt-2">
                        <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-[#055b65] border-2 border-white shadow-[0_0_8px_#055b65] scale-150"></div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-[#055b65]">Vaulted / Finalized</p>
                        <p className="text-[9px] font-bold text-[#1bd488] mt-1 italic">{new Date(data.endTime).toLocaleTimeString()}</p>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {showItemModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-[#055b65]/60 backdrop-blur-sm" onClick={() => setShowItemModal(false)}></div>
               <div className="bg-[#fbfcfc] w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                  <div className="bg-[#055b65] p-8 text-white">
                     <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Deploy Node Item</h3>
                     <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Inventory Integration Module</p>
                  </div>
                  <div className="p-10 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Target Inventory Item</label>
                        <select
                           value={newItem.partId}
                           onChange={(e) => {
                              const p = parts.find(x => x._id === e.target.value);
                              setNewItem({ ...newItem, partId: e.target.value, name: p?.name || "", price: p?.price || 0 });
                           }}
                           className="w-full px-5 py-4 bg-white border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50 appearance-none"
                        >
                           <option value="">Select Part...</option>
                           {parts.map(p => (
                              <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock} • ₹{p.price})</option>
                           ))}
                           <option value="custom">-- Custom Service --</option>
                        </select>
                        {newItem.partId === 'custom' && (
                           <input
                              placeholder="Manual Service Description..."
                              value={newItem.name}
                              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                              className="w-full px-5 py-4 mt-2 bg-white border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none"
                           />
                        )}
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Quantity</label>
                           <input
                              type="number"
                              value={newItem.qty}
                              onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                              className="w-full px-5 py-4 bg-white border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Unit Valuation</label>
                           <input
                              type="number"
                              value={newItem.price}
                              onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                              className="w-full px-5 py-4 bg-white border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none"
                           />
                        </div>
                     </div>
                     <div className="pt-6 flex gap-4">
                        <button onClick={() => setShowItemModal(false)} className="flex-1 px-6 py-4 border border-[#e0e5e9] text-[#45828b] rounded-2xl font-bold text-xs uppercase">Abort</button>
                        <button onClick={handleAddItem} className="flex-1 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] shadow-xl shadow-[#055b65]/20">Deploy Item <ChevronRight size={16} /></button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
