"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Mail, Lock, ArrowRight, Loader2, Zap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Synchronized successfully. Accessing Garage Console.");
        window.location.href = "/dashboard";
      } else {
        const msg = data.message || "Invalid credentials";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = "System connection failure. Please retry.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfcfc] flex flex-col lg:flex-row font-sans antialiased">
      {/* LEFT SIDE - DECORATIVE (Teal Dark) */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#055b65] items-center justify-center relative overflow-hidden p-16">
        {/* PREMIUM GLOWS */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1bd488]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 text-white space-y-12 max-w-md">
          <div className="flex items-center gap-4 group">
            <div className="w-14 h-14 bg-[#1bd488] rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-[#1bd488]/20 group-hover:rotate-12 transition-all duration-500">
              <Wrench className="text-[#055b65]" size={28} strokeWidth={2.5} />
            </div>
            <div>
               <h1 className="text-3xl font-extrabold tracking-tighter uppercase italic leading-none">Garage</h1>
               <p className="text-[10px] font-bold text-[#1bd488] tracking-[0.3em] uppercase mt-2 italic">Intelligence Systems</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl font-extrabold leading-[1.1] tracking-tight italic uppercase">
              The Next Era of <span className="text-[#1bd488]">Garage</span> Management.
            </h2>
            <p className="text-white/60 text-lg font-medium leading-relaxed max-w-sm">
              Deploying advanced telemetry for job cards, inventory, and automated financial settlements.
            </p>
          </div>
          
          <div className="pt-8 flex items-center gap-10 border-t border-white/10">
             <div className="space-y-1">
               <p className="text-3xl font-extrabold italic leading-none text-[#1bd488]">98%</p>
               <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Efficiency Rate</p>
             </div>
             <div className="w-px h-10 bg-white/10"></div>
             <div className="space-y-1">
               <p className="text-3xl font-extrabold italic leading-none text-white">500+</p>
               <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Global Nodes</p>
             </div>
          </div>
        </div>
        
        {/* DECORATIVE TERMINAL ELEMENTS */}
        <div className="absolute bottom-12 right-12 opacity-5 flex items-center gap-3">
           <Zap size={100} strokeWidth={1} />
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM (Clean White) */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-[#fbfcfc] relative">
        {/* MOBILE LOGO */}
        <div className="absolute top-10 left-10 lg:hidden flex items-center gap-3">
           <div className="w-8 h-8 bg-[#055b65] rounded-lg flex items-center justify-center shadow-lg">
              <Wrench className="text-[#1bd488]" size={16} strokeWidth={2.5} />
           </div>
           <span className="font-extrabold text-[#055b65] uppercase italic tracking-tighter text-xl">Garage</span>
        </div>

        <div className="w-full max-w-[400px] space-y-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#1bd488] font-bold text-[10px] uppercase tracking-[0.2em] italic">
               <ShieldCheck size={14} fill="currentColor" className="opacity-80" />
               <span>Secured Access Point</span>
            </div>
            <h2 className="text-4xl font-extrabold text-[#055b65] tracking-tight italic uppercase">Authenticate</h2>
            <p className="text-[#45828b]/60 text-sm font-medium">Input your credentials to synchronize with the dashboard.</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold uppercase tracking-tight animate-in fade-in zoom-in-95 duration-300">
              [Error]: {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest ml-1">Access Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#45828b]/40 group-focus-within:text-[#1bd488] transition-colors">
                  <Mail size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@garage.sys"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-[#e0e5e9]/20 border border-[#e0e5e9] rounded-2xl focus:ring-4 focus:ring-[#1bd488]/5 focus:border-[#1bd488]/50 transition-all outline-none text-[#055b65] font-bold text-sm placeholder:text-[#45828b]/30"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold text-[#055b65]/50 uppercase tracking-widest">Private Key</label>
                <button type="button" className="text-[10px] font-bold text-[#1bd488] hover:underline uppercase tracking-widest">Recovery?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#45828b]/40 group-focus-within:text-[#1bd488] transition-colors">
                  <Lock size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-[#e0e5e9]/20 border border-[#e0e5e9] rounded-2xl focus:ring-4 focus:ring-[#1bd488]/5 focus:border-[#1bd488]/50 transition-all outline-none text-[#055b65] font-bold text-sm placeholder:text-[#45828b]/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#055b65] hover:bg-[#45828b] text-white font-black py-4.5 px-6 rounded-2xl shadow-xl shadow-[#055b65]/20 hover:shadow-[#1bd488]/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none uppercase italic text-sm tracking-tighter"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Connect to Console
                  <ArrowRight size={20} strokeWidth={2.5} className="text-[#1bd488]" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[#45828b]/50 text-[10px] font-bold uppercase tracking-widest">
            System Node: v4.2.1-stable • <button className="text-[#055b65] hover:text-[#1bd488] transition-colors">Technical Support</button>
          </p>
        </div>
      </div>
    </div>
  );
}