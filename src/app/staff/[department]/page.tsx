"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../supabaseClient';

interface RequestItem {
  id: string;
  room: string;
  category: string;
  note: string;
  status: string;
  handled_by?: string;
  created_at: string;
}

interface StaffMember {
  id: string;
  name: string;
  department: string;
  role?: string;
}

export default function StaffDepartmentView() {
  const params = useParams();
  const department = (params?.department as string) || 'general';
  
  const formattedDeptName = department.charAt(0).toUpperCase() + department.slice(1);

  const [tasks, setTasks] = useState<RequestItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Database Staff Login State & Roster
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffName, setStaffName] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [loadingLogin, setLoadingLogin] = useState<boolean>(false);
  const [loadingRoster, setLoadingRoster] = useState<boolean>(true);

  // Check session storage on load
  useEffect(() => {
    const savedStaff = sessionStorage.getItem(`hotel_db_staff_${department}`);
    if (savedStaff) {
      setStaffName(savedStaff);
      setIsLoggedIn(true);
    }
    fetchDepartmentStaff();
  }, [department]);

  const fetchDepartmentStaff = async () => {
    setLoadingRoster(true);
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .ilike('department', `%${department}%`);

      if (data && !error) {
        setStaffList(data);
      }
    } catch (err) {
      console.error('Error fetching staff roster:', err);
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleDatabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setLoginError('');
    setLoadingLogin(true);

    try {
      // Verify the entered PIN matches the selected staff member's record in Supabase
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('id', selectedStaff.id)
        .eq('pin_code', pinInput.trim())
        .single();

      if (error || !data) {
        setLoginError('Incorrect PIN code for this staff member.');
      } else {
        sessionStorage.setItem(`hotel_db_staff_${department}`, data.name);
        setStaffName(data.name);
        setIsLoggedIn(true);
        setSelectedStaff(null);
        setPinInput('');
      }
    } catch (err) {
      setLoginError('Database connection error during login.');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(`hotel_db_staff_${department}`);
    setStaffName('');
    setIsLoggedIn(false);
    setPinInput('');
    setSelectedStaff(null);
  };

  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
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

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('department', department)
      .neq('status', 'Completed')
      .order('created_at', { ascending: true });

    if (data && !error) {
      setTasks(data);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchTasks();
    const channel = supabase
      .channel(`staff_${department}_realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, (payload: any) => {
        if (payload.eventType === 'INSERT' && payload.new?.department === department) {
          playAlertChime();
        }
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [department, soundEnabled, isLoggedIn]);

  const advanceStatus = async (id: string, currentStatus: string) => {
    let nextStatus = 'In Progress';
    if (currentStatus === 'Pending') nextStatus = 'In Progress';
    else if (currentStatus === 'In Progress') nextStatus = 'On the Way';
    else if (currentStatus === 'On the Way') nextStatus = 'Completed';

    await supabase
      .from('requests')
      .update({ 
        status: nextStatus,
        handled_by: staffName 
      })
      .eq('id', id);
    
    fetchTasks();
  };

  // Staff Roster & PIN Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#121212] text-neutral-100 flex items-center justify-center p-6 font-sans antialiased relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-white/[0.02] blur-[100px] pointer-events-none rounded-full" />
        
        <div className="max-w-md w-full bg-[#18181b] border border-white/[0.08] p-8 rounded-2xl shadow-2xl relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#121212] border border-white/[0.08] flex items-center justify-center p-1.5 overflow-hidden">
              <img src="/logo.png" alt="Hotel Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-amber-400 font-semibold">Select Staff Roster</span>
              <h2 className="text-xl font-serif text-white">{formattedDeptName} Station</h2>
            </div>
          </div>

          {!selectedStaff ? (
            <div>
              <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                Click your name below to sign in with your individual PIN code.
              </p>

              {loadingRoster ? (
                <div className="py-12 text-center text-xs text-neutral-500 font-mono">Loading staff members...</div>
              ) : staffList.length === 0 ? (
                <div className="py-8 text-center text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 font-mono">
                  No staff members registered for this department yet. Please check the Manager Dashboard to add staff.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {staffList.map((staff) => (
                    <button
                      key={staff.id}
                      onClick={() => { setSelectedStaff(staff); setPinInput(''); setLoginError(''); }}
                      className="w-full text-left bg-[#121212] hover:bg-white/[0.04] border border-white/[0.06] hover:border-amber-500/40 p-3.5 rounded-xl transition-all flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">{staff.name}</p>
                        {staff.role && <p className="text-[10px] text-neutral-500 uppercase font-mono mt-0.5">{staff.role}</p>}
                      </div>
                      <span className="text-neutral-600 group-hover:text-amber-400 text-xs font-mono transition-transform group-hover:translate-x-1">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleDatabaseLogin} className="space-y-4">
              <div className="bg-[#121212] p-3.5 rounded-xl border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-mono text-neutral-500 tracking-wider">Signing in as</span>
                  <p className="text-sm font-semibold text-amber-400">{selectedStaff.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStaff(null)}
                  className="text-[10px] font-mono text-neutral-400 hover:text-white underline"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-2">Enter Your Individual PIN Code</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-[#121212] border border-white/[0.1] rounded-xl px-4 py-3 text-center tracking-[0.5em] text-lg text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg font-mono">
                  {loginError}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStaff(null)}
                  className="flex-1 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 font-semibold rounded-xl text-xs uppercase tracking-wider font-mono transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loadingLogin}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs uppercase tracking-wider font-mono transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {loadingLogin ? 'Verifying...' : 'Authorize →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 p-6 sm:p-8 font-sans tracking-tight antialiased relative overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-white/[0.02] blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-white/[0.08] flex items-center justify-center p-2 shadow-md overflow-hidden">
              <img src="/logo.png" alt="Hotel Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-amber-400 font-semibold">Active Workstation</span>
              </div>
              <h1 className="text-2xl font-serif text-white">{formattedDeptName} Station</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#18181b] px-3.5 py-2 rounded-xl border border-white/[0.08] flex items-center gap-3 shadow-md">
              <div className="text-right">
                <p className="text-[9px] uppercase font-mono tracking-widest text-neutral-500">Database Handler</p>
                <p className="text-xs font-semibold text-amber-400">{staffName}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="text-[10px] font-mono text-neutral-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] px-2 py-1 rounded-lg border border-white/[0.06] transition-all"
              >
                Lock
              </button>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md ${
                soundEnabled 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : 'bg-white/[0.03] text-neutral-500 border border-white/[0.06]'
              }`}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-neutral-500 text-xs tracking-wider uppercase font-mono border border-dashed border-white/[0.08] rounded-2xl bg-[#18181b]/40">
              <span className="text-3xl mb-2">🎉</span>
              All caught up! No active tasks.
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id}
                className="bg-[#18181b] border border-white/[0.08] p-5 rounded-2xl shadow-xl flex flex-col justify-between gap-4 transition-all hover:border-white/[0.15]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/20">
                      Room {task.room}
                    </span>
                    <h3 className="text-base font-semibold text-white mt-2.5 tracking-wide">{task.category}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.05] text-neutral-300 border border-white/[0.06] inline-block mb-1">
                      {task.status}
                    </span>
                    {task.handled_by && (
                      <p className="text-[10px] text-neutral-500 font-mono">Handled by: {task.handled_by}</p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-neutral-300 bg-[#121212] p-3.5 rounded-xl border border-white/[0.04] leading-relaxed font-light">
                  {task.note}
                </p>

                <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => advanceStatus(task.id, task.status)}
                    className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs uppercase tracking-wider font-mono transition-all shadow-lg active:scale-95"
                  >
                    {task.status === 'Pending' ? 'Start Task →' : task.status === 'In Progress' ? 'Dispatch (On the Way) →' : 'Mark Done ✓'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}