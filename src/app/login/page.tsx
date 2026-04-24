"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Zap, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-[#f7f4ef] flex flex-col lg:flex-row font-sans antialiased selection:bg-[#f59e0b] selection:text-[#263238]">
      {/* LEFT SIDE - BRANDING SIDEBAR (Dark Slate) */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#263238] items-center justify-center relative overflow-hidden p-16">
        {/* PREMIUM GLOWS & TEXTURE */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#f59e0b]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-black/30 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10 text-white space-y-16 max-w-md animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="flex flex-col items-center gap-8 group">
            <div className="h-40 w-full transition-transform duration-700 group-hover:scale-105">
               <img src="/logo-1.png" alt="Falcon Garage" className="h-full w-full object-contain" />
            </div>
            <div className="text-center">
               <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none text-white">Falcon Garage</h1>
               <p className="text-[10px] font-black text-[#f59e0b] tracking-[0.4em] uppercase mt-4 italic opacity-80">Intelligence Systems Cloud</p>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-5xl font-black leading-[1.05] tracking-tighter italic uppercase text-white">
              The Next Era of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]">Workshop</span> <br />
              Management.
            </h2>
            <p className="text-white/40 text-lg font-bold leading-relaxed max-w-sm italic">
              Deploying advanced telemetry for job cards, inventory, and automated financial settlements.
            </p>
          </div>
          
          <div className="pt-12 flex items-center gap-12 border-t border-white/5">
             <div className="space-y-2">
               <p className="text-4xl font-black italic leading-none text-[#f59e0b]">99.2%</p>
               <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">Efficiency Protocol</p>
             </div>
             <div className="w-px h-12 bg-white/5"></div>
             <div className="space-y-2">
               <p className="text-4xl font-black italic leading-none text-white">LIVE</p>
               <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">Telemetry Nodes</p>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM (Clean Industrial) */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-[#f7f4ef] relative overflow-hidden">
        {/* MOBILE LOGO */}
        <div className="absolute top-12 left-12 lg:hidden flex items-center gap-4">
           <div className="w-12 h-12 rounded-full border-2 border-[#f59e0b] overflow-hidden shadow-lg">
              <img src="/logo.jpeg" alt="Logo" className="h-full w-full object-cover" />
           </div>
           <span className="font-black text-[#263238] uppercase italic tracking-tighter text-2xl">Falcon</span>
        </div>

        <div className="w-full max-w-[420px] space-y-12 relative z-10 animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#f59e0b] font-black text-[10px] uppercase tracking-[0.25em] italic">
               <ShieldCheck size={14} fill="currentColor" className="opacity-80" />
               <span>Secured Access Gateway</span>
            </div>
            <h2 className="text-5xl font-black text-[#263238] tracking-tighter italic uppercase">Authenticate</h2>
            <p className="text-[#64748b] text-sm font-bold uppercase tracking-widest opacity-60">Synchronize your node credentials.</p>
          </div>

          {error && (
            <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 text-[10px] font-black uppercase tracking-[0.15em] animate-in slide-in-from-top-2 duration-300">
              [SYSTEM_ALERT]: {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#263238]/40 uppercase tracking-[0.3em] ml-1">Personnel Identity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#263238]/20 group-focus-within:text-[#f59e0b] transition-colors">
                  <Mail size={18} strokeWidth={3} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@falcon.sys"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-14 pr-6 py-5 bg-white border border-[#d8dee6] rounded-xl focus:ring-8 focus:ring-[#f59e0b]/5 focus:border-[#f59e0b]/50 transition-all outline-none text-[#263238] font-bold text-sm placeholder:text-[#64748b]/30 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-[#263238]/40 uppercase tracking-[0.3em]">Access Key</label>
                <button type="button" className="text-[9px] font-black text-[#f59e0b] hover:underline uppercase tracking-widest">Protocol Recovery</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#263238]/20 group-focus-within:text-[#f59e0b] transition-colors">
                  <Lock size={18} strokeWidth={3} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-14 pr-14 py-5 bg-white border border-[#d8dee6] rounded-xl focus:ring-8 focus:ring-[#f59e0b]/5 focus:border-[#f59e0b]/50 transition-all outline-none text-[#263238] font-bold text-sm placeholder:text-[#64748b]/30 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-[#64748b] hover:text-[#263238] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-[#263238] hover:bg-[#1a2327] text-white font-black py-5 px-6 rounded-xl shadow-2xl shadow-[#263238]/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none uppercase italic text-sm tracking-tighter"
            >
              <div className="relative z-10 flex items-center justify-center gap-4">
                {loading ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    Initialize Connection
                    <ArrowRight size={22} strokeWidth={3} className="text-[#f59e0b] group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </form>

          <div className="flex items-center justify-between px-2 pt-4">
             <p className="text-[9px] font-black text-[#64748b]/40 uppercase tracking-widest">
               Node v4.2.1-STABLE
             </p>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-[#263238]/40 uppercase tracking-widest">Secure Uplink</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}