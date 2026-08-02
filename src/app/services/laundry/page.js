"use client";
import { Suspense, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const options = [
  { id: "wash", name: "Wash & Fold", price: 10, emoji: "🧺", desc: "Standard wash, dry & fold" },
  { id: "dry", name: "Dry Cleaning", price: 15, emoji: "👔", desc: "Professional dry clean" },
  { id: "iron", name: "Ironing Only", price: 5, emoji: "♨️", desc: "Press & starch" },
  { id: "express", name: "Express", price: 20, emoji: "⚡", desc: "Ready in 2 hours" },
];

function LaundryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const room = searchParams.get("room") || "";
  const [selected, setSelected] = useState("");
  const [items, setItems] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!selected) return;
    setLoading(true);
    const svc = options.find((o) => o.id === selected);
    const { error } = await supabase.from("requests").insert([
      { room, category: "laundry", details: { service: svc.name, price: svc.price, items }, status: "new" },
    ]);
    setLoading(false);
    if (error) alert(error.message);
    else router.push(`/confirmation?room=${room}&type=laundry`);
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white px-6 pt-6 pb-14">
        <Link href={`/services?room=${room}`} className="text-white/70 text-sm hover:text-white">← Back</Link>
        <h1 className="text-2xl font-bold mt-2">👕 Laundry Service</h1>
        <p className="text-white/70 text-sm">Room {room}</p>
      </div>

      <div className="px-6 -mt-6 max-w-md mx-auto">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Choose service</h2>
        <div className="space-y-3 mb-6">
          {options.map((opt) => (
            <button key={opt.id} onClick={() => setSelected(opt.id)} className={`w-full text-left p-4 rounded-2xl border-2 transition ${selected === opt.id ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-4">
                <span className="text-3xl">{opt.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{opt.name}</p>
                  <p className="text-sm text-gray-500">{opt.desc}</p>
                </div>
                <span className="font-bold text-blue-600">${opt.price}<span className="text-xs text-gray-400 font-normal">/bag</span></span>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">How many bags / items?</label>
            <input type="text" placeholder="e.g. 2 bags, 3 shirts..." value={items} onChange={(e) => setItems(e.target.value)} className="w-full mt-2 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        )}

        {selected && (
          <button onClick={submit} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-300 active:scale-[0.98] transition">
            {loading ? "Sending..." : "Request Pickup"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function LaundryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <LaundryContent />
    </Suspense>
  );
}
