"use client";

import React, { Suspense } from 'react';

function HomeContent() {
  return (
    <main className="flex h-screen items-center justify-center bg-[#0b0d14] text-white">
      <div className="text-center">
        <h1 className="text-xl font-serif tracking-wide">Central Yamarech</h1>
        <p className="text-xs text-neutral-400 mt-2">Please scan your room's QR code to access your room services.</p>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#0b0d14] text-neutral-400">
        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}