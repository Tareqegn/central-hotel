'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Users, MessageSquare, Star, Shield, 
  Activity, Bell, Phone, CheckCircle2, Clock, AlertTriangle, 
  ChevronRight, Calendar, Building, Radio, Settings, LogOut,
  MoreVertical, Eye, Edit3, Trash2, Send, Mic, Volume2, X
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// SUPABASE CLIENT INITIALIZATION
// ==========================================
// Replace these with your actual environment variables or supabase client import
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vbdpofmwszffurkkfrkj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// REUSABLE DESIGN SYSTEM COMPONENTS
// ==========================================

interface UnifiedHeaderProps {
  title: string;
  subtitle: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder: string;
  filterValue: string;
  onFilterChange: (filter: string) => void;
  filterOptions: { label: string; value: string }[];
  primaryActionLabel: string;
  onPrimaryAction: () => void;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filterValue,
  onFilterChange,
  filterOptions,
  primaryActionLabel,
  onPrimaryAction,
}) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-800">
    <div>
      <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
      <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
    </div>
    
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-[#0B0F17] text-sm text-white pl-9 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Filter className="w-4 h-4 text-gray-500" />
        </div>
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="bg-[#0B0F17] text-sm text-gray-300 pl-9 pr-8 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-indigo-500 appearance-none transition-colors cursor-pointer"
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0B0F17] text-gray-200">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onPrimaryAction}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>{primaryActionLabel}</span>
      </button>
    </div>
  </div>
);

type StatusType = 'completed' | 'active' | 'pending' | 'vip' | 'delayed' | 'on-duty' | 'off-duty';

const StatusBadge: React.FC<{ status: StatusType; label?: string }> = ({ status, label }) => {
  const configs: Record<StatusType, { bg: string; text: string; border: string; dot: string; defaultLabel: string }> = {
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400', defaultLabel: 'Completed' },
    'on-duty': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400 animate-pulse', defaultLabel: 'On-Duty' },
    active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400', defaultLabel: 'Active' },
    pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400', defaultLabel: 'Pending' },
    vip: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-400 animate-pulse', defaultLabel: 'VIP' },
    delayed: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-400 animate-pulse', defaultLabel: 'Delayed' },
    'off-duty': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-400', defaultLabel: 'Off-Duty' }
  };

  const config = configs[status] || configs.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label || config.defaultLabel}
    </span>
  );
};

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================

