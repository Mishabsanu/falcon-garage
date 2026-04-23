"use client";

import { useEffect, useState } from "react";
import { 
  ClipboardList, 
  Search, 
  Plus, 
  MoreVertical, 
  User, 
  Car, 
  Wrench, 
  ArrowRight,
  Clock,
  Play,
  CheckCircle2,
  Lock,
  Layers,
  Zap,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

export default function JobCardsPage() {
  const [jobCards, setJobCards] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [creationMode, setCreationMode] = useState<"quotation" | "direct">("quotation");

  const [newJob, setNewJob] = useState({
    quotationId: "",
    customerId: "",
    vehicleId: "",
  });

  const [assignData, setAssignData] = useState({
    technicianId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jRes, qRes, tRes, cRes, vRes] = await Promise.all([
        fetch("/api/jobcards/list"),
        fetch("/api/quotations/list"),
        fetch("/api/users/technicians"),
        fetch("/api/customers/list"),
        fetch("/api/vehicles/list")
      ]);
      const [jData, qData, tData, cData, vData] = await Promise.all([
        jRes.json(), qRes.json(), tRes.json(), cRes.json(), vRes.json()
      ]);
      
      if (jData.success) setJobCards(jData.data);
      if (qData.success) setQuotations(qData.data);
      if (tData.success) setTechnicians(tData.data);
      if (cData.success) setCustomers(cData.data);
      if (vData.success) setVehicles(vData.data);
    } catch (error) {
      toast.error("Queue synchronization failure");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = creationMode === "quotation" ? "/api/jobcards/from-quotation" : "/api/jobcards/create-direct";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(newJob),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Job Card initialized in the cluster");
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Initialization failure");
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/jobcards/assign-technician", {
        method: "POST",
        body: JSON.stringify({ jobId: selectedJobId, technicianId: assignData.technicianId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Technician node assigned successfully");
        setIsAssignModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Assignment failed");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/jobcards/update-status", {
        method: "POST",
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Operational state: ${status.toUpperCase()}`);
        fetchData();
      }
    } catch (error) {
      toast.error("State transition failed");
    }
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e0e5e9] rounded-full shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#1bd488] rounded-full"></div>
             <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-widest">Repair Queue</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#055b65] tracking-tight">Active Service Queue</h1>
          <p className="text-[#45828b]/70 text-sm font-medium">Real-time monitoring of service nodes and repair lifecycle status.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all shadow-xl shadow-[#055b65]/20"
        >
          <Plus size={18} className="text-[#1bd488]" />
          Deploy New Job Card
        </button>
      </div>

      {/* JOB CARD LIST */}
      <div className="bg-white rounded-[2.5rem] border border-[#e0e5e9] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#e0e5e9]/20 text-[#45828b]/60 text-[9px] font-bold uppercase tracking-[0.25em]">
                <th className="px-8 py-5">Order Key</th>
                <th className="px-8 py-5">Target Node</th>
                <th className="px-8 py-5">Personnel Node</th>
                <th className="px-8 py-5">State</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e5e9]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Querying Queue...</p>
                    </div>
                  </td>
                </tr>
              ) : jobCards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-[#45828b]/40">Queue is currently clear. No active nodes.</p>
                  </td>
                </tr>
              ) : jobCards.map((job) => (
                <tr 
                  key={job._id} 
                  onClick={() => window.location.href = `/dashboard/jobcards/${job._id}`}
                  className="hover:bg-[#1bd488]/5 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-[#055b65]">#{job.jobCardNumber}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                       <p className="text-sm font-bold text-[#055b65]">{job.customerId?.name}</p>
                       <div className="flex items-center gap-2 text-[10px] text-[#45828b]/60 font-bold uppercase tracking-tight">
                          <Car size={12} className="text-[#1bd488]" />
                          {job.vehicleId?.vehicleNumber} • {job.vehicleId?.model}
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {job.technicians?.[0] ? (
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-[#055b65] flex items-center justify-center text-white text-[10px] font-bold italic border border-[#1bd488]/20 shadow-sm">
                            {job.technicians[0].name.charAt(0)}
                         </div>
                         <span className="text-xs font-bold text-[#45828b]">{job.technicians[0].name}</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setSelectedJobId(job._id); setIsAssignModalOpen(true); }}
                        className="text-[10px] font-black text-[#1bd488] uppercase tracking-widest hover:underline flex items-center gap-2"
                      >
                         <UserCheck size={14} /> Assign Node
                      </button>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                      job.status === 'completed' ? 'bg-[#1bd488]/10 text-[#1bd488] border-[#1bd488]/20' : 
                      job.status === 'in_progress' ? 'bg-[#45828b]/10 text-[#45828b] border-[#45828b]/20' : 
                      job.status === 'assigned' ? 'bg-[#055b65]/10 text-[#055b65] border-[#055b65]/20' : 'bg-[#e0e5e9]/30 text-[#45828b]/50 border-[#e0e5e9]/60'
                    }`}>
                      {job.status === 'completed' ? <CheckCircle2 size={10} /> : job.status === 'in_progress' ? <Play size={10} className="animate-pulse" /> : <Clock size={10} />}
                      {job.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                       {job.status === 'assigned' && (
                         <button 
                           onClick={() => updateStatus(job._id, 'in_progress')}
                           className="p-2.5 rounded-xl bg-[#1bd488] text-white hover:shadow-lg transition-all"
                         >
                            <Play size={16} fill="currentColor" />
                         </button>
                       )}
                       {job.status === 'in_progress' && (
                         <button 
                           onClick={() => updateStatus(job._id, 'completed')}
                           className="p-2.5 rounded-xl bg-[#055b65] text-[#1bd488] hover:shadow-lg transition-all"
                         >
                            <CheckCircle2 size={16} />
                         </button>
                       )}
                       <button className="p-2.5 rounded-xl hover:bg-white hover:shadow-md transition-all text-[#45828b]">
                        <MoreVertical size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#055b65]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
             <div className="bg-[#055b65] p-8 text-white">
                <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Queue Deployment</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Convert Proposal to Active Service Order</p>
             </div>
             
             <form onSubmit={handleCreate} className="p-10 space-y-6">
                <div className="flex p-1 bg-gray-100 rounded-xl">
                   <button 
                     type="button"
                     onClick={() => setCreationMode("quotation")}
                     className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${creationMode === 'quotation' ? 'bg-white text-[#055b65] shadow-sm' : 'text-[#45828b]/60'}`}
                   >
                      From Proposal
                   </button>
                   <button 
                     type="button"
                     onClick={() => setCreationMode("direct")}
                     className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${creationMode === 'direct' ? 'bg-white text-[#1bd488] shadow-sm' : 'text-[#45828b]/60'}`}
                   >
                      Direct Asset Order
                   </button>
                </div>

                {creationMode === 'quotation' ? (
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Reference Proposal</label>
                      <select 
                        required
                        value={newJob.quotationId}
                        onChange={(e) => setNewJob({...newJob, quotationId: e.target.value})}
                        className="w-full px-5 py-4 bg-[#fbfcfc] border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50 appearance-none transition-all"
                      >
                        <option value="">Select Target Proposal...</option>
                        {quotations.filter(q => q.status === 'draft' || q.status === 'approved').map(q => (
                          <option key={q._id} value={q._id}>{q.quotationNumber} - {q.customerId?.name}</option>
                        ))}
                      </select>
                   </div>
                ) : (
                   <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Target Customer</label>
                         <select 
                           required
                           value={newJob.customerId}
                           onChange={(e) => setNewJob({...newJob, customerId: e.target.value})}
                           className="w-full px-5 py-4 bg-[#fbfcfc] border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50 appearance-none transition-all"
                         >
                           <option value="">Select Customer...</option>
                           {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Asset Reference</label>
                         <select 
                           required
                           value={newJob.vehicleId}
                           onChange={(e) => setNewJob({...newJob, vehicleId: e.target.value})}
                           className="w-full px-5 py-4 bg-[#fbfcfc] border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50 appearance-none transition-all"
                         >
                           <option value="">Select Vehicle...</option>
                           {vehicles.filter(v => v.customerId?._id === newJob.customerId).map(v => (
                             <option key={v._id} value={v._id}>{v.vehicleNumber} ({v.model})</option>
                           ))}
                         </select>
                      </div>
                   </div>
                )}

                <div className="pt-6 flex gap-4">
                   <button 
                     type="button"
                     onClick={() => setIsModalOpen(false)}
                     className="flex-1 px-6 py-4 border border-[#e0e5e9] text-[#45828b] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#fbfcfc]"
                   >
                     Abort
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] flex items-center justify-center gap-3 shadow-xl shadow-[#055b65]/10"
                   >
                     Initialize Order <ArrowRight size={18} className="text-[#1bd488]" />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#055b65]/60 backdrop-blur-sm" onClick={() => setIsAssignModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
             <div className="bg-[#1bd488] p-8 text-[#055b65]">
                <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Personnel Assignment</h3>
                <p className="text-[#055b65]/40 text-[10px] font-bold uppercase tracking-widest mt-2">Deploy human capital to order node</p>
             </div>
             
             <form onSubmit={handleAssign} className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Technician Node</label>
                   <select 
                     required
                     value={assignData.technicianId}
                     onChange={(e) => setAssignData({...assignData, technicianId: e.target.value})}
                     className="w-full px-5 py-4 bg-[#fbfcfc] border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:border-[#055b65]/50 appearance-none transition-all"
                   >
                     <option value="">Select Technician...</option>
                     {technicians.map(t => (
                       <option key={t._id} value={t._id}>{t.name} (Active: {t.activeJobs || 0})</option>
                     ))}
                   </select>
                </div>

                <div className="pt-6 flex gap-4">
                   <button 
                     type="button"
                     onClick={() => setIsAssignModalOpen(false)}
                     className="flex-1 px-6 py-4 border border-[#e0e5e9] text-[#45828b] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#fbfcfc]"
                   >
                     Abort
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 px-6 py-4 bg-[#1bd488] text-[#055b65] rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#055b65] hover:text-white flex items-center justify-center gap-3 shadow-xl shadow-[#1bd488]/10 transition-all"
                   >
                     Confirm Assignment <UserCheck size={18} />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
