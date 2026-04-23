"use client";

import { useEffect, useState } from "react";
import { 
  Package, 
  Search, 
  Plus, 
  MoreVertical, 
  AlertTriangle, 
  ArrowRight,
  Database,
  Tag,
  Warehouse,
  History,
  TrendingUp,
  Boxes
} from "lucide-react";
import { toast } from "sonner";

export default function InventoryPage() {
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPart, setNewPart] = useState({
    name: "",
    sku: "",
    price: 0,
    stock: 0,
    minStock: 5,
    location: ""
  });

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const res = await fetch("/api/stock/list"); // I'll create this
      const data = await res.json();
      if (data.success) setParts(data.data);
    } catch (error) {
      toast.error("Stock synchronization failure");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/parts/create", { // I'll create this
        method: "POST",
        body: JSON.stringify(newPart),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Component registered in inventory");
        setIsModalOpen(false);
        fetchParts();
      }
    } catch (error) {
      toast.error("Registry failed");
    }
  };

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e0e5e9] rounded-full shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#1bd488] rounded-full"></div>
             <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-widest">Stock Control</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#055b65] tracking-tight">Component Registry</h1>
          <p className="text-[#45828b]/70 text-sm font-medium">Real-time inventory monitor and stock levels management.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all shadow-xl shadow-[#055b65]/20"
        >
          <Plus size={18} className="text-[#1bd488]" />
          Register New Component
        </button>
      </div>

      {/* ANALYTICS PREVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-[1.5rem] border border-[#e0e5e9] flex items-center gap-4 shadow-sm">
           <div className="w-12 h-12 rounded-2xl bg-[#055b65]/5 flex items-center justify-center text-[#055b65]">
              <Boxes size={24} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-[#45828b]/50 uppercase tracking-widest">Total SKU Count</p>
              <p className="text-xl font-black text-[#055b65]">{parts.length}</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-[#e0e5e9] flex items-center gap-4 shadow-sm">
           <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
              <AlertTriangle size={24} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-[#45828b]/50 uppercase tracking-widest">Low Stock Alerts</p>
              <p className="text-xl font-black text-rose-500">{parts.filter(p => p.stock <= p.minStock).length}</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[1.5rem] border border-[#e0e5e9] flex items-center gap-4 shadow-sm">
           <div className="w-12 h-12 rounded-2xl bg-[#1bd488]/10 flex items-center justify-center text-[#1bd488]">
              <TrendingUp size={24} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-[#45828b]/50 uppercase tracking-widest">Inventory Valuation</p>
              <p className="text-xl font-black text-[#055b65]">₹{parts.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}</p>
           </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-[1.5rem] border border-[#e0e5e9] shadow-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#45828b]/40 group-focus-within:text-[#1bd488] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Query by component name or SKU identifier..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50 transition-all placeholder:text-[#45828b]/30"
          />
        </div>
      </div>

      {/* STOCK TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-[#e0e5e9] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#e0e5e9]/20 text-[#45828b]/60 text-[9px] font-bold uppercase tracking-[0.25em]">
                <th className="px-8 py-5">Component ID</th>
                <th className="px-8 py-5">Description</th>
                <th className="px-8 py-5">Storage Node</th>
                <th className="px-8 py-5">Availability</th>
                <th className="px-8 py-5">Valuation</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e5e9]/30">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Syncing Stock Levels...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-[#45828b]/40">No components detected in current cluster.</p>
                  </td>
                </tr>
              ) : filteredParts.map((part) => (
                <tr key={part._id} className="hover:bg-[#1bd488]/5 transition-colors group cursor-pointer">
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-[#055b65] font-mono tracking-wider">{part.sku || "N/A"}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                       <p className="text-sm font-bold text-[#055b65]">{part.name}</p>
                       <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest mt-1 italic">Type: Consumable</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#45828b]">
                       <Warehouse size={14} className="text-[#1bd488]" />
                       {part.location || "Central Bay"}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                       <p className={`text-sm font-black ${part.stock <= part.minStock ? 'text-rose-500' : 'text-[#055b65]'}`}>
                          {part.stock} Units
                       </p>
                       <div className="w-24 h-1 bg-[#e0e5e9] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${part.stock <= part.minStock ? 'bg-rose-500' : 'bg-[#1bd488]'}`}
                            style={{ width: `${Math.min(100, (part.stock / (part.minStock * 2)) * 100)}%` }}
                          ></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-[#055b65]">₹{part.price.toLocaleString()}</span>
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
                <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Component Registration</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Add new SKU to system database</p>
             </div>
             
             <form onSubmit={handleCreate} className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Identification (Name)</label>
                      <input 
                        required
                        value={newPart.name}
                        onChange={(e) => setNewPart({...newPart, name: e.target.value})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                        placeholder="e.g. Brake Pads"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">SKU Identifier</label>
                      <input 
                        required
                        value={newPart.sku}
                        onChange={(e) => setNewPart({...newPart, sku: e.target.value})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50 font-mono" 
                        placeholder="SKU-001"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Unit Valuation (₹)</label>
                      <input 
                        type="number"
                        required
                        value={newPart.price}
                        onChange={(e) => setNewPart({...newPart, price: Number(e.target.value)})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Initial Stock</label>
                      <input 
                        type="number"
                        required
                        value={newPart.stock}
                        onChange={(e) => setNewPart({...newPart, stock: Number(e.target.value)})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Critical Alert Level</label>
                      <input 
                        type="number"
                        required
                        value={newPart.minStock}
                        onChange={(e) => setNewPart({...newPart, minStock: Number(e.target.value)})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-rose-500 outline-none focus:border-rose-500/50" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Storage Sector</label>
                      <input 
                        value={newPart.location}
                        onChange={(e) => setNewPart({...newPart, location: e.target.value})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                        placeholder="Shelf A1"
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
                     Deploy to Stock <ArrowRight size={18} className="text-[#1bd488]" />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
