"use client";
export const dynamic = 'force-dynamic';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client with build-safe fallbacks matching your .env.local keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const departments = [
  { 
    id: 'kitchen', 
    name: 'Kitchen & Room Service', 
    desc: 'Manage live food orders and kitchen preparation tickets.', 
    activeCount: '4 active orders',
    defaultPin: '1111',
    theme: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-500/40 text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  { 
    id: 'housekeeping', 
    name: 'Housekeeping', 
    desc: 'Track room sanitization status, linens, and guest amenities.', 
    activeCount: '12 rooms pending',
    defaultPin: '2222',
    theme: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  },
  { 
    id: 'frontdesk', 
    name: 'Front Desk & Concierge', 
    desc: 'Oversee VIP requests, taxi bookings, spa, and guest check-ins.', 
    activeCount: '2 urgent inquiries',
    defaultPin: '3333',
    theme: 'from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  { 
    id: 'maintenance', 
    name: 'Maintenance', 
    desc: 'Handle room repairs, electrical fixtures, and technical facility issues.', 
    activeCount: '1 ticket open',
    defaultPin: '4444',
    theme: 'from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20 hover:border-rose-500/40 text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
];

export default function StaffHubPage() {
  const router = useRouter();
  
  const [activeModal, setActiveModal] = useState<'manager' | 'broadcast' | string | null>(null);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Manager Broadcast Control States
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all_guests');
  const [broadcastPriority, setBroadcastPriority] = useState('normal');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (activeModal === 'manager') {
        const { data, error } = await supabase
          .from('staff_members')
          .select('*')
          .eq('pin_code', pin)
          .in('role', ['manager', 'admin', 'Executive'])
          .single();

        if (error || !data) {
          setErrorMsg('Invalid Master Manager PIN');
          setPin('');
        } else {
          router.push('/dashboard');
        }
      } else {
        const currentDept = departments.find(d => d.id === activeModal);
        if (!currentDept) return;

        const { data, error } = await supabase
          .from('staff_members')
          .select('*')
          .eq('pin_code', pin)
          .ilike('department', `%${currentDept.id}%`)
          .single();

        if (error || !data) {
          setErrorMsg('Incorrect Station PIN');
          setPin('');
        } else {
          router.push(`/staff/${currentDept.id}`);
        }
      }
    } catch (err) {
      setErrorMsg('Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      setErrorMsg('Please enter a broadcast message');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('pin_code', pin)
        .in('role', ['manager', 'admin', 'Executive'])
        .single();

      if (error || !data) {
        setErrorMsg('Invalid Master Manager PIN for Broadcast');
        setPin('');
        setIsLoading(false);
        return;
      }

      setIsBroadcasting(true);
      
      setTimeout(() => {
        setIsBroadcasting(false);
        setIsLoading(false);
        setBroadcastSuccess(true);
        setTimeout(() => {
          setBroadcastSuccess(false);
          setActiveModal(null);
          setBroadcastMessage('');
          setPin('');
        }, 2000);
      }, 800);

    } catch (err) {
      setErrorMsg('Failed to process broadcast authorization.');
      setIsLoading(false);
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0f17] text-neutral-100 p-6 sm:p-12 flex items-center justify-center font-sans antialiased relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/[0.03] blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-3xl w-full relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center drop-shadow-md">
            <img src="/logo.png" alt="Central Yamarech Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-serif tracking-wide text-white">Central Yamarech</h1>
          <p className="text-[10px] tracking-[0.3em] text-amber-400 uppercase mt-1 font-semibold">Operations & Staff Portal Hub</p>
          
          {/* Action Buttons Hub */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => { setActiveModal('manager'); setPin(''); setErrorMsg(''); }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#131622] hover:bg-[#1a1e2e] border border-amber-500/30 hover:border-amber-500/60 text-amber-400 rounded-full shadow-lg shadow-amber-500/5 transition-all active:scale-95 group"
            >
              <svg className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs font-semibold tracking-wider uppercase text-white">Executive Management Dashboard</span>
              <span className="text-neutral-500 text-xs">→</span>
            </button>

            {/* Manager Live Broadcast Control Button */}
            <button
              onClick={() => { setActiveModal('broadcast'); setPin(''); setErrorMsg(''); setBroadcastMessage(''); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-full shadow-lg transition-all active:scale-95 group"
            >
              <svg className="w-4 h-4 animate-pulse text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-300">Live Broadcast Control</span>
            </button>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {departments.map((dept) => (
            <div
              key={dept.id}
              onClick={() => { setActiveModal(dept.id); setPin(''); setErrorMsg(''); }}
              className={`cursor-pointer bg-gradient-to-br ${dept.theme} bg-[#131622] hover:bg-[#171a29] border p-6 rounded-3xl shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${dept.badgeBg} shadow-inner`}>
                    {dept.icon}
                  </div>
                  <span className={`text-[10px] font-medium tracking-wider px-3 py-1 rounded-full border ${dept.badgeBg}`}>
                    {dept.activeCount}
                  </span>
                </div>
                
                <h2 className="text-sm font-semibold text-white tracking-wide mb-1.5">{dept.name}</h2>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">{dept.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-neutral-400 group-hover:text-white transition-colors">
                <span>Secure PIN Access</span>
                <span className="transform group-hover:translate-x-1.5 transition-transform text-amber-400 font-black text-sm">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Universal Secure PIN Verification Modal or Manager Broadcast Control Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          
          {activeModal === 'broadcast' ? (
            <div className="max-w-md w-full bg-[#131622] border border-amber-500/30 p-6 rounded-3xl shadow-2xl relative text-left">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                    <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold tracking-widest uppercase text-amber-400">Manager Broadcast Control</h3>
                    <p className="text-[10px] text-neutral-400">Dispatch live announcements across guest rooms & stations</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="text-neutral-400 hover:text-white text-sm p-1"
                >
                  ✕
                </button>
              </div>

              {broadcastSuccess ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 text-lg font-bold">
                    ✓
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-wide">Broadcast Dispatched Successfully</h4>
                  <p className="text-xs text-neutral-400 mt-1">Live announcement is now active on target client portals.</p>
                </div>
              ) : (
                <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                      Target Audience / Rooms
                    </label>
                    <select 
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value)}
                      className="w-full bg-[#0b0d14] border border-white/10 text-neutral-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
                    >
                      <option value="all_guests">All Active Rooms (102 Rooms)</option>
                      <option value="vip_guests">VIP Guests Only</option>
                      <option value="all_staff">All Staff Stations</option>
                      <option value="kitchen">Kitchen & Room Service Staff Only</option>
                      <option value="housekeeping">Housekeeping Staff Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                      Priority Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['normal', 'important', 'urgent'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setBroadcastPriority(p)}
                          className={`py-2 text-[10px] uppercase font-bold tracking-wider rounded-xl border transition-all ${
                            broadcastPriority === p 
                              ? p === 'urgent' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-amber-500/20 border-amber-500 text-amber-400'
                              : 'bg-[#0b0d14] border-white/10 text-neutral-400 hover:border-white/20'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                      Announcement Message
                    </label>
                    <textarea 
                      rows={3}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Type official hotel announcement here (e.g. Pool maintenance schedule update...)"
                      className="w-full bg-[#0b0d14] border border-white/10 text-neutral-100 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                      Master Manager PIN
                    </label>
                    <input 
                      type="password" 
                      maxLength={4}
                      value={pin}
                      onChange={(e) => { setPin(e.target.value); setErrorMsg(''); }}
                      placeholder="••••"
                      className="w-full text-center tracking-[0.5em] text-base py-2.5 rounded-xl bg-[#0b0d14] border border-white/10 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {errorMsg && <p className="text-[10px] text-rose-400 font-medium">{errorMsg}</p>}

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setActiveModal(null)}
                      className="flex-1 py-2.5 bg-white/5 text-neutral-300 rounded-xl text-xs font-medium hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isBroadcasting || isLoading}
                      className="flex-1 py-2.5 bg-amber-500 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-400 disabled:opacity-50"
                    >
                      {isBroadcasting || isLoading ? 'Broadcasting...' : 'Broadcast Now'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="max-w-xs w-full bg-[#131622] border border-white/10 p-6 rounded-3xl shadow-2xl text-center relative">
              <div className="w-10 h-10 mx-auto mb-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 text-sm">
                {activeModal === 'manager' ? '👑' : '🔐'}
              </div>
              
              <h3 className="text-sm font-semibold tracking-wide uppercase text-amber-400 mb-1">
                {activeModal === 'manager' ? 'Executive Authorization' : `${activeModal?.toUpperCase()} Station`}
              </h3>
              
              <p className="text-[11px] text-neutral-400 mb-4 font-light">
                {activeModal === 'manager' 
                  ? 'Enter master manager PIN to access all 102 rooms.'
                  : 'Enter assigned station PIN to sign in.'
                }
              </p>
              
              <form onSubmit={handleLoginSubmit}>
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
                    onClick={() => { setActiveModal(null); setPin(''); setErrorMsg(''); }}
                    className="flex-1 py-2.5 bg-white/5 text-neutral-300 rounded-xl text-xs font-medium hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1 py-2.5 bg-amber-500 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-400 disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Authorize'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}
    </div>
  );
}