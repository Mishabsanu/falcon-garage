"use client";

import { useEffect, useState } from "react";
import { 
  Car, 
  Search, 
  Plus, 
  MoreVertical, 
  User, 
  Tag, 
  Cpu, 
  ArrowRight,
  Filter,
  Zap
} from "lucide-react";
import { toast } from "sonner";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: "",
    brand: "",
    model: "",
    customerId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vRes, cRes] = await Promise.all([
        fetch("/api/vehicles/list"),
        fetch("/api/customers/list")
      ]);
      const vData = await vRes.json();
      const cData = await cRes.json();
      
      if (vData.success) setVehicles(vData.data);
      if (cData.success) setCustomers(cData.data);
    } catch (error) {
      toast.error("Telemetry sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        body: JSON.stringify(newVehicle),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Asset initialized successfully");
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Initialization failed");
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e0e5e9] rounded-full shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#1bd488] rounded-full"></div>
             <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-widest">Asset Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#055b65] tracking-tight">Machine Inventory</h1>
          <p className="text-[#45828b]/70 text-sm font-medium">Track and manage all vehicle nodes registered in the system.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all shadow-xl shadow-[#055b65]/20"
        >
          <Plus size={18} className="text-[#1bd488]" />
          Register New Asset
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-[1.5rem] border border-[#e0e5e9] shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#45828b]/40 group-focus-within:text-[#1bd488] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by registration number or model class..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50 transition-all placeholder:text-[#45828b]/30"
          />
        </div>
      </div>

      {/* VEHICLE LIST */}
      <div className="bg-white rounded-[2.5rem] border border-[#e0e5e9] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#e0e5e9]/20 text-[#45828b]/60 text-[9px] font-bold uppercase tracking-[0.25em]">
                <th className="px-8 py-5">Asset Key</th>
                <th className="px-8 py-5">Specification</th>
                <th className="px-8 py-5">Owner Node</th>
                <th className="px-8 py-5">Current State</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e5e9]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Scanning Registry...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-[#45828b]/40">No active assets detected in this cluster.</p>
                  </td>
                </tr>
              ) : filteredVehicles.map((vehicle) => (
                <tr key={vehicle._id} className="hover:bg-[#1bd488]/5 transition-colors group cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-[#055b65] flex items-center justify-center text-[#1bd488]">
                          <Car size={16} />
                       </div>
                       <span className="text-sm font-black text-[#055b65] uppercase tracking-tighter italic">{vehicle.vehicleNumber}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                       <p className="text-sm font-bold text-[#055b65]">{vehicle.brand} {vehicle.model}</p>
                       <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest mt-1">Platform ID: {vehicle._id.slice(-6)}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-[#e0e5e9] flex items-center justify-center text-[#055b65] text-[10px] font-bold">
                          {vehicle.customerId?.name?.charAt(0) || "U"}
                       </div>
                       <span className="text-xs font-bold text-[#45828b]">{vehicle.customerId?.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#1bd488]/10 text-[#1bd488] border border-[#1bd488]/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                       <Zap size={10} fill="currentColor" /> Active Node
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2.5 rounded-xl hover:bg-white hover:shadow-md transition-all text-[#45828b]">
                      <MoreVertical size={18} />
                    </button>
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
                <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Asset Initialization</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Bind new machine to customer node</p>
             </div>
             
             <form onSubmit={handleCreate} className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Owner Selection</label>
                   <select 
                     required
                     value={newVehicle.customerId}
                     onChange={(e) => setNewVehicle({...newVehicle, customerId: e.target.value})}
                     className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50 appearance-none"
                   >
                     <option value="">Select Target Customer...</option>
                     {customers.map(c => (
                       <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                     ))}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Registration Vector</label>
                   <input 
                     required
                     value={newVehicle.vehicleNumber}
                     onChange={(e) => setNewVehicle({...newVehicle, vehicleNumber: e.target.value})}
                     className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50 uppercase italic" 
                     placeholder="Vehicle Number (e.g. MH 12 AB 1234)"
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Brand/OEM</label>
                      <input 
                        required
                        value={newVehicle.brand}
                        onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                        placeholder="e.g. BMW"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Model Class</label>
                      <input 
                        required
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                        placeholder="e.g. M3 Competition"
                      />
                   </div>
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
                     Initialize Asset <ArrowRight size={18} className="text-[#1bd488]" />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
