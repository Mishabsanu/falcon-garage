"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FilePlus2,
  Filter,
  Pencil,
  Trash2,
  X,
  XCircle,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import ListPagination from "@/components/ui/ListPagination";
import ListToolbar from "@/components/ui/ListToolbar";
import usePaginatedData from "@/hooks/usePaginatedData";

const statusFilters = ["all", "draft", "approved", "converted", "rejected"];

type QuotationListItem = {
  _id: string;
  quotationNumber?: string;
  customerId?: {
    name?: string;
  };
  vehicleId?: {
    vehicleNumber?: string;
    model?: string;
  };
  grandTotal?: number;
  gstPercent?: number;
  status?: string;
  jobCardId?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/quotations/list");
      const data = await res.json();
      if (data.success) setQuotations(data.data);
    } catch {
      toast.error("Quotation list failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch("/api/quotations/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotationId: id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Approval failed");
      toast.success("Quotation approved");
      fetchData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Approval failed"));
    }
  };

  const handleConvertToJobCard = async (id: string) => {
    try {
      const res = await fetch("/api/jobcards/from-quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotationId: id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Job card creation failed");
      toast.success("Job Card created");
      router.push(`/dashboard/jobcards/${data.data._id}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Job card creation failed"));
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch("/api/quotations/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotationId: id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Rejection failed");
      toast.success("Quotation marked as Rejected");
      fetchData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Rejection failed"));
    }
  };

  const handleBillInspection = async (id: string) => {
    try {
      const res = await fetch("/api/invoices/from-rejection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotationId: id, amount: 250 }), // Default diagnostic fee
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Billing failed");
      toast.success("Inspection Invoice Generated");
      fetchData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Billing failed"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quotation?")) return;

    try {
      const res = await fetch("/api/quotations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");
      toast.success("Quotation deleted");
      fetchData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Delete failed"));
    }
  };

  const filteredQuotations = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return quotations.filter((quote) => {
      const matchesSearch =
        quote.quotationNumber?.toLowerCase().includes(query) ||
        quote.customerId?.name?.toLowerCase().includes(query) ||
        quote.vehicleId?.vehicleNumber?.toLowerCase().includes(query) ||
        quote.status?.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || quote.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchQuery, statusFilter]);

  const { page, pageCount, pageSize, paginatedItems, setPage } = usePaginatedData(filteredQuotations);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 border border-[#d8dee6] bg-white px-3 py-1 shadow-sm">
            <div className="h-1.5 w-1.5 bg-[#f59e0b]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#263238]">Pricing Console</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#263238] uppercase italic">
            Active <span className="text-[#f59e0b]">Estimates</span>
          </h1>
          <p className="text-sm font-medium text-[#64748b]/70">Develop and manage service quotations.</p>
        </div>

        <Link
          href="/dashboard/quotations/new"
          className="inline-flex items-center justify-center gap-3 bg-[#263238] px-6 py-4 text-xs font-black uppercase italic tracking-tight text-white shadow-xl shadow-[#263238]/20 transition-all hover:bg-[#64748b]"
        >
          <FilePlus2 size={18} className="text-[#f59e0b]" />
          New Quotation
        </Link>
      </div>

      <div className="space-y-3">
        <ListToolbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search quotations..."
          searchClassName="md:max-w-md"
          rightSlot={
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className={`inline-flex h-11 w-11 items-center justify-center border transition-all ${
                showFilters
                  ? "border-[#f59e0b] bg-[#f59e0b] text-white"
                  : "border-[#d8dee6] bg-white text-[#263238] hover:bg-[#f7f4ef]"
              }`}
              aria-label="Toggle filters"
            >
              {showFilters ? <X size={18} /> : <Filter size={18} />}
            </button>
          }
        />

        {showFilters && (
          <div className="dashboard-surface flex flex-wrap items-center gap-2 p-4">
            {statusFilters.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === status
                    ? "bg-[#263238] text-white"
                    : "border border-[#d8dee6] bg-white text-[#64748b] hover:text-[#263238]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden border border-[#d8dee6] bg-white shadow-[0_20px_50px_rgba(5,91,101,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Estimate Key</th>
                <th>Customer / Vehicle</th>
                <th>Value</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dee6]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]/40">Loading quotations...</p>
                  </td>
                </tr>
              ) : filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-[#64748b]/40">No quotations found.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((quote) => (
                  <tr key={quote._id}>
                    <td>
                      <span className="text-sm font-bold text-[#263238]">#{quote.quotationNumber}</span>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#263238]">{quote.customerId?.name || "Unknown customer"}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight text-[#64748b]/60">
                          <Car size={12} className="text-[#f59e0b]" />
                          {quote.vehicleId?.vehicleNumber || "No vehicle"} | {quote.vehicleId?.model || "No model"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm font-black text-[#263238]">QAR {Number(quote.grandTotal || 0).toLocaleString()}</p>
                      <p className="mt-1 text-[9px] font-bold uppercase italic tracking-tight text-[#f59e0b]">GST {quote.gstPercent || 0}%</p>
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-2 border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                          quote.status === "approved"
                            ? "border-[#f59e0b]/20 bg-[#f59e0b]/10 text-[#f59e0b]"
                            : quote.status === "rejected"
                              ? "border-rose-100 bg-rose-50 text-rose-500"
                              : quote.status === "billed_inspection"
                                ? "border-emerald-100 bg-emerald-50 text-emerald-500"
                                : "border-[#263238]/20 bg-[#263238]/10 text-[#263238]"
                        }`}
                      >
                        {quote.status === "approved" ? <CheckCircle2 size={10} /> : quote.status === "draft" ? <Clock size={10} /> : quote.status === "billed_inspection" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {quote.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {quote.status === "draft" && (
                          <div className="flex gap-2">
                             <button
                               type="button"
                               onClick={() => handleApprove(quote._id)}
                               className="inline-flex h-10 items-center gap-2 bg-[#f59e0b]/10 px-3 text-[10px] font-black uppercase tracking-widest text-[#f59e0b] transition-all hover:bg-[#f59e0b] hover:text-white"
                             >
                               <CheckCircle2 size={14} />
                               Approve
                             </button>
                             <button
                               type="button"
                               onClick={() => handleReject(quote._id)}
                               className="inline-flex h-10 items-center gap-2 bg-rose-500/10 px-3 text-[10px] font-black uppercase tracking-widest text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
                             >
                               <XCircle size={14} />
                               Reject
                             </button>
                          </div>
                        )}
                        {quote.status === "rejected" && (
                          <button
                            type="button"
                            onClick={() => handleBillInspection(quote._id)}
                            className="inline-flex h-10 items-center gap-2 bg-emerald-500/10 px-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white"
                          >
                            <Wallet size={14} />
                            Bill Inspection
                          </button>
                        )}
                        {quote.status === "approved" && (
                          <button
                            type="button"
                            onClick={() => handleConvertToJobCard(quote._id)}
                            className="inline-flex h-10 items-center gap-2 bg-[#263238] px-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#64748b]"
                          >
                            <ClipboardList size={14} className="text-[#f59e0b]" />
                            Job Card
                          </button>
                        )}
                        {quote.status === "converted" && quote.jobCardId && (
                          <Link
                            href={`/dashboard/jobcards/${quote.jobCardId}`}
                            className="inline-flex h-10 items-center gap-2 border border-[#d8dee6] bg-[#f7f4ef] px-3 text-[10px] font-bold uppercase tracking-widest text-[#263238] transition-all hover:bg-white"
                          >
                            Job Card
                            <ArrowRight size={14} />
                          </Link>
                        )}
                        <Link
                          href={`/dashboard/quotations/${quote._id}/edit`}
                          className="flex h-10 w-10 items-center justify-center bg-[#263238]/5 text-[#263238] transition-all hover:bg-[#263238] hover:text-white"
                          aria-label="Edit quotation"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => window.open(`/api/quotations/pdf/${quote._id}`, "_blank")}
                          className="flex h-10 w-10 items-center justify-center bg-[#263238]/5 text-[#263238] transition-all hover:bg-[#263238] hover:text-white"
                          aria-label="Download quotation PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(quote._id)}
                          className="flex h-10 w-10 items-center justify-center text-rose-500 transition-all hover:bg-rose-50"
                          aria-label="Delete quotation"
                        >
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
        <ListPagination page={page} pageCount={pageCount} pageSize={pageSize} total={filteredQuotations.length} onPageChange={setPage} />
      </div>
    </div>
  );
}
