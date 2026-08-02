"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 flex items-center justify-center p-6 font-sans antialiased relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-white/[0.02] blur-[100px] pointer-events-none rounded-full" />
      
      <div className="max-w-md w-full bg-[#18181b] border border-white/[0.08] p-8 rounded-2xl shadow-2xl relative z-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#121212] border border-white/[0.08] flex items-center justify-center p-2 mx-auto mb-4 overflow-hidden">
          <img src="/logo.png" alt="Hotel Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
        </div>
        
        <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-amber-400 font-semibold">Central Hotel Management</span>
        <h1 className="text-2xl font-serif text-white mt-1 mb-3">Digital Concierge & Operations</h1>
        
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          Welcome to the Central Hotel 102-room management system. Select a portal below to access the interface.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs uppercase tracking-wider font-mono transition-all shadow-lg active:scale-95"
          >
            Manager Dashboard →
          </button>

          <button
            onClick={() => router.push('/staff')}
            className="w-full py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold rounded-xl text-xs uppercase tracking-wider font-mono border border-white/[0.08] transition-all active:scale-95"
          >
            Staff Portal Hub
          </button>
        </div>
      </div>
    </div>
  );
}