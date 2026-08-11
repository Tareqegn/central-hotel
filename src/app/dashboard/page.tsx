"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronDown, Clock, Loader2, CheckCircle2, Truck, Volume2, Search, Filter, Sparkles, Mic, Play, Pause, Users, MessageSquare, Star, Shield, FileText } from 'lucide-react';

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
  audio_url?: string;
}

interface FeedbackItem {
  id: string;
  room: string;
  rating: number;
  comment: string;
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

interface VoiceMessage {
  id: string;
  sender_name: string;
  recipient_target: string;
  audio_url: string;
  created_at: string;
}

export default function ManagerDashboard() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [guestProfiles, setGuestProfiles] = useState<GuestProfile[]>([]);
  const [dbStaffMembers, setDbStaffMembers] = useState<StaffMember[]>([]);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'operations' | 'reviews' | 'staff' | 'crm' | 'communications'>('operations');

  // Accordion Expandable Panel States
  const [expandedPanel, setExpandedPanel] = useState<string | null>('Pending');

  // Pagination state for Completed requests log
  const [visibleCompletedCount, setVisibleCompletedCount] = useState<number>(5);

  const togglePanel = (statusKey: string) => {
    setExpandedPanel(expandedPanel === statusKey ? null : statusKey);
  };

  // Modal States
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [isCrmModalOpen, setIsCrmModalOpen] = useState<boolean>(false);

