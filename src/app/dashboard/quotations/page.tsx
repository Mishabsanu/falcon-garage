"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  Search, 
  Plus, 
  MoreVertical, 
  User, 
  Car, 
  Calculator, 
  ArrowRight,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  FilePlus2,
  Settings2,
  ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newQuote, setNewQuote] = useState({
    customerId: "",
    vehicleId: "",
    items: [{ partId: "", name: "", qty: 1, price: 0 }],
    laborCost: 0,
    gstPercent: 18,
    discount: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [qRes, cRes, vRes, pRes] = await Promise.all([
        fetch("/api/quotations/list"),
        fetch("/api/customers/list"),
        fetch("/api/vehicles/list"),
        fetch("/api/stock/list") // For parts selection
      ]);
      const [qData, cData, vData, pData] = await Promise.all([
        qRes.json(), cRes.json(), vRes.json(), pRes.json()
      ]);
      
      if (qData.success) setQuotations(qData.data);
      if (cData.success) setCustomers(cData.data);
      if (vData.success) setVehicles(vData.data);
      if (pData.success) setParts(pData.data);
    } catch (error) {
      toast.error("Quotation engine sync failure");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const itemsTotal = newQuote.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const subtotal = itemsTotal + Number(newQuote.laborCost);
    const gstAmount = (subtotal * (newQuote.gstPercent / 100));
    const grandTotal = subtotal + gstAmount - Number(newQuote.discount);
    return { subtotal, gstAmount, grandTotal };
  };

  const handleAddItem = () => {
    setNewQuote({ ...newQuote, items: [...newQuote.items, { partId: "", name: "", qty: 1, price: 0 }] });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = newQuote.items.filter((_, i) => i !== index);
    setNewQuote({ ...newQuote, items: newItems });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const totals = calculateTotals();
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        body: JSON.stringify({ ...newQuote, ...totals }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Quotation drafted successfully");
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Draft failed");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch("/api/quotations/approve", {
        method: "POST",
        body: JSON.stringify({ quotationId: id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Proposal approved and locked");
        fetchData();
      }
    } catch (error) {
      toast.error("Approval sequence failed");
    }
  };

  const handleConvertToJobCard = async (id: string) => {
    try {
      const res = await fetch("/api/jobcards/from-quotation", {
        method: "POST",
        body: JSON.stringify({ quotationId: id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Job Card deployed successfully");
        window.location.href = `/dashboard/jobcards/${data.data._id}`;
      }
    } catch (error) {
      toast.error("Deployment failure");
    }
  };

  const { subtotal, gstAmount, grandTotal } = calculateTotals();

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e0e5e9] rounded-full shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#1bd488] rounded-full"></div>
             <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-widest">Pricing Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#055b65] tracking-tight">Active Estimates</h1>
          <p className="text-[#45828b]/70 text-sm font-medium">Develop and manage service proposals for identified asset clusters.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all shadow-xl shadow-[#055b65]/20"
        >
          <FilePlus2 size={18} className="text-[#1bd488]" />
          Generate New Proposal
        </button>
      </div>

      {/* QUOTATION LIST */}
      <div className="bg-white rounded-[2.5rem] border border-[#e0e5e9] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#e0e5e9]/20 text-[#45828b]/60 text-[9px] font-bold uppercase tracking-[0.25em]">
                <th className="px-8 py-5">Estimate Key</th>
                <th className="px-8 py-5">Target Node</th>
                <th className="px-8 py-5">Valuation</th>
                <th className="px-8 py-5">State</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e5e9]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Compiling Data...</p>
                    </div>
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-[#45828b]/40">No active proposals in the current stack.</p>
                  </td>
                </tr>
              ) : quotations.map((quote) => (
                <tr key={quote._id} className="hover:bg-[#1bd488]/5 transition-colors group cursor-pointer">
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-[#055b65]">#{quote.quotationNumber}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                       <p className="text-sm font-bold text-[#055b65]">{quote.customerId?.name}</p>
                       <div className="flex items-center gap-2 text-[10px] text-[#45828b]/60 font-bold uppercase tracking-tight">
                          <Car size={12} className="text-[#1bd488]" />
                          {quote.vehicleId?.vehicleNumber} • {quote.vehicleId?.model}
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-[#055b65]">₹{quote.grandTotal.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-[#1bd488] uppercase tracking-tighter mt-1 italic">Incl. {quote.gstPercent}% Tax</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                      quote.status === 'approved' ? 'bg-[#1bd488]/10 text-[#1bd488] border-[#1bd488]/20' : 
                      quote.status === 'rejected' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-[#055b65]/10 text-[#055b65] border-[#055b65]/20'
                    }`}>
                      {quote.status === 'approved' ? <CheckCircle2 size={10} /> : quote.status === 'draft' ? <Clock size={10} /> : <XCircle size={10} />}
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       {quote.status === 'draft' && (
                         <button 
                           onClick={() => handleApprove(quote._id)}
                           className="flex items-center gap-2 px-4 py-2 bg-[#1bd488]/10 text-[#1bd488] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1bd488] hover:text-white transition-all border border-[#1bd488]/20"
                         >
                            <CheckCircle2 size={14} /> Approve
                         </button>
                       )}
                       {quote.status === 'approved' && (
                         <button 
                           onClick={() => handleConvertToJobCard(quote._id)}
                           className="flex items-center gap-2 px-4 py-2 bg-[#055b65] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#45828b] transition-all shadow-lg shadow-[#055b65]/20 italic"
                         >
                            <ClipboardList size={14} className="text-[#1bd488]" /> Create Job Card
                         </button>
                       )}
                       {quote.status === 'converted' && (
                         <Link 
                           href={`/dashboard/jobcards/${quote.jobCardId}`}
                           className="flex items-center gap-2 px-4 py-2 bg-[#fbfcfc] text-[#055b65] border border-[#e0e5e9] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-md transition-all"
                         >
                            View Job Card <ArrowRight size={14} />
                         </Link>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#055b65]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-[#fbfcfc] w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
             <div className="bg-[#055b65] p-8 text-white flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Generate Proposal</h3>
                   <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Valuation Node: v2.0</p>
                </div>
                <div className="text-right">
                   <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Grand Total</p>
                   <p className="text-3xl font-black text-[#1bd488] italic tracking-tighter">₹{grandTotal.toLocaleString()}</p>
                </div>
             </div>
             
             <form onSubmit={handleCreate} className="p-10 overflow-y-auto space-y-10 flex-1">
                {/* NODE SELECTION */}
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Target Customer</label>
                      <select 
                        required
                        value={newQuote.customerId}
                        onChange={(e) => setNewQuote({...newQuote, customerId: e.target.value})}
                        className="w-full px-5 py-4 bg-white border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:ring-4 focus:ring-[#1bd488]/5 focus:border-[#1bd488]/50 appearance-none transition-all"
                      >
                        <option value="">Select Primary Node...</option>
                        {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Asset Reference</label>
                      <select 
                        required
                        value={newQuote.vehicleId}
                        onChange={(e) => setNewQuote({...newQuote, vehicleId: e.target.value})}
                        className="w-full px-5 py-4 bg-white border border-[#e0e5e9] rounded-2xl text-sm font-bold text-[#055b65] outline-none focus:ring-4 focus:ring-[#1bd488]/5 focus:border-[#1bd488]/50 appearance-none transition-all"
                      >
                        <option value="">Select Asset Node...</option>
                        {vehicles.filter(v => v.customerId?._id === newQuote.customerId).map(v => (
                          <option key={v._id} value={v._id}>{v.vehicleNumber} ({v.model})</option>
                        ))}
                      </select>
                   </div>
                </div>

                {/* ITEMIZATION */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-[#e0e5e9] pb-4">
                      <h4 className="text-[10px] font-black text-[#055b65] uppercase tracking-[0.2em] italic">Service Itemization</h4>
                      <button 
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1bd488]/10 text-[#1bd488] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#1bd488] hover:text-white transition-all border border-[#1bd488]/20"
                      >
                        <Plus size={14} /> Add Line Item
                      </button>
                   </div>
                   
                   <div className="space-y-4">
                      {newQuote.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                           <div className="col-span-6 space-y-1.5">
                              <label className="text-[9px] font-bold text-[#45828b]/50 uppercase tracking-widest ml-1">Inventory Module / Part</label>
                              <select 
                                required
                                value={item.partId || ""}
                                onChange={(e) => {
                                  const selectedPart = parts.find(p => p._id === e.target.value);
                                  const ni = [...newQuote.items];
                                  ni[index] = {
                                    ...ni[index],
                                    partId: e.target.value,
                                    name: selectedPart?.name || "",
                                    price: selectedPart?.price || 0
                                  };
                                  setNewQuote({...newQuote, items: ni});
                                }}
                                className="w-full px-4 py-3 bg-white border border-[#e0e5e9] rounded-xl text-xs font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50 appearance-none transition-all"
                              >
                                 <option value="">Select Part...</option>
                                 {parts.map(p => (
                                   <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock} • ₹{p.price})</option>
                                 ))}
                                 <option value="custom">-- Custom Service / Not in Stock --</option>
                              </select>
                              {item.partId === 'custom' && (
                                <input 
                                  required
                                  value={item.name}
                                  onChange={(e) => {
                                    const ni = [...newQuote.items];
                                    ni[index].name = e.target.value;
                                    setNewQuote({...newQuote, items: ni});
                                  }}
                                  className="w-full px-4 py-3 mt-2 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-xs font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                                  placeholder="Enter custom service name..."
                                />
                              )}
                           </div>
                           <div className="col-span-2 space-y-1.5">
                              <label className="text-[9px] font-bold text-[#45828b]/50 uppercase tracking-widest ml-1">Quantity</label>
                              <input 
                                type="number"
                                required
                                value={item.qty}
                                onChange={(e) => {
                                  const ni = [...newQuote.items];
                                  ni[index].qty = Number(e.target.value);
                                  setNewQuote({...newQuote, items: ni});
                                }}
                                className="w-full px-4 py-3 bg-white border border-[#e0e5e9] rounded-xl text-xs font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                              />
                           </div>
                           <div className="col-span-3 space-y-1.5">
                              <label className="text-[9px] font-bold text-[#45828b]/50 uppercase tracking-widest ml-1">Unit Valuation</label>
                              <input 
                                type="number"
                                required
                                value={item.price}
                                onChange={(e) => {
                                  const ni = [...newQuote.items];
                                  ni[index].price = Number(e.target.value);
                                  setNewQuote({...newQuote, items: ni});
                                }}
                                className="w-full px-4 py-3 bg-white border border-[#e0e5e9] rounded-xl text-xs font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                                placeholder="Price"
                              />
                           </div>
                           <div className="col-span-1">
                              <button 
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="w-10 h-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* FINANCIAL PARAMETERS */}
                <div className="grid grid-cols-3 gap-8 pt-6 border-t border-[#e0e5e9]">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Labor Vector Cost</label>
                      <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#1bd488] font-bold text-xs">₹</div>
                         <input 
                           type="number"
                           value={newQuote.laborCost}
                           onChange={(e) => setNewQuote({...newQuote, laborCost: Number(e.target.value)})}
                           className="w-full pl-8 pr-4 py-4 bg-white border border-[#e0e5e9] rounded-2xl text-sm font-black text-[#055b65] outline-none focus:border-[#1bd488]/50"
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Taxation Index (%)</label>
                      <input 
                        type="number"
                        value={newQuote.gstPercent}
                        onChange={(e) => setNewQuote({...newQuote, gstPercent: Number(e.target.value)})}
                        className="w-full px-5 py-4 bg-white border border-[#e0e5e9] rounded-2xl text-sm font-black text-[#055b65] outline-none focus:border-[#1bd488]/50"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Incentive Discount</label>
                      <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-rose-500 font-bold text-xs">₹</div>
                         <input 
                           type="number"
                           value={newQuote.discount}
                           onChange={(e) => setNewQuote({...newQuote, discount: Number(e.target.value)})}
                           className="w-full pl-8 pr-4 py-4 bg-white border border-[#e0e5e9] rounded-2xl text-sm font-black text-[#055b65] outline-none focus:border-[#1bd488]/50"
                         />
                      </div>
                   </div>
                </div>

                <div className="pt-10 flex gap-6">
                   <button 
                     type="button"
                     onClick={() => setIsModalOpen(false)}
                     className="flex-1 px-8 py-5 border border-[#e0e5e9] text-[#45828b] rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-white hover:shadow-lg transition-all"
                   >
                     Abort Sequence
                   </button>
                   <button 
                     type="submit"
                     className="flex-[2] px-8 py-5 bg-[#055b65] text-white rounded-[1.5rem] font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] flex items-center justify-center gap-4 shadow-2xl shadow-[#055b65]/20 hover:-translate-y-0.5 transition-all"
                   >
                     Finalize Proposal Draft <ArrowRight size={20} className="text-[#1bd488]" />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
