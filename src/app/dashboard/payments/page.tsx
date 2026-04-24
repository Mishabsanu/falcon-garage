"use client";

import { useEffect, useState } from "react";
import { 
  Wallet, 
  Plus, 
  MoreVertical, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Calendar,
  Receipt
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ListPagination from "@/components/ui/ListPagination";
import ListToolbar from "@/components/ui/ListToolbar";
import usePaginatedData from "@/hooks/usePaginatedData";
import { Filter, Pencil, Trash2 } from "lucide-react";

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pRes = await fetch("/api/payments/list");
      const pData = await pRes.json();
      if (pData.success) setPayments(pData.data);
    } catch (error) {
      toast.error("Collection synchronization failure");
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'upi': return <Smartphone size={16} className="text-[#f59e0b]" />;
      case 'card': return <CreditCard size={16} className="text-[#263238]" />;
      case 'bank': return <Building2 size={16} className="text-[#64748b]" />;
      default: return <Banknote size={16} className="text-[#f59e0b]" />;
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const query = searchQuery.toLowerCase();
    return (
      payment.invoiceId?.invoiceNumber?.toLowerCase().includes(query) ||
      payment.method?.toLowerCase().includes(query) ||
      payment.note?.toLowerCase().includes(query)
    );
  });
  const { page, pageCount, pageSize, paginatedItems, setPage } = usePaginatedData(filteredPayments);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER structure matching Quotations */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#d8dee6] rounded-md shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-md"></div>
             <span className="text-[10px] font-bold text-[#263238] uppercase tracking-widest">Revenue Node</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#263238] tracking-tight uppercase italic">
            Payment <span className="text-[#f59e0b]">Settlements</span>
          </h1>
          <p className="text-[#64748b]/70 text-sm font-medium">Synchronize and audit all incoming financial transactions and collections.</p>
        </div>
        
        <Link 
          href="/dashboard/payments/new"
          className="flex items-center gap-3 px-6 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] transition-all shadow-xl shadow-[#263238]/20"
        >
          <Plus size={18} className="text-[#f59e0b]" />
          Record New Collection
        </Link>
      </div>

      {/* SEARCH structure matching Quotations */}
      <div className="space-y-3">
        <ListToolbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search payments by invoice, method, or note..."
          searchClassName="md:max-w-2xl"
          rightSlot={
            <button className="px-6 py-3.5 border border-[#d8dee6] bg-white text-[#263238] font-bold text-xs uppercase tracking-widest rounded-md hover:bg-[#f7f4ef] flex items-center gap-3">
              <Filter size={16} /> Filter
            </button>
          }
        />
      </div>

      {/* TRANSACTION LIST matching Quotations table style */}
      <div className="bg-white rounded-md border border-[#d8dee6] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f7f4ef]/50 border-b border-[#d8dee6]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Transaction Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Source Node (Invoice)</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Settlement Channel</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Valuation</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.25em] text-[#64748b]">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dee6]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#f59e0b]/10 border-t-[#f59e0b] rounded-md animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#64748b]/40 uppercase tracking-widest">Auditing Transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <p className="text-sm font-bold text-[#64748b]/40">No transactions recorded in the current cluster.</p>
                  </td>
                </tr>
              ) : paginatedItems.map((payment) => (
                <tr key={payment._id} className="hover:bg-[#f7f4ef]/30 transition-colors group cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <Calendar size={14} className="text-[#64748b]/40" />
                       <span className="text-xs font-black text-[#263238] uppercase tracking-tight">
                         {new Date(payment.paidAt).toLocaleDateString()} <span className="text-[#64748b]/40 font-bold ml-1">{new Date(payment.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-md bg-[#263238]/5 flex items-center justify-center text-[#f59e0b]">
                          <Receipt size={14} />
                       </div>
                       <span className="text-sm font-black text-[#263238] hover:underline transition-all">#{payment.invoiceId?.invoiceNumber || "INV-???"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 px-3 py-2 bg-white border border-[#d8dee6] rounded shadow-sm w-fit group-hover:border-[#263238] transition-all">
                       {getMethodIcon(payment.method)}
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#263238]">{payment.method}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                       <p className="text-sm font-black text-[#263238] italic">QAR {payment.amount.toLocaleString()}</p>
                       <p className="text-[8px] font-bold text-[#64748b]/40 uppercase tracking-widest">Settled Amount</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Link
                         href={`/dashboard/payments/${payment._id}/edit`}
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
        <ListPagination page={page} pageCount={pageCount} pageSize={pageSize} total={filteredPayments.length} onPageChange={setPage} />
      </div>
    </div>
  );
}