  // Live Chat Reply State
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Staff & Announcement Form States
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffDept, setNewStaffDept] = useState<string>('kitchen');
  const [newStaffRole, setNewStaffRole] = useState<string>('Staff');
  const [newStaffPin, setNewStaffPin] = useState<string>('');

  const [newAnnouncementText, setNewAnnouncementText] = useState<string>('');
  const [announcementTarget, setAnnouncementTarget] = useState<'guest' | 'staff'>('guest');
  const [selectedBroadcastDept, setSelectedBroadcastDept] = useState<string>('all');
  const [selectedStaffName, setSelectedStaffName] = useState<string>('all');
  const [guestAnnouncementRoom, setGuestAnnouncementRoom] = useState<string>('all');

  // Voice Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Guest CRM Note State
  const [crmRoom, setCrmRoom] = useState<string>('');
  const [crmGuestName, setCrmGuestName] = useState<string>('');
  const [crmPreferences, setCrmPreferences] = useState<string>('');
  
  // Search & Filter States
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

  const fetchData = async () => {
    const { data: reqData } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
    if (reqData) {
      const operationalTasks = reqData.filter(r => r.category !== 'Feedback' && !r.note?.startsWith('Rating:'));
      setRequests(operationalTasks);
      if (selectedRequest) {
        const updatedCurrent = operationalTasks.find(r => r.id === selectedRequest.id);
        if (updatedCurrent) setSelectedRequest(updatedCurrent);
      }
    }

    const { data: feedbackData } = await supabase.from('guest_feedback').select('*').order('created_at', { ascending: false });
    if (feedbackData) setFeedbackList(feedbackData);

    const { data: annData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (annData) setAnnouncements(annData);

    const { data: profileData } = await supabase.from('guest_profiles').select('*');
    if (profileData) setGuestProfiles(profileData);

    const { data: staffData } = await supabase.from('staff_members').select('*').order('name', { ascending: true });
    if (staffData && staffData.length > 0) setDbStaffMembers(staffData);

    const { data: voiceData } = await supabase.from('voice_messages').select('*').order('created_at', { ascending: false });
    if (voiceData) setVoiceMessages(voiceData);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('manager_dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, (payload: { eventType: string }) => {
        if (payload.eventType === 'INSERT') playAlertChime();
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_feedback' }, (payload: { eventType: string }) => {
        if (payload.eventType === 'INSERT') playAlertChime();
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_profiles' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_members' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voice_messages' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled, selectedRequest]);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('requests').update({ status: newStatus }).eq('id', id);
    fetchData();
  };

  const handleSendReply = async () => {
    if (!selectedRequest || !replyText.trim()) return;
    const updatedNote = `${selectedRequest.note} | Staff Reply: ${replyText.trim()}`;
    try {
      await supabase.from('requests').update({ note: updatedNote, status: 'In Progress' }).eq('id', selectedRequest.id);
      setReplyText('');
      fetchData();
    } catch (err) {
      console.error('Error sending reply:', err);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffPin.trim()) return;
    const { error } = await supabase.from('staff_members').insert([{
      name: newStaffName.trim(),
      department: newStaffDept.trim(),
      role: newStaffRole.trim(),
      pin_code: newStaffPin.trim()
    }]);
    if (error) {
      await supabase.from('staff').insert([{
        name: newStaffName.trim(),
        department: newStaffDept.trim(),
        role: newStaffRole.trim(),
        pin_code: newStaffPin.trim()
      }]);
    }
    setNewStaffName('');
    setNewStaffPin('');
    setIsStaffModalOpen(false);
    fetchData();
  };

  const handleDeleteStaff = async (name: string, department: string) => {
    const { error } = await supabase.from('staff_members').delete().eq('name', name).eq('department', department);
    if (error) {
      await supabase.from('staff').delete().eq('name', name).eq('department', department);
    }
    fetchData();
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;
    await supabase.from('announcements').insert([{
      message: newAnnouncementText.trim(),
      is_active: true,
      target: announcementTarget,
      staff_role: announcementTarget === 'staff' ? selectedBroadcastDept : 'all',
      staff_name: announcementTarget === 'staff' ? selectedStaffName : 'all',
      target_room: announcementTarget === 'guest' ? guestAnnouncementRoom : 'all'
    }]);
    setNewAnnouncementText('');
    fetchData();
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fileName = `voice_${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage.from('voice-notes').upload(fileName, audioBlob);
        if (uploadError) {
          alert('Error uploading audio clip: ' + uploadError.message);
          return;
        }
        const { data: publicUrlData } = supabase.storage.from('voice-notes').getPublicUrl(fileName);
        const audioUrl = publicUrlData.publicUrl;
        const recipientTarget = selectedStaffName !== 'all' ? selectedStaffName : selectedBroadcastDept;

        await supabase.from('voice_messages').insert([{
          sender_name: 'Manager Hub',
          recipient_target: recipientTarget,
          audio_url: audioUrl
        }]);
        fetchData();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const deleteVoiceMessage = async (id: string) => {
    await supabase.from('voice_messages').delete().eq('id', id);
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
    setIsCrmModalOpen(false);
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

  const availableDepartments = Array.from(new Set(dbStaffMembers.map(s => s.department || 'general'))).sort();
  const filteredStaffForDropdown = dbStaffMembers.filter(s => {
    if (selectedBroadcastDept === 'all') return true;
    return s.department?.trim().toLowerCase() === selectedBroadcastDept?.trim().toLowerCase();
  });

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
      r.room.toLowerCase().includes(searchQuery.toLowerCase());
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
    { 
      title: 'Pending Requests', 
      subtitle: 'Requires immediate staff attention',
      statusKey: 'Pending', 
      icon: <Clock className="w-5 h-5 animate-pulse" />,
      containerClass: `bg-[#0b1021]/85 backdrop-blur-md border rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${urgentCount > 0 ? 'border-amber-500 shadow-amber-500/10 animate-pulse' : 'border-amber-500/30'}`,
      headerClass: 'w-full flex items-center justify-between p-4 bg-amber-500/10 hover:bg-amber-500/15 transition-colors text-left cursor-pointer',
      badgeClass: 'px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-mono font-bold rounded-full border border-amber-500/30'
    },
    { 
      title: 'In Progress', 
      subtitle: 'Currently being handled by staff',
      statusKey: 'In Progress', 
      icon: <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />,
      containerClass: 'bg-[#0b1021]/85 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-xl overflow-hidden transition-all duration-300',
      headerClass: 'w-full flex items-center justify-between p-4 bg-cyan-500/10 hover:bg-cyan-500/15 transition-colors text-left cursor-pointer',
      badgeClass: 'px-2.5 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold rounded-full border border-cyan-500/30'
    },
    { 
      title: 'On the Way', 
      subtitle: 'Dispatched and headed to room',
      statusKey: 'On the Way', 
      icon: <Truck className="w-5 h-5 text-blue-400" />,
      containerClass: 'bg-[#0b1021]/85 backdrop-blur-md border border-blue-500/30 rounded-2xl shadow-xl overflow-hidden transition-all duration-300',
      headerClass: 'w-full flex items-center justify-between p-4 bg-blue-500/10 hover:bg-blue-500/15 transition-colors text-left cursor-pointer',
      badgeClass: 'px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-mono font-bold rounded-full border border-blue-500/30'
    },
    { 
      title: 'Completed', 
      subtitle: 'Fulfilled requests history',
      statusKey: 'Completed', 
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      containerClass: 'bg-[#0b1021]/85 backdrop-blur-md border border-emerald-500/30 rounded-2xl shadow-xl overflow-hidden transition-all duration-300',
      headerClass: 'w-full flex items-center justify-between p-4 bg-emerald-500/10 hover:bg-emerald-500/15 transition-colors text-left cursor-pointer',
      badgeClass: 'px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-full border border-emerald-500/30'
    },
  ];

  return (
    <div className="min-h-screen bg-[#050811] text-neutral-100 p-4 sm:p-8 font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-blue-600/[0.03] blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-20 right-1/4 w-[700px] h-[350px] bg-cyan-500/[0.02] blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-[1600px] mx-auto space-y-6 relative z-10">

        {/* Top Header & Pill Navigation */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-[#0b1021]/85 backdrop-blur-2xl border border-white/[0.06] p-5 rounded-3xl shadow-2xl gap-5">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0e1428] border border-white/[0.08] flex items-center justify-center p-2 shadow-inner">
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

          {/* Enhanced Pill Segmented Navigation Bar with Stronger Glow & Contrast */}
          <div className="flex bg-[#050811] p-1.5 rounded-2xl border border-white/[0.08] shadow-inner overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('operations')}
              className={`px-4 py-2.5 text-xs font-medium rounded-xl transition-all duration-300 flex items-center gap-2 ${activeTab === 'operations' ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20 scale-[1.02]' : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'}`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Live Operations</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2.5 text-xs font-medium rounded-xl transition-all duration-300 flex items-center gap-2 ${activeTab === 'reviews' ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20 scale-[1.02]' : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'}`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Guest Reviews</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === 'reviews' ? 'bg-black/20 text-black' : 'bg-white/10 text-amber-400'}`}>
                {feedbackList.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2.5 text-xs font-medium rounded-xl transition-all duration-300 flex items-center gap-2 ${activeTab === 'staff' ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20 scale-[1.02]' : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'}`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Directory</span>
            </button>
            <button
              onClick={() => setActiveTab('crm')}
              className={`px-4 py-2.5 text-xs font-medium rounded-xl transition-all duration-300 flex items-center gap-2 ${activeTab === 'crm' ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20 scale-[1.02]' : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'}`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Guest CRM & Notes</span>
            </button>
            <button
              onClick={() => setActiveTab('communications')}
              className={`px-4 py-2.5 text-xs font-medium rounded-xl transition-all duration-300 flex items-center gap-2 ${activeTab === 'communications' ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20 scale-[1.02]' : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Communications Hub</span>
            </button>
          </div>

          {/* Minimalist Search and Filter Controls */}
          <div className="flex items-center gap-2.5 w-full xl:w-auto justify-end">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Room 302, item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#050811] text-xs text-neutral-200 pl-9 pr-3.5 py-2.5 rounded-xl border border-white/[0.06] focus:border-amber-400 focus:outline-none w-40 sm:w-48 transition-all"
              />
            </div>
            <div className="relative flex items-center">
              <Filter className="w-3.5 h-3.5 text-amber-400 absolute left-3 pointer-events-none" />
              <select
                value={selectedRoomFilter}
                onChange={(e) => setSelectedRoomFilter(e.target.value)}
                className="bg-[#050811] text-xs font-mono text-amber-400 pl-9 pr-3 py-2.5 rounded-xl border border-white/[0.06] focus:outline-none cursor-pointer appearance-none"
              >
                <option value="ALL">All Rooms</option>
                {uniqueRooms.map(room => <option key={room} value={room}>Room {room}</option>)}
              </select>
            </div>
            <button
              onClick={handleToggleSound}
              className={`px-3.5 py-2.5 rounded-xl text-xs transition-all ${soundEnabled ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/[0.02] text-neutral-500 border border-white/[0.04]'}`}
              title="Toggle Alert Sounds"
            >
              {soundEnabled ? '🔔' : '🔕'}
            </button>
          </div>

        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-[#0b1021]/80 backdrop-blur-xl border border-white/[0.06] p-4 rounded-2xl shadow-xl transition-all hover:border-white/[0.12]">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">F&B Revenue</span>
            <span className="text-lg font-serif text-emerald-400">${totalRevenue.toFixed(2)}</span>
          </div>
          <div className="bg-[#0b1021]/80 backdrop-blur-xl border border-white/[0.06] p-4 rounded-2xl shadow-xl transition-all hover:border-white/[0.12]">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Avg. Order (AOV)</span>
            <span className="text-lg font-serif text-white">${averageOrderValue.toFixed(2)}</span>
          </div>
          <div className="bg-[#0b1021]/80 backdrop-blur-xl border border-white/[0.06] p-4 rounded-2xl shadow-xl transition-all hover:border-white/[0.12]">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Top Category</span>
            <span className="text-sm font-medium text-amber-400 truncate block">{topSellingItem}</span>
          </div>
          <div className="bg-[#0b1021]/80 backdrop-blur-xl border border-white/[0.06] p-4 rounded-2xl shadow-xl transition-all hover:border-white/[0.12]">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Active Rooms</span>
            <span className="text-lg font-serif text-white">{activeRoomsCount} Rooms</span>
          </div>
          <div className={`backdrop-blur-xl border p-4 rounded-2xl shadow-xl transition-all ${urgentCount > 0 ? 'bg-red-500/10 border-red-500/40 animate-pulse' : 'bg-[#0b1021]/80 border-white/[0.06]'}`}>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">VIP / Delayed</span>
            <span className={`text-lg font-serif ${urgentCount > 0 ? 'text-red-400 font-bold' : 'text-white'}`}>{urgentCount}</span>
          </div>
          <div className="bg-[#0b1021]/80 backdrop-blur-xl border border-white/[0.06] p-4 rounded-2xl shadow-xl transition-all hover:border-white/[0.12]">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Resp. Time</span>
            <span className="text-lg font-serif text-emerald-400">3m 45s</span>
          </div>
        </div>

        {/* TAB 1: LIVE OPERATIONS & CHAT REPLY */}
        {activeTab === 'operations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            <div className="lg:col-span-2 space-y-4">
              {columns.map((col) => {
                const colRequests = filteredRequests.filter(r => r.status === col.statusKey);
                const isExpanded = expandedPanel === col.statusKey;
                
                // Apply pagination slice if it's the Completed column
                const displayedRequests = col.statusKey === 'Completed' 
                  ? colRequests.slice(0, visibleCompletedCount) 
                  : colRequests;

                return (
                  <div key={col.statusKey} className={col.containerClass}>
                    
                    {/* Accordion Toggle Header */}
                    <button
                      onClick={() => togglePanel(col.statusKey)}
                      className={col.headerClass}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                          {col.icon}
                        </div>
                        <div>
                          <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-white">{col.title}</h2>
                          <p className="text-xs text-neutral-400">{col.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={col.badgeClass}>
                          {colRequests.length} Active
                        </span>
                        <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Smooth Expandable Accordion Content */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1200px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0'}`}>
                      <div className="space-y-3.5 bg-[#050811]/90 rounded-2xl p-4 border border-white/[0.06] max-h-[600px] overflow-y-auto">
                        {colRequests.length === 0 ? (
                          <div className="h-40 flex flex-col items-center justify-center text-neutral-400 text-xs border border-dashed border-white/[0.08] bg-[#0b1021]/40 rounded-2xl p-6 text-center">
                            <span className="text-2xl mb-2 opacity-50">✨</span>
                            <span className="font-semibold text-neutral-300 mb-1">All caught up!</span>
                            <span className="text-[11px] text-neutral-500">No active items currently in {col.title}.</span>
                          </div>
                        ) : (
                          <>
                            {displayedRequests.map((req) => {
                              const isDelayed = req.status === 'Pending' && (now - new Date(req.created_at).getTime() > 10 * 60 * 1000);
                              const guestName = roomToGuestNameMap[req.room];
                              const isSelected = selectedRequest?.id === req.id;

                              return (
                                <div 
                                  key={req.id} 
                                  onClick={() => setSelectedRequest(req)}
                                  className={`p-4 rounded-2xl border flex flex-col justify-between shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-0.5 ${
                                    isSelected 
                                      ? 'bg-amber-500/15 border-amber-500/80 shadow-amber-500/10' 
                                      : isDelayed 
                                      ? 'bg-red-950/20 border-red-500/40 hover:border-red-500/60' 
                                      : req.status === 'Pending' 
                                      ? 'bg-[#0f152d] border-amber-500/30 hover:border-amber-500/50' 
                                      : 'bg-[#0b1021]/70 border-white/[0.06] hover:border-white/[0.15] hover:bg-[#0f152d]/50'
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
                                    <p className="text-xs text-neutral-300 mb-3 bg-[#050811]/80 p-3 rounded-xl border border-white/[0.04] leading-relaxed">
                                      {req.note}
                                    </p>

                                    {/* Audio Waveform Player Integration for Voice Notes */}
                                    {req.audio_url && (
                                      <div className="mb-3 p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl flex items-center gap-3">
                                        <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                                          <Mic className="w-4 h-4 animate-pulse" />
                                        </div>
                                        <div className="flex-1">
                                          <span className="text-[10px] font-mono text-cyan-300 block mb-1">Voice Request Note</span>
                                          <audio controls src={req.audio_url} className="w-full h-7" />
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* One-Tap Quick-Action Status Buttons */}
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-3 border-t border-white/[0.06]" onClick={(e) => e.stopPropagation()}>
                                    {col.statusKey !== 'Pending' && (
                                      <button onClick={() => updateStatus(req.id, 'Pending')} className="py-1.5 bg-white/[0.03] hover:bg-white/[0.08] rounded-xl text-[10px] text-neutral-300 transition-all font-medium">
                                        Mark Pending
                                      </button>
                                    )}
                                    {col.statusKey !== 'In Progress' && (
                                      <button onClick={() => updateStatus(req.id, 'In Progress')} className="py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 rounded-xl text-[10px] transition-all font-medium">
                                        Mark In Progress
                                      </button>
                                    )}
                                    {col.statusKey !== 'On the Way' && (
                                      <button onClick={() => updateStatus(req.id, 'On the Way')} className="py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 rounded-xl text-[10px] transition-all font-medium">
                                        Dispatch (On Way)
                                      </button>
                                    )}
                                    {col.statusKey !== 'Completed' && (
                                      <button onClick={() => updateStatus(req.id, 'Completed')} className="py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold col-span-2 sm:col-span-1 transition-all shadow-sm">
                                        Mark Done
                                      </button>
                                    )}
                                  </div>

                                </div>
                              );
                            })}

                            {/* Load More Pagination Button for Completed Section */}
                            {col.statusKey === 'Completed' && visibleCompletedCount < colRequests.length && (
                              <button
                                onClick={() => setVisibleCompletedCount(prev => prev + 5)}
                                className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                              >
                                <span>Load More Completed Requests ({colRequests.length - visibleCompletedCount} remaining)</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            <div className="bg-[#0b1021]/80 backdrop-blur-xl border border-white/[0.06] p-6 rounded-3xl shadow-2xl flex flex-col h-[600px]">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
                <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">💬 Live Guest Chat & Reply</span>
                <span className="text-[10px] text-neutral-500 font-mono">Real-time sync</span>
              </div>

              {selectedRequest ? (
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  
                  {/* Room & Status Header */}
                  <div className="flex justify-between items-center bg-[#050811] p-3.5 rounded-2xl border border-amber-500/30 mb-3 shrink-0">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-400 block">Room {selectedRequest.room}</span>
                      <span className="text-xs text-white font-medium">{selectedRequest.category}</span>
                    </div>
                    <span className="text-[10px] uppercase px-2.5 py-1 rounded-lg font-mono bg-amber-500/20 text-amber-300">
                      {selectedRequest.status}
                    </span>
                  </div>

                  {/* Threaded Chat Bubbles View */}
                  <div className="space-y-3 overflow-y-auto pr-2 flex-1 bg-[#050811]/50 p-3 rounded-2xl border border-white/[0.04]">
                    {selectedRequest.note.split('| Staff Reply:').map((messageChunk, index) => {
                      const isStaffReply = index > 0;
                      return (
                        <div key={index} className={`flex flex-col ${isStaffReply ? 'items-end' : 'items-start'}`}>
                          <span className="text-[9px] font-mono text-neutral-500 mb-1 px-1">
                            {isStaffReply ? 'Manager / Staff' : `Guest (Room ${selectedRequest.room})`}
                          </span>
                          <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                            isStaffReply 
                              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded-tr-sm' 
                              : 'bg-[#0b1021] text-neutral-200 border border-white/[0.08] rounded-tl-sm'
                          }`}>
                            {messageChunk.trim()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Status Buttons */}
                  <div className="flex items-center gap-2 pt-3 shrink-0">
                    <button 
                      onClick={() => updateStatus(selectedRequest.id, 'In Progress')}
                      className="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white/[0.04] hover:bg-white/[0.08] text-amber-400 border border-white/[0.08] transition-all font-mono"
                    >
                      Mark Progress
                    </button>
                    <button 
                      onClick={() => updateStatus(selectedRequest.id, 'Completed')}
                      className="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all font-mono"
                    >
                      Mark Completed
                    </button>
                  </div>

                  {/* Reply Input Bar */}
                  <div className="pt-3 border-t border-white/[0.06] mt-3 flex items-center gap-2 shrink-0">
                    <input 
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                      placeholder="Type reply to guest room..."
                      className="flex-1 bg-[#050811] text-xs text-white focus:outline-none px-4 py-3 rounded-xl border border-white/[0.06] focus:border-amber-400 transition-all"
                    />
                    <button 
                      onClick={handleSendReply}
                      className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs uppercase tracking-wider font-mono shadow-md transition-all"
                    >
                      Send
                    </button>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-500 text-xs">
                  <span className="text-2xl mb-2 opacity-40">📨</span>
                  <p className="max-w-xs leading-relaxed">Select any ticket card from the live pipeline to open the interactive chat reply interface.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: GUEST REVIEWS & FEEDBACK PANEL */}
        {activeTab === 'reviews' && (
          <div className="bg-[#0b1021]/80 backdrop-blur-xl border border-white/[0.06] p-6 sm:p-8 rounded-3xl shadow-2xl animate-fadeIn space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase block mb-1">Guest Sentiment & Evaluation</span>
                <h2 className="text-xl font-serif text-white">Guest Reviews & Ratings Log</h2>
              </div>
              <span className="text-xs font-mono text-neutral-400 bg-[#050811] px-4 py-2 rounded-2xl border border-white/[0.06]">
                Total Submissions: {feedbackList.length}
              </span>
            </div>

            {feedbackList.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-neutral-400 text-xs tracking-wider uppercase font-mono border border-dashed border-white/[0.08] rounded-2xl bg-[#050811]/40">
                <span className="text-3xl mb-2 opacity-50">⭐</span>
                <span className="font-semibold text-neutral-300 mb-1">No guest reviews yet</span>
                <span className="text-[11px] text-neutral-500">Submissions from guest tablets will appear here.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbackList.map((item) => {
                  const guestName = roomToGuestNameMap[item.room];
                  return (
                    <div 
                      key={item.id}
                      className="bg-[#050811] border border-white/[0.08] p-5 rounded-2xl shadow-xl flex flex-col gap-3 transition-all hover:border-amber-500/30"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/25">
                            Room {item.room} {guestName ? `(${guestName})` : ''}
                          </span>
                          <div className="flex items-center text-amber-400 text-sm">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < (item.rating || 0) ? 'text-amber-400' : 'text-neutral-700'}>
                                ★
                              </span>
                            ))}
                            <span className="ml-2 text-xs font-mono text-neutral-300 font-bold">({item.rating}/5)</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-200 bg-[#0b1021] p-3.5 rounded-xl border border-white/[0.04] leading-relaxed italic">
                        "{item.comment || 'No written comment provided.'}"
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STAFF DIRECTORY */}
        {activeTab === 'staff' && (
          <div className="bg-[#0b1021]/80 backdrop-blur-xl border border-white/[0.06] p-6 sm:p-8 rounded-3xl shadow-2xl animate-fadeIn space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase block mb-1">Personnel Management</span>
                <h2 className="text-xl font-serif text-white">Staff Member Directory & Roster Control</h2>
              </div>
              <button
                onClick={() => setIsStaffModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-medium text-xs px-5 py-3 rounded-2xl transition-all shadow-lg flex items-center gap-2"
              >
                <span>+ Register New Staff</span>
              </button>
            </div>

            {dbStaffMembers.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-neutral-400 text-xs border border-dashed border-white/[0.08] rounded-2xl bg-[#050811]/40 text-center">
                <span className="text-2xl mb-2 opacity-50">👥</span>
                <span className="font-semibold text-neutral-300">No staff registered yet</span>
                <span className="text-[11px] text-neutral-500 mt-1">Click "Register New Staff" above to add team members.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {dbStaffMembers.map((staff, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#050811] p-5 rounded-2xl border border-white/[0.06] shadow-lg transition-all hover:border-amber-500/30">
                    <div className="space-y-1">
                      <span className="font-semibold text-white block text-sm">{staff.name}</span>
                      <span className="text-xs text-amber-400 capitalize bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 inline-block font-mono">
                        {staff.department} {staff.role ? `• ${staff.role}` : ''}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteStaff(staff.name, staff.department)} 
                      className="text-neutral-500 hover:text-red-400 text-xs p-2.5 bg-white/[0.02] hover:bg-red-500/10 rounded-xl transition-all"
                      title="Remove Staff"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GUEST CRM & SHIFT NOTES (Updated with Responsive Multi-Column Grid) */}
        {activeTab === 'crm' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
            
            <div className="bg-[#0b1021]/80 backdrop-blur-xl border border-white/[0.06] p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-6">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase block mb-1">Guest Profiles</span>
                    <h2 className="text-xl font-serif text-white">Guest CRM Memory Database</h2>
                  </div>
                  <button
                    onClick={() => setIsCrmModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                  >
                    + Add Profile
                  </button>
                </div>

                {/* Updated Responsive Grid Container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-1">
                  {guestProfiles.length === 0 ? (
                    <div className="col-span-full h-40 flex flex-col items-center justify-center text-neutral-400 text-xs border border-dashed border-white/[0.08] rounded-2xl bg-[#050811]/40 text-center">
                      <span className="text-2xl mb-2 opacity-50">📂</span>
                      <span className="font-semibold text-neutral-300">No guest profiles stored</span>
                      <span className="text-[11px] text-neutral-500 mt-1">Add guest preferences to track personalized service.</span>
                    </div>
                  ) : (
                    guestProfiles.map((p) => (
                      <div key={p.id} className="flex flex-col justify-between bg-[#050811] p-4 rounded-2xl border border-white/[0.06] shadow transition-all hover:border-amber-500/30">
                        <div>
                          <span className="font-semibold text-amber-400 text-sm block mb-1">Room {p.room} — <span className="text-white">{p.guest_name || 'Guest'}</span></span>
                          <p className="text-xs text-neutral-300 italic">"{p.preferences}"</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#0b1021]/80 backdrop-blur-xl border border-white/[0.06] p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-6">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase block mb-1">Handover Log</span>
                    <h2 className="text-xl font-serif text-white">Shift Notes & Handover Log</h2>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono bg-white/[0.03] px-3 py-1 rounded-xl border border-white/[0.05]">Auto-saved</span>
                </div>
                <textarea
                  value={shiftNotes}
                  onChange={handleShiftNotesChange}
                  placeholder="Type hand-over notes for incoming shift managers..."
                  className="w-full bg-[#050811] text-neutral-200 text-xs p-4 rounded-2xl border border-white/[0.06] focus:border-amber-400 focus:outline-none h-64 resize-none leading-relaxed shadow-inner"
                />
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: COMMUNICATIONS HUB */}
        {activeTab === 'communications' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
            
            <div className="bg-[#0b1021]/80 backdrop-blur-xl border border-white/[0.06] p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase block mb-1">Broadcasts</span>
                  <h2 className="text-xl font-serif text-white">Granular Broadcast Center</h2>
                </div>
                
                <div className="flex bg-[#050811] p-1 rounded-xl border border-white/[0.06]">
                  <button type="button" onClick={() => setAnnouncementTarget('guest')} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${announcementTarget === 'guest' ? 'bg-amber-500 text-black font-semibold' : 'text-neutral-400'}`}>Guests</button>
                  <button type="button" onClick={() => setAnnouncementTarget('staff')} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${announcementTarget === 'staff' ? 'bg-blue-600 text-white font-semibold' : 'text-neutral-400'}`}>Staff</button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {announcementTarget === 'staff' ? (
                  <>
                    <select
                      value={selectedBroadcastDept}
                      onChange={(e) => { 
                        setSelectedBroadcastDept(e.target.value); 
                        setSelectedStaffName('all'); 
                      }}
                      className="bg-[#050811] text-cyan-400 text-xs px-3.5 py-2.5 rounded-xl border border-cyan-500/30 focus:outline-none capitalize cursor-pointer flex-1"
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
                      className="bg-[#050811] text-emerald-400 text-xs px-3.5 py-2.5 rounded-xl border border-emerald-500/30 focus:outline-none cursor-pointer flex-1"
                    >
                      <option value="all">All Staff in Dept ({filteredStaffForDropdown.length})</option>
                      {filteredStaffForDropdown.map((s) => (
                        <option key={s.name} value={s.name}>{s.name} {s.role ? `(${s.role})` : ''}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <select
                    value={guestAnnouncementRoom}
                    onChange={(e) => setGuestAnnouncementRoom(e.target.value)}
                    className="bg-[#050811] text-amber-400 text-xs px-3.5 py-2.5 rounded-xl border border-amber-500/30 focus:outline-none cursor-pointer w-full"
                  >
                    <option value="all">All Guests (Lobby / General)</option>
                    {uniqueRooms.map((roomNum) => <option key={roomNum} value={roomNum}>Room {roomNum}</option>)}
                  </select>
                )}
              </div>

              <form onSubmit={handlePublishAnnouncement} className="space-y-3">
                <textarea
                  value={newAnnouncementText}
                  onChange={(e) => setNewAnnouncementText(e.target.value)}
                  placeholder={selectedStaffName !== 'all' ? `Send private message directly to ${selectedStaffName}...` : "Type broadcast announcement message..."}
                  className="w-full bg-[#050811] text-neutral-200 text-xs p-4 rounded-2xl border border-white/[0.06] focus:border-amber-400 focus:outline-none h-24 resize-none leading-relaxed shadow-inner"
                />
                <button type="submit" className={`w-full font-medium text-xs py-3.5 rounded-2xl transition-all shadow-md ${announcementTarget === 'guest' ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                  {selectedStaffName !== 'all' ? 'Send Direct Message' : 'Publish Broadcast'}
                </button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {announcements.length === 0 ? (
                  <div className="py-6 text-center border border-dashed border-white/[0.08] rounded-2xl bg-[#050811]/40">
                    <span className="text-xs text-neutral-400 font-mono">No broadcasts active.</span>
                  </div>
                ) : (
                  announcements.map((ann) => (
                    <div key={ann.id} className="flex items-center justify-between bg-[#050811] px-4 py-3 rounded-2xl border border-white/[0.06]">
                      <div className="flex items-center gap-3 truncate max-w-[400px]">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-xl ${ann.target === 'staff' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                          {ann.target === 'staff' 
                            ? (ann.staff_name && ann.staff_name !== 'all' ? `Staff (${ann.staff_name})` : `Staff (${ann.staff_role || 'all'})`) 
                            : `Room ${ann.target_room || 'All'}`}
                        </span>
                        <span className="text-xs text-neutral-200 truncate">{ann.message}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleAnnouncementStatus(ann.id, ann.is_active)} className={`text-[10px] font-mono px-2.5 py-1 rounded-xl ${ann.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'}`}>
                          {ann.is_active ? 'LIVE' : 'HIDDEN'}
                        </button>
                        <button onClick={() => deleteAnnouncement(ann.id)} className="text-xs text-red-400 p-1 hover:text-red-300">✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-[#0b1021]/80 backdrop-blur-xl border border-white/[0.06] p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase block mb-1">Intercom</span>
                  <h2 className="text-xl font-serif text-white">Walkie-Talkie Voice Intercom</h2>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">Push-to-talk</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#050811] p-4 rounded-2xl border border-cyan-500/20">
                <span className="text-xs text-neutral-300">
                  Target: <strong className="text-amber-400">{selectedStaffName !== 'all' ? selectedStaffName : selectedBroadcastDept}</strong>
                </span>

                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-medium text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all animate-pulse"
                  >
                    <span>🔴 Record Voice Note</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all animate-bounce"
                  >
                    <span>⏹️ Stop & Send</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {voiceMessages.length === 0 ? (
                  <div className="py-6 text-center border border-dashed border-white/[0.08] rounded-2xl bg-[#050811]/40">
                    <span className="text-xs text-neutral-400 font-mono">No voice notes recorded yet.</span>
                  </div>
                ) : (
                  voiceMessages.map((msg) => (
                    <div key={msg.id} className="flex items-center justify-between bg-[#050811] px-4 py-3 rounded-2xl border border-cyan-500/20">
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                          {msg.recipient_target}
                        </span>
                        <audio controls src={msg.audio_url} className="h-8 max-w-[200px] sm:max-w-xs" />
                      </div>
                      <button onClick={() => deleteVoiceMessage(msg.id)} className="text-xs text-red-400 p-1 hover:text-red-300">✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL 1: ADD STAFF MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b1021] border border-white/[0.08] w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/[0.06]">
              <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Register New Staff Member</h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-neutral-400 hover:text-white p-2 text-sm">✕</button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">Staff Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chef Markos"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-[#050811] text-neutral-200 text-xs px-4 py-3 rounded-xl border border-white/[0.06] focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">Department</label>
                  <select
                    value={newStaffDept}
                    onChange={(e) => setNewStaffDept(e.target.value)}
                    className="w-full bg-[#050811] text-amber-400 text-xs px-4 py-3 rounded-xl border border-amber-500/30 focus:outline-none capitalize cursor-pointer"
                  >
                    <option value="kitchen">Kitchen</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="front desk">Front Desk</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">Job Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Head Chef"
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="w-full bg-[#050811] text-neutral-200 text-xs px-4 py-3 rounded-xl border border-white/[0.06] focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">Security PIN Code</label>
                <input
                  type="text"
                  placeholder="e.g. 1234"
                  value={newStaffPin}
                  onChange={(e) => setNewStaffPin(e.target.value)}
                  className="w-full bg-[#050811] text-amber-400 text-xs px-4 py-3 rounded-xl border border-white/[0.06] focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-5 py-3 rounded-xl text-xs bg-white/[0.03] text-neutral-300 hover:bg-white/[0.08] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs py-3 px-6 rounded-xl transition-all shadow-lg"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CRM PROFILE MODAL */}
      {isCrmModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b1021] border border-white/[0.08] w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/[0.06]">
              <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Add Guest CRM Profile</h3>
              <button onClick={() => setIsCrmModalOpen(false)} className="text-neutral-400 hover:text-white p-2 text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveGuestProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 104"
                    value={crmRoom}
                    onChange={(e) => setCrmRoom(e.target.value)}
                    className="w-full bg-[#050811] text-amber-400 text-xs px-4 py-3 rounded-xl border border-white/[0.06] focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. John Doe"
                    value={crmGuestName}
                    onChange={(e) => setCrmGuestName(e.target.value)}
                    className="w-full bg-[#050811] text-neutral-200 text-xs px-4 py-3 rounded-xl border border-white/[0.06] focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">Preferences & Notes</label>
                <textarea
                  value={crmPreferences}
                  onChange={(e) => setCrmPreferences(e.target.value)}
                  placeholder="e.g., Prefers extra feather pillows, allergic to peanuts..."
                  className="w-full bg-[#050811] text-neutral-200 text-xs p-4 rounded-xl border border-white/[0.06] focus:border-amber-400 focus:outline-none h-28 resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsCrmModalOpen(false)}
                  className="px-5 py-3 rounded-xl text-xs bg-white/[0.03] text-neutral-300 hover:bg-white/[0.08] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs py-3 px-6 rounded-xl transition-all shadow-lg"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}