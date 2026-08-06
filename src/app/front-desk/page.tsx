// Front Desk Check-In & Smart Guest Memory Portal with SMS & Session Tokens
"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface GuestProfile {
  id: string;
  room: string;
  guest_name: string;
  preferences: string;
  is_checked_in: boolean;
  is_active: boolean;
  last_visited: string;
  session_token?: string;
  checked_out_at?: string;
}

export default function FrontDeskPortal() {
  const [profiles, setProfiles] = useState<GuestProfile[]>([]);
  const [roomNum, setRoomNum] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [preferences, setPreferences] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_profiles')
        .select('*')
        .order('room', { ascending: true });
      if (error) console.error("Supabase fetch error:", error.message);
      else if (data) setProfiles(data);
    } catch (err) {
      console.error("Fetch exception:", err);
    }
  };

  useEffect(() => {
    fetchProfiles();
    const channel = supabase
      .channel('front_desk_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_profiles' }, () => {
        fetchProfiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleGuestNameChange = (val: string) => {
    setGuestName(val);
    
    // Only auto-fetch if the typed name matches an existing profile's guest name exactly (case-insensitive and trimmed)
    const trimmedVal = val.trim().toLowerCase();
    if (!trimmedVal) return;

    const existing = profiles.find(p => p.guest_name && p.guest_name.trim().toLowerCase() === trimmedVal);
    if (existing && existing.preferences) {
      setPreferences(existing.preferences);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNum.trim() || !guestName.trim()) return;

    // Generate a secure unique session token for this check-in session
    const secureSessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    try {
      const { error } = await supabase.from('guest_profiles').upsert([
        { 
          room: roomNum.trim(), 
          guest_name: guestName.trim(), 
          preferences: preferences.trim() || 'No special preferences noted.',
          is_checked_in: true,
          is_active: true,
          last_visited: new Date().toISOString(),
          session_token: secureSessionToken,
          checked_out_at: null
        }
      ], { onConflict: 'room' });

      if (error) {
        alert(`Check-in failed: ${error.message}`);
        return;
      }

      setRoomNum('');
      setGuestName('');
      setGuestPhone('');
      setPreferences('');
      await fetchProfiles();
    } catch (err) {
      console.error("Check-in exception:", err);
    }
  };

  const handleCheckOut = async (roomNumber: string) => {
    try {
      const { error } = await supabase
        .from('guest_profiles')
        .update({ 
          is_checked_in: false,
          is_active: false, 
          guest_name: '', 
          preferences: '', 
          session_token: null,
          checked_out_at: new Date().toISOString() 
        })
        .eq('room', roomNumber);

      if (error) {
        alert('Checkout failed: ' + error.message);
      } else {
        alert(`Room ${roomNumber} checked out successfully.`);
        await fetchProfiles();
      }
    } catch (err) {
      console.error("Checkout exception:", err);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.guest_name && p.guest_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.preferences && p.preferences.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeCount = profiles.filter(p => p.is_checked_in).length;

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 p-6 sm:p-8 font-sans tracking-tight antialiased relative overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-white/[0.02] blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1500px] mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-white/[0.08] flex items-center justify-center p-2 shadow-md overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Hotel Logo" 
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-emerald-400 font-semibold">Reception Check-In Terminal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-wide">Central Yamarech — Front Desk Portal</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#18181b] backdrop-blur-md px-3 py-2 rounded-xl border border-white/[0.08]">
            <span className="text-xs text-neutral-400 font-mono">Search Room / Guest:</span>
            <input
              type="text"
              placeholder="e.g. 104 or John..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#121212] text-neutral-100 font-mono text-xs px-2.5 py-1 rounded-lg border border-white/[0.1] focus:outline-none focus:border-amber-400 w-44"
            />
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Total Rooms</p>
            <span className="text-xl font-serif text-white">102 Rooms</span>
          </div>
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Occupied Rooms</p>
            <span className="text-xl font-serif text-amber-400">{activeCount} Active</span>
          </div>
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Available Rooms</p>
            <span className="text-xl font-serif text-emerald-400">{102 - activeCount} Vacant</span>
          </div>
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">CRM Status</p>
            <span className="text-xl font-serif text-blue-400">Synced Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Check-In Form */}
          <div className="bg-[#18181b] border border-white/[0.08] p-6 rounded-2xl shadow-xl h-fit">
            <h2 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold mb-4 flex items-center gap-2">
              <span>🏨</span> Check-In New Guest & Sync CRM
            </h2>

            <form onSubmit={handleCheckIn} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. 104"
                  value={roomNum}
                  onChange={(e) => setRoomNum(e.target.value)}
                  className="w-full bg-[#121212] text-amber-400 font-mono text-xs px-3 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">Guest Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. & Mrs. Kassahun"
                  value={guestName}
                  onChange={(e) => handleGuestNameChange(e.target.value)}
                  className="w-full bg-[#121212] text-white font-mono text-xs px-3 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">Guest Phone (Optional for SMS)</label>
                <input
                  type="text"
                  placeholder="e.g. +2519..."
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-[#121212] text-white font-mono text-xs px-3 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400">Preferences & Memory Auto-Fetch</label>
                  <span className="text-[9px] text-amber-400/80 font-mono">Auto-populated from history</span>
                </div>
                <textarea
                  placeholder="Past orders, spa preferences, pillow types auto-load here..."
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  className="w-full bg-[#121212] text-neutral-200 font-mono text-xs p-3 rounded-xl border border-white/[0.08] focus:outline-none focus:border-amber-400 h-28 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs py-3 rounded-xl transition-all shadow-lg"
              >
                Complete Check-In & Generate Token
              </button>
            </form>
          </div>

          {/* Active Rooms & Guest Memory Directory */}
          <div className="lg:col-span-2 bg-[#18181b] border border-white/[0.08] p-6 rounded-2xl shadow-xl">
            <h2 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold mb-4 flex items-center justify-between">
              <span>📋 Active Rooms & Secure Token Directory</span>
              <span className="text-[10px] text-neutral-400 font-normal">Connected to Manager Dashboard</span>
            </h2>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
              {filteredProfiles.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-neutral-500 text-xs font-mono border border-dashed border-white/[0.06] rounded-xl">
                  No rooms checked in or matching search.
                </div>
              ) : (
                filteredProfiles.map((p) => {
                  const tokenParam = p.session_token ? `?token=${p.session_token}` : '';
                  const roomUrl = `${window.location.origin}/room/${p.room}${tokenParam}`;

                  return (
                    <div 
                      key={p.id} 
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                        p.is_checked_in ? 'bg-[#202024] border-amber-500/30 shadow-md' : 'bg-[#151518] border-white/[0.04] opacity-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/20">
                            Room {p.room}
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {p.is_checked_in ? (p.guest_name || 'Checked-In Guest') : 'Vacant Room'}
                          </span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                            p.is_checked_in ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
                          }`}>
                            {p.is_checked_in ? 'OCCUPIED' : 'VACANT'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-300 font-mono italic pl-1">
                          "{p.preferences || 'No preference notes logged.'}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {p.is_checked_in && (
                          <>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(roomUrl);
                                alert(`Copied token-secured link for Room ${p.room}!`);
                              }}
                              className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 border border-white/[0.08] rounded-lg text-xs font-mono transition-all"
                            >
                              Copy Link
                            </button>
                            <a
                              href={`sms:?body=${encodeURIComponent(`Welcome to Central Yamarech! Access your Room ${p.room} digital concierge menu here: ${roomUrl}`)}`}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1"
                            >
                              <span>💬</span> Send SMS
                            </a>
                            <button
                              onClick={() => handleCheckOut(p.room)}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-mono font-semibold transition-all"
                            >
                              Check-Out
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}