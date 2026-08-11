'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Users, MessageSquare, Star, Shield, 
  Activity, Bell, Phone, CheckCircle2, Clock, AlertTriangle, 
  ChevronRight, Calendar, Building, Radio, Settings, LogOut,
  MoreVertical, Eye, Edit3, Trash2, Send, Mic, Volume2
} from 'lucide-react';

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
      {/* Contextual Search Bar */}
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

      {/* Quick Filters */}
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

      {/* Primary Action Button */}
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
    completed: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-400',
      defaultLabel: 'Completed'
    },
    'on-duty': {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-400 animate-pulse',
      defaultLabel: 'On-Duty'
    },
    active: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-400',
      defaultLabel: 'Active'
    },
    pending: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      dot: 'bg-amber-400',
      defaultLabel: 'Pending'
    },
    vip: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      dot: 'bg-rose-400 animate-pulse',
      defaultLabel: 'VIP'
    },
    delayed: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      dot: 'bg-rose-400 animate-pulse',
      defaultLabel: 'Delayed'
    },
    'off-duty': {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/20',
      dot: 'bg-slate-400',
      defaultLabel: 'Off-Duty'
    }
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

  // Tab 1: Live Operations State
  const [opsSearch, setOpsSearch] = useState('');
  const [opsFilter, setOpsFilter] = useState('all');

  // Tab 2: Guest Reviews State
  const [reviewsSearch, setReviewsSearch] = useState('');
  const [reviewsFilter, setReviewsFilter] = useState('all');

  // Tab 3: Staff Directory State
  const [staffSearch, setStaffSearch] = useState('');
  const [staffFilter, setStaffFilter] = useState('all');

  // Tab 4: Guest CRM State
  const [crmSearch, setCrmSearch] = useState('');
  const [crmFilter, setCrmFilter] = useState('all');

  // Tab 5: Communications Hub State
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

        {/* Navigation Tabs */}
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
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Manager Profile Quick Display */}
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

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center gap-1 bg-[#0B0F17] border-b border-gray-800 p-2 overflow-x-auto">
        {[
          { id: 'operations', label: 'Operations', icon: Activity },
          { id: 'reviews', label: 'Reviews', icon: Star },
          { id: 'staff', label: 'Staff', icon: Users },
          { id: 'crm', label: 'CRM', icon: Shield },
          { id: 'communications', label: 'Comms', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-400 bg-[#06090F]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

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
              onPrimaryAction={() => alert('Open New Request Modal')}
            />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Active Requests', value: '14', change: '+2 from last hour', status: 'pending' as StatusType },
                { title: 'Completed Today', value: '86', change: '98% efficiency rate', status: 'completed' as StatusType },
                { title: 'VIP Guests Served', value: '5', change: 'All suites occupied', status: 'vip' as StatusType },
                { title: 'Avg. Fulfillment', value: '12m', change: '-3m vs yesterday', status: 'on-duty' as StatusType },
              ].map((stat, idx) => (
                <div key={idx} className="bg-[#0B0F17] border border-gray-800 rounded-xl p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-400">{stat.title}</span>
                    <StatusBadge status={stat.status} label="" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-[11px] text-gray-400">{stat.change}</div>
                </div>
              ))}
            </div>

            {/* Data Table Container */}
            <div className="bg-[#0B0F17] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Active Service Log</h3>
                <span className="text-xs text-gray-400">Showing live database feed</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#06090F] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Room / Guest</th>
                      <th className="py-3 px-4">Service / Request</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Time Elapsed</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {[
                      { room: 'Room 304', guest: 'Ato Kebede', request: 'In-Room Dining (Doro Wat)', dept: 'Kitchen', status: 'pending' as StatusType, time: '8 mins ago' },
                      { room: 'Suite 501', guest: 'Dr. Sarah Jenkins', request: 'Extra Premium Towels & Robe', dept: 'Housekeeping', status: 'vip' as StatusType, time: '14 mins ago' },
                      { room: 'Room 210', guest: 'Moges Tadesse', request: 'Bottled Water & Espresso', dept: 'Room Service', status: 'completed' as StatusType, time: '25 mins ago' },
                      { room: 'Room 112', guest: 'Hanna Lemma', request: 'Maintenance AC Check', dept: 'Engineering', status: 'delayed' as StatusType, time: '42 mins ago' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 px-4 font-medium text-white">
                          <div>{row.room}</div>
                          <div className="text-xs text-gray-400 font-normal">{row.guest}</div>
                        </td>
                        <td className="py-4 px-4">{row.request}</td>
                        <td className="py-4 px-4 text-gray-400">{row.dept}</td>
                        <td className="py-4 px-4"><StatusBadge status={row.status} /></td>
                        <td className="py-4 px-4 text-gray-400 text-xs">{row.time}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer" title="View Details">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer" title="Mark Completed">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </div>
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
                { label: 'Critical (<3 Stars)', value: 'critical' },
              ]}
              primaryActionLabel="Add Review"
              onPrimaryAction={() => alert('Open Manual Review Modal')}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0B0F17] border border-gray-800 rounded-xl p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Average CSAT Score</p>
                  <div className="text-3xl font-bold text-white">4.8 / 5.0</div>
                  <p className="text-xs text-emerald-400 mt-1">+0.2 from last month</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
              </div>

              <div className="bg-[#0B0F17] border border-gray-800 rounded-xl p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Submissions</p>
                  <div className="text-3xl font-bold text-white">342</div>
                  <p className="text-xs text-gray-400 mt-1">94% response rate</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#0B0F17] border border-gray-800 rounded-xl p-6 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Action Required</p>
                  <div className="text-3xl font-bold text-white">2</div>
                  <p className="text-xs text-rose-400 mt-1">Pending manager follow-up</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Marcus Aurelius', room: 'Suite 402', rating: 5, date: 'Today, 2:30 PM', comment: 'Exceptional service at the Central Yamarech restaurant. The traditional coffee ceremony was wonderful!', status: 'completed' as StatusType },
                { name: 'Elena Rostova', room: 'Room 208', rating: 4, date: 'Yesterday, 8:15 PM', comment: 'Room service was prompt, though the Wi-Fi connection in the evening dropped briefly.', status: 'active' as StatusType },
                { name: 'Dawit Bekele', room: 'Room 312', rating: 5, date: 'August 9, 2026', comment: 'Very clean rooms and professional staff. Special thanks to housekeeping team.', status: 'completed' as StatusType },
                { name: 'Claire Dubois', room: 'Suite 105', rating: 3, date: 'August 8, 2026', comment: 'Requested early morning wake-up call that was slightly delayed. Management handled it well.', status: 'vip' as StatusType },
              ].map((rev, idx) => (
                <div key={idx} className="bg-[#0B0F17] border border-gray-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{rev.name}</h4>
                        <p className="text-xs text-gray-400">{rev.room} • {rev.date}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-amber-400 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 italic mb-4">"{rev.comment}"</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800/60">
                    <StatusBadge status={rev.status} label={rev.status === 'completed' ? 'Verified Review' : 'Pending Action'} />
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer">
                      Send Reply →
                    </button>
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
                { label: 'Kitchen & Dining', value: 'kitchen' },
                { label: 'Housekeeping', value: 'housekeeping' },
                { label: 'Front Desk', value: 'frontdesk' },
              ]}
              primaryActionLabel="Register Staff"
              onPrimaryAction={() => alert('Open Register Staff Modal')}
            />

            <div className="bg-[#0B0F17] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Active Personnel Roster</h3>
                <span className="text-xs text-gray-400">24 Staff members active today</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#06090F] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Shift</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Contact Ext.</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {[
                      { name: 'Solomon Worku', role: 'Head Chef', dept: 'Kitchen & Dining', shift: 'Morning (6AM - 2PM)', status: 'on-duty' as StatusType, ext: 'Ext. 104' },
                      { name: 'Bethlehem Tadesse', role: 'Lead Receptionist', dept: 'Front Desk', shift: 'Morning (6AM - 2PM)', status: 'on-duty' as StatusType, ext: 'Ext. 101' },
                      { name: 'Ephrem Alemu', role: 'Housekeeping Supervisor', dept: 'Housekeeping', shift: 'Evening (2PM - 10PM)', status: 'off-duty' as StatusType, ext: 'Ext. 205' },
                      { name: 'Tigest Mengistu', role: 'F&B Waitress', dept: 'Kitchen & Dining', shift: 'Evening (2PM - 10PM)', status: 'on-duty' as StatusType, ext: 'Ext. 109' },
                    ].map((staff, idx) => (
                      <tr key={idx} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 px-4 font-medium text-white">
                          <div>{staff.name}</div>
                          <div className="text-xs text-gray-400 font-normal">{staff.role}</div>
                        </td>
                        <td className="py-4 px-4">{staff.dept}</td>
                        <td className="py-4 px-4 text-gray-400">{staff.shift}</td>
                        <td className="py-4 px-4"><StatusBadge status={staff.status} /></td>
                        <td className="py-4 px-4 text-gray-400 font-mono text-xs">{staff.ext}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer" title="Edit Profile">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-rose-400 transition-colors cursor-pointer" title="Deactivate">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
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
                { label: 'Returning Guests', value: 'returning' },
              ]}
              primaryActionLabel="Add Profile"
              onPrimaryAction={() => alert('Open Add Profile Modal')}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Registered Profiles', value: '1,284', desc: '+18 this week', status: 'active' as StatusType },
                { label: 'Active VIP Guests', value: '38', desc: 'Currently checked in', status: 'vip' as StatusType },
                { label: 'Returning Guest Rate', value: '42%', desc: 'Loyalty benchmark high', status: 'completed' as StatusType },
              ].map((card, idx) => (
                <div key={idx} className="bg-[#0B0F17] border border-gray-800 rounded-xl p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">{card.label}</span>
                    <StatusBadge status={card.status} label="" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
                  <div className="text-xs text-gray-400">{card.desc}</div>
                </div>
              ))}
            </div>

            <div className="bg-[#0B0F17] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Guest Database</h3>
                <span className="text-xs text-gray-400">Encrypted CRM records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#06090F] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Guest Name</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Status Category</th>
                      <th className="py-3 px-4">Total Stays</th>
                      <th className="py-3 px-4">Special Preferences</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {[
                      { name: 'Dr. Sarah Jenkins', contact: 's.jenkins@university.edu', category: 'vip' as StatusType, stays: '6 Stays', prefs: 'Extra pillows, Quiet room, Vegan dining' },
                      { name: 'Ato Kebede Chanie', contact: '+251 91 123 4567', category: 'returning' as StatusType, stays: '12 Stays', prefs: 'Prefers 3rd Floor, Espresso lover' },
                      { name: 'Claire Dubois', contact: 'c.dubois@globalcorp.fr', category: 'vip' as StatusType, stays: '3 Stays', prefs: 'Late check-out requested' },
                    ].map((guest, idx) => (
                      <tr key={idx} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 px-4 font-medium text-white">{guest.name}</td>
                        <td className="py-4 px-4 text-gray-400 text-xs">{guest.contact}</td>
                        <td className="py-4 px-4"><StatusBadge status={guest.category} /></td>
                        <td className="py-4 px-4 text-gray-300">{guest.stays}</td>
                        <td className="py-4 px-4 text-gray-400 text-xs">{guest.prefs}</td>
                        <td className="py-4 px-4 text-right">
                          <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer">
                            View Profile
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
              filterOptions={[
                { label: 'All Channels', value: 'all' },
                { label: 'Active Broadcasts', value: 'broadcast' },
                { label: 'Voice Notes', value: 'voice' },
              ]}
              primaryActionLabel="Send Broadcast"
              onPrimaryAction={() => alert('Open Broadcast Modal')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Broadcast Panel */}
              <div className="lg:col-span-2 bg-[#0B0F17] border border-gray-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-indigo-400" />
                      <span>Live Intercom & Broadcast Center</span>
                    </h3>
                    <StatusBadge status="on-duty" label="System Online" />
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="bg-[#06090F] border border-gray-800 rounded-xl p-4">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span>Broadcast to All Departments</span>
                        <span>Today, 11:00 AM</span>
                      </div>
                      <p className="text-sm text-gray-200">"VIP delegation arriving at 3:00 PM. All front-desk and housekeeping personnel please ensure Suites 501-505 are fully inspected."</p>
                    </div>

                    <div className="bg-[#06090F] border border-gray-800 rounded-xl p-4">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span>Kitchen Department Update</span>
                        <span>Today, 9:30 AM</span>
                      </div>
                      <p className="text-sm text-gray-200">"Special traditional coffee ceremony scheduled for the lobby lounge at 4:00 PM today."</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                  <input
                    type="text"
                    placeholder="Type broadcast announcement to staff..."
                    className="flex-1 bg-[#06090F] text-sm text-white px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-indigo-500"
                  />
                  <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer">
                    <Send className="w-4 h-4" />
                    <span>Broadcast</span>
                  </button>
                </div>
              </div>

              {/* Voice Walkie-Talkie Panel */}
              <div className="bg-[#0B0F17] border border-gray-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>Walkie-Talkie Channel</span>
                    </h3>
                    <span className="text-xs text-emerald-400 font-mono">CH-01</span>
                  </div>

                  <p className="text-xs text-gray-400 mb-6">
                    Press and hold or tap to record instant audio voice notes to department leads.
                  </p>

                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-20 h-20 rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 cursor-pointer hover:bg-indigo-600/20 transition-all shadow-lg shadow-indigo-600/10">
                      <Mic className="w-8 h-8 animate-pulse" />
                    </div>
                    <span className="text-xs font-medium text-white">Tap to Record Voice Note</span>
                    <span className="text-[10px] text-gray-400 mt-1">Direct to All Channel Leads</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Active Listeners</span>
                    <span className="text-emerald-400 font-medium">12 Staff Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}