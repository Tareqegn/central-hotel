"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const departments = [
  { id: 'kitchen', name: 'Kitchen & Room Service', icon: '🍳', desc: 'Manage food orders and kitchen tickets.' },
  { id: 'housekeeping', name: 'Housekeeping', icon: '🧹', desc: 'Track room cleaning and guest requests.' },
  { id: 'frontdesk', name: 'Front Desk & Concierge', icon: '🛎️', desc: 'Oversee taxi bookings, spa, and general services.' },
  { id: 'maintenance', name: 'Maintenance', icon: '🔧', desc: 'Handle room repairs and technical issues.' },
];

export default function StaffHubPage() {
  const router = useRouter();
  
  // State for Manager PIN Modal Lock
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const MANAGER_PIN = "1234"; // You can change this code anytime for your pitch!

  const handleManagerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === MANAGER_PIN) {
      router.push('/dashboard');
    } else {
      setErrorMsg('Incorrect manager passcode');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0f17] text-neutral-100 p-6 sm:p-12 flex items-center justify-center font-sans antialiased relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.05] blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-2xl w-full relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <img src="/logo.png" alt="Central Yamarech Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-serif tracking-wide text-white">Central Yamarech</h1>
          <p className="text-[10px] tracking-[0.25em] text-amber-400 uppercase mt-1 font-medium">Operations & Staff Portal</p>
          
          {/* Secure Manager Dashboard Button Trigger */}
          <div className="mt-5">
            <button
              onClick={() => setShowPinModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-neutral-950 font-bold text-[11px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-amber-500/10 hover:brightness-105 transition-all active:scale-95"
            >
              🔒 Manager Dashboard Access
            </button>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <Link
              key={dept.id}
              href={`/staff/${dept.id}`}
              className="bg-[#131622] hover:bg-[#1a1e2e] border border-white/[0.06] hover:border-amber-500/30 p-6 rounded-3xl shadow-xl transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl mb-3 block group-hover:scale-110 transition-transform origin-left">{dept.icon}</span>
                <h2 className="text-sm font-semibold text-white tracking-wide mb-1">{dept.name}</h2>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">{dept.desc}</p>
              </div>
              <div className="mt-6 flex items-center text-[10px] uppercase font-bold tracking-widest text-amber-400">
                <span>Open Station</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* PIN Verification Modal for Manager Dashboard */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-xs w-full bg-[#131622] border border-white/10 p-6 rounded-3xl shadow-2xl text-center relative">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-amber-400 mb-1">Manager Authorization</h3>
            <p className="text-[11px] text-neutral-400 mb-4 font-light">Enter 4-digit manager passcode to unlock dashboard.</p>
            
            <form onSubmit={handleManagerLogin}>
              <input 
                type="password" 
                maxLength={4}
                value={pin}
                onChange={(e) => { setPin(e.target.value); setErrorMsg(''); }}
                placeholder="••••"
                autoFocus
                className="w-full text-center tracking-[0.5em] text-lg py-3 rounded-xl bg-[#0b0d14] border border-white/10 text-white focus:outline-none focus:border-amber-500 mb-3"
              />
              {errorMsg && <p className="text-[10px] text-rose-400 mb-3 font-medium">{errorMsg}</p>}

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => { setShowPinModal(false); setPin(''); setErrorMsg(''); }}
                  className="flex-1 py-2.5 bg-white/5 text-neutral-300 rounded-xl text-xs font-medium hover:bg-white/10"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-amber-500 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}