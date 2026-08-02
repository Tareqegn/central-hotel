"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../supabaseClient';

interface RoomItem {
  id: string;
  room: string;
  category: string;
  note: string;
  price?: number;
  status: string;
  created_at: string;
}

export default function GuestBillView() {
  const params = useParams();
  const roomNumber = (params?.roomNumber as string) || '302';

  const [charges, setCharges] = useState<RoomItem[]>([]);
  const [isSettled, setIsSettled] = useState<boolean>(false);

  useEffect(() => {
    const fetchRoomCharges = async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('room', roomNumber)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setCharges(data);
      }
    };

    fetchRoomCharges();
  }, [roomNumber]);

  // Calculate Subtotal (defaulting items to $15.00 if price isn't set)
  const subtotal = charges.reduce((sum, item) => sum + (item.price || 15.00), 0);
  const tax = subtotal * 0.15; // 15% hospitality service tax & VAT
  const totalBill = subtotal + tax;

  const handleSettleBill = () => {
    setIsSettled(true);
  };

  if (isSettled) {
    return (
      <div className="min-h-screen bg-[#121212] text-neutral-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#18181b] border border-white/[0.08] p-8 rounded-2xl shadow-2xl text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>
          <h2 className="text-2xl font-serif text-white mb-2">Tab Settled Successfully</h2>
          <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
            Room {roomNumber}'s folio has been successfully closed and charged to the card on file. Thank you for staying at Central Hotel.
          </p>
          <a
            href={`/room/${roomNumber}`}
            className="inline-block py-3 px-6 bg-amber-500 text-black font-semibold rounded-xl text-xs uppercase tracking-wider font-mono transition-all"
          >
            Return to Concierge Portal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 p-6 sm:p-10 font-sans tracking-tight antialiased relative">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-white/[0.08] flex items-center justify-center p-2 shadow-md">
              <img src="/logo.png" alt="Hotel Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-amber-400 font-semibold">Live Guest Folio</span>
              <h1 className="text-2xl font-serif text-white">Room {roomNumber} — Statement</h1>
            </div>
          </div>
          <a
            href={`/room/${roomNumber}`}
            className="text-xs font-mono text-neutral-400 hover:text-white bg-[#18181b] px-3.5 py-2 rounded-xl border border-white/[0.08] transition-all"
          >
            ← Back to Menu
          </a>
        </div>

        {/* Charges Breakdown Card */}
        <div className="bg-[#18181b] border border-white/[0.08] rounded-2xl p-6 shadow-xl mb-6">
          <h3 className="text-xs uppercase font-mono tracking-widest text-neutral-400 mb-4 pb-2 border-b border-white/[0.06]">
            Itemized Service & F&B Charges
          </h3>

          {charges.length === 0 ? (
            <p className="text-xs text-neutral-500 font-mono py-6 text-center">No active charges recorded for this room yet.</p>
          ) : (
            <div className="space-y-3 mb-6">
              {charges.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-white/[0.04]">
                  <div>
                    <span className="font-medium text-white">{item.category}</span>
                    <p className="text-[11px] text-neutral-400 truncate max-w-[260px]">{item.note}</p>
                  </div>
                  <span className="font-mono text-amber-400">${(item.price || 15.00).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Totals Calculation */}
          <div className="space-y-2 pt-4 border-t border-white/[0.08] text-xs font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Service Tax & VAT (15%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-serif text-white pt-3 border-t border-white/[0.06]">
              <span>Total Balance Due</span>
              <span className="text-emerald-400 font-bold">${totalBill.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleSettleBill}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs uppercase tracking-widest font-mono transition-all shadow-xl active:scale-95"
        >
          Settle Tab & Express Checkout 💳
        </button>

      </div>
    </div>
  );
}