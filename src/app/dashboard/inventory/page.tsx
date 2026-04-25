"use client";

import { useEffect, useState } from "react";
import { 
  Package, 
  Plus, 
  MoreVertical, 
  AlertTriangle, 
  ArrowRight,
  Database,
  Tag,
  Warehouse,
  History,
  TrendingUp,
  Boxes,
  Filter,
  Pencil,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import ListPagination from "@/components/ui/ListPagination";
import ListToolbar from "@/components/ui/ListToolbar";
import usePaginatedData from "@/hooks/usePaginatedData";

export default function InventoryPage() {
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const res = await fetch("/api/stock/list");
      const data = await res.json();
      if (data.success) setParts(data.data);
    } catch (error) {
      toast.error("Stock synchronization failure");
    } finally {
      setLoading(false);
    }
  };

  const filteredParts = parts.filter(p => {
    const query = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(query) || p.sku?.toLowerCase().includes(query);
  });
  const { page, pageCount, pageSize, paginatedItems, setPage } = usePaginatedData(filteredParts);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER structure matching Quotations */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#d8dee6] rounded-md shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-md"></div>
             <span className="text-[10px] font-bold text-[#263238] uppercase tracking-widest">Stock Control</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#263238] tracking-tight uppercase italic">
            Component <span className="text-[#f59e0b]">Inventory</span>
          </h1>
          <p className="text-[#64748b]/70 text-sm font-medium">Real-time inventory monitor and stock levels management.</p>
        </div>
        
        <Link 
          href="/dashboard/inventory/create"
          className="flex items-center gap-3 px-6 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] transition-all shadow-xl shadow-[#263238]/20"
        >
          <Plus size={18} className="text-[#f59e0b]" />
          Register New Component
        </Link>
      </div>

      {/* ANALYTICS PREVIEW - Luxury standardized cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 border border-[#d8dee6] flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
           <div className="w-14 h-14 rounded-md bg-[#263238] flex items-center justify-center text-[#f59e0b]">
              <Boxes size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.2em]">Total SKU Count</p>
              <p className="text-3xl font-black text-[#263238] tracking-tighter mt-1">{parts.length}</p>
           </div>
        </div>
        <div className="bg-white p-8 border border-[#d8dee6] flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
           <div className="w-14 h-14 rounded-md bg-rose-500 flex items-center justify-center text-white">
              <AlertTriangle size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.2em]">Low Stock Alerts</p>
              <p className="text-3xl font-black text-rose-500 tracking-tighter mt-1">{parts.filter(p => p.stock <= p.minStock).length}</p>
           </div>
        </div>
        <div className="bg-white p-8 border border-[#d8dee6] flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
           <div className="w-14 h-14 rounded-md bg-[#f59e0b] flex items-center justify-center text-[#263238]">
              <TrendingUp size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.2em]">Inventory Valuation</p>
              <p className="text-3xl font-black text-[#263238] tracking-tighter mt-1">₹{parts.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0).toLocaleString()}</p>
           </div>
        </div>
      </div>

      {/* SEARCH structure matching Quotations */}
      <div className="space-y-3">
        <ListToolbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search components by name or SKU..."
          searchClassName="md:max-w-2xl"
          rightSlot={
            <button className="px-6 py-3.5 border border-[#d8dee6] bg-white text-[#263238] font-bold text-xs uppercase tracking-widest rounded-md hover:bg-[#f7f4ef] flex items-center gap-3">
              <Filter size={16} /> Filter
            </button>
          }
        />
      </div>

      {/* STOCK TABLE matching Quotations table style */}
      <div className="bg-white rounded-md border border-[#d8dee6] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f7f4ef]/50 border-b border-[#d8dee6]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Component ID</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Description</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Storage Node</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Availability</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Valuation</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dee6]/30">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#f59e0b]/10 border-t-[#f59e0b] rounded-md animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#64748b]/40 uppercase tracking-widest">Syncing Stock Levels...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <p className="text-sm font-bold text-[#64748b]/40">No components detected in current cluster.</p>
                  </td>
                </tr>
              ) : paginatedItems.map((part) => (
                <tr key={part._id} className="hover:bg-[#f7f4ef]/30 transition-colors group cursor-pointer">
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-[#263238] font-mono tracking-tighter bg-[#263238]/5 px-2 py-1 rounded">
                      {part.sku || "N/A"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                       <p className="text-sm font-black uppercase tracking-tight text-[#263238]">{part.name}</p>
                       <p className="text-[9px] font-bold text-[#64748b]/40 uppercase tracking-widest mt-1">Type: Consumable</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-md bg-[#d8dee6] flex items-center justify-center text-[#263238]">
                          <Warehouse size={14} />
                       </div>
                       <span className="text-[11px] font-bold uppercase tracking-tight text-[#64748b]">{part.location || "Central Bay"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                       <div className="flex items-center justify-between gap-4">
                          <p className={`text-xs font-black uppercase italic ${part.stock <= part.minStock ? 'text-rose-500' : 'text-[#263238]'}`}>
                             {part.stock} Units
                          </p>
                          {part.stock <= part.minStock && (
                            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Critical</span>
                          )}
                       </div>
                       <div className="w-32 h-1.5 bg-[#f7f4ef] border border-[#d8dee6] rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${part.stock <= part.minStock ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-[#f59e0b]'}`}
                            style={{ width: `${Math.min(100, (part.stock / (part.minStock * 2 || 10)) * 100)}%` }}
                          ></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                       <p className="text-sm font-black text-[#263238]">₹{(part.price || 0).toLocaleString()}</p>
                       <p className="text-[8px] font-bold text-[#64748b]/60 uppercase tracking-widest">Rate / Unit</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                       <Link
                         href={`/dashboard/inventory/${part._id}/edit`}
                         className="p-2.5 rounded-md bg-white border border-[#d8dee6] text-[#263238] hover:border-[#263238] transition-all"
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
        <ListPagination page={page} pageCount={pageCount} pageSize={pageSize} total={filteredParts.length} onPageChange={setPage} />
      </div>
    </div>
  );
}
