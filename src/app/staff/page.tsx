"use client";

import React from 'react';
import Link from 'next/link';

export default function StaffPortalHub() {
  const departments = [
    { id: 'kitchen', name: 'Kitchen & F&B', description: 'Manage food, beverage, and dining room service orders', icon: '🍳', pinHint: '1234' },
    { id: 'housekeeping', name: 'Housekeeping', description: 'Manage room cleaning, laundry, and guest amenities', icon: '🧹', pinHint: '5678' },
    { id: 'concierge', name: 'Concierge & Front Desk', description: 'Manage taxi bookings, luggage, and guest requests', icon: '🛎️', pinHint: '1111' },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 flex items-center justify-center p-6 font-sans antialiased relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-white/[0.02] blur-[100px] pointer-events-none rounded-full" />
      
      <div className="max-w-xl w-full relative z-10">
        <div className="text-center mb-10">
          <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-amber-400 font-semibold">Central Hotel Staff Portal</span>
          <h1 className="text-3xl font-serif text-white mt-1">Select Workstation</h1>
          <p className="text-xs text-neutral-400 mt-2">Choose your department portal to securely authenticate and view live requests.</p>
        </div>

        <div className="grid gap-4">
          {departments.map((dept) => (
            <Link
              key={dept.id}
              href={`/staff/${dept.id}`}
              className="bg-[#18181b] border border-white/[0.08] hover:border-amber-500/40 p-5 rounded-2xl shadow-xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#121212] border border-white/[0.08] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  {dept.icon}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors">{dept.name}</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">{dept.description}</p>
                </div>
              </div>
              <div className="text-neutral-500 group-hover:text-amber-400 font-mono text-sm pl-4 transition-colors">
                →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}