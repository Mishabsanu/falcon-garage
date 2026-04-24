"use client";

import ListPagination from "@/components/ui/ListPagination";
import ListToolbar from "@/components/ui/ListToolbar";
import usePaginatedData from "@/hooks/usePaginatedData";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  MoreVertical,
  Receipt
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [jobCards, setJobCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newInvoice, setNewInvoice] = useState({
    jobCardId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [iRes, jRes] = await Promise.all([
        fetch("/api/invoices/list"),
        fetch("/api/jobcards/list")
      ]);
      const [iData, jData] = await Promise.all([
        iRes.json(), jRes.json()
      ]);
      
      if (iData.success) setInvoices(iData.data);
      if (jData.success) setJobCards(jData.data);
    } catch (error) {
      toast.error("Financial synchronization failure");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        body: JSON.stringify(newInvoice),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Invoice generated and stock updated");
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Generation failure");
    }
  };

  const downloadPDF = (id: string) => {
    window.open(`/api/invoices/pdf/${id}`, "_blank");
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const query = searchQuery.toLowerCase();
    return (
      invoice.invoiceNumber?.toLowerCase().includes(query) ||
      invoice.customerId?.name?.toLowerCase().includes(query) ||
      invoice.jobCardId?.jobCardNumber?.toLowerCase().includes(query) ||
      invoice.status?.toLowerCase().includes(query)
    );
  });
  const { page, pageCount, pageSize, paginatedItems, setPage } = usePaginatedData(filteredInvoices);

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#d8dee6] rounded-md shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-md"></div>
             <span className="text-[10px] font-bold text-[#263238] uppercase tracking-widest">Financial Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#263238] tracking-tight uppercase italic">
            Invoice <span className="text-[#f59e0b]">Ledger</span>
          </h1>
          <p className="text-[#64748b]/70 text-sm font-medium">Review and manage all financial settlements and billing nodes.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] transition-all shadow-xl shadow-[#263238]/20"
        >
          <Receipt size={18} className="text-[#f59e0b]" />
          Generate Billing Unit
        </button>
      </div>

      <ListToolbar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search invoices by number, customer, job card, or status..."
      />

      {/* INVOICE LIST */}
      <div className="bg-white rounded-md border border-[#d8dee6] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#d8dee6]/20 text-[#64748b]/60 text-[9px] font-bold uppercase tracking-[0.25em]">
                <th className="px-8 py-5">Ledger Key</th>
                <th className="px-8 py-5">Recipient</th>
                <th className="px-8 py-5">Valuation</th>
                <th className="px-8 py-5">Payment State</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dee6]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#f59e0b]/10 border-t-[#f59e0b] rounded-md animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#64748b]/40 uppercase tracking-widest">Auditing Records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-[#64748b]/40">No billing records synchronized in the current period.</p>
                  </td>
                </tr>
              ) : paginatedItems.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-[#f59e0b]/5 transition-colors group cursor-pointer">
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-[#263238]">#{invoice.invoiceNumber}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                       <p className="text-sm font-bold text-[#263238]">{invoice.customerId?.name}</p>
                       <p className="text-[10px] font-bold text-[#64748b]/60 uppercase tracking-tight italic">Ref: Job #{invoice.jobCardId?.jobCardNumber}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-[#263238]">QAR {invoice.grandTotal.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-[#f59e0b] uppercase tracking-tighter mt-1 italic">Balance: QAR {invoice.balanceAmount.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                      invoice.status === 'paid' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' : 
                      invoice.status === 'partial' ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                    }`}>
                      {invoice.status === 'paid' ? <CheckCircle2 size={10} /> : invoice.status === 'partial' ? <Clock size={10} /> : <AlertCircle size={10} />}
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                       <button 
                         onClick={() => downloadPDF(invoice._id)}
                         className="p-2.5 rounded-md bg-[#263238]/5 text-[#263238] hover:bg-[#263238] hover:text-white transition-all shadow-sm"
                       >
                          <Download size={16} />
                       </button>
                       <button className="p-2.5 rounded-md hover:bg-white hover:shadow-md transition-all text-[#64748b]">
                        <MoreVertical size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ListPagination page={page} pageCount={pageCount} pageSize={pageSize} total={filteredInvoices.length} onPageChange={setPage} />
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#263238]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-md shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
             <div className="bg-[#263238] p-8 text-white">
                <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Billing Initialization</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Generate Invoice for Completed Service Order</p>
             </div>
             
             <form onSubmit={handleCreate} className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#263238]/50 uppercase tracking-widest ml-1">Completed Order Node</label>
                   <select 
                     required
                     value={newInvoice.jobCardId}
                     onChange={(e) => setNewInvoice({...newInvoice, jobCardId: e.target.value})}
                     className="w-full px-5 py-4 bg-[#f7f4ef] border border-[#d8dee6] rounded-md text-sm font-bold text-[#263238] outline-none focus:border-[#f59e0b]/50 appearance-none transition-all"
                   >
                     <option value="">Select Completed Job Card...</option>
                     {jobCards.filter(j => j.status === 'completed').map(j => (
                       <option key={j._id} value={j._id}>{j.jobCardNumber} - {j.customerId?.name} ({j.vehicleId?.vehicleNumber})</option>
                     ))}
                   </select>
                </div>

                <div className="p-6 bg-[#f7f4ef] rounded-md border border-[#d8dee6] border-dashed">
                   <p className="text-[10px] font-bold text-[#64748b]/60 uppercase tracking-[0.2em] mb-4">Automation Protocol</p>
                   <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-xs font-bold text-[#263238]">
                         <CheckCircle2 size={14} className="text-[#f59e0b]" />
                         Sync items from Proposal node
                      </li>
                      <li className="flex items-center gap-3 text-xs font-bold text-[#263238]">
                         <CheckCircle2 size={14} className="text-[#f59e0b]" />
                         Calculate Final Valuation
                      </li>
                      <li className="flex items-center gap-3 text-xs font-bold text-[#263238]">
                         <CheckCircle2 size={14} className="text-[#f59e0b]" />
                         Deduct Inventory SKU Levels
                      </li>
                   </ul>
                </div>

                <div className="pt-6 flex gap-4">
                   <button 
                     type="button"
                     onClick={() => setIsModalOpen(false)}
                     className="flex-1 px-6 py-4 border border-[#d8dee6] text-[#64748b] rounded-md font-bold text-xs uppercase tracking-widest hover:bg-[#f7f4ef]"
                   >
                     Abort
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 px-6 py-4 bg-[#263238] text-white rounded-md font-black text-xs uppercase italic tracking-tighter hover:bg-[#64748b] flex items-center justify-center gap-3 shadow-xl shadow-[#263238]/10"
                   >
                     Confirm & Bill <ArrowRight size={18} className="text-[#f59e0b]" />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
