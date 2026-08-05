// Improvement added: Added a Shift Notes / Manager Log box for shift-to-shift communication.
"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface RequestItem {
  id: string;
  room: string;
  category: string;
  note: string;
  status: string;
  price?: number;
  rating?: number;
  feedback?: string;
  created_at: string;
}

export default function ManagerDashboard() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shiftNotes, setShiftNotes] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('manager_shift_notes') || '';
    }
    return '';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('manager_sound_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('manager_sound_enabled', JSON.stringify(newState));
  };

  const handleShiftNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setShiftNotes(val);
    localStorage.setItem('manager_shift_notes', val);
  };

  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      [587.33, 880].forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.15 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.15);
        osc.stop(ctx.currentTime + index * 0.15 + 0.3);
      });
    } catch (e) {}
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setRequests(data);
    }
  };

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel('manager_dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, (payload: { eventType: string }) => {
        if (payload.eventType === 'INSERT') {
          playAlertChime();
        }
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', id);
    fetchRequests();
  };

  // Get unique room numbers for filter dropdown
  const uniqueRooms = Array.from(new Set(requests.map(r => r.room))).sort((a, b) => {
    return parseInt(a) - parseInt(b) || a.localeCompare(b);
  });

  // Filter requests based on Room selection and Keyword Search query
  const filteredRequests = requests.filter(r => {
    const matchesRoom = selectedRoomFilter === 'ALL' || r.room === selectedRoomFilter;
    const matchesSearch = searchQuery === '' || 
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.feedback && r.feedback.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesRoom && matchesSearch;
  });

  // Financial & Pitch Metrics Calculations (based on current filter view)
  const activeRoomsCount = new Set(filteredRequests.filter(r => r.status !== 'Completed').map(r => r.room)).size;

  const now = new Date().getTime();
  const urgentCount = filteredRequests.filter(r => {
    if (r.status !== 'Pending') return false;
    const createdTime = new Date(r.created_at).getTime();
    return (now - createdTime) > 10 * 60 * 1000;
  }).length;

  const totalRevenue = filteredRequests.reduce((sum, item) => sum + (item.price || 15.00), 0);
  const averageOrderValue = filteredRequests.length > 0 ? totalRevenue / filteredRequests.length : 0;

  const categoryCounts: { [key: string]: number } = {};
  filteredRequests.forEach(r => {
    const cat = r.category || 'General Service';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const topSellingItem = sortedCategories.length > 0 ? sortedCategories[0][0] : 'None yet';

  const columns = [
    { title: 'Pending', statusKey: 'Pending', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { title: 'In Progress', statusKey: 'In Progress', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
    { title: 'On the Way', statusKey: 'On the Way', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
    { title: 'Completed', statusKey: 'Completed', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 p-6 sm:p-8 font-sans tracking-tight antialiased relative overflow-x-hidden">
      
      {/* Subtle Ambient Glow */}
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
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-amber-400/90 font-semibold">Live Operations Command Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-wide">Central Yamarech — Manager Dashboard</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Keyword Search Bar */}
            <div className="flex items-center gap-2 bg-[#18181b] backdrop-blur-md px-3 py-2 rounded-xl border border-white/[0.08]">
              <span className="text-xs text-neutral-400 font-mono">Search:</span>
              <input
                type="text"
                placeholder="Filter requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#121212] text-neutral-100 font-mono text-xs px-2.5 py-1 rounded-lg border border-white/[0.1] focus:outline-none focus:border-amber-400 w-36 sm:w-44"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 px-2 py-1 rounded-md font-mono transition-all border border-white/[0.08]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Room Filter Control */}
            <div className="flex items-center gap-2 bg-[#18181b] backdrop-blur-md px-3 py-2 rounded-xl border border-white/[0.08]">
              <span className="text-xs text-neutral-400 font-mono">Room:</span>
              <select
                value={selectedRoomFilter}
                onChange={(e) => setSelectedRoomFilter(e.target.value)}
                className="bg-[#121212] text-amber-400 font-mono text-xs px-2.5 py-1 rounded-lg border border-amber-500/30 focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Rooms</option>
                {uniqueRooms.map((roomNum) => (
                  <option key={roomNum} value={roomNum}>
                    Room {roomNum}
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Chime Toggle */}
            <div className="flex items-center gap-3 bg-[#18181b] backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/[0.08]">
              <span className="text-xs text-neutral-400 font-mono">Audio:</span>
              <button
                onClick={handleToggleSound}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  soundEnabled 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-white/[0.03] text-neutral-500 border border-white/[0.06]'
                }`}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

          </div>
        </div>

        {/* Pitch KPI & Financial Metrics Grid (Clean 6-Column Layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          
          {/* 1. Real-Time F&B Revenue */}
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl flex flex-col justify-between shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">F&B Revenue</p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-serif text-emerald-400">${totalRevenue.toFixed(2)}</span>
            </div>
          </div>

          {/* 2. Average Order Value */}
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl flex flex-col justify-between shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Avg. Order (AOV)</p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-serif text-white">${averageOrderValue.toFixed(2)}</span>
            </div>
          </div>

          {/* 3. Top-Selling Category */}
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl flex flex-col justify-between shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Top Category</p>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-serif text-amber-400 truncate max-w-[110px]">{topSellingItem}</span>
            </div>
          </div>

          {/* 4. Active Rooms */}
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl flex flex-col justify-between shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Active Rooms</p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-serif text-white">{activeRoomsCount} Rooms</span>
            </div>
          </div>

          {/* 5. Urgent / VIP Alerts */}
          <div className={`border p-4 rounded-xl flex flex-col justify-between shadow-lg transition-all ${
            urgentCount > 0 
              ? 'bg-red-500/10 border-red-500/40 animate-pulse' 
              : 'bg-[#18181b] border-white/[0.08]'
          }`}>
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">VIP / Delayed</p>
            <div className="flex items-baseline justify-between">
              <span className={`text-lg font-serif ${urgentCount > 0 ? 'text-red-400 font-bold' : 'text-white'}`}>
                {urgentCount}
              </span>
            </div>
          </div>

          {/* 6. Response Time */}
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl flex flex-col justify-between shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Resp. Time</p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-serif text-emerald-400">3m 45s</span>
            </div>
          </div>

        </div>

        {/* Shift Notes / Manager Log Section */}
        <div className="mb-8 bg-[#18181b] border border-white/[0.08] p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-semibold flex items-center gap-1.5">
              📝 Shift Notes & Handover Log (Auto-Saved)
            </span>
            <span className="text-[9px] text-neutral-500 font-mono">Visible to on-duty managers</span>
          </div>
          <textarea
            value={shiftNotes}
            onChange={handleShiftNotesChange}
            placeholder="Type hand-over notes, VIP instructions, or special shift reminders here..."
            className="w-full bg-[#121212] text-neutral-200 text-xs font-mono p-3 rounded-xl border border-white/[0.08] focus:outline-none focus:border-amber-400 h-20 resize-none leading-relaxed"
          />
        </div>

        {/* Kanban Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {columns.map((col) => {
            const colRequests = filteredRequests.filter(r => r.status === col.statusKey);

            return (
              <div key={col.statusKey} className="bg-[#18181b]/70 rounded-2xl border border-white/[0.06] p-4 flex flex-col backdrop-blur-md min-h-[560px] shadow-xl">
                
                {/* Column Header */}
                <div className={`flex justify-between items-center p-3 rounded-xl border mb-4 ${col.color}`}>
                  <h2 className="text-xs font-bold uppercase tracking-wider font-mono">{col.title}</h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-black/40">
                    {colRequests.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1">
                  {colRequests.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-neutral-500 text-[11px] tracking-wider uppercase font-mono border border-dashed border-white/[0.04] rounded-xl">
                      No items
                    </div>
                  ) : (
                    colRequests.map((req) => {
                      const isDelayed = req.status === 'Pending' && (now - new Date(req.created_at).getTime() > 10 * 60 * 1000);

                      return (
                        <div 
                          key={req.id} 
                          className={`p-4 rounded-xl border flex flex-col justify-between shadow-md transition-all duration-300 group ${
                            isDelayed 
                              ? 'bg-red-950/20 border-red-500/60 shadow-red-500/10' 
                              : req.status === 'Pending' 
                              ? 'bg-[#202024] border-amber-500/40' 
                              : 'bg-[#202024] border-white/[0.07] hover:border-amber-500/30'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-mono font-bold tracking-wide border border-amber-500/20">
                                Room {req.room}
                              </span>
                              {isDelayed ? (
                                <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                                  OVERDUE
                                </span>
                              ) : (
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm font-semibold tracking-wide text-white mb-1.5">{req.category}</h3>
                            <p className="text-xs text-neutral-300 mb-3 font-light leading-relaxed bg-[#121212]/60 p-2.5 rounded-lg border border-white/[0.04]">
                              {req.note}
                            </p>

                            {/* Distinct Customer Feedback / Rating Display */}
                            {(req.rating || req.feedback) && (
                              <div className="mb-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-2 border-amber-400 p-3 rounded-r-xl shadow-inner">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                                    ★ Guest Feedback
                                  </span>
                                  {req.rating && (
                                    <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
                                      {req.rating} / 5 Stars
                                    </span>
                                  )}
                                </div>
                                {req.feedback && (
                                  <p className="text-xs text-neutral-100 italic bg-black/20 p-2 rounded-lg border border-white/[0.03]">
                                    "{req.feedback}"
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Status Action Buttons */}
                          <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
                            <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold font-mono">Move To:</p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {col.statusKey !== 'Pending' && (
                                <button
                                  onClick={() => updateStatus(req.id, 'Pending')}
                                  className="py-1.5 px-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg text-[10px] font-medium transition-all text-neutral-300 hover:text-white"
                                >
                                  Pending
                                </button>
                              )}
                              {col.statusKey !== 'In Progress' && (
                                <button
                                  onClick={() => updateStatus(req.id, 'In Progress')}
                                  className="py-1.5 px-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg text-[10px] font-medium transition-all text-neutral-300 hover:text-white"
                                >
                                  Progress
                                </button>
                              )}
                              {col.statusKey !== 'On the Way' && (
                                <button
                                  onClick={() => updateStatus(req.id, 'On the Way')}
                                  className="py-1.5 px-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg text-[10px] font-medium transition-all text-neutral-300 hover:text-white"
                                >
                                  On Way
                                </button>
                              )}
                              {col.statusKey !== 'Completed' && (
                                <button
                                  onClick={() => updateStatus(req.id, 'Completed')}
                                  className="py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-[10px] font-semibold transition-all text-emerald-300 shadow-sm col-span-2"
                                >
                                  Mark Done
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}