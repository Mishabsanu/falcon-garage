"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type QuoteItem = {
  partId: string;
  name: string;
  qty: number;
  price: number;
};

type QuoteFormState = {
  customerId: string;
  vehicleId: string;
  items: QuoteItem[];
  laborCost: number;
  gstPercent: number;
  discount: number;
};

type ApiEntity = {
  _id: string;
  [key: string]: unknown;
};

type SelectableVehicle = ApiEntity & {
  customerId?: string | ApiEntity;
  vehicleNumber?: string;
  make?: string;
  model?: string;
  year?: number | string;
};

type SelectableCustomer = ApiEntity & {
  name?: string;
  phone?: string;
};

type SelectablePart = ApiEntity & {
  name?: string;
  stock?: number;
  price?: number;
};

const emptyQuote: QuoteFormState = {
  customerId: "",
  vehicleId: "",
  items: [{ partId: "", name: "", qty: 1, price: 0 }],
  laborCost: 0,
  gstPercent: 18,
  discount: 0,
};

function getId(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value) {
    return String((value as ApiEntity)._id || "");
  }
  return "";
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function normalizeQuote(quote: {
  customerId?: unknown;
  vehicleId?: unknown;
  items?: Array<{ partId?: unknown; name?: string; qty?: number; price?: number }>;
  laborCost?: number;
  gstPercent?: number;
  discount?: number;
}): QuoteFormState {
  return {
    customerId: getId(quote.customerId),
    vehicleId: getId(quote.vehicleId),
    items: quote.items?.length
      ? quote.items.map((item) => ({
        partId: getId(item.partId) || (item.name ? "custom" : ""),
        name: item.name || "",
        qty: Number(item.qty || 1),
        price: Number(item.price || 0),
      }))
      : emptyQuote.items,
    laborCost: Number(quote.laborCost || 0),
    gstPercent: Number(quote.gstPercent ?? 18),
    discount: Number(quote.discount || 0),
  };
}

