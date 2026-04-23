"use client";

import { useEffect, useState } from "react";
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
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) setNotifications(data.data);
    } catch (error) {
      toast.error("Alert synchronization failure");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "PATCH" });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error("Failed to update status");
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LOW_STOCK': return <Package size={18} className="text-rose-500" />;
      case 'JOB_ASSIGNED': return <Wrench size={18} className="text-[#1bd488]" />;
      default: return <Bell size={18} className="text-[#055b65]" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e0e5e9] rounded-full shadow-sm">
             <div className="w-1.5 h-1.5 bg-[#1bd488] rounded-full"></div>
             <span className="text-[10px] font-bold text-[#055b65] uppercase tracking-widest">Alert Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#055b65] tracking-tight">System Notifications</h1>
          <p className="text-[#45828b]/70 text-sm font-medium">Monitor real-time system alerts, stock triggers, and workforce updates.</p>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={fetchNotifications}
             className="flex items-center gap-2 px-6 py-4 border border-[#e0e5e9] text-[#055b65] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#fbfcfc]"
           >
             Synchronize Registry
           </button>
        </div>
      </div>

      {/* NOTIFICATION LIST */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
             <div className="w-10 h-10 border-2 border-[#1bd488]/10 border-t-[#1bd488] rounded-full animate-spin"></div>
             <p className="text-[10px] font-bold text-[#45828b]/40 uppercase tracking-widest">Compiling Alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-[#e0e5e9] border-dashed">
             <Bell size={40} className="mx-auto text-[#e0e5e9] mb-4" />
             <p className="text-sm font-bold text-[#45828b]/40 uppercase tracking-widest">No alerts registered in the current period.</p>
          </div>
        ) : notifications.map((notification) => (
          <div 
            key={notification._id} 
            className={`group bg-white rounded-[2rem] p-6 border transition-all flex items-start gap-6 hover:shadow-xl ${
              notification.isRead ? "border-[#e0e5e9] opacity-70" : "border-[#1bd488]/30 shadow-lg shadow-[#1bd488]/5 border-l-4 border-l-[#1bd488]"
            }`}
          >
             <div className={`p-4 rounded-2xl ${notification.isRead ? "bg-[#fbfcfc]" : "bg-[#1bd488]/5"} flex-shrink-0`}>
                {getTypeIcon(notification.type)}
             </div>

             <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                   <h3 className={`text-sm font-black ${notification.isRead ? "text-[#45828b]" : "text-[#055b65]"} tracking-tight uppercase`}>
                      {notification.title}
                   </h3>
                   <span className="text-[9px] font-bold text-[#45828b]/40 uppercase tracking-widest">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                   </span>
                </div>
                <p className={`text-xs ${notification.isRead ? "text-[#45828b]/60" : "text-[#45828b]"} font-medium leading-relaxed`}>
                   {notification.message}
                </p>
                <div className="pt-4 flex items-center gap-6">
                   {!notification.isRead && (
                     <button 
                       onClick={() => markAsRead(notification._id)}
                       className="text-[10px] font-black text-[#1bd488] uppercase tracking-tighter italic flex items-center gap-1.5 hover:underline"
                     >
                       Acknowledge Alert <ArrowRight size={12} />
                     </button>
                   )}
                   <button 
                     onClick={() => deleteNotification(notification._id)}
                     className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-rose-600 transition-colors"
                   >
                     <Trash2 size={12} /> Purge
                   </button>
                </div>
             </div>

             {!notification.isRead && (
                <div className="w-2 h-2 bg-[#1bd488] rounded-full mt-2 animate-pulse shadow-[0_0_8px_#1bd488]"></div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
}
