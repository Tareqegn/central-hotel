"use client";
import { Suspense, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const categories = [
  { id: "general", label: "General Feedback", emoji: "💬" },
  { id: "cleanliness", label: "Room Cleanliness", emoji: "🛏️" },
  { id: "service", label: "Staff Service", emoji: "👨‍💼" },
  { id: "noise", label: "Noise Complaint", emoji: "🔊" },
  { id: "facilities", label: "Hotel Facilities", emoji: "🏊" },
  { id: "other", label: "Other", emoji: "📝" },
];

function FeedbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const room = searchParams.get("room") || "";
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitFeedback = async () => {
    if (!selected || !message.trim()) return;
    setLoading(true);

    const cat = categories.find((c) => c.id === selected);

    const { error } = await supabase.from("requests").insert([
      {
        room: room,
        category: "feedback",
        details: {
          type: cat.label,
          message: message,
        },
        status: "new",
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push(`/confirmation?room=${room}&type=feedback`);
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
        <h1 className="text-2xl font-bold">💬 Feedback & Complaints</h1>
        <p className="text-gray-600">Room {room}</p>
      </div>

      <h2 className="font-semibold mb-3">What is this about?</h2>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelected(cat.id)}
            className={`p-3 rounded-lg border text-sm text-left transition ${
              selected === cat.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <span className="text-xl block mb-1">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Your message
            </label>
            <textarea
              placeholder="Please describe your feedback or complaint..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows={5}
            />
          </div>

          <button
            onClick={submitFeedback}
            disabled={!message.trim() || loading}
            className="w-full p-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:bg-gray-300"
          >
            {loading ? "Sending..." : "Submit Feedback"}
          </button>
        </>
      )}
    </main>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p>Loading...</p>
        </main>
      }
    >
      <FeedbackContent />
    </Suspense>
  );
}
