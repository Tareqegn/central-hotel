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

interface Announcement {
  id: string;
  message: string;
  is_active: boolean;
  target: 'guest' | 'staff';
  staff_role?: string;
  staff_name?: string;
  target_room?: string;
  created_at: string;
}

interface GuestProfile {
  id: string;
  room: string;
  guest_name: string;
  preferences: string;
}

interface StaffMember {
  name: string;
  department: string;
  role?: string;
  pin_code?: string;
}

export default function ManagerDashboard() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [guestProfiles, setGuestProfiles] = useState<GuestProfile[]>([]);
  const [dbStaffMembers, setDbStaffMembers] = useState<StaffMember[]>([]);
  
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'operations' | 'management'>('operations');

  // New Staff Management Form State
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffDept, setNewStaffDept] = useState<string>('kitchen');
  const [newStaffRole, setNewStaffRole] = useState<string>('Staff');
  const [newStaffPin, setNewStaffPin] = useState<string>('');

  const [newAnnouncementText, setNewAnnouncementText] = useState<string>('');
  const [announcementTarget, setAnnouncementTarget] = useState<'guest' | 'staff'>('guest');
  const [selectedStaffRole, setSelectedStaffRole] = useState<string>('all');
  const [selectedStaffName, setSelectedStaffName] = useState<string>('all');
  const [guestAnnouncementRoom, setGuestAnnouncementRoom] = useState<string>('all');

  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Guest CRM Note State
  const [crmRoom, setCrmRoom] = useState<string>('');
  const [crmGuestName, setCrmGuestName] = useState<string>('');
  const [crmPreferences, setCrmPreferences] = useState<string>('');
  
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

  const fetchData = async () => {
    const { data: reqData } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
    if (reqData) setRequests(reqData);

    const { data: annData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (annData) setAnnouncements(annData);

    const { data: profileData } = await supabase.from('guest_profiles').select('*');
    if (profileData) setGuestProfiles(profileData);

    const { data: staffData } = await supabase.from('staff_members').select('name, department, role, pin_code');
    if (staffData) setDbStaffMembers(staffData);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('manager_dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, (payload: { eventType: string }) => {
        if (payload.eventType === 'INSERT') playAlertChime();
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_profiles' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_members' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('requests').update({ status: newStatus }).eq('id', id);
    fetchData();
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffPin.trim()) return;
    await supabase.from('staff_members').insert([{
      name: newStaffName.trim(),
      department: newStaffDept.trim(),
      role: newStaffRole.trim(),
      pin_code: newStaffPin.trim()
    }]);
    setNewStaffName('');
    setNewStaffPin('');
    fetchData();
  };

  const handleDeleteStaff = async (name: string, department: string) => {
    await supabase.from('staff_members').delete().eq('name', name).eq('department', department);
    fetchData();
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;
    await supabase.from('announcements').insert([{
      message: newAnnouncementText.trim(),
      is_active: true,
      target: announcementTarget,
      staff_role: announcementTarget === 'staff' ? selectedStaffRole : 'all',
      staff_name: announcementTarget === 'staff' ? selectedStaffName : 'all',
      target_room: announcementTarget === 'guest' ? guestAnnouncementRoom : 'all'
    }]);
    setNewAnnouncementText('');
    fetchData();
  };

  const handleSaveGuestProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmRoom.trim() || !crmPreferences.trim()) return;
    await supabase.from('guest_profiles').upsert([{
      room: crmRoom.trim(),
      guest_name: crmGuestName.trim(),
      preferences: crmPreferences.trim()
    }], { onConflict: 'room' });
    setCrmRoom('');
    setCrmGuestName('');
    setCrmPreferences('');
    fetchData();
  };

  const toggleAnnouncementStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('announcements').update({ is_active: !currentStatus }).eq('id', id);
    fetchData();
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    fetchData();
  };

  const availableDepartments = Array.from(new Set(dbStaffMembers.map(s => s.department))).sort();

  const activeRoomsSet = new Set<string>();
  requests.forEach(r => { if (r.room) activeRoomsSet.add(r.room); });
  guestProfiles.forEach(p => { if (p.room) activeRoomsSet.add(p.room); });

  const uniqueRooms = Array.from(activeRoomsSet).sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b));
  const roomToGuestNameMap: { [room: string]: string } = {};
  guestProfiles.forEach(p => { if (p.guest_name) roomToGuestNameMap[p.room] = p.guest_name; });

  const filteredRequests = requests.filter(r => {
    const matchesRoom = selectedRoomFilter === 'ALL' || r.room === selectedRoomFilter;
    const matchesSearch = searchQuery === '' || 
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.feedback && r.feedback.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRoom && matchesSearch;
  });

  const activeRoomsCount = new Set(filteredRequests.filter(r => r.status !== 'Completed').map(r => r.room)).size;
  const now = new Date().getTime();
  const urgentCount = filteredRequests.filter(r => {
    if (r.status !== 'Pending') return false;
    return (now - new Date(r.created_at).getTime()) > 10 * 60 * 1000;
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
    { title: 'Pending', statusKey: 'Pending', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
    { title: 'In Progress', statusKey: 'In Progress', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' },
    { title: 'On the Way', statusKey: 'On the Way', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
    { title: 'Completed', statusKey: 'Completed', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
  ];

  return (
    <div className="min-h-screen bg-[#070a14] text-neutral-100 p-4 sm:p-8 font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
      
      {/* Ambient background lighting glows (Bluish / Obsidian theme) */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[350px] bg-blue-600/[0.04] blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-20 right-1/4 w-[600px] h-[300px] bg-cyan-500/[0.03] blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1600px] mx-auto space-y-6 relative z-10">

        {/* Top Header Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-[#0e1322]/80 backdrop-blur-xl border border-blue-500/[0.12] p-5 rounded-3xl shadow-2xl gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#11172a] border border-amber-500/30 flex items-center justify-center p-2 shadow-inner">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e)=>{(e.target as HTMLElement).style.display='none';}} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-[10px] font-mono tracking-[0.3em] text-amber-400 uppercase font-bold">Executive Control Suite</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif text-white tracking-wide">Central Yamarech — Manager Hub</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* View Switcher Tabs */}
            <div className="flex bg-[#090d19] p-1 rounded-2xl border border-blue-500/[0.1]">
              <button
                onClick={() => setActiveTab('operations')}
                className={`px-4 py-2 text-xs font-mono rounded-xl transition-all ${activeTab === 'operations' ? 'bg-amber-500 text-black font-bold shadow-lg' : 'text-neutral-400 hover:text-white'}`}
              >
                Live Operations
              </button>
              <button
                onClick={() => setActiveTab('management')}
                className={`px-4 py-2 text-xs font-mono rounded-xl transition-all ${activeTab === 'management' ? 'bg-amber-500 text-black font-bold shadow-lg' : 'text-neutral-400 hover:text-white'}`}
              >
                Staff & Broadcasts
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#090d19] text-xs font-mono text-neutral-200 px-3.5 py-2.5 rounded-xl border border-blue-500/[0.1] focus:border-amber-400 focus:outline-none w-36 sm:w-44"
              />
              <select
                value={selectedRoomFilter}
                onChange={(e) => setSelectedRoomFilter(e.target.value)}
                className="bg-[#090d19] text-xs font-mono text-amber-400 px-3.5 py-2.5 rounded-xl border border-amber-500/30 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Rooms</option>
                {uniqueRooms.map(room => <option key={room} value={room}>Room {room}</option>)}
              </select>
              <button
                onClick={handleToggleSound}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${soundEnabled ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.03] text-neutral-500 border border-white/[0.06]'}`}
              >
                {soundEnabled ? '🔔 ON' : '🔕 OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Clean Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-[#0e1322]/70 backdrop-blur-xl border border-blue-500/[0.1] p-4 rounded-2xl shadow-xl">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">F&B Revenue</span>
            <span className="text-lg font-serif text-emerald-400">${totalRevenue.toFixed(2)}</span>
          </div>
          <div className="bg-[#0e1322]/70 backdrop-blur-xl border border-blue-500/[0.1] p-4 rounded-2xl shadow-xl">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Avg. Order (AOV)</span>
            <span className="text-lg font-serif text-white">${averageOrderValue.toFixed(2)}</span>
          </div>
          <div className="bg-[#0e1322]/70 backdrop-blur-xl border border-blue-500/[0.1] p-4 rounded-2xl shadow-xl">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Top Category</span>
            <span className="text-sm font-serif text-amber-400 truncate block">{topSellingItem}</span>
          </div>
          <div className="bg-[#0e1322]/70 backdrop-blur-xl border border-blue-500/[0.1] p-4 rounded-2xl shadow-xl">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Active Rooms</span>
            <span className="text-lg font-serif text-white">{activeRoomsCount} Rooms</span>
          </div>
          <div className={`backdrop-blur-xl border p-4 rounded-2xl shadow-xl transition-all ${urgentCount > 0 ? 'bg-red-500/10 border-red-500/50 animate-pulse' : 'bg-[#0e1322]/70 border-blue-500/[0.1]'}`}>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">VIP / Delayed</span>
            <span className={`text-lg font-serif ${urgentCount > 0 ? 'text-red-400 font-bold' : 'text-white'}`}>{urgentCount}</span>
          </div>
          <div className="bg-[#0e1322]/70 backdrop-blur-xl border border-blue-500/[0.1] p-4 rounded-2xl shadow-xl">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Resp. Time</span>
            <span className="text-lg font-serif text-emerald-400">3m 45s</span>
          </div>
        </div>

        {/* TAB 1: LIVE OPERATIONS */}
        {activeTab === 'operations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-fadeIn">
            {columns.map((col) => {
              const colRequests = filteredRequests.filter(r => r.status === col.statusKey);

              return (
                <div key={col.statusKey} className="bg-[#0e1322]/70 backdrop-blur-xl rounded-3xl border border-blue-500/[0.1] p-4 flex flex-col min-h-[600px] shadow-2xl">
                  
                  <div className={`flex justify-between items-center p-3.5 rounded-2xl border mb-4 ${col.color}`}>
                    <h2 className="text-xs font-bold uppercase tracking-wider font-mono">{col.title}</h2>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-xl bg-black/40 shadow-inner">
                      {colRequests.length}
                    </span>
                  </div>

                  <div className="space-y-3.5 flex-1">
                    {colRequests.length === 0 ? (
                      <div className="h-44 flex items-center justify-center text-neutral-500 text-xs font-mono border border-dashed border-blue-500/[0.08] rounded-2xl">
                        No requests
                      </div>
                    ) : (
                      colRequests.map((req) => {
                        const isDelayed = req.status === 'Pending' && (now - new Date(req.created_at).getTime() > 10 * 60 * 1000);
                        const guestName = roomToGuestNameMap[req.room];

                        return (
                          <div 
                            key={req.id} 
                            className={`p-4 rounded-2xl border flex flex-col justify-between shadow-lg transition-all ${
                              isDelayed 
                                ? 'bg-red-950/30 border-red-500/60 shadow-red-500/10' 
                                : req.status === 'Pending' 
                                ? 'bg-[#141b2f] border-amber-500/40' 
                                : 'bg-[#090d19]/80 border-blue-500/[0.08] hover:border-amber-500/30'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-center mb-2.5">
                                <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/20 shadow-sm">
                                  Room {req.room} {guestName ? `(${guestName})` : ''}
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

                              <h3 className="text-xs font-semibold text-white mb-1.5">{req.category}</h3>
                              <p className="text-[11px] text-neutral-300 mb-3 bg-[#0a0f1d]/80 p-2.5 rounded-xl border border-blue-500/[0.05] leading-relaxed">
                                {req.note}
                              </p>

                              {(req.rating || req.feedback) && (
                                <div className="mb-3 bg-amber-500/10 border-l-2 border-amber-400 p-2.5 rounded-r-xl">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] uppercase font-mono tracking-widest text-amber-400 font-bold">Feedback</span>
                                    {req.rating && <span className="bg-amber-400/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">{req.rating}★</span>}
                                  </div>
                                  {req.feedback && <p className="text-[11px] text-neutral-100 italic">"{req.feedback}"</p>}
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-blue-500/[0.08]">
                              {col.statusKey !== 'Pending' && <button onClick={() => updateStatus(req.id, 'Pending')} className="py-1.5 bg-white/[0.03] hover:bg-white/[0.08] rounded-xl text-[10px] text-neutral-300 font-mono transition-all">Pending</button>}
                              {col.statusKey !== 'In Progress' && <button onClick={() => updateStatus(req.id, 'In Progress')} className="py-1.5 bg-white/[0.03] hover:bg-white/[0.08] rounded-xl text-[10px] text-neutral-300 font-mono transition-all">Progress</button>}
                              {col.statusKey !== 'On the Way' && <button onClick={() => updateStatus(req.id, 'On the Way')} className="py-1.5 bg-white/[0.03] hover:bg-white/[0.08] rounded-xl text-[10px] text-neutral-300 font-mono transition-all">On Way</button>}
                              {col.statusKey !== 'Completed' && <button onClick={() => updateStatus(req.id, 'Completed')} className="py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold font-mono col-span-2 transition-all shadow-sm">Mark Done</button>}
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
        )}

        {/* TAB 2: STAFF, CRM, BROADCASTS & HANDOVER MANAGEMENT */}
        {activeTab === 'management' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Staff Member & Roster Control */}
            <div className="bg-[#0e1322]/70 backdrop-blur-xl border border-blue-500/[0.1] p-6 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase font-mono tracking-widest text-amber-400 font-bold">Staff Member & Roster Control</span>
                <span className="text-[10px] text-neutral-500 font-mono bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.05]">Supabase Sync Active</span>
              </div>

              <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Staff Name (e.g. Chef Markos)"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="bg-[#090d19] text-neutral-200 text-xs font-mono px-3.5 py-3 rounded-2xl border border-blue-500/[0.1] focus:border-amber-400 focus:outline-none"
                />
                <select
                  value={newStaffDept}
                  onChange={(e) => setNewStaffDept(e.target.value)}
                  className="bg-[#090d19] text-amber-400 text-xs font-mono px-3.5 py-3 rounded-2xl border border-amber-500/30 focus:outline-none capitalize cursor-pointer"
                >
                  <option value="kitchen">Kitchen</option>
                  <option value="housekeeping">Housekeeping</option>
                  <option value="front desk">Front Desk</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <input
                  type="text"
                  placeholder="Role (e.g. Head Chef)"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="bg-[#090d19] text-neutral-200 text-xs font-mono px-3.5 py-3 rounded-2xl border border-blue-500/[0.1] focus:border-amber-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="PIN Code (e.g. 1234)"
                  value={newStaffPin}
                  onChange={(e) => setNewStaffPin(e.target.value)}
                  className="bg-[#090d19] text-amber-400 text-xs font-mono px-3.5 py-3 rounded-2xl border border-blue-500/[0.1] focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs py-3 px-4 rounded-2xl transition-all shadow-md active:scale-95"
                >
                  Add Staff Member
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-1">
                {dbStaffMembers.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-mono italic p-2">No staff registered yet.</p>
                ) : (
                  dbStaffMembers.map((staff, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#090d19] px-4 py-3 rounded-2xl border border-blue-500/[0.08] shadow">
                      <div>
                        <span className="font-mono font-bold text-white block text-xs">{staff.name}</span>
                        <span className="text-[10px] text-amber-400 font-mono capitalize">{staff.department} {staff.role ? `• ${staff.role}` : ''}</span>
                      </div>
                      <button onClick={() => handleDeleteStaff(staff.name, staff.department)} className="text-neutral-500 hover:text-red-400 font-mono text-xs p-1">✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CRM & Shift Handover Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-[#0e1322]/70 backdrop-blur-xl border border-blue-500/[0.1] p-6 rounded-3xl shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] uppercase font-mono tracking-widest text-amber-400 font-bold">Guest Identity & Preference CRM</span>
                    <span className="text-[10px] text-neutral-500 font-mono bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.05]">Persistent Memory</span>
                  </div>

                  <form onSubmit={handleSaveGuestProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Room (e.g. 104)"
                      value={crmRoom}
                      onChange={(e) => setCrmRoom(e.target.value)}
                      className="bg-[#090d19] text-amber-400 text-xs font-mono px-3.5 py-3 rounded-2xl border border-blue-500/[0.1] focus:border-amber-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Guest Name"
                      value={crmGuestName}
                      onChange={(e) => setCrmGuestName(e.target.value)}
                      className="bg-[#090d19] text-neutral-200 text-xs font-mono px-3.5 py-3 rounded-2xl border border-blue-500/[0.1] focus:border-amber-400 focus:outline-none"
                    />
                    <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs py-3 px-4 rounded-2xl transition-all shadow-md">
                      Save Profile
                    </button>
                  </form>
                  <input
                    type="text"
                    placeholder="Preferences (e.g., Prefers extra pillows, red wine)"
                    value={crmPreferences}
                    onChange={(e) => setCrmPreferences(e.target.value)}
                    className="w-full bg-[#090d19] text-neutral-200 text-xs font-mono px-3.5 py-3 rounded-2xl border border-blue-500/[0.1] focus:border-amber-400 focus:outline-none mb-4"
                  />
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {guestProfiles.length === 0 ? (
                    <p className="text-xs text-neutral-500 font-mono italic">No profiles stored.</p>
                  ) : (
                    guestProfiles.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-[#090d19] px-3.5 py-2.5 rounded-2xl border border-blue-500/[0.08] text-xs">
                        <span className="font-mono font-bold text-amber-400">Room {p.room} — <span className="text-white font-normal">{p.guest_name || 'Guest'}</span>:</span>
                        <span className="text-neutral-300 truncate max-w-[200px] italic">"{p.preferences}"</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-[#0e1322]/70 backdrop-blur-xl border border-blue-500/[0.1] p-6 rounded-3xl shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase font-mono tracking-widest text-amber-400 font-bold">Shift Notes & Handover Log</span>
                    <span className="text-[10px] text-neutral-500 font-mono bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.05]">Auto-saved locally</span>
                  </div>
                  <textarea
                    value={shiftNotes}
                    onChange={handleShiftNotesChange}
                    placeholder="Type hand-over notes for incoming shift managers..."
                    className="w-full bg-[#090d19] text-neutral-200 text-xs font-mono p-4 rounded-2xl border border-blue-500/[0.1] focus:border-amber-400 focus:outline-none h-36 resize-none leading-relaxed"
                  />
                </div>
              </div>

            </div>

            {/* Broadcast Command Center */}
            <div className="bg-[#0e1322]/70 backdrop-blur-xl border border-blue-500/[0.1] p-6 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <span className="text-[11px] uppercase font-mono tracking-widest text-amber-400 font-bold">Granular Broadcast Command Center</span>
                
                <div className="flex items-center gap-2.5 flex-wrap">
                  {announcementTarget === 'staff' ? (
                    <>
                      <select
                        value={selectedStaffRole}
                        onChange={(e) => { setSelectedStaffRole(e.target.value); setSelectedStaffName('all'); }}
                        className="bg-[#090d19] text-cyan-400 font-mono text-xs px-3.5 py-2 rounded-xl border border-cyan-500/30 focus:outline-none capitalize cursor-pointer"
                      >
                        <option value="all">All Departments</option>
                        <option value="kitchen">Kitchen</option>
                        <option value="housekeeping">Housekeeping</option>
                        <option value="front desk">Front Desk</option>
                        <option value="maintenance">Maintenance</option>
                        {availableDepartments.filter(d => !['kitchen', 'housekeeping', 'front desk', 'maintenance'].includes(d.toLowerCase())).map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>

                      <select
                        value={selectedStaffName}
                        onChange={(e) => setSelectedStaffName(e.target.value)}
                        className="bg-[#090d19] text-emerald-400 font-mono text-xs px-3.5 py-2 rounded-xl border border-emerald-500/30 focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Staff in Dept</option>
                        {dbStaffMembers
                          .filter(s => selectedStaffRole === 'all' || s.department.toLowerCase() === selectedStaffRole.toLowerCase())
                          .map((s) => (
                            <option key={s.name} value={s.name}>{s.name}</option>
                          ))}
                      </select>
                    </>
                  ) : (
                    <select
                      value={guestAnnouncementRoom}
                      onChange={(e) => setGuestAnnouncementRoom(e.target.value)}
                      className="bg-[#090d19] text-amber-400 font-mono text-xs px-3.5 py-2 rounded-xl border border-amber-500/30 focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Guests (Lobby / General)</option>
                      {uniqueRooms.map((roomNum) => <option key={roomNum} value={roomNum}>Room {roomNum}</option>)}
                    </select>
                  )}

                  <div className="flex bg-[#090d19] p-1 rounded-xl border border-blue-500/[0.1]">
                    <button type="button" onClick={() => setAnnouncementTarget('guest')} className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${announcementTarget === 'guest' ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400'}`}>Guests</button>
                    <button type="button" onClick={() => setAnnouncementTarget('staff')} className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${announcementTarget === 'staff' ? 'bg-blue-600 text-white font-bold' : 'text-neutral-400'}`}>Staff</button>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePublishAnnouncement} className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={newAnnouncementText}
                  onChange={(e) => setNewAnnouncementText(e.target.value)}
                  placeholder="Type broadcast announcement message..."
                  className="flex-1 bg-[#090d19] text-neutral-200 text-xs font-mono px-4 py-3 rounded-2xl border border-blue-500/[0.1] focus:border-amber-400 focus:outline-none"
                />
                <button type="submit" className={`font-mono font-bold text-xs px-6 py-3 rounded-2xl transition-all shadow-md ${announcementTarget === 'guest' ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                  Publish
                </button>
              </form>

              <div className="space-y-2 max-h-36 overflow-y-auto">
                {announcements.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-mono italic">No broadcasts created.</p>
                ) : (
                  announcements.map((ann) => (
                    <div key={ann.id} className="flex items-center justify-between bg-[#090d19] px-4 py-2.5 rounded-2xl border border-blue-500/[0.08]">
                      <div className="flex items-center gap-3 truncate max-w-[750px]">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-xl ${ann.target === 'staff' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                          {ann.target === 'staff' ? `Staff (${ann.staff_role || 'all'})` : `Guest Room ${ann.target_room || 'All'}`}
                        </span>
                        <span className="text-xs text-neutral-200 truncate font-mono">{ann.message}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleAnnouncementStatus(ann.id, ann.is_active)} className={`text-[10px] font-mono px-2.5 py-1 rounded-xl ${ann.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'}`}>
                          {ann.is_active ? 'LIVE' : 'HIDDEN'}
                        </button>
                        <button onClick={() => deleteAnnouncement(ann.id)} className="text-xs text-red-400 font-mono p-1 hover:text-red-300">✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}