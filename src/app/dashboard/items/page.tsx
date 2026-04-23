"use client";

import { useEffect, useState } from "react";
import { 
  Database, 
  Plus, 
  Search, 
  Tag, 
  Layers, 
  MoreVertical, 
  ArrowRight,
  Filter,
  Boxes
} from "lucide-react";
import { toast } from "sonner";

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    sku: "",
    price: 0,
    category: "",
    minStock: 5
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/stock/list");
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (error) {
      toast.error("Component registry sync failure");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/parts/create", {
        method: "POST",
        body: JSON.stringify({...newItem, stock: 0}), // Items start with 0 stock
      });
      const data = await res.json();
      if (data.success) {
        toast.success("New Component Master initialized");
        setIsModalOpen(false);
        fetchItems();
        setNewItem({ name: "", sku: "", price: 0, category: "", minStock: 5 });
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
             <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-widest">Master Data Node</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#055b65] tracking-tight">Component Registry</h1>
          <p className="text-[#45828b]/70 text-sm font-medium">Define your master item list and SKUs before procurement.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all shadow-xl shadow-[#055b65]/20"
        >
          <Plus size={18} className="text-[#1bd488]" />
          Define New Item
        </button>
      </div>

      {/* ITEMS LIST */}
      <div className="bg-white rounded-[2.5rem] border border-[#e0e5e9] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#e0e5e9]/20 text-[#45828b]/60 text-[9px] font-bold uppercase tracking-[0.25em]">
                <th className="px-8 py-5">SKU / ID</th>
                <th className="px-8 py-5">Item Definition</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Default Pricing</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e5e9]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Indexing Master Nodes...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-[#1bd488]/5 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-[#055b65] font-mono">{item.sku}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-[#055b65]/5 flex items-center justify-center text-[#055b65]">
                            <Database size={16} />
                         </div>
                         <span className="text-sm font-bold text-[#055b65]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-[#45828b] uppercase tracking-widest bg-[#fbfcfc] px-3 py-1 rounded-lg border border-[#e0e5e9]">
                        {item.category || "General"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-[#055b65]">Rs.{item.price.toLocaleString()}</span>
                      <p className="text-[8px] font-bold text-[#45828b]/40 uppercase tracking-tighter">Retail Price</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-[#45828b]/30 hover:text-[#055b65] transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
                <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Define Item Master</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Initializing new component SKU for workshop catalog</p>
             </div>
             
             <form onSubmit={handleCreate} className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Component Name</label>
                   <input 
                     required
                     value={newItem.name}
                     onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                     className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none" 
                     placeholder="e.g. Synthetic Engine Oil"
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">SKU Identifier</label>
                      <input 
                        required
                        value={newItem.sku}
                        onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none font-mono" 
                        placeholder="OIL-001"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Category Node</label>
                      <input 
                        required
                        value={newItem.category}
                        onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none" 
                        placeholder="e.g. Consumables"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Default Unit Price</label>
                      <input 
                        type="number"
                        required
                        value={newItem.price}
                        onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-rose-500/50 uppercase tracking-widest">Low Stock Trigger</label>
                      <input 
                        type="number"
                        required
                        value={newItem.minStock}
                        onChange={(e) => setNewItem({...newItem, minStock: Number(e.target.value)})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-rose-500 outline-none" 
                      />
                   </div>
                </div>

                <div className="pt-6 flex gap-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-[#e0e5e9] text-[#45828b] rounded-2xl font-bold text-xs uppercase tracking-widest">
                     Abort
                   </button>
                   <button type="submit" className="flex-1 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] flex items-center justify-center gap-3">
                     Initialize SKU <ArrowRight size={18} className="text-[#1bd488]" />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
