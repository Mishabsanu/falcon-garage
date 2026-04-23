"use client";

import { useEffect, useState } from "react";
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  ExternalLink,
  MoreVertical,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/vendors/list");
      const data = await res.json();
      if (data.success) setVendors(data.data);
    } catch (error) {
      toast.error("Supply node synchronization failure");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        body: JSON.stringify(newVendor),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Vendor node initialized successfully");
        setIsModalOpen(false);
        fetchVendors();
        setNewVendor({ name: "", phone: "", email: "", address: "" });
      }
    } catch (error) {
      toast.error("Initialization failed");
    }
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e0e5e9] rounded-full shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#1bd488] rounded-full"></div>
             <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-widest">Supplier Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#055b65] tracking-tight">Vendor Management</h1>
          <p className="text-[#45828b]/70 text-sm font-medium">Manage supply chain nodes and corporate partnerships.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all shadow-xl shadow-[#055b65]/20"
        >
          <Plus size={18} className="text-[#1bd488]" />
          Initialize Vendor
        </button>
      </div>

      {/* VENDOR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
             <div className="w-10 h-10 border-2 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
             <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Querying Registry...</p>
          </div>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor._id} className="bg-white p-8 rounded-[2.5rem] border border-[#e0e5e9] shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#055b65]/5 rounded-full blur-2xl group-hover:bg-[#1bd488]/10 transition-all"></div>
               
               <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#055b65] flex items-center justify-center text-white shadow-lg shadow-[#055b65]/20 group-hover:scale-110 transition-transform duration-500">
                     <Building2 size={28} className="text-[#1bd488]" />
                  </div>
                  <button className="p-2 text-[#45828b]/30 hover:text-[#055b65] transition-colors">
                     <MoreVertical size={20} />
                  </button>
               </div>

               <div className="space-y-1 mb-8 relative z-10">
                  <h3 className="text-xl font-black text-[#055b65] tracking-tight">{vendor.name}</h3>
                  <p className="text-[#45828b]/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                     <Truck size={12} className="text-[#1bd488]" /> Verified Supplier
                  </p>
               </div>

               <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3 text-[#45828b] hover:text-[#055b65] transition-colors cursor-pointer">
                     <div className="w-8 h-8 rounded-xl bg-[#fbfcfc] flex items-center justify-center border border-[#e0e5e9]">
                        <Phone size={14} />
                     </div>
                     <span className="text-xs font-bold">{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#45828b] hover:text-[#055b65] transition-colors cursor-pointer">
                     <div className="w-8 h-8 rounded-xl bg-[#fbfcfc] flex items-center justify-center border border-[#e0e5e9]">
                        <Mail size={14} />
                     </div>
                     <span className="text-xs font-bold truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-start gap-3 text-[#45828b]">
                     <div className="w-8 h-8 rounded-xl bg-[#fbfcfc] flex items-center justify-center border border-[#e0e5e9] shrink-0">
                        <MapPin size={14} />
                     </div>
                     <span className="text-xs font-medium leading-relaxed">{vendor.address}</span>
                  </div>
               </div>

               <div className="mt-10 pt-8 border-t border-[#e0e5e9] flex justify-between items-center relative z-10">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-bold text-[#45828b]/40 uppercase tracking-widest">Procurement Node</span>
                     <span className="text-xs font-black text-[#055b65]">Active Partner</span>
                  </div>
                  <button className="w-10 h-10 rounded-xl bg-[#fbfcfc] border border-[#e0e5e9] flex items-center justify-center text-[#055b65] hover:bg-[#055b65] hover:text-white transition-all group-hover:border-[#055b65]">
                     <ExternalLink size={16} />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#055b65]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
             <div className="bg-[#055b65] p-8 text-white">
                <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Initialize Vendor Node</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Integrating new corporate supply partner</p>
             </div>
             
             <form onSubmit={handleCreate} className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Entity Name</label>
                   <input 
                     required
                     value={newVendor.name}
                     onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                     className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none" 
                     placeholder="Supplier Corporate Identity"
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Communication Hub</label>
                      <input 
                        required
                        value={newVendor.phone}
                        onChange={(e) => setNewVendor({...newVendor, phone: e.target.value})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none" 
                        placeholder="Primary Phone"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Data Node</label>
                      <input 
                        required
                        value={newVendor.email}
                        onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none" 
                        placeholder="Corporate Email"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Physical Coordinates</label>
                   <textarea 
                     required
                     value={newVendor.address}
                     onChange={(e) => setNewVendor({...newVendor, address: e.target.value})}
                     className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none min-h-[100px]" 
                     placeholder="Full HQ Address"
                   />
                </div>

                <div className="pt-6 flex gap-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-[#e0e5e9] text-[#45828b] rounded-2xl font-bold text-xs uppercase tracking-widest">
                     Abort
                   </button>
                   <button type="submit" className="flex-1 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] flex items-center justify-center gap-3">
                     Activate Node <ArrowRight size={18} className="text-[#1bd488]" />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
