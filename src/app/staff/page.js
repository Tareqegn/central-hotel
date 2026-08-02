"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Utensils, Sparkles, BellRing, ArrowRight, Lock } from 'lucide-react';

export default function StaffHub() {
  const [pin, setPin] = useState('');
  const [selectedDept, setSelectedDept] = useState(null);
  const [error, setError] = useState(false);
  
  const [deptStats, setDeptStats] = useState({
    kitchen: { count: 0, wiggle: false },
    housekeeping: { count: 0, wiggle: false },
    lobby: { count: 0, wiggle: false }
  });

  const departmentPins = {
    kitchen: "1234",
    housekeeping: "5678",
    lobby: "0000"
  };

  const departmentCategories = {
    kitchen: ["Food Order"],
    housekeeping: ["Housekeeping", "Laundry"],
    lobby: ["Request Taxi", "Spa Booking", "Call Waiter", "General"]
  };

  const playHubAlert = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.12);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1200, ctx.currentTime + 0.08);
      gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.log("Audio playback blocked.");
    }
  };

  useEffect(() => {
    async function fetchCounts() {
      const { data, error } = await supabase
        .from('requests')
        .select('category, status')
        .neq('status', 'Completed');

      if (!error && data) {
        updateCountsState(data);
      }
    }

    const updateCountsState = (records) => {
      let kitchenCount = 0;
      let houseCount = 0;
      let lobbyCount = 0;

      records.forEach(r => {
        if (departmentCategories.kitchen.includes(r.category)) kitchenCount++;
        if (departmentCategories.housekeeping.includes(r.category)) houseCount++;
        if (departmentCategories.lobby.includes(r.category)) lobbyCount++;
      });

      setDeptStats(prev => ({
        kitchen: { ...prev.kitchen, count: kitchenCount },
        housekeeping: { ...prev.housekeeping, count: houseCount },
        lobby: { ...prev.lobby, count: lobbyCount }
      }));
    };

    fetchCounts();

    const channel = supabase
      .channel('hub_global_feed_v3')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        (payload) => {
          fetchCounts();
          if (payload.eventType === 'INSERT') {
            playHubAlert();
            const cat = payload.new.category;
            
            let targetDept = null;
            if (departmentCategories.kitchen.includes(cat)) targetDept = 'kitchen';
            else if (departmentCategories.housekeeping.includes(cat)) targetDept = 'housekeeping';
            else if (departmentCategories.lobby.includes(cat)) targetDept = 'lobby';

            if (targetDept) {
              setDeptStats(prev => ({
                ...prev,
                [targetDept]: { ...prev[targetDept], wiggle: true }
              }));
              setTimeout(() => {
                setDeptStats(prev => ({
                  ...prev,
                  [targetDept]: { ...prev[targetDept], wiggle: false }
                }));
              }, 1200);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (departmentPins[selectedDept] === pin) {
      window.location.href = `/staff/${selectedDept}`;
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-sans flex flex-col items-center justify-center relative overflow-hidden">
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <style jsx>{`
        @keyframes customWiggle {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px) rotate(-1deg); }
          40% { transform: translateX(6px) rotate(1deg); }
          60% { transform: translateX(-4px) rotate(-0.5deg); }
          80% { transform: translateX(4px) rotate(0.5deg); }
        }
        .wiggle-effect {
          animation: customWiggle 0.5s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-md w-full bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-2xl p-8 rounded-[36px] shadow-2xl text-center relative z-10">
        
        {/* Restored Hotel Logo */}
        <img 
          src="/logo.png" 
          alt="Central Yamarech Logo" 
          className="w-16 h-16 object-contain mx-auto mb-4 rounded-2xl border border-amber-500/30 bg-neutral-950 shadow-lg shadow-amber-500/10 p-1" 
        />
        
        <h1 className="text-xl font-serif tracking-wide text-white font-medium">Central Yamarech</h1>
        <p className="text-[10px] tracking-widest text-amber-500 font-black uppercase mt-1 mb-8">Staff Operations Gateway</p>

        {!selectedDept ? (
          <div className="flex flex-col gap-3.5">
            <p className="text-[11px] text-neutral-400 mb-1 uppercase tracking-wider font-bold">Select Department Portal</p>
            
            {/* Kitchen Button */}
            <button 
              onClick={() => setSelectedDept('kitchen')}
              className={`w-full p-4 rounded-2xl bg-neutral-950/60 border border-amber-500/20 text-amber-400 font-bold text-xs uppercase tracking-wider hover:bg-amber-500/10 transition-all flex items-center justify-between group ${deptStats.kitchen.wiggle ? 'wiggle-effect border-amber-400 bg-amber-500/20 shadow-[0_0_25px_rgba(245,195,71,0.3)]' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                  <Utensils className="w-4 h-4" />
                </div>
                <span className="text-neutral-200">Kitchen Operations</span>
              </div>
              <div className="flex items-center gap-2">
                {deptStats.kitchen.count > 0 && (
                  <span className="bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                    {deptStats.kitchen.count}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-colors" />
              </div>
            </button>
            
            {/* Housekeeping Button */}
            <button 
              onClick={() => setSelectedDept('housekeeping')}
              className={`w-full p-4 rounded-2xl bg-neutral-950/60 border border-sky-500/20 text-sky-400 font-bold text-xs uppercase tracking-wider hover:bg-sky-500/10 transition-all flex items-center justify-between group ${deptStats.housekeeping.wiggle ? 'wiggle-effect border-sky-400 bg-sky-500/20 shadow-[0_0_25px_rgba(56,189,248,0.3)]' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-neutral-200">Housekeeping & Laundry</span>
              </div>
              <div className="flex items-center gap-2">
                {deptStats.housekeeping.count > 0 && (
                  <span className="bg-sky-500 text-neutral-950 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                    {deptStats.housekeeping.count}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-sky-400 transition-colors" />
              </div>
            </button>
            
            {/* Lobby Button */}
            <button 
              onClick={() => setSelectedDept('lobby')}
              className={`w-full p-4 rounded-2xl bg-neutral-950/60 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider hover:bg-emerald-500/10 transition-all flex items-center justify-between group ${deptStats.lobby.wiggle ? 'wiggle-effect border-emerald-400 bg-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.3)]' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <BellRing className="w-4 h-4" />
                </div>
                <span className="text-neutral-200">Front Desk & Lobby</span>
              </div>
              <div className="flex items-center gap-2">
                {deptStats.lobby.count > 0 && (
                  <span className="bg-emerald-500 text-neutral-950 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                    {deptStats.lobby.count}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
              </div>
            </button>
          </div>
        ) : (
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 text-xs text-neutral-300 font-bold uppercase tracking-wider mb-1">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Enter PIN for <span className="text-amber-400 capitalize">{selectedDept}</span></span>
            </div>
            
            <input 
              type="password" 
              maxLength="4"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              placeholder="••••"
              className="w-full text-center tracking-[1em] text-xl p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-white outline-none focus:border-amber-500 shadow-inner"
              autoFocus
            />

            {error && (
              <p className="text-[11px] text-red-400 font-bold">Incorrect PIN. Try (1234, 5678, or 0000)</p>
            )}

            <div className="flex gap-2 mt-3">
              <button 
                type="button" 
                onClick={() => { setSelectedDept(null); setPin(''); setError(false); }}
                className="flex-1 py-3 rounded-xl bg-neutral-800/80 text-neutral-300 font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all"
              >
                Back
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
              >
                Unlock
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}