"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../supabaseClient';

// Helper component to unpack search parameters safely in Next.js App Router
function TrackContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id');

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Soft chime play tool to draw user's attention on real-time status updates
  const playSoftChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // Gentle C5 Note
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log("Chime skipped: Waiting for interaction gestures.");
    }
  };

  const fetchRequestDetails = async () => {
    if (!requestId) {
      setErrorMsg("No request ID found in the URL link.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) {
      setErrorMsg("We couldn't locate this active order.");
    } else {
      setRequest(data);
    }
    setLoading(false);
  };

  // Setup initial fetch and subscribe to real-time status mutations
  useEffect(() => {
    fetchRequestDetails();

    if (!requestId) return;

    const channel = supabase
      .channel(`guest_track_channel_${requestId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'requests', filter: `id=eq.${requestId}` },
        (payload) => {
          setRequest(payload.new);
          playSoftChime();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  // Maps the current status to a context-aware description text for guests
  const getContextStatusMessage = (category, status) => {
    if (status === 'Completed') {
      if (category === 'Food Order') return "Delicious news! Your order is freshly cooked and on the way to your room.";
      if (category === 'Request Taxi') return "Your taxi has arrived and is waiting for you at the main entrance.";
      if (category === 'Laundry') return "Your clothes have been cleaned and delivered.";
      return "Your request has been successfully completed! Thank you.";
    }
    if (status === 'In Progress') {
      if (category === 'Food Order') return "Our chef is actively preparing your meal with care.";
      return "Our staff has accepted your ticket and is working on it right now.";
    }
    return "Your request is received and in line. Staff will review it shortly.";
  };

  // Helper arrays to handle active tracking layout bars
  const steps = ['Pending', 'In Progress', 'Completed'];
  const currentStepIndex = request ? steps.indexOf(request.status) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center p-6">
        <p className="text-sm text-neutral-500 animate-pulse">Syncing live ticket timeline...</p>
      </div>
    );
  }

  if (errorMsg || !request) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center p-6">
        <div className="text-center border border-neutral-900 bg-neutral-900/20 p-6 rounded-2xl max-w-sm">
          <p className="text-sm text-red-400 font-medium">{errorMsg || "Order not found."}</p>
          <p className="text-xs text-neutral-500 mt-2">Please double-check the QR code scan or request link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 flex flex-col justify-between">
      {/* Upper Navigation Header */}
      <header className="max-w-md w-full mx-auto flex justify-between items-center border-b border-neutral-900 pb-4">
        <div>
          <h1 className="text-lg font-black tracking-wide">Yamarech Resort</h1>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Live Request Track</p>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">
          Room {request.room}
        </span>
      </header>

      {/* Center Informational Stage */}
      <main className="max-w-md w-full mx-auto my-auto py-10 flex flex-col gap-8">
        
        {/* Real-time Visual Status Indicator Bar */}
        <div className="relative flex items-center justify-between w-full px-4">
          {/* Background Connecting Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-900 -z-10" />
          {/* Glowing Active Progress Bar Filler Line */}
          <div 
            className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-500 -z-10" 
            style={{ width: `${currentStepIndex === 0 ? '0%' : currentStepIndex === 1 ? '50%' : '88%'}` }}
          />

          {steps.map((stepName, idx) => {
            const isFinished = idx <= currentStepIndex;
            const isActive = idx === currentStepIndex;

            return (
              <div key={stepName} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] border transition-all duration-300 ${
                    isActive 
                      ? 'bg-emerald-500 border-emerald-400 text-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110' 
                      : isFinished
                      ? 'bg-neutral-900 border-emerald-500 text-emerald-400'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-600'
                  }`}
                >
                  {isFinished && !isActive ? '✓' : idx + 1}
                </div>
                <span className={`text-[11px] font-bold tracking-wide uppercase ${
                  isActive ? 'text-emerald-400' : isFinished ? 'text-neutral-400' : 'text-neutral-600'
                }`}>
                  {stepName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Context Notification Display Box */}
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/30 text-center shadow-2xl">
          <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest bg-neutral-900 border border-neutral-800 text-neutral-400 mb-3">
            {request.category}
          </div>
          <h2 className="text-base font-bold mb-2 tracking-wide transition-all">
            {request.status === 'Pending' && "Order Received"}
            {request.status === 'In Progress' && "Preparing Request"}
            {request.status === 'Completed' && "On Its Way!"}
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
            {getContextStatusMessage(request.category, request.status)}
          </p>
        </div>

        {/* Guest Custom Note Summary */}
        {request.note && (
          <div className="border-l-2 border-neutral-800 pl-4 py-1">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold block">Your note:</span>
            <p className="text-xs text-neutral-400 italic mt-0.5">"{request.note}"</p>
          </div>
        )}
      </main>

      {/* Footer Branding Area */}
      <footer className="max-w-md w-full mx-auto text-center border-t border-neutral-900 pt-4">
        <p className="text-[10px] text-neutral-600">If you need extra help, please call Front Desk from your room phone.</p>
      </footer>
    </div>
  );
}

// Main page wrap with a Suspense Boundary to handle queries on search params seamlessly
export default function GuestTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 text-neutral-400 flex items-center justify-center">
        <p className="text-sm animate-pulse">Initializing pipeline states...</p>
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}