export default function CentralYamarechManagerDashboard() {
  const [activeTab, setActiveTab] = useState<'operations' | 'reviews' | 'staff' | 'crm' | 'communications'>('operations');

  // Supabase Data States
  const [requests, setRequests] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [modalType, setModalType] = useState<string | null>(null);

  // Form Input States
  const [newReq, setNewReq] = useState({ room_number: '', guest_name: '', request_text: '', department: 'Kitchen', status: 'pending' });
  const [newStaff, setNewStaff] = useState({ name: '', role: '', department: 'Kitchen & Dining', shift: 'Morning (6AM - 2PM)', status: 'on-duty', extension: '' });
  const [newGuest, setNewGuest] = useState({ name: '', contact: '', status_category: 'vip', total_stays: '1 Stay', preferences: '' });
  const [newReview, setNewReview] = useState({ guest_name: '', room_number: '', rating: 5, comment: '', status: 'completed' });
  const [newBroadcast, setNewBroadcast] = useState({ title: '', message: '' });

  // Fetch Data from Supabase on Load & Setup Real-time Subscriptions
  useEffect(() => {
    fetchAllData();

    // Supabase Real-time Channel Subscriptions
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [reqRes, revRes, staffRes, guestRes, broadRes] = await Promise.all([
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('staff').select('*').order('created_at', { ascending: false }),
        supabase.from('guests').select('*').order('created_at', { ascending: false }),
        supabase.from('broadcasts').select('*').order('created_at', { ascending: false }),
      ]);

      if (reqRes.data) setRequests(reqRes.data);
      if (revRes.data) setReviews(revRes.data);
      if (staffRes.data) setStaff(staffRes.data);
      if (guestRes.data) setGuests(guestRes.data);
      if (broadRes.data) setBroadcasts(broadRes.data);
    } catch (error) {
      console.error('Error fetching Supabase data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Inserting Data into Supabase
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('requests').insert([newReq]);
    if (!error) {
      setModalType(null);
      setNewReq({ room_number: '', guest_name: '', request_text: '', department: 'Kitchen', status: 'pending' });
      fetchAllData();
    } else {
      alert('Error creating request: ' + error.message);
    }
  };

  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('staff').insert([newStaff]);
    if (!error) {
      setModalType(null);
      setNewStaff({ name: '', role: '', department: 'Kitchen & Dining', shift: 'Morning (6AM - 2PM)', status: 'on-duty', extension: '' });
      fetchAllData();
    } else {
      alert('Error registering staff: ' + error.message);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('guests').insert([newGuest]);
    if (!error) {
      setModalType(null);
      setNewGuest({ name: '', contact: '', status_category: 'vip', total_stays: '1 Stay', preferences: '' });
      fetchAllData();
    } else {
      alert('Error adding guest: ' + error.message);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('reviews').insert([newReview]);
    if (!error) {
      setModalType(null);
      setNewReview({ guest_name: '', room_number: '', rating: 5, comment: '', status: 'completed' });
      fetchAllData();
    } else {
      alert('Error adding review: ' + error.message);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('broadcasts').insert([{ ...newBroadcast, sender: 'Executive Manager' }]);
    if (!error) {
      setNewBroadcast({ title: '', message: '' });
      fetchAllData();
    } else {
      alert('Error sending broadcast: ' + error.message);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    await supabase.from('requests').update({ status }).eq('id', id);
    fetchAllData();
  };

  // Search & Filter States per Tab
  const [opsSearch, setOpsSearch] = useState('');
  const [opsFilter, setOpsFilter] = useState('all');
  const [reviewsSearch, setReviewsSearch] = useState('');
  const [reviewsFilter, setReviewsFilter] = useState('all');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffFilter, setStaffFilter] = useState('all');
  const [crmSearch, setCrmSearch] = useState('');
  const [crmFilter, setCrmFilter] = useState('all');
  const [commSearch, setCommSearch] = useState('');
  const [commFilter, setCommFilter] = useState('all');

  return (
    <div className="min-h-screen bg-[#06090F] text-gray-100 flex flex-col font-sans">
      {/* Top Executive Navigation Bar */}
      <header className="h-16 bg-[#0B0F17] border-b border-gray-800 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
            CY
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Central Yamarech</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Executive Manager Suite</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-[#06090F] p-1 rounded-xl border border-gray-800">
          {[
            { id: 'operations', label: 'Live Operations', icon: Activity },
            { id: 'reviews', label: 'Guest Reviews', icon: Star },
            { id: 'staff', label: 'Staff Directory', icon: Users },
            { id: 'crm', label: 'Guest CRM', icon: Shield },
            { id: 'communications', label: 'Communications', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-white">Tarekegn K.</p>
            <p className="text-[10px] text-emerald-400">On Duty (Shift A)</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 font-semibold text-xs">
            TK
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* TAB 1: LIVE OPERATIONS */}
        {activeTab === 'operations' && (
          <div className="space-y-6">
            <UnifiedHeader
              title="Live Hotel Operations"
              subtitle="Real-time tracking of guest requests, kitchen orders, and room service tasks."
              searchQuery={opsSearch}
              onSearchChange={setOpsSearch}
              searchPlaceholder="Search requests or room #..."
              filterValue={opsFilter}
              onFilterChange={setOpsFilter}
              filterOptions={[
                { label: 'All Requests', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Completed', value: 'completed' },
                { label: 'VIP Priority', value: 'vip' },
              ]}
              primaryActionLabel="New Request"
              onPrimaryAction={() => setModalType('request')}
            />

            <div className="bg-[#0B0F17] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Active Service Log (Supabase Live)</h3>
                <span className="text-xs text-gray-400">{requests.length} Total Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#06090F] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Room / Guest</th>
                      <th className="py-3 px-4">Service / Request</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {requests
                      .filter(r => opsFilter === 'all' || r.status === opsFilter)
                      .filter(r => r.guest_name?.toLowerCase().includes(opsSearch.toLowerCase()) || r.room_number?.toLowerCase().includes(opsSearch.toLowerCase()))
                      .map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 px-4 font-medium text-white">
                          <div>{row.room_number}</div>
                          <div className="text-xs text-gray-400 font-normal">{row.guest_name}</div>
                        </td>
                        <td className="py-4 px-4">{row.request_text}</td>
                        <td className="py-4 px-4 text-gray-400">{row.department}</td>
                        <td className="py-4 px-4"><StatusBadge status={row.status} /></td>
                        <td className="py-4 px-4 text-right">
                          <button 
                            onClick={() => updateRequestStatus(row.id, 'completed')}
                            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer" 
                            title="Mark Completed"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GUEST REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <UnifiedHeader
              title="Guest Feedback & Reviews"
              subtitle="Monitor real-time satisfaction metrics, ratings, and direct feedback comments."
              searchQuery={reviewsSearch}
              onSearchChange={setReviewsSearch}
              searchPlaceholder="Search review comments..."
              filterValue={reviewsFilter}
              onFilterChange={setReviewsFilter}
              filterOptions={[
                { label: 'All Ratings', value: 'all' },
                { label: '5 Stars', value: '5' },
                { label: '4 Stars', value: '4' },
              ]}
              primaryActionLabel="Add Review"
              onPrimaryAction={() => setModalType('review')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev, idx) => (
                <div key={rev.id || idx} className="bg-[#0B0F17] border border-gray-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{rev.guest_name}</h4>
                        <p className="text-xs text-gray-400">{rev.room_number}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-amber-400 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 italic mb-4">"{rev.comment}"</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800/60">
                    <StatusBadge status={rev.status} label="Verified Review" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STAFF DIRECTORY */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <UnifiedHeader
              title="Staff Directory & Roster"
              subtitle="Manage hotel personnel, active shift assignments, and department statuses."
              searchQuery={staffSearch}
              onSearchChange={setStaffSearch}
              searchPlaceholder="Search staff name or role..."
              filterValue={staffFilter}
              onFilterChange={setStaffFilter}
              filterOptions={[
                { label: 'All Departments', value: 'all' },
                { label: 'Kitchen & Dining', value: 'kitchen & dining' },
                { label: 'Housekeeping', value: 'housekeeping' },
              ]}
              primaryActionLabel="Register Staff"
              onPrimaryAction={() => setModalType('staff')}
            />

            <div className="bg-[#0B0F17] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#06090F] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Shift</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Contact Ext.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {staff.map((s, idx) => (
                      <tr key={s.id || idx} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 px-4 font-medium text-white">
                          <div>{s.name}</div>
                          <div className="text-xs text-gray-400 font-normal">{s.role}</div>
                        </td>
                        <td className="py-4 px-4">{s.department}</td>
                        <td className="py-4 px-4 text-gray-400">{s.shift}</td>
                        <td className="py-4 px-4"><StatusBadge status={s.status} /></td>
                        <td className="py-4 px-4 text-gray-400 font-mono text-xs">{s.extension}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GUEST CRM */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            <UnifiedHeader
              title="Guest CRM & Preferences"
              subtitle="Manage guest profiles, stay history, VIP preferences, and special dietary notes."
              searchQuery={crmSearch}
              onSearchChange={setCrmSearch}
              searchPlaceholder="Search guest name or email..."
              filterValue={crmFilter}
              onFilterChange={setCrmFilter}
              filterOptions={[
                { label: 'All Profiles', value: 'all' },
                { label: 'VIP Guests', value: 'vip' },
              ]}
              primaryActionLabel="Add Profile"
              onPrimaryAction={() => setModalType('guest')}
            />

            <div className="bg-[#0B0F17] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#06090F] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Guest Name</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Status Category</th>
                      <th className="py-3 px-4">Total Stays</th>
                      <th className="py-3 px-4">Special Preferences</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {guests.map((g, idx) => (
                      <tr key={g.id || idx} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 px-4 font-medium text-white">{g.name}</td>
                        <td className="py-4 px-4 text-gray-400 text-xs">{g.contact}</td>
                        <td className="py-4 px-4"><StatusBadge status={g.status_category} /></td>
                        <td className="py-4 px-4 text-gray-300">{g.total_stays}</td>
                        <td className="py-4 px-4 text-gray-400 text-xs">{g.preferences}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COMMUNICATIONS HUB */}
        {activeTab === 'communications' && (
          <div className="space-y-6">
            <UnifiedHeader
              title="Communications & Intercom Hub"
              subtitle="Hotel-wide broadcast announcements, walkie-talkie voice channels, and staff messaging."
              searchQuery={commSearch}
              onSearchChange={setCommSearch}
              searchPlaceholder="Search broadcasts..."
              filterValue={commFilter}
              onFilterChange={setCommFilter}
              filterOptions={[{ label: 'All Channels', value: 'all' }]}
              primaryActionLabel="Send Broadcast"
              onPrimaryAction={() => document.getElementById('broadcast-input')?.focus()}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#0B0F17] border border-gray-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-indigo-400" />
                      <span>Live Intercom & Broadcast Center</span>
                    </h3>
                    <StatusBadge status="on-duty" label="System Online" />
                  </div>
                  
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {broadcasts.map((b, idx) => (
                      <div key={b.id || idx} className="bg-[#06090F] border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                          <span className="text-indigo-400 font-medium">{b.title || 'General Broadcast'}</span>
                          <span>{new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-gray-200">"{b.message}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSendBroadcast} className="flex items-center gap-3 pt-4 border-t border-gray-800">
                  <input
                    id="broadcast-input"
                    type="text"
                    value={newBroadcast.message}
                    onChange={(e) => setNewBroadcast({ title: 'Manager Announcement', message: e.target.value })}
                    placeholder="Type broadcast announcement to staff..."
                    className="flex-1 bg-[#06090F] text-sm text-white px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-indigo-500"
                  />
                  <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer">
                    <Send className="w-4 h-4" />
                    <span>Broadcast</span>
                  </button>
                </form>
              </div>

              <div className="bg-[#0B0F17] border border-gray-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>Walkie-Talkie Channel</span>
                    </h3>
                    <span className="text-xs text-emerald-400 font-mono">CH-01</span>
                  </div>

                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-20 h-20 rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 cursor-pointer hover:bg-indigo-600/20 transition-all shadow-lg">
                      <Mic className="w-8 h-8 animate-pulse" />
                    </div>
                    <span className="text-xs font-medium text-white">Live Voice Channel Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DYNAMIC MODALS FOR INSERTING DATA */}
      {modalType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F17] border border-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button onClick={() => setModalType(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            {modalType === 'request' && (
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Create New Guest Request</h3>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Room Number</label>
                  <input type="text" value={newReq.room_number} onChange={e => setNewReq({...newReq, room_number: e.target.value})} placeholder="e.g. Room 304" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Guest Name</label>
                  <input type="text" value={newReq.guest_name} onChange={e => setNewReq({...newReq, guest_name: e.target.value})} placeholder="e.g. Ato Kebede" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Request Details</label>
                  <input type="text" value={newReq.request_text} onChange={e => setNewReq({...newReq, request_text: e.target.value})} placeholder="e.g. In-Room Dining" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Department</label>
                  <select value={newReq.department} onChange={e => setNewReq({...newReq, department: e.target.value})} className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white">
                    <option value="Kitchen">Kitchen</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Front Desk">Front Desk</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium text-sm transition-all cursor-pointer">Submit Request</button>
              </form>
            )}

            {modalType === 'staff' && (
              <form onSubmit={handleRegisterStaff} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Register New Staff Member</h3>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                  <input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="e.g. Solomon Worku" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Role / Title</label>
                  <input type="text" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} placeholder="e.g. Head Chef" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Department</label>
                  <input type="text" value={newStaff.department} onChange={e => setNewStaff({...newStaff, department: e.target.value})} className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Contact Extension</label>
                  <input type="text" value={newStaff.extension} onChange={e => setNewStaff({...newStaff, extension: e.target.value})} placeholder="Ext. 104" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium text-sm transition-all cursor-pointer">Save Staff Member</button>
              </form>
            )}

            {modalType === 'guest' && (
              <form onSubmit={handleAddGuest} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Add Guest CRM Profile</h3>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Guest Name</label>
                  <input type="text" value={newGuest.name} onChange={e => setNewGuest({...newGuest, name: e.target.value})} className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Contact Info</label>
                  <input type="text" value={newGuest.contact} onChange={e => setNewGuest({...newGuest, contact: e.target.value})} className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Preferences / Notes</label>
                  <input type="text" value={newGuest.preferences} onChange={e => setNewGuest({...newGuest, preferences: e.target.value})} placeholder="e.g. Extra pillows" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium text-sm transition-all cursor-pointer">Create Profile</button>
              </form>
            )}

            {modalType === 'review' && (
              <form onSubmit={handleAddReview} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Add Guest Review</h3>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Guest Name</label>
                  <input type="text" value={newReview.guest_name} onChange={e => setNewReview({...newReview, guest_name: e.target.value})} className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Room #</label>
                  <input type="text" value={newReview.room_number} onChange={e => setNewReview({...newReview, room_number: e.target.value})} className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Rating (1-5)</label>
                  <input type="number" min="1" max="5" value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})} className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Comment</label>
                  <textarea value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium text-sm transition-all cursor-pointer">Publish Review</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}