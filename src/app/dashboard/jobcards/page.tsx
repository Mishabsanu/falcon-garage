"use client";

import { useEffect, useState } from "react";
import { 
  ClipboardList, 
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
import { useRouter } from "next/navigation";
import Link from "next/link";
import ListPagination from "@/components/ui/ListPagination";
import ListToolbar from "@/components/ui/ListToolbar";
import usePaginatedData from "@/hooks/usePaginatedData";
import { Filter, Pencil, Trash2 } from "lucide-react";

export default function JobCardsPage() {
  const router = useRouter();
  const [jobCards, setJobCards] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [assignData, setAssignData] = useState({
    technicianId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jRes, tRes] = await Promise.all([
        fetch("/api/jobcards/list"),
        fetch("/api/users/technicians"),
      ]);
      const [jData, tData] = await Promise.all([
        jRes.json(), tRes.json()
      ]);
      
      if (jData.success) setJobCards(jData.data);
      if (tData.success) setTechnicians(tData.data);
    } catch (error) {
      toast.error("Queue synchronization failure");
    } finally {
      setLoading(false);
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

  const filteredJobCards = jobCards.filter((job) => {
    const query = searchQuery.toLowerCase();
    return (
      job.jobCardNumber?.toLowerCase().includes(query) ||
      job.customerId?.name?.toLowerCase().includes(query) ||
      job.vehicleId?.vehicleNumber?.toLowerCase().includes(query) ||
      job.status?.toLowerCase().includes(query)
    );
  });
  const { page, pageCount, pageSize, paginatedItems, setPage } = usePaginatedData(filteredJobCards);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER structure matching Quotations */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#d8dee6] rounded-md shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-md"></div>
             <span className="text-[10px] font-bold text-[#263238] uppercase tracking-widest">Repair Queue</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#263238] tracking-tight uppercase italic">
            Active Service <span className="text-[#f59e0b]">Queue</span>
          </h1>
          <p className="text-[#64748b]/70 text-sm font-medium">Real-time monitoring of service nodes and repair lifecycle status.</p>
        </div>
        
        <Link 
          href="/dashboard/jobcards/new"
          className="flex items-center gap-3 px-6 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] transition-all shadow-xl shadow-[#263238]/20"
        >
          <Plus size={18} className="text-[#f59e0b]" />
          Deploy New Job Card
        </Link>
      </div>

      {/* SEARCH structure matching Quotations */}
      <div className="space-y-3">
        <ListToolbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search job cards by number, customer, vehicle, or status..."
          searchClassName="md:max-w-2xl"
          rightSlot={
            <button className="px-6 py-3.5 border border-[#d8dee6] bg-white text-[#263238] font-bold text-xs uppercase tracking-widest rounded-md hover:bg-[#f7f4ef] flex items-center gap-3">
              <Filter size={16} /> Filter
            </button>
          }
        />
      </div>

      {/* JOB CARD LIST matching Quotations table style */}
      <div className="bg-white rounded-md border border-[#d8dee6] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f7f4ef]/50 border-b border-[#d8dee6]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Order Key</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Target Node</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Personnel Node</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">State</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dee6]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#f59e0b]/10 border-t-[#f59e0b] rounded-md animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#64748b]/40 uppercase tracking-widest">Querying Queue...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredJobCards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <p className="text-sm font-bold text-[#64748b]/40">Queue is currently clear. No active nodes.</p>
                  </td>
                </tr>
              ) : paginatedItems.map((job) => (
                <tr 
                  key={job._id} 
                  className="hover:bg-[#f7f4ef]/30 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6" onClick={() => router.push(`/dashboard/jobcards/${job._id}`)}>
                    <span className="text-sm font-black text-[#263238] bg-[#263238]/5 px-2 py-1 rounded">#{job.jobCardNumber}</span>
                  </td>
                  <td className="px-8 py-6" onClick={() => router.push(`/dashboard/jobcards/${job._id}`)}>
                    <div className="space-y-1.5">
                       <p className="text-sm font-black uppercase tracking-tight text-[#263238]">{job.customerId?.name}</p>
                       <div className="flex items-center gap-2 text-[10px] text-[#64748b]/60 font-bold uppercase tracking-widest">
                          <Car size={12} className="text-[#f59e0b]" />
                          {job.vehicleId?.vehicleNumber} <span className="text-[#d8dee6] mx-1">|</span> {job.vehicleId?.model}
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {job.technicians?.[0] ? (
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-md bg-[#263238] flex items-center justify-center text-white font-black text-xs uppercase italic border border-[#f59e0b]/20 shadow-sm transition-all group-hover:bg-[#f59e0b] group-hover:text-[#263238]">
                            {job.technicians[0].name.charAt(0)}
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-tight text-[#64748b]">{job.technicians[0].name}</span>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedJobId(job._id); setIsAssignModalOpen(true); }}
                        className="text-[10px] font-black text-[#f59e0b] uppercase tracking-[0.2em] hover:text-[#263238] flex items-center gap-2 transition-colors border border-dashed border-[#f59e0b]/30 px-3 py-2 rounded-md bg-[#f59e0b]/5"
                      >
                         <UserCheck size={14} /> Assign Node
                      </button>
                    )}
                  </td>
                  <td className="px-8 py-6" onClick={() => router.push(`/dashboard/jobcards/${job._id}`)}>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest border transition-all ${
                      job.status === 'completed' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' : 
                      job.status === 'in_progress' ? 'bg-[#263238]/10 text-[#263238] border-[#263238]/20' : 
                      job.status === 'assigned' ? 'bg-[#64748b]/10 text-[#64748b] border-[#64748b]/20' : 'bg-[#d8dee6]/30 text-[#64748b]/50 border-[#d8dee6]/60'
                    }`}>
                      {job.status === 'completed' ? <CheckCircle2 size={10} /> : job.status === 'in_progress' ? <Play size={10} className="animate-pulse" /> : <Clock size={10} />}
                      {job.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       {job.status === 'assigned' && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); updateStatus(job._id, 'in_progress'); }}
                           className="p-2.5 rounded-md bg-[#263238] text-white hover:bg-[#f59e0b] hover:text-[#263238] transition-all shadow-lg shadow-[#263238]/10"
                           title="Start Mission"
                         >
                            <Play size={16} fill="currentColor" />
                         </button>
                       )}
                       {job.status === 'in_progress' && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); updateStatus(job._id, 'completed'); }}
                           className="p-2.5 rounded-md bg-[#f59e0b] text-[#263238] hover:bg-[#263238] hover:text-white transition-all shadow-lg shadow-[#f59e0b]/10"
                           title="Complete Mission"
                         >
                            <CheckCircle2 size={16} />
                         </button>
                       )}
                       <Link
                         href={`/dashboard/jobcards/${job._id}/edit`}
                         className="p-2.5 rounded-md bg-white border border-[#d8dee6] text-[#263238] hover:border-[#263238] transition-all"
                         onClick={(e) => e.stopPropagation()}
                       >
                         <Pencil size={16} />
                       </Link>
                       <button className="p-2.5 rounded-md bg-white border border-[#d8dee6] text-rose-500 hover:border-rose-500 transition-all">
                        <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ListPagination page={page} pageCount={pageCount} pageSize={pageSize} total={filteredJobCards.length} onPageChange={setPage} />
      </div>

      {/* ASSIGN MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#263238]/60 backdrop-blur-sm" onClick={() => setIsAssignModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-md shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-[#d8dee6]">
             <div className="bg-[#263238] p-10 text-white">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded bg-[#f59e0b] flex items-center justify-center text-[#263238]">
                      <UserCheck size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black italic uppercase tracking-tight">Personnel Deployment</h3>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Assign human capital to service node</p>
                   </div>
                </div>
             </div>
             
             <form onSubmit={handleAssign} className="p-10 space-y-10">
                <div className="space-y-4">
                   <label className="flex items-center gap-2 text-[10px] font-black text-[#263238] uppercase tracking-[0.2em]">
                      <Zap size={14} className="text-[#f59e0b]" /> Select Technician Node
                   </label>
                   <select 
                     required
                     value={assignData.technicianId}
                     onChange={(e) => setAssignData({...assignData, technicianId: e.target.value})}
                     className="w-full border-b-2 border-[#d8dee6] bg-transparent py-4 text-lg font-bold text-[#263238] outline-none focus:border-[#f59e0b] appearance-none transition-all"
                   >
                     <option value="">Select Technician...</option>
                     {technicians.map(t => (
                       <option key={t._id} value={t._id}>{t.name} (Active Units: {t.activeJobs || 0})</option>
                     ))}
                   </select>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                     type="button" 
                     onClick={() => setIsAssignModalOpen(false)} 
                     className="flex-1 px-6 py-4 border border-[#d8dee6] text-[#64748b] rounded font-black text-[10px] uppercase tracking-widest hover:bg-[#f7f4ef] transition-colors"
                   >
                     Abort
                   </button>
                   <button 
                     type="submit" 
                     className="flex-1 px-6 py-4 bg-[#263238] text-white rounded font-black text-[10px] uppercase tracking-widest hover:bg-[#64748b] transition-all shadow-xl shadow-[#263238]/10"
                   >
                     Confirm Assignment
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
