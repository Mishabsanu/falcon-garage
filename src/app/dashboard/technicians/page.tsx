"use client";

import { useEffect, useState } from "react";
import { 
  Wrench, 
  Search, 
  Plus, 
  MoreVertical, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Mail, 
  ShieldCheck,
  UserPlus,
  Terminal,
  Zap,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTech, setNewTech] = useState({
    name: "",
    email: "",
    password: "password123", // Default for demo
    role: "TECHNICIAN"
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const res = await fetch("/api/users/technicians");
      const data = await res.json();
      if (data.success) setTechnicians(data.data);
    } catch (error) {
      toast.error("Personnel sync failure");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(newTech),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Personnel node deployed successfully");
        setIsModalOpen(false);
        fetchTechnicians();
      }
    } catch (error) {
      toast.error("Deployment failed");
    }
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e0e5e9] rounded-full shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#1bd488] rounded-full"></div>
             <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-widest">Personnel Matrix</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#055b65] tracking-tight">Active Technicians</h1>
          <p className="text-[#45828b]/70 text-sm font-medium">Manage human capital and workforce distribution nodes.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all shadow-xl shadow-[#055b65]/20"
        >
          <UserPlus size={18} className="text-[#1bd488]" />
          Deploy New Personnel
        </button>
      </div>

      {/* TECHNICIAN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
             <div className="w-10 h-10 border-2 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
             <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Synchronizing Nodes...</p>
          </div>
        ) : technicians.length === 0 ? (
          <div className="col-span-full py-20 text-center">
             <p className="text-sm font-bold text-[#45828b]/40">No personnel nodes detected in current cluster.</p>
          </div>
        ) : technicians.map((tech) => (
          <div key={tech._id} className="bg-white rounded-[2.5rem] p-8 border border-[#e0e5e9] shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
             <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#055b65] flex items-center justify-center text-white text-xl font-bold italic shadow-lg shadow-[#055b65]/20">
                   {tech.name.charAt(0)}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                   tech.activeJobs > 0 ? "bg-[#1bd488]/10 text-[#1bd488] border border-[#1bd488]/20" : "bg-[#fbfcfc] text-[#45828b]/40 border border-[#e0e5e9]"
                }`}>
                   {tech.activeJobs > 0 ? <Zap size={10} fill="currentColor" /> : <Clock size={10} />}
                   {tech.activeJobs > 0 ? "Active Now" : "Standby"}
                </div>
             </div>

             <div className="space-y-1 relative z-10 mb-8">
                <h3 className="text-lg font-black text-[#055b65] tracking-tight">{tech.name}</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#45828b]/60 uppercase tracking-widest">
                   <Mail size={12} className="text-[#1bd488]" />
                   {tech.email}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#e0e5e9]/50 relative z-10">
                <div className="space-y-1">
                   <p className="text-[9px] font-bold text-[#45828b]/40 uppercase tracking-widest">Active Jobs</p>
                   <p className="text-xl font-black text-[#055b65]">{tech.activeJobs || 0}</p>
                </div>
                <div className="space-y-1 text-right">
                   <p className="text-[9px] font-bold text-[#45828b]/40 uppercase tracking-widest">Efficiency</p>
                   <p className="text-xl font-black text-[#1bd488] italic">94.2%</p>
                </div>
             </div>

             <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none text-[#055b65]">
                <ShieldCheck size={140} />
             </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#055b65]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
             <div className="bg-[#055b65] p-8 text-white">
                <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Personnel Deployment</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Provision new human resource node</p>
             </div>
             
             <form onSubmit={handleCreate} className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Full Identity</label>
                   <input 
                     required
                     value={newTech.name}
                     onChange={(e) => setNewTech({...newTech, name: e.target.value})}
                     className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                     placeholder="Technician Name"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Secure Link (Email)</label>
                   <input 
                     type="email"
                     required
                     value={newTech.email}
                     onChange={(e) => setNewTech({...newTech, email: e.target.value})}
                     className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                     placeholder="email@node.sys"
                   />
                </div>

                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                   <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Terminal size={14} /> Security Protocol
                   </p>
                   <p className="text-[10px] text-amber-600/70 font-medium leading-relaxed">
                      Initial access credential is set to <span className="font-bold text-amber-700 italic">password123</span>. 
                      Personnel must perform a key rotation upon initial node synchronization.
                   </p>
                </div>

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
                     Confirm Access <ArrowRight size={18} className="text-[#1bd488]" />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
