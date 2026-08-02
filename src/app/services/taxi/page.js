"use client";
import { Suspense, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function TaxiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const room = searchParams.get("room") || "";
  const [dest, setDest] = useState("");
  const [pax, setPax] = useState("1");
  const [time, setTime] = useState("now");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!dest.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("requests").insert([
      { room, category: "taxi", details: { destination: dest, passengers: pax, pickupTime: time }, status: "new" },
    ]);
    setLoading(false);
    if (error) alert(error.message);
    else router.push(`/confirmation?room=${room}&type=taxi`);
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white px-6 pt-6 pb-14">
        <Link href={`/services?room=${room}`} className="text-white/70 text-sm hover:text-white">← Back</Link>
        <h1 className="text-2xl font-bold mt-2">🚕 Taxi Request</h1>
        <p className="text-white/70 text-sm">Room {room}</p>
      </div>

      <div className="px-6 -mt-6 max-w-md mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Destination</label>
          <input type="text" placeholder="Airport, City Center, Mall..." value={dest} onChange={(e) => setDest(e.target.value)} className="w-full mt-2 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400" />
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Passengers</label>
          <div className="grid grid-cols-5 gap-2 mt-3">
            {["1", "2", "3", "4", "5+"].map((n) => (
              <button key={n} onClick={() => setPax(n)} className={`py-3 rounded-xl font-bold text-lg transition ${pax === n ? "bg-yellow-500 text-white shadow-md" : "bg-gray-100 text-gray-600"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">When</label>
          <div className="space-y-2 mt-3">
            {[
              { val: "now", label: "As soon as possible", icon: "⚡" },
              { val: "30min", label: "In 30 minutes", icon: "🕐" },
              { val: "1hour", label: "In 1 hour", icon: "⏰" },
            ].map((opt) => (
              <button key={opt.val} onClick={() => setTime(opt.val)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl font-medium transition ${time === opt.val ? "bg-yellow-50 border-2 border-yellow-400 text-yellow-800" : "bg-gray-50 border-2 border-transparent text-gray-600"}`}>
                <span className="text-xl">{opt.icon}</span>{opt.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={submit} disabled={!dest.trim() || loading} className="w-full py-4 bg-yellow-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:shadow-none active:scale-[0.98] transition">
          {loading ? "Sending..." : "Request Taxi"}
        </button>
      </div>
    </div>
  );
}

export default function TaxiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <TaxiContent />
    </Suspense>
  );
}
