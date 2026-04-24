"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Trash2, 
  MoreVertical,
  Zap,
  Package,
  Wrench,
  ArrowRight,
  ShieldAlert,
  Layers,
  Inbox,
  Filter,
  CheckCheck,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      toast.error("Alert registry synchronization failure");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "PATCH" });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      toast.success("Notification acknowledged");
    } catch (error) {
      toast.error("Failed to update node status");
    }
  };

  const markAllRead = async () => {
     try {
        // Optimistic UI update
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        toast.success("All system nodes acknowledged");
     } catch (error) {
        toast.error("Mass acknowledgment failed");
     }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success("Notification purged from registry");
    } catch (error) {
      toast.error("Purge failed");
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(n => {
        const matchesFilter = activeFilter === "ALL" || n.type === activeFilter;
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             n.message.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, activeFilter, searchQuery]);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'LOW_STOCK': return { 
        icon: <Package size={18} />, 
        color: 'text-rose-500', 
        bg: 'bg-rose-50', 
        border: 'border-rose-100',
        label: 'Stock Alert'
      };
      case 'JOB_ASSIGNED': return { 
        icon: <Wrench size={18} />, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        border: 'border-amber-100',
        label: 'Workforce'
      };
      case 'SYSTEM': return { 
        icon: <Zap size={18} />, 
        color: 'text-indigo-600', 
        bg: 'bg-indigo-50', 
        border: 'border-indigo-100',
        label: 'System Node'
      };
      default: return { 
        icon: <Bell size={18} />, 
        color: 'text-slate-600', 
        bg: 'bg-slate-50', 
        border: 'border-slate-100',
        label: 'Notification'
      };
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-200 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-black text-slate-500 uppercase tracking-widest">
             <ShieldAlert size={12} className="text-amber-500" />
             Active Telemetry Monitoring
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
            Command <span className="text-amber-500">Center</span>
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-3">
             <Layers size={16} /> Real-time node triggers and system state alerts
          </p>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={markAllRead}
             className="flex items-center gap-2 px-6 py-3.5 bg-slate-50 border border-slate-200 text-slate-600 rounded font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
           >
             <CheckCheck size={16} className="text-amber-600" /> Acknowledge All
           </button>
           <button 
             onClick={fetchNotifications}
             className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 text-white rounded font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 shadow-xl shadow-slate-800/20 transition-all"
           >
             <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync Nodes
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        
        {/* FILTERS SIDEBAR */}
        <div className="space-y-8 sticky top-24">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Registry</label>
              <div className="relative group">
                 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Filter by keyword..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all"
                 />
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <Filter size={12} /> Category Protocol
              </label>
              <div className="flex flex-col gap-2">
                 {[
                   { id: 'ALL', label: 'All Alerts', icon: <Inbox size={14} />, count: notifications.length },
                   { id: 'LOW_STOCK', label: 'Inventory', icon: <Package size={14} />, count: notifications.filter(n => n.type === 'LOW_STOCK').length },
                   { id: 'JOB_ASSIGNED', label: 'Workforce', icon: <Wrench size={14} />, count: notifications.filter(n => n.type === 'JOB_ASSIGNED').length },
                   { id: 'SYSTEM', label: 'System State', icon: <Zap size={14} />, count: notifications.filter(n => n.type === 'SYSTEM').length },
                 ].map((filter) => (
                   <button
                     key={filter.id}
                     onClick={() => setActiveFilter(filter.id)}
                     className={`flex items-center justify-between px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                       activeFilter === filter.id 
                         ? "bg-slate-800 text-white shadow-xl shadow-slate-800/20 translate-x-2" 
                         : "bg-white border border-slate-100 text-slate-500 hover:bg-slate-50"
                     }`}
                   >
                     <div className="flex items-center gap-3">
                        {filter.icon}
                        {filter.label}
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[8px] ${activeFilter === filter.id ? "bg-amber-500 text-slate-900" : "bg-slate-100 text-slate-400"}`}>
                        {filter.count}
                     </span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 space-y-4">
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Live Status</p>
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-amber-200">
                    <span className="text-lg font-black text-amber-600">{unreadCount}</span>
                 </div>
                 <div>
                    <p className="text-[11px] font-black text-amber-900 uppercase leading-none">Unread Nodes</p>
                    <p className="text-[9px] font-bold text-amber-700/60 mt-1 uppercase tracking-widest italic">Awaiting Acknowledgment</p>
                 </div>
              </div>
           </div>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="lg:col-span-3 space-y-4">
           {loading ? (
             <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-2xl border border-slate-200"></div>
                ))}
             </div>
           ) : filteredNotifications.length === 0 ? (
             <div className="bg-white rounded-3xl p-24 text-center border-2 border-dashed border-slate-100 flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                   <Inbox size={40} />
                </div>
                <div className="space-y-2">
                   <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Protocol Clear</p>
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No active nodes match the current filter registry.</p>
                </div>
             </div>
           ) : filteredNotifications.map((notification) => {
              const styles = getTypeStyles(notification.type);
              return (
                <div 
                  key={notification._id} 
                  className={`group relative bg-white rounded-2xl p-8 border transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 flex items-start gap-8 ${
                    notification.isRead 
                      ? "border-slate-100 opacity-60" 
                      : "border-slate-200 shadow-xl shadow-slate-200/30 border-l-[6px] border-l-amber-500"
                  }`}
                >
                   <div className={`w-14 h-14 rounded-xl ${styles.bg} ${styles.color} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm border ${styles.border}`}>
                      {styles.icon}
                   </div>

                   <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${styles.bg} ${styles.color}`}>
                               {styles.label}
                            </span>
                            <span className="text-[9px] font-bold text-slate-300 flex items-center gap-1 uppercase tracking-widest">
                               <Clock size={10} /> {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => deleteNotification(notification._id)}
                              className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                              title="Purge Node"
                            >
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                      
                      <h3 className={`text-lg font-black tracking-tight ${notification.isRead ? "text-slate-500" : "text-slate-800"} uppercase italic`}>
                         {notification.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${notification.isRead ? "text-slate-400" : "text-slate-500"} font-medium max-w-2xl`}>
                         {notification.message}
                      </p>

                      <div className="pt-6 flex items-center gap-4">
                         {!notification.isRead && (
                           <button 
                             onClick={() => markAsRead(notification._id)}
                             className="group/btn relative px-6 py-2.5 bg-slate-800 text-white rounded font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-3 overflow-hidden"
                           >
                             <div className="relative z-10 flex items-center gap-2">
                                Acknowledge Node <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform text-amber-500" />
                             </div>
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                           </button>
                         )}
                         {notification.isRead && (
                           <span className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                              <CheckCircle2 size={14} className="text-slate-200" /> Protocol Acknowledged
                           </span>
                         )}
                      </div>
                   </div>

                   {!notification.isRead && (
                      <div className="absolute top-8 right-8 w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                   )}
                </div>
              );
           })}
        </div>
      </div>
    </div>
  );
}
