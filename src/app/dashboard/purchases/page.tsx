"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  ArrowRight,
  ShoppingCart,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Hash,
  Activity,
  ArrowUpRight,
  Wallet,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [receiptData, setReceiptData] = useState<any[]>([]);

  const [newPurchase, setNewPurchase] = useState({
    vendorName: "",
    items: [{ partId: "", qty: 0, costPrice: 0 }],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, sRes, vRes] = await Promise.all([
        fetch("/api/purchases/list"),
        fetch("/api/stock/list"),
        fetch("/api/vendors/list"),
      ]);
      const [pData, sData, vData] = await Promise.all([
        pRes.json(),
        sRes.json(),
        vRes.json(),
      ]);

      if (pData.success) setPurchases(pData.data);
      if (sData.success) setParts(sData.data);
      if (vData.success) setVendors(vData.data);
    } catch (error) {
      toast.error("Supply chain sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setNewPurchase({
      ...newPurchase,
      items: [...newPurchase.items, { partId: "", qty: 0, costPrice: 0 }],
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const processedItems = newPurchase.items.map((item) => ({
        ...item,
        name: parts.find((p) => p._id === item.partId)?.name || "Unknown",
        total: item.qty * item.costPrice,
        receivedQty: 0,
      }));

      const res = await fetch("/api/purchases", {
        method: "POST",
        body: JSON.stringify({ ...newPurchase, items: processedItems }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Purchase order initialized");
        setIsModalOpen(false);
        setNewPurchase({
          vendorName: "",
          items: [{ partId: "", qty: 0, costPrice: 0 }],
        });
        fetchData();
      }
    } catch (error) {
      toast.error("Initialization failed");
    }
  };

  const openReceiptModal = (po: any) => {
    setSelectedPO(po);
    setReceiptData(
      po.items.map((i: any) => ({
        partId: i.partId,
        name: i.name,
        qty: 0,
        max: i.qty - (i.receivedQty || 0),
      })),
    );
    setIsReceiptModalOpen(true);
  };

  const handleProcessReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/purchases/process-receipt", {
        method: "POST",
        body: JSON.stringify({
          id: selectedPO._id,
          receivedItems: receiptData.filter((d) => d.qty > 0),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Inventory synchronized: ${data.status.toUpperCase()}`);
        setIsReceiptModalOpen(false);
        fetchData();
      } else {
        toast.error(data.message || "Sync failure");
      }
    } catch (error) {
      toast.error("Network failure");
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white border border-[#e0e5e9] rounded-full shadow-sm">
            <div className="w-2 h-2 bg-[#1bd488] rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-[0.2em]">
              Supply Chain Node
            </span>
          </div>
          <h1 className="text-4xl font-black text-[#055b65] tracking-tight italic uppercase">
            Stock Acquisitions
          </h1>
          <p className="text-[#45828b]/60 text-sm font-medium max-w-xl">
            Manage corporate procurement lifecycles, vendor settlements, and
            automated stock fulfillment nodes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-4 px-8 py-5 bg-[#055b65] text-white rounded-[2rem] font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all shadow-2xl shadow-[#055b65]/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <ShoppingCart size={20} className="text-[#1bd488]" />
          <span>Initialize Procurement</span>
          <ArrowUpRight
            size={18}
            className="opacity-40 group-hover:opacity-100 transition-opacity"
          />
        </button>
      </div>

      {/* PROCUREMENT CARDS */}
      <div className="space-y-8">
        {loading ? (
          <div className="py-32 text-center flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-[#45828b]/40 uppercase tracking-[0.3em] animate-pulse">
              Synchronizing Procurement Ledger...
            </p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="py-32 bg-white rounded-[3rem] border border-dashed border-[#e0e5e9] text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-[#fbfcfc] rounded-full flex items-center justify-center text-[#45828b]/20">
              <ShoppingCart size={40} />
            </div>
            <p className="text-sm font-bold text-[#45828b]/40">
              No procurement nodes detected in current cluster.
            </p>
          </div>
        ) : (
          purchases.map((purchase) => (
            <div
              key={purchase._id}
              className="bg-white rounded-[3rem] border border-[#e0e5e9] shadow-[0_15px_60px_-15px_rgba(5,91,101,0.05)] hover:shadow-[0_25px_80px_-20px_rgba(5,91,101,0.1)] transition-all duration-700 overflow-hidden group"
            >
              <div className="flex flex-col lg:flex-row">
                {/* LEFT INFO PANEL */}
                <div className="lg:w-1/3 p-10 lg:border-r border-[#e0e5e9]/50 bg-[#fbfcfc]/50">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#055b65] flex items-center justify-center text-[#1bd488] shadow-lg shadow-[#055b65]/20">
                        <Hash size={20} strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-[#45828b]/40 uppercase tracking-widest leading-none mb-1">
                          Procurement Key
                        </p>
                        <h3 className="text-xl font-black text-[#055b65] tracking-tighter">
                          {purchase.purchaseNumber}
                        </h3>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        purchase.status === "received"
                          ? "bg-[#1bd488]/10 text-[#1bd488] border-[#1bd488]/20"
                          : purchase.status === "partial"
                            ? "bg-amber-50 text-amber-500 border-amber-100"
                            : "bg-rose-50 text-rose-500 border-rose-100"
                      }`}
                    >
                      {purchase.status}
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-white border border-[#e0e5e9] flex items-center justify-center text-[#45828b] shadow-sm">
                        <Truck size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-[#45828b]/40 uppercase tracking-widest mb-1">
                          Supply Partner
                        </p>
                        <p className="text-sm font-black text-[#055b65]">
                          {purchase.vendorName}
                        </p>
                      </div>
                    </div>
                    <div className="p-6 bg-white border border-[#e0e5e9] rounded-[2rem]">
                      <p className="text-[9px] font-bold text-[#45828b]/40 uppercase tracking-widest mb-1">
                        Total Order Valuation
                      </p>
                      <p className="text-2xl font-black text-[#055b65]">
                        Rs.{purchase.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-10">
                    {purchase.status !== "received" && (
                      <button
                        onClick={() => openReceiptModal(purchase)}
                        className="w-full py-4 bg-[#055b65] text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-[#45828b] transition-all shadow-xl shadow-[#055b65]/10 flex items-center justify-center gap-3"
                      >
                        Process Stock Receipt
                        <ArrowRight size={16} className="text-[#1bd488]" />
                      </button>
                    )}
                    {purchase.status === "received" && (
                      <div className="w-full py-4 bg-[#1bd488]/5 border border-[#1bd488]/20 text-[#1bd488] rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
                        <CheckCircle2 size={16} />
                        Stock Fully Synchronized
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT ITEMS PANEL */}
                <div className="lg:w-2/3 p-10 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black text-[#45828b]/30 uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                      <Layers size={14} /> Component itemization & fulfillment
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {purchase.items.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="p-5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-[2rem] hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all duration-500 group/item"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 overflow-hidden">
                              <h4 className="text-sm font-black text-[#055b65] truncate uppercase tracking-tight">
                                {item.name}
                              </h4>
                              <p className="text-[9px] font-bold text-[#45828b]/40 uppercase mt-0.5">
                                Valuation: Rs.{item.costPrice}
                              </p>
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-[8px] font-black ${item.receivedQty >= item.qty ? "bg-[#1bd488]/10 text-[#1bd488]" : "bg-[#055b65]/5 text-[#055b65]"}`}
                            >
                              {item.receivedQty}/{item.qty} UNITS
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                              <span className="text-[#45828b]/60">
                                Fulfillment Progress
                              </span>
                              <span className="text-[#055b65]">
                                {Math.round(
                                  (item.receivedQty / item.qty) * 100,
                                )}
                                %
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#e0e5e9] rounded-full overflow-hidden shadow-inner">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${item.receivedQty >= item.qty ? "bg-gradient-to-r from-[#1bd488] to-[#055b65]" : "bg-[#055b65]"}`}
                                style={{
                                  width: `${(item.receivedQty / item.qty) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-[#e0e5e9]/50 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-[#45828b]/40 italic">
                      Initialized on{" "}
                      {new Date(purchase.createdAt).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )}
                    </p>
                    <button className="text-[10px] font-black text-[#055b65] uppercase tracking-widest flex items-center gap-2 hover:text-[#1bd488] transition-colors">
                      <Search size={14} /> Full Audit Trail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE PO MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#055b65]/80 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500 border border-white/20">
            <div className="bg-[#055b65] p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#1bd488]/10 blur-[100px] -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-3">
                  Initialize Procurement
                </h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                  Replenishing internal component cluster
                </p>
              </div>
            </div>

            <form
              onSubmit={handleCreate}
              className="p-12 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar"
            >
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#055b65] uppercase tracking-widest ml-1">
                  Supply Partner Identification
                </label>
                <select
                  required
                  value={newPurchase.vendorName}
                  onChange={(e) =>
                    setNewPurchase({
                      ...newPurchase,
                      vendorName: e.target.value,
                    })
                  }
                  className="w-full px-6 py-4 bg-[#fbfcfc] border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488] transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Vendor Node...</option>
                  {vendors.map((v) => (
                    <option key={v._id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-[#055b65] uppercase tracking-widest">
                    Inventory Itemization
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1bd488]/10 text-[#1bd488] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#1bd488] hover:text-white transition-all"
                  >
                    <Plus size={14} /> Add Line Item
                  </button>
                </div>

                <div className="space-y-4">
                  {newPurchase.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-4 items-end p-6 bg-[#fbfcfc] border border-[#e0e5e9] rounded-[2rem]"
                    >
                      <div className="col-span-12 md:col-span-6 space-y-2">
                        <p className="text-[9px] font-bold text-[#45828b]/60 uppercase tracking-widest ml-1">
                          Component Selection
                        </p>
                        <select
                          required
                          value={item.partId}
                          onChange={(e) => {
                            const ni = [...newPurchase.items];
                            ni[index].partId = e.target.value;
                            setNewPurchase({ ...newPurchase, items: ni });
                          }}
                          className="w-full px-5 py-3.5 bg-white border border-[#e0e5e9] rounded-xl text-xs font-bold text-[#055b65] outline-none"
                        >
                          <option value="">Select Module...</option>
                          {parts.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-6 md:col-span-3 space-y-2">
                        <p className="text-[9px] font-bold text-[#45828b]/60 uppercase tracking-widest ml-1">
                          Quantity
                        </p>
                        <input
                          type="number"
                          required
                          placeholder="0"
                          value={item.qty}
                          onChange={(e) => {
                            const ni = [...newPurchase.items];
                            ni[index].qty = Number(e.target.value);
                            setNewPurchase({ ...newPurchase, items: ni });
                          }}
                          className="w-full px-5 py-3.5 bg-white border border-[#e0e5e9] rounded-xl text-xs font-bold text-[#055b65] outline-none"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3 space-y-2">
                        <p className="text-[9px] font-bold text-[#45828b]/60 uppercase tracking-widest ml-1">
                          Buying Cost (₹)
                        </p>
                        <input
                          type="number"
                          required
                          placeholder="0.00"
                          value={item.costPrice}
                          onChange={(e) => {
                            const ni = [...newPurchase.items];
                            ni[index].costPrice = Number(e.target.value);
                            setNewPurchase({ ...newPurchase, items: ni });
                          }}
                          className="w-full px-5 py-3.5 bg-white border border-[#e0e5e9] rounded-xl text-xs font-bold text-[#055b65] outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 flex gap-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-5 border-2 border-[#e0e5e9] text-[#055b65] rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#fbfcfc] transition-all"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-5 bg-[#055b65] text-white rounded-[2rem] font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-[#055b65]/20"
                >
                  Deploy Order Node{" "}
                  <ArrowRight size={20} className="text-[#1bd488]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#055b65]/80 backdrop-blur-md"
            onClick={() => setIsReceiptModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-white/20">
            <div className="bg-[#1bd488] p-12 text-[#055b65] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-3">
                  Process Partial Receipt
                </h3>
                <p className="text-[#055b65]/60 text-[10px] font-bold uppercase tracking-[0.3em]">
                  Synchronizing physical incoming stock nodes
                </p>
              </div>
            </div>

            <form onSubmit={handleProcessReceipt} className="p-12 space-y-8">
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {receiptData.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-[#fbfcfc] border border-[#e0e5e9] rounded-[2rem] gap-6"
                  >
                    <div className="space-y-2">
                      <p className="text-sm font-black text-[#055b65] uppercase tracking-tight">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-[#45828b]/60 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-[#e0e5e9]">
                          Pending: {item.max} UNITS
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-[#e0e5e9] shadow-sm">
                      {item.max > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] font-black text-[#45828b]/40 uppercase tracking-[0.2em] mb-1.5">
                            Incoming Stock
                          </span>
                          <input
                            type="number"
                            min="0"
                            max={item.max}
                            value={item.qty}
                            onChange={(e) => {
                              const val =
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value);
                              const nd = [...receiptData];
                              nd[index].qty = Math.min(item.max, val);
                              setReceiptData(nd);
                            }}
                            className="w-28 px-2 py-1.5 bg-[#1bd488]/5 text-center text-2xl font-black text-[#055b65] outline-none rounded-xl border border-[#1bd488]/20 focus:border-[#1bd488] transition-all"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-[#1bd488] px-6 py-2 bg-[#1bd488]/10 rounded-2xl border border-[#1bd488]/10">
                          <CheckCircle2 size={18} strokeWidth={3} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Fully Synchronized
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 flex gap-5">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="flex-1 px-8 py-5 border-2 border-[#e0e5e9] text-[#055b65] rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#fbfcfc] transition-all"
                >
                  Abort Sync
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-5 bg-[#055b65] text-white rounded-[2rem] font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-[#055b65]/20"
                >
                  Authorize Update{" "}
                  <ArrowRight size={20} className="text-[#1bd488]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
