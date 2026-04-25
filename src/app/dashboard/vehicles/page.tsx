"use client";

import { useEffect, useState } from "react";
import { 
  Car, 
  Plus, 
  User, 
  Tag, 
  Cpu, 
  ArrowRight,
  Filter,
  Zap,
  Pencil,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ListPagination from "@/components/ui/ListPagination";
import ListToolbar from "@/components/ui/ListToolbar";
import usePaginatedData from "@/hooks/usePaginatedData";

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingVehicle, setDeletingVehicle] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const vRes = await fetch("/api/vehicles/list");
      const vData = await vRes.json();
      if (vData.success) setVehicles(vData.data);
    } catch (error) {
      toast.error("Telemetry sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVehicle) return;
    try {
      const res = await fetch("/api/vehicles", {
        method: "DELETE",
        body: JSON.stringify({ id: deletingVehicle._id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Asset deleted");
        setDeletingVehicle(null);
        fetchData();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const query = searchQuery.toLowerCase();
    return v.vehicleNumber.toLowerCase().includes(query) || v.model.toLowerCase().includes(query) || v.brand.toLowerCase().includes(query);
  });
  const { page, pageCount, pageSize, paginatedItems, setPage } = usePaginatedData(filteredVehicles);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER structure matching Quotations */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#d8dee6] rounded-md shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-md"></div>
             <span className="text-[10px] font-bold text-[#263238] uppercase tracking-widest">Asset Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#263238] tracking-tight uppercase italic">
            Machine <span className="text-[#f59e0b]">Inventory</span>
          </h1>
          <p className="text-[#64748b]/70 text-sm font-medium">Track and manage all vehicle nodes registered in the system.</p>
        </div>
        
        <Link 
          href="/dashboard/vehicles/create"
          className="flex items-center gap-3 px-6 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] transition-all shadow-xl shadow-[#263238]/20"
        >
          <Plus size={18} className="text-[#f59e0b]" />
          Register New Asset
        </Link>
      </div>

      {/* SEARCH structure matching Quotations */}
      <div className="space-y-3">
        <ListToolbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search vehicles by registration, brand, or model..."
          searchClassName="md:max-w-2xl"
          rightSlot={
            <button className="px-6 py-3.5 border border-[#d8dee6] bg-white text-[#263238] font-bold text-xs uppercase tracking-widest rounded-md hover:bg-[#f7f4ef] flex items-center gap-3">
              <Filter size={16} /> Filter
            </button>
          }
        />
      </div>

      {/* VEHICLE LIST matching Quotations table style */}
      <div className="bg-white rounded-md border border-[#d8dee6] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f7f4ef]/50 border-b border-[#d8dee6]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Asset Key</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Specification</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Owner Node</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Current State</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dee6]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#f59e0b]/10 border-t-[#f59e0b] rounded-md animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#64748b]/40 uppercase tracking-widest">Scanning Registry...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <p className="text-sm font-bold text-[#64748b]/40">No active assets detected in this cluster.</p>
                  </td>
                </tr>
              ) : paginatedItems.map((vehicle) => (
                <tr key={vehicle._id} className="hover:bg-[#f7f4ef]/30 transition-colors group cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-11 h-11 rounded-md bg-[#263238] flex items-center justify-center text-[#f59e0b] transition-all group-hover:bg-[#f59e0b] group-hover:text-[#263238]">
                          <Car size={18} />
                       </div>
                       <span className="text-sm font-black text-[#263238] uppercase tracking-tighter italic">{vehicle.vehicleNumber}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                       <p className="text-sm font-black uppercase tracking-tight text-[#263238]">{vehicle.brand} {vehicle.model}</p>
                       <p className="text-[9px] font-bold text-[#64748b]/40 uppercase tracking-[0.2em] mt-1">Platform ID: {vehicle._id.slice(-6)}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-md bg-[#d8dee6] flex items-center justify-center text-[#263238] text-[10px] font-black uppercase italic">
                          {vehicle.customerId?.name?.charAt(0) || "U"}
                       </div>
                       <span className="text-[11px] font-bold uppercase tracking-tight text-[#64748b]">{vehicle.customerId?.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f59e0b]/5 text-[#f59e0b] border border-[#f59e0b]/20 text-[9px] font-black uppercase tracking-widest">
                       <Zap size={10} fill="currentColor" /> Active Node
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <Link
                        href={`/dashboard/vehicles/${vehicle._id}/edit`}
                        className="p-2.5 rounded-md bg-white border border-[#d8dee6] text-[#263238] hover:border-[#263238] transition-all"
                        aria-label="Edit vehicle"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingVehicle(vehicle);
                        }}
                        className="p-2.5 rounded-md bg-white border border-[#d8dee6] text-rose-500 hover:border-rose-500 transition-all"
                        aria-label="Delete vehicle"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ListPagination page={page} pageCount={pageCount} pageSize={pageSize} total={filteredVehicles.length} onPageChange={setPage} />
      </div>

      {/* DELETE MODAL */}
      {deletingVehicle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#263238]/60 backdrop-blur-sm" onClick={() => setDeletingVehicle(null)}></div>
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-md bg-white shadow-2xl">
            <div className="bg-rose-500 p-7 text-white">
              <h3 className="text-lg font-black uppercase tracking-tight italic">Purge Sequence</h3>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/75">De-registering {deletingVehicle.vehicleNumber} from the registry.</p>
            </div>
            <div className="flex gap-4 p-7">
              <button onClick={() => setDeletingVehicle(null)} className="flex-1 rounded-md border border-[#d8dee6] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#64748b] hover:bg-[#f7f4ef]">
                Abort
              </button>
              <button onClick={handleDelete} className="flex-1 rounded-md bg-rose-500 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20">
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

