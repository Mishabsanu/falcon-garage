"use client";

import { useEffect, useState, use } from "react";
import { 
  User, 
  Car, 
  ClipboardList, 
  FileText, 
  Wallet, 
  Clock, 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin,
  Plus,
  Zap,
  Activity,
  Calendar,
  History,
  TrendingUp,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (error) {
      toast.error("Telemetry sync failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="py-20 text-center flex flex-col items-center gap-4">
       <div className="w-10 h-10 border-2 border-[#f59e0b]/10 border-t-[#f59e0b] rounded-md animate-spin"></div>
       <p className="text-[10px] font-bold text-[#64748b]/40 uppercase tracking-widest">Accessing Profile Node...</p>
    </div>
  );

  if (!data) return <div className="text-center py-20 font-bold text-[#263238]">Customer record not found.</div>;

  const totalSpent = data.invoices.reduce((sum: number, inv: any) => sum + (inv.grandTotal || 0), 0);
  const totalBalance = data.invoices.reduce((sum: number, inv: any) => sum + (inv.balanceAmount || 0), 0);

  return (
    <div className="space-y-10 pb-20">
      {/* NAVIGATION */}
      <Link href="/dashboard/customers" className="inline-flex items-center gap-2 text-[#64748b] hover:text-[#263238] transition-colors font-bold text-xs uppercase tracking-widest group">
        <div className="p-2 rounded-lg bg-white border border-[#d8dee6] group-hover:border-[#f59e0b] transition-all">
          <ArrowLeft size={16} />
        </div>
        Back to Directory
      </Link>

      {/* HEADER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* PROFILE CARD */}
        <div className="lg:col-span-2 bg-[#263238] rounded-md p-10 text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#f59e0b]/10 rounded-md blur-3xl group-hover:bg-[#f59e0b]/20 transition-all duration-1000"></div>
           
           <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
              <div className="w-32 h-32 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-5xl font-black italic shadow-inner">
                 {data.customer.name.charAt(0)}
              </div>
              <div className="flex-1 space-y-6">
                 <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-md mb-3">
                       <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-md shadow-[0_0_8px_#f59e0b]"></div>
                       <span className="text-[9px] font-bold text-[#f59e0b] uppercase tracking-widest">Active Partner</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">{data.customer.name}</h1>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">UUID: {id}</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[#f59e0b]">
                          <Phone size={16} />
                       </div>
                       <span className="text-sm font-bold opacity-80">{data.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[#f59e0b]">
                          <Mail size={16} />
                       </div>
                       <span className="text-sm font-bold opacity-80">{data.customer.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3 col-span-1 md:col-span-full">
                       <div className="w-9 h-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[#f59e0b] shrink-0">
                          <MapPin size={16} />
                       </div>
                       <span className="text-sm font-bold opacity-80">{data.customer.address}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* FINANCIAL SUMMARY */}
        <div className="bg-white rounded-md p-10 border border-[#d8dee6] shadow-sm flex flex-col justify-between group overflow-hidden relative">
           <Zap size={100} className="absolute -right-8 -bottom-8 opacity-[0.02] text-[#263238] group-hover:scale-110 transition-transform duration-700" />
           <div className="space-y-10 relative z-10">
              <div>
                 <p className="text-[10px] font-black text-[#64748b]/40 uppercase tracking-widest mb-2">Total Transaction Volume</p>
                 <h3 className="text-3xl font-black text-[#263238]">₹{totalSpent.toLocaleString()}</h3>
              </div>
              <div>
                 <p className="text-[10px] font-black text-rose-500/40 uppercase tracking-widest mb-2">Outstanding Exposure</p>
                 <h3 className="text-3xl font-black text-rose-500">₹{totalBalance.toLocaleString()}</h3>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest border transition-all ${
                data.customer.customerType === 'credit' ? 'bg-[#263238]/10 text-[#263238] border-[#263238]/20' : 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20'
              }`}>
                 <CreditCard size={14} />
                 Account Type: {data.customer.customerType}
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ASSET REGISTER (MULTIPLE CARS) */}
        <div className="lg:col-span-1 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-black text-[#263238] uppercase italic tracking-tight">Asset Register</h3>
              <Car size={20} className="text-[#f59e0b]" />
           </div>
           
           <div className="space-y-4">
              {data.vehicles.length === 0 ? (
                <div className="p-8 rounded-md bg-white border border-[#d8dee6] border-dashed text-center">
                  <p className="text-xs font-bold text-[#64748b]/40">No vehicles registered.</p>
                </div>
              ) : data.vehicles.map((vehicle: any) => (
                <div key={vehicle._id} className="p-6 bg-white rounded-md border border-[#d8dee6] shadow-sm hover:shadow-xl hover:border-[#f59e0b]/40 transition-all group overflow-hidden relative">
                   <Activity size={60} className="absolute -right-4 -bottom-4 text-[#263238] opacity-[0.03] group-hover:opacity-[0.05] transition-all" />
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-md bg-[#263238]/5 border border-[#263238]/10 flex items-center justify-center text-[#263238]">
                         <Car size={20} />
                      </div>
                      <span className="text-[10px] font-black text-[#f59e0b] bg-[#f59e0b]/5 px-3 py-1 rounded-md uppercase tracking-tighter shadow-sm border border-[#f59e0b]/10 transition-all group-hover:bg-[#f59e0b] group-hover:text-white">
                         Verified
                      </span>
                   </div>
                   <h4 className="text-lg font-black text-[#263238] tracking-tight">{vehicle.brand} {vehicle.model}</h4>
                   <p className="text-xs font-bold text-[#64748b] mt-1 uppercase tracking-widest">{vehicle.vehicleNumber}</p>
                   {vehicle.vin && <p className="text-[10px] text-[#64748b]/40 font-bold mt-4 uppercase tracking-[0.2em]">VIN: {vehicle.vin}</p>}
                </div>
              ))}
              
              <button className="w-full p-6 border-2 border-dashed border-[#d8dee6] rounded-md text-[#64748b]/40 hover:border-[#f59e0b]/50 hover:text-[#f59e0b] transition-all flex flex-col items-center gap-3 font-bold text-xs uppercase tracking-widest group">
                 <div className="w-8 h-8 rounded-md border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Plus size={16} />
                 </div>
                 Register New Asset
              </button>
           </div>
        </div>

        {/* SERVICE HISTORY LOG */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-black text-[#263238] uppercase italic tracking-tight">Service History Log</h3>
              <History size={20} className="text-[#f59e0b]" />
           </div>

           <div className="bg-white rounded-md border border-[#d8dee6] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-[#d8dee6]/20 text-[#64748b]/60 text-[9px] font-bold uppercase tracking-[0.25em]">
                         <th className="px-8 py-5">Event Cycle</th>
                         <th className="px-8 py-5">Asset</th>
                         <th className="px-8 py-5">Current State</th>
                         <th className="px-8 py-5 text-right">Valuation</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[#d8dee6]/30">
                      {data.jobCards.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center">
                            <p className="text-sm font-bold text-[#64748b]/40">No service history records synchronized.</p>
                          </td>
                        </tr>
                      ) : data.jobCards.map((jc: any) => (
                        <tr key={jc._id} className="hover:bg-[#f59e0b]/5 transition-colors group cursor-pointer">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-md bg-[#263238] flex items-center justify-center text-[#f59e0b]">
                                    <ClipboardList size={18} />
                                 </div>
                                 <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-[#263238]">#{jc.jobCardNumber}</p>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#64748b]/50 uppercase tracking-tighter">
                                       <Calendar size={12} className="text-[#f59e0b]" />
                                       {new Date(jc.createdAt).toLocaleDateString()}
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <p className="text-xs font-bold text-[#64748b] uppercase tracking-tight">{jc.vehicleNumber || "Reference Missing"}</p>
                           </td>
                           <td className="px-8 py-6">
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                jc.status === 'closed' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' : 'bg-[#64748b]/10 text-[#64748b] border-[#64748b]/20'
                              }`}>
                                 {jc.status}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <p className="text-sm font-bold text-[#263238]">--</p>
                              <p className="text-[9px] text-[#64748b]/40 font-bold mt-1 uppercase italic">Un-Valuated</p>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           </div>
           
           {/* RECENT INVOICES */}
           <div className="bg-white rounded-md border border-[#d8dee6] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden mt-8">
             <div className="px-8 py-6 border-b border-[#d8dee6]/50 bg-[#f7f4ef] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-[#263238]" />
                  <h4 className="text-xs font-black text-[#263238] uppercase tracking-widest">Financial Registry (Billings)</h4>
                </div>
                <TrendingUp size={16} className="text-[#f59e0b]" />
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <tbody className="divide-y divide-[#d8dee6]/30">
                      {data.invoices.length === 0 ? (
                        <tr>
                           <td className="px-8 py-10 text-center text-xs font-bold text-[#64748b]/40 uppercase tracking-widest italic">No billing cycles recorded.</td>
                        </tr>
                      ) : data.invoices.slice(0, 5).map((inv: any) => (
                        <tr key={inv._id} className="hover:bg-[#f59e0b]/5 transition-colors group">
                           <td className="px-8 py-5">
                              <p className="text-sm font-bold text-[#263238] group-hover:text-[#f59e0b] transition-colors">#{inv.invoiceNumber}</p>
                           </td>
                           <td className="px-8 py-5">
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                inv.status === 'paid' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : inv.status === 'partial' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                              }`}>
                                 {inv.status}
                              </div>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <p className="text-sm font-black text-[#263238]">₹{inv.grandTotal.toLocaleString()}</p>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
