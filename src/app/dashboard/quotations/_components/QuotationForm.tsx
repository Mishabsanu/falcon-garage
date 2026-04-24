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
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        {/* Preview Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors w-full sm:w-auto justify-center">
            <ArrowLeft size={16} /> Back to Edit Form
          </button>
          <button onClick={() => handleSubmit()} disabled={saving} className="flex items-center gap-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 px-8 py-2 rounded-md transition-all shadow-sm w-full sm:w-auto justify-center disabled:opacity-70">
            {saving ? "Saving..." : "Confirm & Save Quotation"} <ArrowRight size={16} />
          </button>
        </div>

        {/* A4 Paper PDF Preview */}
        <div className="bg-white p-12 shadow-2xl border border-slate-200 min-h-[1056px] max-w-[816px] mx-auto text-slate-800 relative">

          {/* Document Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-6">
              <img src="/logo.jpeg" alt="Falcon Garage Logo" className="h-24 w-auto object-contain rounded-md" />
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">FALCON GARAGE</h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">Vehicle Maintenance & Repair</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-light text-amber-500 uppercase tracking-widest">{mode === 'edit' ? 'Quotation' : 'Estimate'}</h2>
              <div className="mt-2 text-sm text-slate-500">
                <span className="font-bold text-slate-800">Date:</span> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                <span className="font-bold text-slate-800">Ref No:</span> {quotationId ? quotationId.slice(-6).toUpperCase() : 'DRAFT-XXXX'}
              </div>
            </div>
          </div>

          {/* Company Info Bar */}
          <div className="bg-slate-50 border-y border-slate-200 py-3 px-4 mb-8 flex justify-between text-xs text-slate-600">
            <span>📍 123 Industrial Auto Park, Dubai, UAE</span>
            <span>📞 +971 50 123 4567</span>
            <span>✉️ info@falcongarage.com</span>
            <span className="font-bold">TRN: 10029394859</span>
          </div>

          {/* Client & Vehicle Meta Boxes */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm">
              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Bill To</h3>
              {selectedCustomer ? (
                <div className="space-y-1">
                  <p className="font-black text-slate-800 text-lg">{selectedCustomer.name}</p>
                  <p className="text-sm text-slate-600 font-medium">Contact: {selectedCustomer.phone}</p>
                </div>
              ) : (
                <p className="text-sm italic text-rose-500">No client selected</p>
              )}
            </div>
            <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm">
              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Vehicle Details</h3>
              {selectedVehicle ? (
                <div className="space-y-1">
                  <p className="font-black text-slate-800 text-lg tracking-wider">{selectedVehicle.vehicleNumber}</p>
                  <p className="text-sm text-slate-600 font-medium">{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})</p>
                </div>
              ) : (
                <p className="text-sm italic text-rose-500">No vehicle selected</p>
              )}
            </div>
          </div>

          {/* Preview Table */}
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider w-12 border border-slate-800">#</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider border border-slate-800">Service / Part Description</th>
                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider w-24 border border-slate-800">Qty</th>
                <th className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider w-32 border border-slate-800">Rate (Rs)</th>
                <th className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider w-32 border border-slate-800">Amount (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, idx) => (
                <tr key={idx} className="even:bg-slate-50">
                  <td className="py-4 px-4 text-sm text-center text-slate-500 border border-slate-200">{idx + 1}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-800 border border-slate-200">{item.name || 'Unnamed Service'}</td>
                  <td className="py-4 px-4 text-sm text-center border border-slate-200">{Number(item.qty)}</td>
                  <td className="py-4 px-4 text-sm text-right border border-slate-200">{Number(item.price).toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm text-right font-black border border-slate-200">{(Number(item.qty) * Number(item.price)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Preview Totals & Terms */}
          <div className="flex justify-between items-start mt-12 pb-24">

            {/* Terms */}
            <div className="w-1/2 pr-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Terms & Conditions</h4>
              <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4">
                <li>Quotation is valid for 15 days from the date of issue.</li>
                <li>Any additional parts required during repair will be charged separately upon approval.</li>
                <li>Vehicles must be collected within 3 days of completion.</li>
              </ul>

              <div className="mt-16 pt-4 border-t border-slate-300 w-48 text-center">
                <p className="text-xs font-bold text-slate-600">Authorized Signature</p>
              </div>
            </div>

            {/* Financials */}
            <div className="w-72 bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-bold">Subtotal</span>
                  <span className="font-medium">{totals.itemsTotal.toLocaleString()}</span>
                </div>
                {Number(quote.laborCost) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 font-bold">Labor Cost</span>
                    <span className="font-medium">{Number(quote.laborCost).toLocaleString()}</span>
                  </div>
                )}
                {Number(quote.gstPercent) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 font-bold">GST ({quote.gstPercent}%)</span>
                    <span className="font-medium">{totals.gstAmount.toLocaleString()}</span>
                  </div>
                )}
                {Number(quote.discount) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span className="font-bold">Discount</span>
                    <span className="font-medium">- {Number(quote.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t-2 border-slate-800 pt-3 mt-3 flex justify-between items-end">
                  <span className="font-black uppercase tracking-widest">Total Rs.</span>
                  <span className="text-2xl font-black text-amber-500">{totals.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-12 left-0 right-0 text-center px-12">
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[10px] text-slate-400">
              <span className="uppercase tracking-widest font-bold">Thank you for your business</span>
              <span>System generated quotation - No physical signature required</span>
            </div>
          </div>

        </div>
      </div>
    );
  }

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
