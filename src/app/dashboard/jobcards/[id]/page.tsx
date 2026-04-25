"use client";

import {
   Activity,
   AlertTriangle,
   ArrowRight,
   Car,
   ChevronRight,
   Clock,
   Download,
   FileText,
   Plus,
   ShieldCheck,
   Trash2,
   User,
   Wallet,
   Wrench,
   Zap
} from "lucide-react";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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
   const [newComplaint, setNewComplaint] = useState("");

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

   const handleAddComplaint = async () => {
      if (!newComplaint.trim()) return;
      try {
         const updatedComplaints = [...(data.complaints || []), newComplaint];
         const res = await fetch(`/api/jobcards/update-status`, {
            method: "POST",
            body: JSON.stringify({ jobCardId: id, complaints: updatedComplaints }),
         });
         const result = await res.json();
         if (result.success) {
            toast.success("Diagnostic Node Added");
            setNewComplaint("");
            fetchJobCard();
         }
      } catch (error) {
         toast.error("Diagnostic sync failure");
      }
   };

   const handleRemoveComplaint = async (index: number) => {
      try {
         const updatedComplaints = data.complaints.filter((_: any, i: number) => i !== index);
         const res = await fetch(`/api/jobcards/update-status`, {
            method: "POST",
            body: JSON.stringify({ jobCardId: id, complaints: updatedComplaints }),
         });
         const result = await res.json();
         if (result.success) {
            toast.success("Diagnostic Node Removed");
            fetchJobCard();
         }
      } catch (error) {
         toast.error("Diagnostic removal failure");
      }
   };

   const handleAddItem = async () => {
      try {
         const updatedItems = [...(data.items || []), newItem];
         const res = await fetch(`/api/jobcards/update-status`, {
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
               jobCardId: id,
               laborCost: 0,
               discount: 0
            }),
         });
         const result = await res.json();
         if (result.success) {
            toast.success("Billing Cycle Initialized");
            window.location.href = `/dashboard/invoices/${result.data._id}`;
         }
      } catch (error) {
         toast.error("Billing failure");
      }
   };

   if (loading) return <div className="flex h-screen items-center justify-center bg-[#f7f4ef]"><Activity size={40} className="text-[#f59e0b] animate-spin" /></div>;

   if (!data) return <div className="text-center py-20 font-bold text-[#263238]">Job Card registry not found.</div>;

   return (
      <div className="space-y-10 pb-20 animate-in fade-in duration-700">
         {/* TOP COMMAND BAR */}
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-10 rounded-md border border-[#d8dee6] shadow-sm">
            <div className="space-y-2">
               <div className="flex items-center gap-3 text-[10px] font-black text-[#f59e0b] uppercase tracking-[0.3em]">
                  <Zap size={14} /> Global Repair Node
               </div>
               <h1 className="text-4xl font-black text-[#263238] tracking-tight flex items-center gap-4">
                  #{data.jobCardNumber}
                  <span className={`text-[10px] px-4 py-1.5 rounded-md uppercase tracking-[0.25em] border italic ${data.status === 'closed' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' :
                     data.status === 'in_progress' ? 'bg-[#263238] text-white border-[#263238]' : 'bg-white text-[#64748b] border-[#d8dee6]'
                     }`}>
                     {data.status}
                  </span>
               </h1>
            </div>

            <div className="flex items-center gap-4">
               {(data.status === 'open' || data.status === 'assigned') && (
                  <button
                     onClick={() => handleStatusUpdate('in_progress')}
                     className="px-8 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] shadow-xl shadow-[#263238]/20 flex items-center gap-3"
                  >
                     Start Workshop Protocol <Activity size={18} className="text-[#f59e0b]" />
                  </button>
               )}
               {data.status === 'waiting_approval' && (
                  <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-md border border-amber-200">
                     <AlertTriangle size={20} className="text-[#f59e0b]" />
                     <p className="text-[10px] font-black text-[#263238] uppercase tracking-widest text-amber-700">Awaiting Client Authorization for Additional Nodes</p>
                  </div>
               )}
               {data.status === 'in_progress' && (
                  <button
                     onClick={() => handleStatusUpdate('completed')}
                     className="px-8 py-4 bg-[#f59e0b] text-[#263238] rounded-md font-black text-xs uppercase italic tracking-tighter hover:shadow-xl transition-all"
                  >
                     Signal Completion
                  </button>
               )}
               {data.status === 'completed' && (
                  <button
                     onClick={handleGenerateInvoice}
                     className="px-8 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] flex items-center gap-3 shadow-2xl"
                  >
                     Finalize & Bill Cycle <Wallet size={18} className="text-[#f59e0b]" />
                  </button>
               )}
            </div>
         </div>

         {/* ROW 0: TIMELINE - FULL WIDTH */}
         <div className="bg-white rounded-md p-10 border border-[#d8dee6] shadow-sm">
            <div className="flex items-center gap-3 mb-10">
               <Clock size={18} className="text-[#263238]" />
               <h3 className="text-[10px] font-black text-[#263238] uppercase tracking-widest">Protocol Execution Timeline</h3>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative">
               <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-[#d8dee6] -translate-y-1/2 z-0"></div>
               {[
                  { label: 'Initialization', time: data.createdAt, active: true },
                  { label: 'Personnel Deployed', time: data.technicians?.length > 0 ? data.updatedAt : null, active: data.technicians?.length > 0 },
                  { label: 'Labor Commenced', time: data.startTime, active: !!data.startTime },
                  { label: 'Quality Verification', time: data.status === 'completed' ? data.updatedAt : null, active: data.status === 'completed' || data.status === 'closed' },
                  { label: 'Vaulted', time: data.endTime, active: data.status === 'closed' },
               ].map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-4 bg-white px-4">
                     <div className={`w-4 h-4 rounded-full border-4 border-white shadow-lg transition-all duration-700 ${step.active ? 'bg-[#f59e0b] scale-125' : 'bg-[#d8dee6]'}`}></div>
                     <div className="text-center">
                        <p className={`text-[9px] font-black uppercase tracking-widest ${step.active ? 'text-[#263238]' : 'text-[#64748b]/40'}`}>{step.label}</p>
                        {step.time && <p className="text-[8px] font-bold text-[#64748b]/60 mt-1 italic">{new Date(step.time).toLocaleDateString()}</p>}
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* ROW 1: ASSET INTELLIGENCE */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-md border border-[#d8dee6] shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 text-[#263238]/5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <User size={120} />
               </div>
               <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">Asset Proprietor</h3>
                     <ShieldCheck size={18} className="text-[#f59e0b]" />
                  </div>
                  <div>
                     <p className="text-xl font-black text-[#263238] italic tracking-tight">{data.customerId?.name}</p>
                     <p className="text-xs font-bold text-[#64748b]/60 mt-1 uppercase tracking-widest">{data.customerId?.phone}</p>
                  </div>
                  <div className="pt-4 border-t border-[#d8dee6]/50 space-y-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#64748b]/50 uppercase tracking-widest">LPO Number (Credit Workflow)</label>
                        <div className="flex gap-2">
                           <input
                              value={lpo}
                              onChange={(e) => setLpo(e.target.value)}
                              placeholder="Pending LPO Acquisition..."
                              className="flex-1 bg-[#f7f4ef] border border-[#d8dee6] rounded-md px-4 py-2 text-xs font-bold text-[#263238] outline-none focus:border-[#f59e0b]/50"
                           />
                           <button onClick={handleUpdateLPO} className="px-4 py-2 bg-[#263238] text-white rounded-md text-[9px] font-black uppercase hover:bg-[#64748b]">Update</button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-md border border-[#d8dee6] shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 text-[#263238]/5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <Car size={120} />
               </div>
               <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">Target Asset</h3>
                     <Activity size={18} className="text-[#f59e0b]" />
                  </div>
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-xl font-black text-[#263238] italic tracking-tight">{data.vehicleId?.brand} {data.vehicleId?.model}</p>
                        <p className="text-xs font-bold text-[#64748b]/60 mt-1 uppercase tracking-widest">{data.vehicleId?.vehicleNumber}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-[#f59e0b] uppercase tracking-widest">{data.mileage?.toLocaleString()} KM RECORDED</p>
                        <p className="text-[8px] font-bold text-[#64748b]/40 uppercase mt-1 italic">Last Telemetry Update</p>
                     </div>
                  </div>
                  <div className="pt-4 border-t border-[#d8dee6]/50 flex gap-6">
                     <div>
                        <p className="text-[9px] font-black text-[#64748b]/40 uppercase tracking-widest mb-1">Color Unit</p>
                        <p className="text-[10px] font-bold text-[#263238] uppercase">{data.vehicleId?.color || 'N/A'}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-[#64748b]/40 uppercase tracking-widest mb-1">Chassis Identifier</p>
                        <p className="text-[10px] font-bold text-[#263238] uppercase">{data.vehicleId?.vin || 'N/A'}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* ROW 2: DIAGNOSTICS & PERSONNEL */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* FAULT LOG */}
            <div className="lg:col-span-2 bg-white rounded-md border border-[#d8dee6] shadow-sm overflow-hidden flex flex-col">
               <div className="p-8 border-b border-[#d8dee6]/50 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-md bg-[#263238] flex items-center justify-center text-[#f59e0b]">
                        <AlertTriangle size={20} />
                     </div>
                     <h3 className="text-[12px] font-black text-[#263238] uppercase tracking-widest italic">Diagnostic Fault Log</h3>
                  </div>
               </div>
               <div className="p-8 flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {data.complaints?.map((c: string, i: number) => (
                        <div key={i} className="flex gap-4 items-center p-4 rounded-md bg-[#f7f4ef] border border-[#d8dee6] group relative">
                           <div className="w-6 h-6 rounded-lg bg-white border border-[#d8dee6] flex items-center justify-center text-[10px] font-black text-[#263238] group-hover:bg-[#f59e0b] group-hover:text-white transition-colors">
                              {i + 1}
                           </div>
                           <p className="text-xs font-bold text-[#64748b] flex-1">{c}</p>
                           <button onClick={() => handleRemoveComplaint(i)} className="p-1.5 text-rose-400 hover:text-rose-600 transition-all">
                              <Trash2 size={14} />
                           </button>
                        </div>
                     ))}
                  </div>
                  <div className="pt-6 border-t border-[#d8dee6]/30 flex gap-3">
                     <input 
                        value={newComplaint}
                        onChange={(e) => setNewComplaint(e.target.value)}
                        placeholder="Log new diagnostic finding..."
                        className="flex-1 bg-white border border-[#d8dee6] rounded-md px-5 py-3 text-sm font-bold text-[#263238] outline-none focus:border-[#f59e0b]/50"
                     />
                     <button onClick={handleAddComplaint} className="px-6 py-3 bg-[#263238] text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-[#64748b]">Deploy Finding</button>
                  </div>
               </div>
            </div>

            {/* PERSONNEL */}
            <div className="bg-[#263238] rounded-md p-8 text-white shadow-2xl relative overflow-hidden group flex flex-col">
               <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Wrench size={160} />
               </div>
               <div className="relative z-10 space-y-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold italic tracking-tight">Personnel</h3>
                     <Wrench size={20} className="text-[#f59e0b]" />
                  </div>

                  <div className="space-y-4 flex-1">
                     {data.technicians?.length === 0 ? (
                        <p className="text-xs font-bold text-white/30 italic">No personnel assigned to this node.</p>
                     ) : data.technicians.map((tech: any) => (
                        <div key={tech._id} className="flex items-center gap-4 group/tech p-1">
                           <div className="w-10 h-10 rounded-md bg-white/10 border border-white/10 flex items-center justify-center font-bold text-[#f59e0b] group-hover/tech:bg-[#f59e0b] group-hover/tech:text-[#263238] transition-all">
                              {tech.name.charAt(0)}
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-bold text-white uppercase tracking-tight">{tech.name}</p>
                              <p className="text-[8px] font-bold text-[#f59e0b] uppercase tracking-widest mt-0.5 italic">Operator</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="pt-6 border-t border-white/10">
                     <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-4">Deploy Specialist</p>
                     <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                        {technicians.filter(t => !data.technicians?.some((at: any) => at._id === t._id)).map((tech: any) => (
                           <button
                              key={tech._id}
                              onClick={() => handleAssignTech(tech._id)}
                              className="w-full flex items-center justify-between p-3 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#f59e0b]/40 transition-all group/btn"
                           >
                              <span className="text-[10px] font-bold uppercase tracking-tight">{tech.name}</span>
                              <Plus size={14} className="text-[#f59e0b]" />
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* ROW 3: NODE ITEMIZATION - FULL WIDTH */}
         <div className="bg-white rounded-md border border-[#d8dee6] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-[#d8dee6]/50 flex items-center justify-between bg-gray-50/50">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-[#263238] flex items-center justify-center text-[#f59e0b]">
                     <Wrench size={20} />
                  </div>
                  <h3 className="text-[12px] font-black text-[#263238] uppercase tracking-widest italic">Node Itemization (Inventory Integration)</h3>
               </div>
               <button
                  onClick={() => setShowItemModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#f59e0b] text-[#263238] rounded-md text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
               >
                  <Plus size={14} /> Deploy New Item
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-[9px] font-black text-[#64748b]/40 uppercase tracking-widest bg-white border-b border-gray-100">
                        <th className="px-10 py-5">Item / Service Component</th>
                        <th className="px-4 py-5 text-center">Qty</th>
                        <th className="px-4 py-5 text-right">Valuation</th>
                        <th className="px-10 py-5 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {data.items?.length === 0 ? (
                        <tr>
                           <td colSpan={4} className="px-10 py-20 text-center text-xs font-bold text-[#64748b]/30 italic">No direct inventory nodes deployed yet.</td>
                        </tr>
                     ) : data.items.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="px-10 py-6 text-xs font-bold text-[#263238]">{item.name}</td>
                           <td className="px-4 py-6 text-xs font-bold text-[#64748b] text-center">{item.qty}</td>
                           <td className="px-4 py-6 text-xs font-black text-[#263238] text-right">QAR {item.price.toLocaleString()}</td>
                           <td className="px-10 py-6 text-right">
                              <button onClick={() => handleRemoveItem(i)} className="text-rose-400 hover:text-rose-600 transition-colors p-2">
                                 <Trash2 size={16} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* ROW 4: PROPOSALS - FULL WIDTH */}
         <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
                     <FileText size={18} />
                  </div>
                  <h3 className="text-lg font-black text-[#263238] uppercase italic tracking-tight">Active Proposals & Estimates</h3>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               {data.quotationIds?.map((q: any) => (
                  <div key={q._id} className="bg-white p-8 rounded-md border border-[#d8dee6] shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-[#f59e0b]">
                     <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                           <p className="text-xs font-black text-[#263238] uppercase">#{q.quotationNumber}</p>
                           <p className="text-[8px] font-black text-[#f59e0b] uppercase tracking-[0.2em] italic">
                              {q.isSubQuotation ? "Sub-Proposal" : "Master Protocol"}
                           </p>
                        </div>
                        <span className={`text-[8px] px-3 py-1 rounded-md font-black uppercase tracking-widest border ${q.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                           }`}>
                           {q.status}
                        </span>
                     </div>
                     <div className="flex items-center justify-between pt-6 border-t border-[#d8dee6]/50">
                        <p className="text-2xl font-black text-[#263238]">QAR {q.grandTotal?.toLocaleString()}</p>
                        <div className="flex gap-2">
                           {q.status === 'draft' && q.isSubQuotation && (
                              <div className="flex gap-2">
                                 <button 
                                    onClick={async () => {
                                       const res = await fetch("/api/quotations/sub/approve", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ quotationId: q._id })
                                       });
                                       const result = await res.json();
                                       if (result.success) {
                                          toast.success("Sub-Proposal Node Activated");
                                          fetchJobCard();
                                       }
                                    }}
                                    className="px-4 py-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all rounded-md"
                                 >
                                    Approve
                                 </button>
                                 <button 
                                    onClick={async () => {
                                       const res = await fetch("/api/quotations/sub/reject", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ quotationId: q._id })
                                       });
                                       const result = await res.json();
                                       if (result.success) {
                                          toast.success("Proposal Rejected");
                                          fetchJobCard();
                                       }
                                    }}
                                    className="px-4 py-2 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all rounded-md"
                                 >
                                    Reject
                                 </button>
                              </div>
                           )}
                           <button 
                              onClick={() => window.open(`/api/quotations/pdf/${q._id}`, "_blank")}
                              className="p-3 rounded-md bg-[#263238] text-white hover:bg-[#64748b] transition-all"
                           >
                              <Download size={16} />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
               <button
                  onClick={() => {
                     setSubItems([{ partId: "", name: "", qty: 1, price: 0 }]);
                     setShowSubModal(true);
                  }}
                  className="flex flex-col items-center justify-center p-8 rounded-md border-2 border-dashed border-[#d8dee6] text-[#64748b]/40 hover:border-[#f59e0b]/50 hover:text-[#f59e0b] transition-all group gap-4 bg-white/50 min-h-[200px]"
               >
                  <div className="w-12 h-12 rounded-md border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-all">
                     <Plus size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">New Sub-Proposal Node<br />(Additional Authorization)</span>
               </button>
            </div>
         </div>


         {/* SUB-QUOTATION MODAL */}
         {showSubModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-[#263238]/60 backdrop-blur-sm" onClick={() => setShowSubModal(false)}></div>
               <div className="bg-[#f7f4ef] w-full max-w-2xl max-h-[90vh] rounded-md shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
                  <div className="bg-[#263238] p-8 text-white">
                     <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Active Sub-Proposal</h3>
                     <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Append supplementary items to Node #{data.jobCardNumber}</p>
                  </div>
                  <div className="p-10 overflow-y-auto space-y-6 flex-1">
                     <div className="space-y-4">
                        {subItems.map((item, index) => (
                           <div key={index} className="grid grid-cols-12 gap-4 items-end">
                              <div className="col-span-12 md:col-span-6 space-y-1.5">
                                 <label className="text-[9px] font-bold text-[#64748b]/50">Inventory / Service</label>
                                 <select
                                    value={item.partId}
                                    onChange={(e) => {
                                       const p = parts.find(x => x._id === e.target.value);
                                       const ni = [...subItems];
                                       ni[index] = { ...ni[index], partId: e.target.value, name: p?.name || "", price: p?.price || 0 };
                                       setSubItems(ni);
                                    }}
                                    className="w-full px-4 py-3 bg-white border border-[#d8dee6] rounded-md text-xs font-bold text-[#263238] outline-none"
                                 >
                                    <option value="">Select Part...</option>
                                    {parts.map(p => <option key={p._id} value={p._id}>{p.name} (QAR {p.price})</option>)}
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
                                       className="w-full px-4 py-3 mt-2 bg-white border border-[#d8dee6] rounded-md text-xs font-bold text-[#263238] outline-none"
                                    />
                                 )}
                              </div>
                              <div className="col-span-4 md:col-span-2 space-y-1.5">
                                 <label className="text-[9px] font-bold text-[#64748b]/50">Qty</label>
                                 <input
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) => {
                                       const ni = [...subItems];
                                       ni[index].qty = Number(e.target.value);
                                       setSubItems(ni);
                                    }}
                                    className="w-full px-4 py-3 bg-white border border-[#d8dee6] rounded-md text-xs font-bold text-[#263238] outline-none"
                                 />
                              </div>
                              <div className="col-span-8 md:col-span-3 space-y-1.5">
                                 <label className="text-[9px] font-bold text-[#64748b]/50">Valuation</label>
                                 <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => {
                                       const ni = [...subItems];
                                       ni[index].price = Number(e.target.value);
                                       setSubItems(ni);
                                    }}
                                    className="w-full px-4 py-3 bg-white border border-[#d8dee6] rounded-md text-xs font-bold text-[#263238] outline-none"
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
                        className="flex items-center gap-2 text-[10px] font-bold text-[#f59e0b] uppercase tracking-widest hover:gap-3 transition-all"
                     >
                        <Plus size={14} /> Add Line Item
                     </button>
                     <div className="pt-6 flex gap-4">
                        <button onClick={() => setShowSubModal(false)} className="flex-1 px-6 py-4 border border-[#d8dee6] text-[#64748b] rounded-md font-bold text-xs uppercase tracking-widest hover:bg-[#f7f4ef]">Abort</button>
                        <button onClick={handleCreateSubQuotation} className="flex-[2] px-6 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] flex items-center justify-center gap-4 shadow-2xl shadow-[#263238]/20">Deploy Sub-Proposal <ArrowRight size={20} className="text-[#f59e0b]" /></button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {showItemModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-[#263238]/60 backdrop-blur-sm" onClick={() => setShowItemModal(false)}></div>
               <div className="bg-[#f7f4ef] w-full max-w-lg rounded-md shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                  <div className="bg-[#263238] p-8 text-white">
                     <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Deploy Node Item</h3>
                     <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Inventory Integration Module</p>
                  </div>
                  <div className="p-10 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#263238]/50 uppercase tracking-widest">Target Inventory Item</label>
                        <select
                           value={newItem.partId}
                           onChange={(e) => {
                              const p = parts.find(x => x._id === e.target.value);
                              setNewItem({ ...newItem, partId: e.target.value, name: p?.name || "", price: p?.price || 0 });
                           }}
                           className="w-full px-5 py-4 bg-white border border-[#d8dee6] rounded-md text-sm font-bold text-[#263238] outline-none focus:border-[#f59e0b]/50 appearance-none"
                        >
                           <option value="">Select Part...</option>
                           {parts.map(p => (
                              <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock} • QAR {p.price})</option>
                           ))}
                           <option value="custom">-- Custom Service --</option>
                        </select>
                        {newItem.partId === 'custom' && (
                           <input
                              placeholder="Manual Service Description..."
                              value={newItem.name}
                              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                              className="w-full px-5 py-4 mt-2 bg-white border border-[#d8dee6] rounded-md text-sm font-bold text-[#263238] outline-none"
                           />
                        )}
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-[#263238]/50 uppercase tracking-widest">Quantity</label>
                           <input
                              type="number"
                              value={newItem.qty}
                              onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                              className="w-full px-5 py-4 bg-white border border-[#d8dee6] rounded-md text-sm font-bold text-[#263238] outline-none"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-[#263238]/50 uppercase tracking-widest">Unit Valuation</label>
                           <input
                              type="number"
                              value={newItem.price}
                              onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                              className="w-full px-5 py-4 bg-white border border-[#d8dee6] rounded-md text-sm font-bold text-[#263238] outline-none"
                           />
                        </div>
                     </div>
                     <div className="pt-6 flex gap-4">
                        <button onClick={() => setShowItemModal(false)} className="flex-1 px-6 py-4 border border-[#d8dee6] text-[#64748b] rounded-md font-bold text-xs uppercase">Abort</button>
                        <button onClick={handleAddItem} className="flex-1 px-6 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] shadow-xl shadow-[#263238]/20">Deploy Item <ChevronRight size={16} /></button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

