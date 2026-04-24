"use client";

import React from "react";

interface LoadingSpinnerProps {
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label = "Synchronizing Telemetry..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
      <div className="relative flex flex-col items-center">
        {/* CINEMATIC LOGO CONTAINER */}
        <div className="relative w-32 h-32 mb-8 group">
          {/* HEADLIGHT GLOW EFFECTS */}
          <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-amber-500 rounded-full blur-xl animate-pulse opacity-50"></div>
          <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-amber-500 rounded-full blur-xl animate-pulse opacity-50 delay-75"></div>
          
          {/* THE LOGO */}
          <img 
            src="/logo-1.png" 
            alt="Falcon Garage" 
            className="w-full h-full object-contain relative z-10 animate-pulse"
          />
          
          {/* SCANNING BEAM */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="w-full h-[2px] bg-amber-500 shadow-[0_0_15px_#f59e0b] absolute top-0 left-0 animate-scan"></div>
          </div>
        </div>

        {/* LOADING TEXT */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 italic">
            {label}
          </span>
          
          {/* PROGRESS BAR */}
          <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 w-full animate-progress rounded-full"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-20px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(140px); opacity: 0; }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .animate-scan {
          animation: scan 2.5s infinite ease-in-out;
        }
        .animate-progress {
          animation: progress 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
