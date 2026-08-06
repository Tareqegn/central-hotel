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

export default function ManagerDashboard() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [guestProfiles, setGuestProfiles] = useState<GuestProfile[]>([]);
  
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

  const staffRoster: { [key: string]: string[] } = {
    waiters: ['John', 'Abebe', 'Sara', 'Michael'],
    housekeeping: ['Tigist', 'Hanna', 'Dawit'],
    kitchen: ['Chef Markos', 'Chef Leah', 'Samson'],
    'front desk': ['Edom', 'Natnael']
  };

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
    const { data: reqData } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (reqData) setRequests(reqData);

    const { data: annData } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (annData) setAnnouncements(annData);

    const { data: profileData } = await supabase
      .from('guest_profiles')
      .select('*');
    if (profileData) setGuestProfiles(profileData);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('manager_dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, (payload: { eventType: string }) => {
        if (payload.eventType === 'INSERT') playAlertChime();
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_profiles' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('requests').update({ status: newStatus }).eq('id', id);
    fetchData();
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;

    await supabase.from('announcements').insert([
      { 
        message: newAnnouncementText.trim(), 
        is_active: true, 
        target: announcementTarget,
        staff_role: announcementTarget === 'staff' ? selectedStaffRole : 'all',
        staff_name: announcementTarget === 'staff' ? selectedStaffName : 'all',
        target_room: announcementTarget === 'guest' ? guestAnnouncementRoom : 'all'
      }
    ]);

    setNewAnnouncementText('');
    fetchData();
  };

  const handleSaveGuestProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmRoom.trim() || !crmPreferences.trim()) return;

    await supabase.from('guest_profiles').upsert([
      { room: crmRoom.trim(), guest_name: crmGuestName.trim(), preferences: crmPreferences.trim() }
    ], { onConflict: 'room' });

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

  // Dynamically aggregate all active rooms from both requests and guest profiles
  const activeRoomsSet = new Set<string>();
  requests.forEach(r => {
    if (r.room) activeRoomsSet.add(r.room);
  });
  guestProfiles.forEach(p => {
    if (p.room) activeRoomsSet.add(p.room);
  });

  const uniqueRooms = Array.from(activeRoomsSet).sort((a, b) => {
    return parseInt(a) - parseInt(b) || a.localeCompare(b);
  });

  // Helper map for room -> guest name lookup
  const roomToGuestNameMap: { [room: string]: string } = {};
  guestProfiles.forEach(p => {
    if (p.guest_name) {
      roomToGuestNameMap[p.room] = p.guest_name;
    }
  });

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
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-amber-400/90 font-semibold">Live Operations Command Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-wide">Central Yamarech — Manager Dashboard</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#18181b] backdrop-blur-md px-3 py-2 rounded-xl border border-white/[0.08]">
              <span className="text-xs text-neutral-400 font-mono">Search:</span>
              <input
                type="text"
                placeholder="Filter requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#121212] text-neutral-100 font-mono text-xs px-2.5 py-1 rounded-lg border border-white/[0.1] focus:outline-none focus:border-amber-400 w-36 sm:w-44"
              />
            </div>

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
                    Room {roomNum} {roomToGuestNameMap[roomNum] ? `(${roomToGuestNameMap[roomNum]})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-[#18181b] backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/[0.08]">
              <span className="text-xs text-neutral-400 font-mono">Audio:</span>
              <button
                onClick={handleToggleSound}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  soundEnabled ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.03] text-neutral-500 border border-white/[0.06]'
                }`}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Pitch KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl flex flex-col justify-between shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">F&B Revenue</p>
            <span className="text-lg font-serif text-emerald-400">${totalRevenue.toFixed(2)}</span>
          </div>
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl flex flex-col justify-between shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Avg. Order (AOV)</p>
            <span className="text-lg font-serif text-white">${averageOrderValue.toFixed(2)}</span>
          </div>
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl flex flex-col justify-between shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Top Category</p>
            <span className="text-sm font-serif text-amber-400 truncate max-w-[110px]">{topSellingItem}</span>
          </div>
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl flex flex-col justify-between shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Active Rooms</p>
            <span className="text-lg font-serif text-white">{activeRoomsCount} Rooms</span>
          </div>
          <div className={`border p-4 rounded-xl flex flex-col justify-between shadow-lg transition-all ${
            urgentCount > 0 ? 'bg-red-500/10 border-red-500/40 animate-pulse' : 'bg-[#18181b] border-white/[0.08]'
          }`}>
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">VIP / Delayed</p>
            <span className={`text-lg font-serif ${urgentCount > 0 ? 'text-red-400 font-bold' : 'text-white'}`}>{urgentCount}</span>
          </div>
          <div className="bg-[#18181b] border border-white/[0.08] p-4 rounded-xl flex flex-col justify-between shadow-lg">
            <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Resp. Time</p>
            <span className="text-lg font-serif text-emerald-400">3m 45s</span>
          </div>
        </div>

        {/* Guest CRM Memory & Shift Notes Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Guest Preference CRM Memory Log */}
          <div className="bg-[#18181b] border border-white/[0.08] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-semibold flex items-center gap-1.5">
                  Guest Identity & Preference CRM
                </span>
                <span className="text-[9px] text-neutral-500 font-mono">Stored in Supabase</span>
              </div>

              <form onSubmit={handleSaveGuestProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Room (e.g. 104)"
                  value={crmRoom}
                  onChange={(e) => setCrmRoom(e.target.value)}
                  className="bg-[#121212] text-amber-400 text-xs font-mono px-3 py-2 rounded-xl border border-white/[0.08] focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="Guest Name (e.g. Mr. John)"
                  value={crmGuestName}
                  onChange={(e) => setCrmGuestName(e.target.value)}
                  className="bg-[#121212] text-neutral-200 text-xs font-mono px-3 py-2 rounded-xl border border-white/[0.08] focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-md"
                >
                  Save Profile
                </button>
              </form>

              <input
                type="text"
                placeholder="Preferences (e.g., Enjoyed spa last time, prefers red wine)"
                value={crmPreferences}
                onChange={(e) => setCrmPreferences(e.target.value)}
                className="w-full bg-[#121212] text-neutral-200 text-xs font-mono px-3 py-2 rounded-xl border border-white/[0.08] focus:outline-none focus:border-amber-400 mb-3"
              />
            </div>

            {/* Existing Profiles List */}
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {guestProfiles.length === 0 ? (
                <p className="text-[11px] text-neutral-500 font-mono italic">No guest memory profiles stored yet.</p>
              ) : (
                guestProfiles.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-[#121212] px-3 py-1.5 rounded-lg border border-white/[0.06] text-xs">
                    <span className="font-mono font-bold text-amber-400">
                      Room {p.room} — <span className="text-white">{p.guest_name || 'Unnamed Guest'}</span>:
                    </span>
                    <span className="text-neutral-300 truncate max-w-[220px] italic">"{p.preferences}"</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Shift Handover Notes */}
          <div className="bg-[#18181b] border border-white/[0.08] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-semibold flex items-center gap-1.5">
                  Shift Notes & Handover Log
                </span>
                <span className="text-[9px] text-neutral-500 font-mono">Auto-saved locally</span>
              </div>
              <textarea
                value={shiftNotes}
                onChange={handleShiftNotesChange}
                placeholder="Type hand-over notes for incoming shift managers..."
                className="w-full bg-[#121212] text-neutral-200 text-xs font-mono p-3 rounded-xl border border-white/[0.08] focus:outline-none focus:border-amber-400 h-28 resize-none leading-relaxed"
              />
            </div>
          </div>

        </div>

        {/* Room-Specific Broadcast Command Center */}
        <div className="bg-[#18181b] border border-white/[0.08] p-5 rounded-2xl shadow-lg mb-8">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-semibold flex items-center gap-1.5">
              Granular Broadcast Command Center
            </span>
            
            <div className="flex items-center gap-2 flex-wrap">
              {announcementTarget === 'staff' ? (
                <>
                  <select
                    value={selectedStaffRole}
                    onChange={(e) => {
                      setSelectedStaffRole(e.target.value);
                      setSelectedStaffName('all');
                    }}
                    className="bg-[#121212] text-blue-400 font-mono text-[10px] px-2 py-1 rounded-lg border border-blue-500/30 focus:outline-none focus:border-blue-400"
                  >
                    <option value="all">All Departments</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="waiters">Waiters</option>
                    <option value="front desk">Front Desk</option>
                  </select>

                  {selectedStaffRole !== 'all' && staffRoster[selectedStaffRole] && (
                    <select
                      value={selectedStaffName}
                      onChange={(e) => setSelectedStaffName(e.target.value)}
                      className="bg-[#121212] text-emerald-400 font-mono text-[10px] px-2 py-1 rounded-lg border border-emerald-500/30 focus:outline-none focus:border-emerald-400"
                    >
                      <option value="all">All {selectedStaffRole}</option>
                      {staffRoster[selectedStaffRole].map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  )}
                </>
              ) : (
                <select
                  value={guestAnnouncementRoom}
                  onChange={(e) => setGuestAnnouncementRoom(e.target.value)}
                  className="bg-[#121212] text-amber-400 font-mono text-[10px] px-2 py-1 rounded-lg border border-amber-500/30 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Guests (Lobby / General Broadcast)</option>
                  {uniqueRooms.map((roomNum) => (
                    <option key={roomNum} value={roomNum}>
                      Room {roomNum} {roomToGuestNameMap[roomNum] ? `— ${roomToGuestNameMap[roomNum]}` : ''}
                    </option>
                  ))}
                </select>
              )}

              {/* Target Toggle Tabs */}
              <div className="flex bg-[#121212] p-1 rounded-lg border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setAnnouncementTarget('guest')}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded-md transition-all ${
                    announcementTarget === 'guest' ? 'bg-amber-500 text-black font-bold shadow' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  To Guests
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementTarget('staff')}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded-md transition-all ${
                    announcementTarget === 'staff' ? 'bg-blue-500 text-white font-bold shadow' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  To Staff
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handlePublishAnnouncement} className="flex gap-2 mb-3">
            <input
              type="text"
              value={newAnnouncementText}
              onChange={(e) => setNewAnnouncementText(e.target.value)}
              placeholder={
                announcementTarget === 'guest' 
                  ? guestAnnouncementRoom !== 'all' 
                    ? `Personalized message for Room ${guestAnnouncementRoom} (${roomToGuestNameMap[guestAnnouncementRoom] || 'Guest'}): e.g. We noticed you enjoyed our spa last time, shall we book it?` 
                    : "Broadcast message to all guests..."
                  : "Broadcast message to staff..."
              }
              className="flex-1 bg-[#121212] text-neutral-200 text-xs font-mono px-3 py-2 rounded-xl border border-white/[0.08] focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className={`font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md ${
                announcementTarget === 'guest' ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              Publish
            </button>
          </form>

          {/* Active Announcements List */}
          <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
            {announcements.length === 0 ? (
              <p className="text-[11px] text-neutral-500 font-mono italic">No broadcasts created yet.</p>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="flex items-center justify-between bg-[#121212] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                  <div className="flex items-center gap-2 truncate max-w-[700px]">
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                      ann.target === 'staff' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {ann.target === 'staff' 
                        ? `Staff (${ann.staff_role || 'all'}${ann.staff_name && ann.staff_name !== 'all' ? ` — ${ann.staff_name}` : ''})` 
                        : `Guest ${ann.target_room && ann.target_room !== 'all' ? `(Room ${ann.target_room}${roomToGuestNameMap[ann.target_room] ? `: ${roomToGuestNameMap[ann.target_room]}` : ''})` : '(All)'}`}
                    </span>
                    <span className="text-xs text-neutral-200 truncate">{ann.message}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAnnouncementStatus(ann.id, ann.is_active)}
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                        ann.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {ann.is_active ? 'LIVE' : 'HIDDEN'}
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="text-[10px] text-red-400 hover:text-red-300 font-mono"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kanban Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {columns.map((col) => {
            const colRequests = filteredRequests.filter(r => r.status === col.statusKey);

            return (
              <div key={col.statusKey} className="bg-[#18181b]/70 rounded-2xl border border-white/[0.06] p-4 flex flex-col backdrop-blur-md min-h-[560px] shadow-xl">
                
                <div className={`flex justify-between items-center p-3 rounded-xl border mb-4 ${col.color}`}>
                  <h2 className="text-xs font-bold uppercase tracking-wider font-mono">{col.title}</h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-black/40">
                    {colRequests.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colRequests.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-neutral-500 text-[11px] tracking-wider uppercase font-mono border border-dashed border-white/[0.04] rounded-xl">
                      No items
                    </div>
                  ) : (
                    colRequests.map((req) => {
                      const isDelayed = req.status === 'Pending' && (now - new Date(req.created_at).getTime() > 10 * 60 * 1000);
                      const guestName = roomToGuestNameMap[req.room];

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

                            <h3 className="text-sm font-semibold tracking-wide text-white mb-1.5">{req.category}</h3>
                            <p className="text-xs text-neutral-300 mb-3 font-light leading-relaxed bg-[#121212]/60 p-2.5 rounded-lg border border-white/[0.04]">
                              {req.note}
                            </p>

                            {(req.rating || req.feedback) && (
                              <div className="mb-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-2 border-amber-400 p-3 rounded-r-xl shadow-inner">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                                    Guest Feedback
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

                          <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
                            <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold font-mono mb-1">Move To:</p>
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