"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  Plus, 
  MoreVertical, 
  ArrowRight,
  User,
  Phone,
  Filter,
  Pencil,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import ListPagination from "@/components/ui/ListPagination";
import ListToolbar from "@/components/ui/ListToolbar";
import usePaginatedData from "@/hooks/usePaginatedData";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/vendors/list");
      const data = await res.json();
      if (data.success) setVendors(data.data);
    } catch (error) {
      toast.error("Supplier registry sync failure");
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    const query = searchQuery.toLowerCase();
    return (
      vendor.name?.toLowerCase().includes(query) ||
      vendor.contactPerson?.toLowerCase().includes(query) ||
      vendor.category?.toLowerCase().includes(query)
    );
  });
  const { page, pageCount, pageSize, paginatedItems, setPage } = usePaginatedData(filteredVendors);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER structure matching Quotations */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#d8dee6] rounded-md shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-md"></div>
             <span className="text-[10px] font-bold text-[#263238] uppercase tracking-widest">Procurement Node</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#263238] tracking-tight uppercase italic">
            Supplier <span className="text-[#f59e0b]">Directory</span>
          </h1>
          <p className="text-[#64748b]/70 text-sm font-medium">Manage your network of parts suppliers and service providers.</p>
        </div>
        
        <Link 
          href="/dashboard/vendors/create"
          className="flex items-center gap-3 px-6 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] transition-all shadow-xl shadow-[#263238]/20"
        >
          <Plus size={18} className="text-[#f59e0b]" />
          Onboard New Vendor
        </Link>
      </div>

      {/* SEARCH structure matching Quotations */}
      <div className="space-y-3">
        <ListToolbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search suppliers by name, representative, or category..."
          searchClassName="md:max-w-2xl"
          rightSlot={
            <button className="px-6 py-3.5 border border-[#d8dee6] bg-white text-[#263238] font-bold text-xs uppercase tracking-widest rounded-md hover:bg-[#f7f4ef] flex items-center gap-3">
              <Filter size={16} /> Filter
            </button>
          }
        />
      </div>

      {/* VENDOR LIST matching Quotations table style */}
      <div className="bg-white rounded-md border border-[#d8dee6] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f7f4ef]/50 border-b border-[#d8dee6]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Business Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Contact Matrix</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Category</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">GSTIN</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dee6]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#f59e0b]/10 border-t-[#f59e0b] rounded-md animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#64748b]/40 uppercase tracking-widest">Indexing Suppliers...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <p className="text-sm font-bold text-[#64748b]/40">No supplier records match your search.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-[#f7f4ef]/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-md bg-[#263238] flex items-center justify-center text-[#f59e0b] transition-all group-hover:scale-110 shadow-lg shadow-[#263238]/10">
                            <Building2 size={16} />
                         </div>
                         <div>
                            <p className="text-sm font-black uppercase tracking-tight text-[#263238]">{vendor.name}</p>
                            <p className="text-[9px] font-bold text-[#64748b]/40 uppercase tracking-widest mt-1 italic">{vendor.address?.slice(0, 30)}...</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                         <div className="flex items-center gap-2">
                            <User size={12} className="text-[#f59e0b]" />
                            <p className="text-xs font-black text-[#263238] uppercase tracking-tight">{vendor.contactPerson}</p>
                         </div>
                         <div className="flex items-center gap-2">
                            <Phone size={12} className="text-[#64748b]/40" />
                            <p className="text-[10px] font-bold text-[#64748b]">{vendor.phone}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[9px] font-black text-[#263238] uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-[#d8dee6] shadow-sm">
                        {vendor.category || "General Supply"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-[#263238] font-mono tracking-tighter bg-[#263238]/5 px-2 py-1 rounded">
                        {vendor.gstNumber || "UNREGISTERED"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                         <Link
                           href={`/dashboard/vendors/${vendor._id}/edit`}
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
                ))
              )}
            </tbody>
          </table>
        </div>
        <ListPagination page={page} pageCount={pageCount} pageSize={pageSize} total={filteredVendors.length} onPageChange={setPage} />
      </div>
    </div>
  );
}
