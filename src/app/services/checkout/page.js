"use client";
import { Suspense, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const room = searchParams.get("room") || "";
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [loading, setLoading] = useState(false);

  const submitRequest = async () => {
    if (!date) return;
    setLoading(true);

    const { error } = await supabase.from("requests").insert([
      {
        room: room,
        category: "checkout",
        details: {
          checkoutDate: date,
          checkoutTime: time,
        },
        status: "new",
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push(`/confirmation?room=${room}&type=checkout`);
    }
  };

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <div className="mb-6 pt-4">
        <Link
          href={`/services?room=${room}`}
          className="text-blue-600 text-sm mb-2 inline-block"
        >
          ← Back to Services
        </Link>
        <h1 className="text-2xl font-bold">🏨 Schedule Checkout</h1>
        <p className="text-gray-600">Room {room}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Checkout Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preferred Time</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="06:00">6:00 AM</option>
            <option value="07:00">7:00 AM</option>
            <option value="08:00">8:00 AM</option>
            <option value="09:00">9:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="13:00">1:00 PM</option>
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="17:00">5:00 PM</option>
          </select>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
          <p className="font-medium mb-1">Standard checkout time is 12:00 PM</p>
          <p>Late checkout may be available upon request. Our team will confirm.</p>
        </div>

        <button
          onClick={submitRequest}
          disabled={!date || loading}
          className="w-full p-4 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:bg-gray-300"
        >
          {loading ? "Sending..." : "Schedule Checkout"}
        </button>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p>Loading...</p>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
