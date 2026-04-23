"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Phone, 
  MapPin, 
  Mail, 
  ArrowRight,
  Filter,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    customerType: "cash"
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers/list"); // I'll create this helper endpoint
      const data = await res.json();
      if (data.success) setCustomers(data.data);
    } catch (error) {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        body: JSON.stringify(newCustomer),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Customer profile deployed successfully");
        setIsModalOpen(false);
        fetchCustomers();
      }
    } catch (error) {
      toast.error("Deployment failed");
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e0e5e9] rounded-full shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#1bd488] rounded-full"></div>
             <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-widest">Database Node</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#055b65] tracking-tight">Customer Directory</h1>
          <p className="text-[#45828b]/70 text-sm font-medium">Manage and synchronize customer profiles across the system.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] transition-all shadow-xl shadow-[#055b65]/20"
        >
          <UserPlus size={18} className="text-[#1bd488]" />
          Enroll New Customer
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white p-4 rounded-[1.5rem] border border-[#e0e5e9] shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#45828b]/40 group-focus-within:text-[#1bd488] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or identification number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50 transition-all placeholder:text-[#45828b]/30"
          />
        </div>
        <button className="px-6 py-3.5 border border-[#e0e5e9] text-[#055b65] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#fbfcfc] flex items-center gap-3">
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* CUSTOMER LIST */}
      <div className="bg-white rounded-[2.5rem] border border-[#e0e5e9] shadow-[0_20px_50px_rgba(5,91,101,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#e0e5e9]/20 text-[#45828b]/60 text-[9px] font-bold uppercase tracking-[0.25em]">
                <th className="px-8 py-5">Ident Node</th>
                <th className="px-8 py-5">Profile Detail</th>
                <th className="px-8 py-5">Access Channel</th>
                <th className="px-8 py-5">Asset Type</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e5e9]/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-2 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
                       <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Querying Nodes...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-[#45828b]/40">No records synchronized with the system.</p>
                  </td>
                </tr>
              ) : filteredCustomers.map((customer) => (
                <tr 
                  key={customer._id} 
                  onClick={() => window.location.href = `/dashboard/customers/${customer._id}`}
                  className="hover:bg-[#1bd488]/5 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-[#055b65]">#{customer.customerNumber}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-[#055b65] flex items-center justify-center text-white font-bold text-xs uppercase italic">
                          {customer.name.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-[#055b65]">{customer.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-[#45828b]/60 mt-1">
                             <MapPin size={12} className="text-[#1bd488]" />
                             <span className="truncate max-w-[150px]">{customer.address}</span>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                       <div className="flex items-center gap-2 text-xs font-bold text-[#45828b]">
                          <Phone size={14} className="text-[#1bd488]" />
                          {customer.phone}
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-medium text-[#45828b]/40">
                          <Mail size={12} />
                          {customer.email || "N/A"}
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      customer.customerType === 'credit' ? 'bg-[#055b65]/10 text-[#055b65] border-[#055b65]/20' : 'bg-[#1bd488]/10 text-[#1bd488] border-[#1bd488]/20'
                    }`}>
                      {customer.customerType}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2.5 rounded-xl hover:bg-white hover:shadow-md transition-all text-[#45828b]">
                      <MoreVertical size={18} />
                    </button>
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
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
             <div className="bg-[#055b65] p-8 text-white">
                <h3 className="text-xl font-extrabold italic uppercase tracking-tight">Profile Deployment</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Initialize new customer record</p>
             </div>
             
             <form onSubmit={handleCreate} className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Full Identity</label>
                      <input 
                        required
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                        placeholder="Name"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Secure Link (Phone)</label>
                      <input 
                        required
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                        className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                        placeholder="Phone"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Electronic Mail</label>
                   <input 
                     type="email"
                     value={newCustomer.email}
                     onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                     className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50" 
                     placeholder="email@access.sys"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Geospatial Address</label>
                   <textarea 
                     required
                     value={newCustomer.address}
                     onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                     className="w-full px-5 py-3.5 bg-[#fbfcfc] border border-[#e0e5e9] rounded-xl text-sm font-bold text-[#055b65] outline-none focus:border-[#1bd488]/50 min-h-[100px]" 
                     placeholder="Unit/Street/City"
                   />
                </div>

                <div className="pt-6 flex gap-4">
                   <button 
                     type="button"
                     onClick={() => setIsModalOpen(false)}
                     className="flex-1 px-6 py-4 border border-[#e0e5e9] text-[#45828b] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#fbfcfc]"
                   >
                     Abort
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 px-6 py-4 bg-[#055b65] text-white rounded-2xl font-black text-xs uppercase italic tracking-tighter hover:bg-[#45828b] flex items-center justify-center gap-3 shadow-xl shadow-[#055b65]/10"
                   >
                     Confirm Access <ArrowRight size={18} className="text-[#1bd488]" />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
