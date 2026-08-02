"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const services = [
  { name: "Food Order", desc: "Order from our menu", icon: "🍽️", href: "/services/food", bg: "bg-orange-500" },
  { name: "Taxi", desc: "Request a ride", icon: "🚕", href: "/services/taxi", bg: "bg-yellow-500" },
  { name: "Laundry", desc: "Pickup & delivery", icon: "👕", href: "/services/laundry", bg: "bg-blue-500" },
  { name: "Checkout", desc: "Schedule departure", icon: "🏨", href: "/services/checkout", bg: "bg-purple-500" },
  { name: "Feedback", desc: "Share your thoughts", icon: "💬", href: "/services/feedback", bg: "bg-green-500" },
];

function ServicesContent() {
  const searchParams = useSearchParams();
  const room = searchParams.get("room") || "";

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 pt-6 pb-14">
        <Link href={`/?room=${room}`} className="text-white/70 text-sm hover:text-white">← Back</Link>
        <h1 className="text-2xl font-bold mt-2">Services</h1>
        <p className="text-white/70 text-sm">Room {room}</p>
      </div>

      <div className="px-6 -mt-6 max-w-md mx-auto space-y-3">
        {services.map((s) => (
          <Link
            key={s.name}
            href={`${s.href}?room=${room}`}
            className="block bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${s.bg} rounded-xl flex items-center justify-center text-2xl text-white shadow-md`}>
                {s.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{s.name}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
              <span className="text-gray-300 text-xl">›</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
