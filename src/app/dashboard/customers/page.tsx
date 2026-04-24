"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Plus, 
  Phone, 
  MapPin, 
  Mail, 
  ArrowRight,
  Filter,
  UserPlus,
  Pencil,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ListPagination from "@/components/ui/ListPagination";
import ListToolbar from "@/components/ui/ListToolbar";
import usePaginatedData from "@/hooks/usePaginatedData";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingCustomer, setDeletingCustomer] = useState<any | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers/list");
      const data = await res.json();
      if (data.success) setCustomers(data.data);
    } catch (error) {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    try {
      const res = await fetch("/api/customers", {
        method: "DELETE",
        body: JSON.stringify({ id: deletingCustomer._id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Customer deleted");
        setDeletingCustomer(null);
        fetchCustomers();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(query) || c.phone.includes(query);
  });
  const { page, pageCount, pageSize, paginatedItems, setPage } = usePaginatedData(filteredCustomers);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER structure matching Quotations */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#d8dee6] rounded-md shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-md"></div>
             <span className="text-[10px] font-bold text-[#263238] uppercase tracking-widest">Database Node</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#263238] tracking-tight uppercase italic">
            Customer <span className="text-[#f59e0b]">Directory</span>
          </h1>
          <p className="text-[#64748b]/70 text-sm font-medium">Manage and synchronize customer profiles across the system.</p>
        </div>
        
        <Link 
          href="/dashboard/customers/create"
          className="flex items-center gap-3 px-6 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] transition-all shadow-xl shadow-[#263238]/20"
        >
          <UserPlus size={18} className="text-[#f59e0b]" />
          Enroll New Customer
        </Link>
      </div>

      {/* SEARCH & FILTERS structure matching Quotations */}
      <div className="space-y-3">
        <ListToolbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search customers by name or phone..."
          searchClassName="md:max-w-2xl"
          rightSlot={
            <button className="px-6 py-3.5 border border-[#d8dee6] bg-white text-[#263238] font-bold text-xs uppercase tracking-widest rounded-md hover:bg-[#f7f4ef] flex items-center gap-3">
              <Filter size={16} /> Filter
            </button>
          }
        />
      </div>

      {/* CUSTOMER LIST matching Quotations table style */}
      <div className="bg-white rounded-md border border-[#d8dee6] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f7f4ef]/50 border-b border-[#d8dee6]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Ident Node</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Profile Detail</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Access Channel</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Asset Type</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dee6]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#f59e0b]/10 border-t-[#f59e0b] rounded-md animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#64748b]/40 uppercase tracking-widest">Querying Nodes...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <p className="text-sm font-bold text-[#64748b]/40">No records synchronized with the system.</p>
                  </td>
                </tr>
              ) : paginatedItems.map((customer) => (
                <tr 
                  key={customer._id} 
                  className="hover:bg-[#f7f4ef]/30 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6" onClick={() => window.location.href = `/dashboard/customers/${customer._id}`}>
                    <span className="text-sm font-bold text-[#263238]">#{customer.customerNumber}</span>
                  </td>
                  <td className="px-8 py-6" onClick={() => window.location.href = `/dashboard/customers/${customer._id}`}>
                    <div className="flex items-center gap-4">
                       <div className="w-11 h-11 rounded-md bg-[#263238] flex items-center justify-center text-white font-black text-sm uppercase italic transition-all group-hover:bg-[#f59e0b] group-hover:text-[#263238]">
                          {customer.name.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-black uppercase tracking-tight text-[#263238]">{customer.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-[#64748b]/60 mt-1 font-bold">
                             <MapPin size={12} className="text-[#f59e0b]" />
                             <span className="truncate max-w-[150px]">{customer.address}</span>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6" onClick={() => window.location.href = `/dashboard/customers/${customer._id}`}>
                    <div className="space-y-1.5">
                       <div className="flex items-center gap-2 text-xs font-black text-[#263238]">
                          <Phone size={14} className="text-[#f59e0b]" />
                          {customer.phone}
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748b]/60">
                          <Mail size={12} />
                          {customer.email || "N/A"}
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6" onClick={() => window.location.href = `/dashboard/customers/${customer._id}`}>
                    <span className={`inline-flex items-center px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border ${
                      customer.customerType === 'credit' ? 'bg-[#263238]/10 text-[#263238] border-[#263238]/20' : 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20'
                    }`}>
                      {customer.customerType}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/dashboard/customers/${customer._id}/edit`}
                        className="p-2.5 rounded-md bg-white border border-[#d8dee6] text-[#263238] hover:border-[#263238] transition-all"
                        aria-label="Edit customer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeletingCustomer(customer);
                        }}
                        className="p-2.5 rounded-md bg-white border border-[#d8dee6] text-rose-500 hover:border-rose-500 transition-all"
                        aria-label="Delete customer"
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
        <ListPagination page={page} pageCount={pageCount} pageSize={pageSize} total={filteredCustomers.length} onPageChange={setPage} />
      </div>

      {/* DELETE MODAL */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#263238]/60 backdrop-blur-sm" onClick={() => setDeletingCustomer(null)}></div>
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-md bg-white shadow-2xl">
            <div className="bg-rose-500 p-7 text-white">
              <h3 className="text-lg font-black uppercase tracking-tight italic">Purge Sequence</h3>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/75">De-enrolling {deletingCustomer.name} from the core directory.</p>
            </div>
            <div className="flex gap-4 p-7">
              <button onClick={() => setDeletingCustomer(null)} className="flex-1 rounded-md border border-[#d8dee6] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#64748b] hover:bg-[#f7f4ef]">
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

