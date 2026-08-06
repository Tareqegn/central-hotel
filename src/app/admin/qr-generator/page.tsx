"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRGeneratorPage() {
  const [startRoom, setStartRoom] = useState<number>(101);
  const [endRoom, setEndRoom] = useState<number>(110);
  const [baseUrl, setBaseUrl] = useState<string>('https://central-hotel.vercel.app');

  // Automatically detect current origin (localhost vs production Vercel URL) on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // Generate an array of room numbers based on inputs
  const rooms = [];
  for (let i = startRoom; i <= endRoom; i++) {
    rooms.push(i);
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0b0d14] text-neutral-100 p-8 font-sans antialiased">
      <div className="max-w-5xl mx-auto">
        
        {/* Header & Controls (Hidden when printing) */}
        <div className="print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-[#131622] p-6 rounded-2xl border border-white/[0.04] shadow-xl">
          <div>
            <h1 className="text-xl font-serif text-white tracking-wide">Central Hotel — Room QR Generator</h1>
            <p className="text-xs text-neutral-400 mt-1">Batch generate and print QR codes and NFC fallback links for rooms 101 to 102+</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">From Room</label>
              <input 
                type="number" 
                value={startRoom} 
                onChange={(e) => setStartRoom(parseInt(e.target.value) || 101)}
                className="w-24 bg-[#0b0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">To Room</label>
              <input 
                type="number" 
                value={endRoom} 
                onChange={(e) => setEndRoom(parseInt(e.target.value) || 110)}
                className="w-24 bg-[#0b0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Base URL</label>
              <input 
                type="text" 
                value={baseUrl} 
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-56 bg-[#0b0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <button 
              onClick={handlePrint}
              className="mt-5 px-5 py-2.5 bg-amber-500 hover:brightness-110 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              Print QR Cards
            </button>
          </div>
        </div>

        {/* Printable Grid of QR Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
          {rooms.map((room) => {
            const roomUrl = `${baseUrl.replace(/\/$/, '')}/room/${room}`;
            return (
              <div 
                key={room} 
                className="bg-white text-neutral-900 p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center border border-neutral-200 page-break-inside-avoid print:shadow-none print:border print:border-neutral-300"
              >
                <div className="w-10 h-10 mb-2 flex items-center justify-center">
                  <img src="/logo.png" alt="Central Hotel Logo" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-xs font-serif tracking-widest text-neutral-500 uppercase">Central Hotel</h2>
                <p className="text-xl font-bold font-mono tracking-wider text-neutral-900 mt-0.5 mb-4">Suite {room}</p>
                
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-inner">
                  <QRCodeSVG 
                    value={roomUrl} 
                    size={140} 
                    level={"M"}
                    includeMargin={false}
                  />
                </div>

                <p className="text-[10px] text-neutral-500 mt-4 font-mono truncate max-w-[200px]">
                  {roomUrl}
                </p>
                <p className="text-[9px] text-amber-600 font-medium uppercase tracking-wider mt-1">
                  Scan to Open Room Service & Menu
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}