export default function QuotationForm({
  quotationId,
  mode,
}: {
  quotationId?: string;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteFormState>(emptyQuote);
  const [customers, setCustomers] = useState<SelectableCustomer[]>([]);
  const [vehicles, setVehicles] = useState<SelectableVehicle[]>([]);
  const [parts, setParts] = useState<SelectablePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = [
          fetch("/api/customers/list"),
          fetch("/api/vehicles/list"),
          fetch("/api/stock/list"),
        ];

        if (quotationId) {
          requests.push(fetch(`/api/quotations/${quotationId}`));
        }

        const responses = await Promise.all(requests);
        const data = await Promise.all(responses.map((res) => res.json()));

        if (data[0].success) setCustomers(data[0].data);
        if (data[1].success) setVehicles(data[1].data);
        if (data[2].success) setParts(data[2].data);
        if (quotationId && data[3]?.success) setQuote(normalizeQuote(data[3].data));
      } catch {
        toast.error("Quotation form data failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quotationId]);

  const totals = useMemo(() => {
    const itemsTotal = quote.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const subtotal = itemsTotal + Number(quote.laborCost || 0);
    const gstAmount = subtotal * (Number(quote.gstPercent || 0) / 100);
    const grandTotal = subtotal + gstAmount - Number(quote.discount || 0);
    return { itemsTotal, subtotal, gstAmount, grandTotal };
  }, [quote]);

  const customerVehicles = vehicles.filter((vehicle) => getId(vehicle.customerId) === quote.customerId);

  const updateItem = (index: number, item: Partial<QuoteItem>) => {
    const items = [...quote.items];
    items[index] = { ...items[index], ...item };
    setQuote({ ...quote, items });
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    setSaving(true);

    const payload = {
      ...quote,
      ...totals,
      items: quote.items.map((item) => ({
        ...item,
        partId: item.partId === "custom" || item.partId === "" ? undefined : item.partId,
      })),
    };

    try {
      const res = await fetch("/api/quotations", {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "edit" ? { id: quotationId, ...payload } : payload),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Quotation save failed");
      }

      toast.success(mode === "edit" ? "Quotation updated" : "Quotation drafted");
      router.push("/dashboard/quotations");
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Quotation save failed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-600"></div>
      </div>
    );
  }

  if (showPreview) {
    const selectedCustomer = customers.find(c => c._id === quote.customerId);
    const selectedVehicle = vehicles.find(v => v._id === quote.vehicleId);

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
        {/* Preview Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md border border-slate-200">
          <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors w-full sm:w-auto justify-center">
            <ArrowLeft size={16} /> Edit Details
          </button>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button onClick={() => handleSubmit()} disabled={saving} className="flex-1 sm:flex-none flex items-center gap-2 text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-600 px-8 py-2 rounded-md transition-all shadow-sm justify-center disabled:opacity-70">
              {saving ? "Processing..." : "Confirm & Save"} <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* A4 Digital Replica */}
        <div className="bg-white shadow-2xl border border-slate-200 min-h-[1056px] w-full max-w-[816px] mx-auto text-slate-800 relative overflow-hidden font-sans">
          
          {/* Top Brand Bars */}
          <div className="h-4 bg-slate-800 w-full" />
          <div className="h-1.5 bg-amber-500 w-full" />

          <div className="p-12">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-12">
              <div className="pt-4">
                <img src="/logo-1.png" alt="Logo" className="h-16 w-auto object-contain opacity-90" />
              </div>
              <div className="text-right">
                <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">FALCON PLUS GARAGE W.L.L</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Industrial Area, Street 24, Doha - Qatar</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">VAT ID: 300012345600003 | CR No: 210580</p>
                <p className="text-[10px] text-slate-400 font-medium">Mob: +974 7072 7121 | Tel: +974 3074 0770</p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-1 uppercase">Service Quotation</h2>
              <div className="h-1 w-16 bg-amber-500 rounded-full" />
            </div>

            {/* Partitioned Details Section */}
            <div className="flex gap-10 mb-12 relative">
              {/* Left: Client */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">Client Details</h3>
                  <p className="text-lg font-black text-slate-800 leading-tight">
                    {selectedCustomer ? selectedCustomer.name : "Valued Customer"}
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    Contact: {selectedCustomer?.phone || "N/A"}
                  </p>
                </div>
                <div className="pt-2">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Vehicle Asset</h3>
                  <p className="text-sm font-black text-slate-700">
                    {selectedVehicle ? `${selectedVehicle.vehicleNumber} (${selectedVehicle.model})` : "No vehicle assigned"}
                  </p>
                </div>
              </div>

              {/* Vertical Partition */}
              <div className="w-[2px] bg-amber-500/30 self-stretch rounded-full" />

              {/* Right: Quotation Info */}
              <div className="flex-1">
                <h3 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-3">Document Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs border-b border-slate-100 pb-1">
                    <span className="font-bold text-slate-400">Reference:</span>
                    <span className="font-black text-slate-800">{quotationId ? `QTN-${quotationId.slice(-6).toUpperCase()}` : 'DRAFT-NEW'}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-100 pb-1">
                    <span className="font-bold text-slate-400">Issued On:</span>
                    <span className="font-bold text-slate-700">{new Date().toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-100 pb-1">
                    <span className="font-bold text-slate-400">Valid For:</span>
                    <span className="font-bold text-slate-700">07 Working Days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Table */}
            <table className="w-full mb-10 border-collapse">
              <thead>
                <tr className="bg-slate-800">
                  <th className="py-3 px-4 text-center text-[10px] font-black text-white uppercase tracking-widest w-12 border-r border-slate-700">#</th>
                  <th className="py-3 px-6 text-left text-[10px] font-black text-white uppercase tracking-widest">Service / Parts Description</th>
                  <th className="py-3 px-4 text-center text-[10px] font-black text-white uppercase tracking-widest w-20">Qty</th>
                  <th className="py-3 px-6 text-right text-[10px] font-black text-white uppercase tracking-widest w-32">Amount (QAR)</th>
                </tr>
              </thead>
              <tbody className="border-x border-b border-slate-100">
                {quote.items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="py-4 px-4 text-xs text-center font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-800">{item.name || 'Service Component'}</td>
                    <td className="py-4 px-4 text-sm text-center font-medium text-slate-600">{item.qty}</td>
                    <td className="py-4 px-6 text-sm text-right font-black text-slate-900">{(item.qty * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {Number(quote.laborCost) > 0 && (
                  <tr className="bg-slate-50">
                    <td className="py-4 px-4 text-xs text-center font-bold text-slate-400 border-r border-slate-100">{quote.items.length + 1}</td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-800 italic">Labor & Technical Service Charges</td>
                    <td className="py-4 px-4 text-sm text-center font-medium text-slate-600">1</td>
                    <td className="py-4 px-6 text-sm text-right font-black text-slate-900">{Number(quote.laborCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Footer Summary */}
            <div className="flex justify-between items-end gap-10">
              <div className="flex-1">
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Service Terms</h4>
                <ul className="text-[10px] text-slate-400 space-y-1.5 font-medium">
                  <li className="flex gap-2"><span>•</span> Valid for 7 working days from issued date.</li>
                  <li className="flex gap-2"><span>•</span> 50% advance required for special order parts.</li>
                  <li className="flex gap-2"><span>•</span> Not responsible for items left in vehicles.</li>
                </ul>
              </div>

              <div className="w-64 bg-slate-900 p-6 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500" />
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                </div>
                <div className="text-2xl font-black text-white tracking-tighter">
                  QAR {totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[9px] font-bold text-amber-500 mt-1">VAT Inclusive ({quote.gstPercent}%)</p>
              </div>
            </div>

            {/* Signature Area */}
            <div className="mt-20 flex justify-between gap-20">
              <div className="flex-1 border-t border-slate-100 pt-3 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Customer Acceptance</p>
              </div>
              <div className="flex-1 border-t border-slate-100 pt-3 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Authorized Signatory</p>
              </div>
            </div>
          </div>

          {/* Page Footer Accent */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-800" />
          <div className="absolute bottom-8 left-0 right-0 h-1 bg-amber-500" />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/quotations" className="p-2 bg-white rounded-md border border-slate-200 shadow-sm text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {mode === "edit" ? "Edit Quotation" : "Create New Quotation"}
          </h1>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setShowPreview(true); }} className="w-full bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden flex flex-col">

        {/* Full Width Top Section: Client & Vehicle */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 border-b border-slate-200 bg-slate-50/50">
          <div className="p-8 border-b xl:border-b-0 xl:border-r border-slate-200">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Client Information</label>
            <select
              required
              value={quote.customerId}
              onChange={(event) => setQuote({ ...quote, customerId: event.target.value, vehicleId: "" })}
              className="w-full appearance-none bg-white border border-slate-200 rounded-md px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
            >
              <option value="">Select customer account...</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} ({customer.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="p-8">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Vehicle Information</label>
            <select
              required
              value={quote.vehicleId}
              onChange={(event) => setQuote({ ...quote, vehicleId: event.target.value })}
              className="w-full appearance-none bg-white border border-slate-200 rounded-md px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer disabled:opacity-50 disabled:bg-slate-50"
              disabled={!quote.customerId}
            >
              <option value="">Select registered vehicle...</option>
              {customerVehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.vehicleNumber} ({vehicle.model})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Full Width Table Section */}
        <div className="w-full overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200">
                <th className="py-4 px-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider w-16">#</th>
                <th className="py-4 px-8 text-xs font-bold text-slate-600 uppercase tracking-wider">Line Item Details</th>
                <th className="py-4 px-8 text-center text-xs font-bold text-slate-600 uppercase tracking-wider w-40">Quantity</th>
                <th className="py-4 px-8 text-right text-xs font-bold text-slate-600 uppercase tracking-wider w-56">Unit Price</th>
                <th className="py-4 px-8 text-right text-xs font-bold text-slate-600 uppercase tracking-wider w-56">Total Amount</th>
                <th className="py-4 px-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quote.items.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 align-top pt-6 text-center font-bold text-slate-400">{index + 1}</td>
                  <td className="py-4 px-8 align-top">
                    <div className="flex flex-col gap-2">
                      <select
                        required
                        value={item.partId}
                        onChange={(event) => {
                          const selectedPart = parts.find((part) => part._id === event.target.value);
                          updateItem(index, {
                            partId: event.target.value,
                            name: selectedPart?.name || "",
                            price: selectedPart?.price || 0,
                          });
                        }}
                        className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none focus:text-amber-600 transition-colors cursor-pointer py-2"
                      >
                        <option value="">Select item from inventory...</option>
                        {parts.map((part) => (
                          <option key={part._id} value={part._id}>
                            {part.name} (Stock: {part.stock} | Rs.{part.price})
                          </option>
                        ))}
                        <option value="custom">Custom Service / Manual Entry</option>
                      </select>
                      {item.partId === "custom" && (
                        <input
                          required
                          value={item.name}
                          onChange={(event) => updateItem(index, { name: event.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-sm"
                          placeholder="Enter service description..."
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-8 align-top pt-5">
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.qty}
                      onChange={(event) => updateItem(index, { qty: Number(event.target.value) })}
                      className="w-full text-center bg-white border border-slate-200 rounded-md px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-sm"
                    />
                  </td>
                  <td className="py-4 px-8 align-top pt-5">
                    <input
                      type="number"
                      min="0"
                      required
                      value={item.price}
                      onChange={(event) => updateItem(index, { price: Number(event.target.value) })}
                      className="w-full text-right bg-white border border-slate-200 rounded-md px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-sm"
                    />
                  </td>
                  <td className="py-4 px-8 align-top text-right pt-7 text-sm font-bold text-slate-800">
                    Rs. {(item.qty * item.price).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 align-top pt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setQuote({ ...quote, items: quote.items.filter((_, itemIndex) => itemIndex !== index) })}
                      disabled={quote.items.length === 1}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center px-8">
            <button
              type="button"
              onClick={() => setQuote({ ...quote, items: [...quote.items, { partId: "", name: "", qty: 1, price: 0 }] })}
              className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-4 py-2 rounded-md transition-colors"
            >
              <Plus size={16} /> Add Another Row
            </button>
          </div>
        </div>

        {/* Full Width Bottom Section: Summary & Adjustments Stacked */}
        <div className="bg-slate-50 flex justify-end">

          {/* Bill Section Block */}
          <div className="w-full md:w-[450px] p-8 space-y-4 border-l border-slate-200 bg-white shadow-[inset_4px_0_10px_-4px_rgba(0,0,0,0.02)]">

            <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
              <span>Items Subtotal</span>
              <span>Rs. {totals.itemsTotal.toLocaleString()}</span>
            </div>

            {/* Labor Cost Inside Bill Section */}
            <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
              <span className="flex items-center">Labor Cost</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">Rs.</span>
                <input
                  type="number"
                  min="0"
                  value={quote.laborCost}
                  onChange={(event) => setQuote({ ...quote, laborCost: Number(event.target.value) })}
                  className="w-24 text-right bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* GST Tax Inside Bill Section */}
            <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
              <span className="flex items-center">GST Tax</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={quote.gstPercent}
                  onChange={(event) => setQuote({ ...quote, gstPercent: Number(event.target.value) })}
                  className="w-16 text-right bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
                <span className="text-slate-400 text-xs">%</span>
              </div>
            </div>

            {/* Discount Inside Bill Section */}
            <div className="flex justify-between items-center text-sm font-semibold text-emerald-600">
              <span className="flex items-center text-slate-600">Discount</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-xs">Rs.</span>
                <input
                  type="number"
                  min="0"
                  value={quote.discount}
                  onChange={(event) => setQuote({ ...quote, discount: Number(event.target.value) })}
                  className="w-24 text-right bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-sm font-bold text-emerald-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-5 mt-5 flex justify-between items-end">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Grand Total</span>
              <span className="text-3xl font-black text-slate-800 tracking-tight">Rs. {totals.grandTotal.toLocaleString()}</span>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold uppercase tracking-wider text-xs py-4 rounded-md shadow-sm transition-all flex items-center justify-center gap-2"
              >
                Review PDF
              </button>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={saving}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-wider text-xs py-4 rounded-md shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
              >
                {saving ? "Saving..." : "Save Directly"}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
