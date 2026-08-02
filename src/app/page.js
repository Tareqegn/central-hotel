"use client";
import { Suspense, useState } from "react";
import { supabase } from "./supabaseClient";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function HomeContent() {
  const searchParams = useSearchParams();
  const room = searchParams.get("room");
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const callWaiter = async () => {
    setLoading(true);
    setErrorMsg("");
    const { error } = await supabase.from("requests").insert([
      { room, category: "waiter", details: {}, status: "new" },
    ]);
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setWaiterCalled(true);
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 px-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">🏨</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Central Hotel</h1>
          <p className="text-gray-500">Please scan the QR code in your room to access hotel services.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 pt-10 pb-16 text-center">
        <div className="text-4xl mb-3">🏨</div>
        <h1 className="text-2xl font-bold">Central Hotel</h1>
        <div className="mt-2 inline-block bg-white/20 rounded-full px-4 py-1 text-sm font-medium">
          Room {room}
        </div>
      </div>

      <div className="px-6 -mt-8 max-w-md mx-auto">
        <Link
          href={`/services?room=${room}`}
          className="block bg-white rounded-2xl shadow-lg p-5 mb-4 hover:shadow-xl transition"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              🍽️
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">View All Services</h2>
              <p className="text-sm text-gray-500">Food, Taxi, Laundry & more</p>
            </div>
            <span className="text-gray-300 text-xl">›</span>
          </div>
        </Link>

        <button
          onClick={callWaiter}
          disabled={loading || waiterCalled}
          className={`w-full rounded-2xl shadow-lg p-5 font-bold text-lg transition ${
            waiterCalled
              ? "bg-green-50 text-green-700 border-2 border-green-200 shadow-none"
              : loading
              ? "bg-gray-100 text-gray-400 cursor-wait"
              : "bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98]"
          }`}
        >
          {waiterCalled ? "✅ Waiter on the way!" : loading ? "Sending..." : "🔔 Call the Waiter"}
        </button>

        {errorMsg && (
          <div className="mt-4 bg-red-50 text-red-600 text-sm p-4 rounded-xl text-center">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
