'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Users, MessageSquare, Star, Shield, 
  Activity, CheckCircle2, Radio, Volume2, Mic, X, Send
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// SUPABASE CLIENT INITIALIZATION
// ==========================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vbdpofmwszffurkkfrkj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// REUSABLE HEADER & BADGES
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
  title, subtitle, searchQuery, onSearchChange, searchPlaceholder,
  filterValue, onFilterChange, filterOptions, primaryActionLabel, onPrimaryAction,
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
          className="w-full bg-[#0B0F17] text-sm text-white pl-9 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="bg-[#0B0F17] text-sm text-gray-300 pl-9 pr-8 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0B0F17] text-gray-200">{opt.label}</option>
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

type StatusType = 'Completed' | 'completed' | 'active' | 'pending' | 'vip' | 'delayed' | 'on-duty' | 'off-duty';

const StatusBadge: React.FC<{ status: StatusType; label?: string }> = ({ status, label }) => {
  const normStatus = (status || 'pending').toLowerCase();
  const configs: Record<string, { bg: string; text: string; border: string; dot: string; defaultLabel: string }> = {
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400', defaultLabel: 'Completed' },
    'on-duty': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400 animate-pulse', defaultLabel: 'On-Duty' },
    active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400', defaultLabel: 'Active' },
    pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400', defaultLabel: 'Pending' },
    vip: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-400 animate-pulse', defaultLabel: 'VIP' },
  };
  const config = configs[normStatus] || configs.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label || status || config.defaultLabel}
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
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalType, setModalType] = useState<string | null>(null);

  // Form States matching updated schema columns
  const [newReq, setNewReq] = useState({ room: '', guest_name: '', category: 'Food Order', note: '', status: 'pending' });
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Staff', department: 'kitchen', shift: 'Morning', status: 'on-duty', extension: 'Ext. 101', pin_code: '0000' });
  const [newGuest, setNewGuest] = useState({ room: '', guest_name: '', contact: '', status_category: 'vip', total_stays: '1 Stay', preferences: '' });
  const [newReview, setNewReview] = useState({ room: '', guest_name: '', rating: 5, comment: '' });
  const [newBroadcast, setNewBroadcast] = useState({ title: 'Hotel Announcement', message: '', target: 'all' });

  // Search & Filter States
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

  // Fetch Data & Real-time Subscriptions across all tables
  useEffect(() => {
    fetchAllData();

    const channel = supabase
      .channel('central-hotel-manager-realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Realtime change received:', payload);
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
      const [reqRes, revRes, staffRes, guestRes, chatRes] = await Promise.all([
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('guest_feedback').select('*').order('created_at', { ascending: false }),
        supabase.from('staff_members').select('*').order('created_at', { ascending: false }),
        supabase.from('guest_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('guest_chats').select('*').order('created_at', { ascending: false }),
      ]);

      if (reqRes.data) setRequests(reqRes.data);
      if (revRes.data) setReviews(revRes.data);
      if (staffRes.data) setStaff(staffRes.data);
      if (guestRes.data) setGuests(guestRes.data);
      if (chatRes.data) setChats(chatRes.data);
    } catch (error) {
      console.error('Error fetching Supabase data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('requests').insert([newReq]);
    if (!error) {
      setModalType(null);
      setNewReq({ room: '', guest_name: '', category: 'Food Order', note: '', status: 'pending' });
      fetchAllData();
    } else alert(error.message);
  };

  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('staff_members').insert([newStaff]);
    if (!error) {
      setModalType(null);
      setNewStaff({ name: '', role: 'Staff', department: 'kitchen', shift: 'Morning', status: 'on-duty', extension: 'Ext. 101', pin_code: '0000' });
      fetchAllData();
    } else alert(error.message);
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('guest_profiles').insert([newGuest]);
    if (!error) {
      setModalType(null);
      setNewGuest({ room: '', guest_name: '', contact: '', status_category: 'vip', total_stays: '1 Stay', preferences: '' });
      fetchAllData();
    } else alert(error.message);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('guest_feedback').insert([newReview]);
    if (!error) {
      setModalType(null);
      setNewReview({ room: '', guest_name: '', rating: 5, comment: '' });
      fetchAllData();
    } else alert(error.message);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBroadcast.message.trim()) return;
    const { error } = await supabase.from('announcements').insert([newBroadcast]);
    if (!error) {
      setNewBroadcast({ title: 'Hotel Announcement', message: '', target: 'all' });
      fetchAllData();
    } else alert(error.message);
  };

  const updateRequestStatus = async (id: string, status: string) => {
    await supabase.from('requests').update({ status }).eq('id', id);
    fetchAllData();
  };

  return (
    <div className="min-h-screen bg-[#06090F] text-gray-100 flex flex-col font-sans">
      {/* Navigation Header */}
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
            <p className="text-[10px] text-emerald-400">On Duty</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 font-semibold text-xs">
            TK
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* TAB 1: LIVE OPERATIONS */}
        {activeTab === 'operations' && (
          <div className="space-y-6">
            <UnifiedHeader
              title="Live Hotel Operations"
              subtitle="Real-time guest concierge requests synced from guest pages."
              searchQuery={opsSearch}
              onSearchChange={setOpsSearch}
              searchPlaceholder="Search room # or request..."
              filterValue={opsFilter}
              onFilterChange={setOpsFilter}
              filterOptions={[
                { label: 'All Requests', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Completed', value: 'completed' },
              ]}
              primaryActionLabel="New Request"
              onPrimaryAction={() => setModalType('request')}
            />
            <div className="bg-[#0B0F17] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Active Service Log</h3>
                <span className="text-xs text-gray-400">{requests.length} Total Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#06090F] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Room #</th>
                      <th className="py-3 px-4">Guest Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Note / Request</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {requests
                      .filter(r => opsFilter === 'all' || (r.status || '').toLowerCase() === opsFilter)
                      .filter(r => (String(r.room || '') + String(r.guest_name || '') + String(r.category || '') + String(r.note || '')).toLowerCase().includes(opsSearch.toLowerCase()))
                      .map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 px-4 font-bold text-white">Room {row.room}</td>
                        <td className="py-4 px-4 text-gray-200">{row.guest_name || 'Guest'}</td>
                        <td className="py-4 px-4 text-indigo-400">{row.category}</td>
                        <td className="py-4 px-4">{row.note || row.details || '—'}</td>
                        <td className="py-4 px-4"><StatusBadge status={row.status || 'pending'} /></td>
                        <td className="py-4 px-4 text-right">
                          <button 
                            onClick={() => updateRequestStatus(row.id, 'Completed')}
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
              subtitle="Monitor ratings and direct comments from guest feedback."
              searchQuery={reviewsSearch}
              onSearchChange={setReviewsSearch}
              searchPlaceholder="Search feedback comments..."
              filterValue={reviewsFilter}
              onFilterChange={setReviewsFilter}
              filterOptions={[{ label: 'All Ratings', value: 'all' }]}
              primaryActionLabel="Add Review"
              onPrimaryAction={() => setModalType('review')}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev, idx) => (
                <div key={rev.id || idx} className="bg-[#0B0F17] border border-gray-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">Room {rev.room} - {rev.guest_name || 'Guest'}</h4>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-amber-400 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rev.rating || 5}.0</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 italic mb-4">"{rev.comment}"</p>
                  </div>
                  <div className="pt-4 border-t border-gray-800/60 text-xs text-gray-400">
                    Logged: {new Date(rev.created_at || Date.now()).toLocaleDateString()}
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
              subtitle="Full personnel info from your existing staff_members database."
              searchQuery={staffSearch}
              onSearchChange={setStaffSearch}
              searchPlaceholder="Search staff name or department..."
              filterValue={staffFilter}
              onFilterChange={setStaffFilter}
              filterOptions={[
                { label: 'All Departments', value: 'all' },
                { label: 'Kitchen', value: 'kitchen' },
                { label: 'Housekeeping', value: 'housekeeping' },
                { label: 'Front Desk', value: 'front desk' },
                { label: 'Concierge', value: 'concierge' },
              ]}
              primaryActionLabel="Register Staff"
              onPrimaryAction={() => setModalType('staff')}
            />
            <div className="bg-[#0B0F17] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#06090F] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Staff Name</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Shift</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Extension</th>
                      <th className="py-3 px-4">PIN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {staff
                      .filter(s => staffFilter === 'all' || (s.department || '').toLowerCase().includes(staffFilter))
                      .filter(s => (String(s.name || '') + String(s.department || '') + String(s.role || '')).toLowerCase().includes(staffSearch.toLowerCase()))
                      .map((s, idx) => (
                      <tr key={s.id || idx} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 px-4 font-medium text-white">{s.name}</td>
                        <td className="py-4 px-4 text-indigo-300">{s.role || 'Staff'}</td>
                        <td className="py-4 px-4 text-gray-400 capitalize">{s.department}</td>
                        <td className="py-4 px-4 text-gray-400 text-xs">{s.shift || 'Morning'}</td>
                        <td className="py-4 px-4"><StatusBadge status={s.status || 'on-duty'} /></td>
                        <td className="py-4 px-4 text-gray-400">{s.extension || 'Ext. 101'}</td>
                        <td className="py-4 px-4 font-mono text-xs text-gray-400">{s.pin_code || '0000'}</td>
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
              subtitle="Manage guest profiles and preferences from guest_profiles."
              searchQuery={crmSearch}
              onSearchChange={setCrmSearch}
              searchPlaceholder="Search guest name..."
              filterValue={crmFilter}
              onFilterChange={setCrmFilter}
              filterOptions={[{ label: 'All Profiles', value: 'all' }]}
              primaryActionLabel="Add Profile"
              onPrimaryAction={() => setModalType('guest')}
            />
            <div className="bg-[#0B0F17] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#06090F] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Room</th>
                      <th className="py-3 px-4">Guest Name</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Total Stays</th>
                      <th className="py-3 px-4">Preferences</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {guests.map((g, idx) => (
                      <tr key={g.id || idx} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 px-4 font-bold text-white">Room {g.room}</td>
                        <td className="py-4 px-4 font-medium text-indigo-300">{g.guest_name}</td>
                        <td className="py-4 px-4 text-gray-400">{g.contact || 'N/A'}</td>
                        <td className="py-4 px-4"><StatusBadge status={g.status_category || 'vip'} /></td>
                        <td className="py-4 px-4 text-gray-400">{g.total_stays || '1 Stay'}</td>
                        <td className="py-4 px-4 text-gray-400 text-xs">{g.preferences || 'None'}</td>
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
              subtitle="Real-time guest concierge chats and hotel announcements."
              searchQuery={commSearch}
              onSearchChange={setCommSearch}
              searchPlaceholder="Search messages..."
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
                      <span>Live Guest Concierge Chats & Broadcasts</span>
                    </h3>
                    <StatusBadge status="on-duty" label="System Online" />
                  </div>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {chats.map((c, idx) => (
                      <div key={c.id || idx} className="bg-[#06090F] border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                          <span className="text-indigo-400 font-medium">Room {c.room} ({c.sender_type || 'guest'})</span>
                          <span>{new Date(c.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-gray-200">"{c.message}"</p>
                      </div>
                    ))}
                  </div>
                </div>
                <form onSubmit={handleSendBroadcast} className="flex items-center gap-3 pt-4 border-t border-gray-800">
                  <input
                    id="broadcast-input"
                    type="text"
                    value={newBroadcast.message}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                    placeholder="Type broadcast announcement to staff & guests..."
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

      {/* MODALS */}
      {modalType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F17] border border-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button onClick={() => setModalType(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            {modalType === 'request' && (
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Create New Request</h3>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Room Number</label>
                  <input type="text" value={newReq.room} onChange={e => setNewReq({...newReq, room: e.target.value})} placeholder="e.g. 204" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Guest Name</label>
                  <input type="text" value={newReq.guest_name} onChange={e => setNewReq({...newReq, guest_name: e.target.value})} placeholder="e.g. Dr. Samuel" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Category</label>
                  <select value={newReq.category} onChange={e => setNewReq({...newReq, category: e.target.value})} className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white">
                    <option value="Food Order">Food Order</option>
                    <option value="Call Waiter">Call Waiter</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Laundry">Laundry</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Note / Details</label>
                  <input type="text" value={newReq.note} onChange={e => setNewReq({...newReq, note: e.target.value})} placeholder="e.g. Extra towels" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium text-sm transition-all cursor-pointer">Submit Request</button>
              </form>
            )}

            {modalType === 'staff' && (
              <form onSubmit={handleRegisterStaff} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Register Staff Member</h3>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                  <input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="e.g. Solomon Worku" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Role</label>
                  <input type="text" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} placeholder="Executive Head Chef" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Department</label>
                  <select value={newStaff.department} onChange={e => setNewStaff({...newStaff, department: e.target.value})} className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white">
                    <option value="Kitchen & Dining">Kitchen & Dining</option>
                    <option value="Front Desk & Reception">Front Desk & Reception</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Concierge">Concierge</option>
                    <option value="Engineering & Maintenance">Engineering & Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Extension</label>
                  <input type="text" value={newStaff.extension} onChange={e => setNewStaff({...newStaff, extension: e.target.value})} placeholder="Ext. 101" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">PIN Code</label>
                  <input type="text" value={newStaff.pin_code} onChange={e => setNewStaff({...newStaff, pin_code: e.target.value})} placeholder="0000" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium text-sm transition-all cursor-pointer">Save Staff Member</button>
              </form>
            )}

            {modalType === 'guest' && (
              <form onSubmit={handleAddGuest} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Add Guest Profile</h3>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Room Number</label>
                  <input type="text" value={newGuest.room} onChange={e => setNewGuest({...newGuest, room: e.target.value})} placeholder="204" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Guest Name</label>
                  <input type="text" value={newGuest.guest_name} onChange={e => setNewGuest({...newGuest, guest_name: e.target.value})} placeholder="Dr. Samuel Abebe" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Contact</label>
                  <input type="text" value={newGuest.contact} onChange={e => setNewGuest({...newGuest, contact: e.target.value})} placeholder="+251..." className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Preferences</label>
                  <input type="text" value={newGuest.preferences} onChange={e => setNewGuest({...newGuest, preferences: e.target.value})} placeholder="Extra pillows, quiet room" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium text-sm transition-all cursor-pointer">Save Profile</button>
              </form>
            )}

            {modalType === 'review' && (
              <form onSubmit={handleAddReview} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Add Feedback</h3>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Room Number</label>
                  <input type="text" value={newReview.room} onChange={e => setNewReview({...newReview, room: e.target.value})} placeholder="204" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Guest Name</label>
                  <input type="text" value={newReview.guest_name} onChange={e => setNewReview({...newReview, guest_name: e.target.value})} placeholder="Dr. Samuel Abebe" className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Rating (1-5)</label>
                  <input type="number" min="1" max="5" value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})} className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Comment</label>
                  <textarea value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} className="w-full bg-[#06090F] border border-gray-800 p-3 rounded-xl text-sm text-white" required />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium text-sm transition-all cursor-pointer">Publish</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}