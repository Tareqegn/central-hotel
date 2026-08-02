"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const messages = {
  food: { title: "Order Received!", desc: "Your food order has been sent to the kitchen.", icon: "🍽️" },
  taxi: { title: "Taxi Requested!", desc: "We're arranging your taxi now.", icon: "🚕" },
  laundry: { title: "Pickup Scheduled!", desc: "We'll collect your laundry soon.", icon: "👕" },
  checkout: { title: "Checkout Scheduled!", desc: "Your checkout has been noted. See you next time!", icon: "🏨" },
  feedback: { title: "Thank You!", desc: "Your feedback has been received.", icon: "💬" },
  waiter: { title: "Waiter Called!", desc: "A waiter is on the way.", icon: "🔔" },
};

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const room = searchParams.get("room") || "";
  const type = searchParams.get("type") || "waiter";
  const msg = messages[type] || messages.waiter;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">{msg.icon}</div>
        <h1 className="text-2xl font-bold mb-2 text-green-600">{msg.title}</h1>
        <p className="text-gray-600 mb-2">{msg.desc}</p>
        <p className="text-gray-500 text-sm mb-8">Room {room}</p>

        <Link
          href={`/?room=${room}`}
          className="block w-full p-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition text-center"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p>Loading...</p>
        </main>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
