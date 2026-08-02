"use client";
import { Suspense, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const menuItems = [
  { id: 1, name: "Grilled Chicken", price: 25, emoji: "🍗", cat: "Mains" },
  { id: 2, name: "Caesar Salad", price: 15, emoji: "🥗", cat: "Starters" },
  { id: 3, name: "Spaghetti Bolognese", price: 20, emoji: "🍝", cat: "Mains" },
  { id: 4, name: "Fish & Chips", price: 22, emoji: "🐟", cat: "Mains" },
  { id: 5, name: "Beef Burger", price: 18, emoji: "🍔", cat: "Mains" },
  { id: 6, name: "Margherita Pizza", price: 19, emoji: "🍕", cat: "Mains" },
  { id: 7, name: "Orange Juice", price: 5, emoji: "🍊", cat: "Drinks" },
  { id: 8, name: "Coffee", price: 4, emoji: "☕", cat: "Drinks" },
];

function FoodContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const room = searchParams.get("room") || "";
  const [cart, setCart] = useState([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const add = (item) => {
    const ex = cart.find((c) => c.id === item.id);
    if (ex) setCart(cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
    else setCart([...cart, { ...item, qty: 1 }]);
  };
  const remove = (id) => {
    const ex = cart.find((c) => c.id === id);
    if (ex && ex.qty > 1) setCart(cart.map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c)));
    else setCart(cart.filter((c) => c.id !== id));
  };
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const submit = async () => {
    if (!cart.length) return;
    setLoading(true);
    const { error } = await supabase.from("requests").insert([
      { room, category: "food", details: { items: cart, note, total }, status: "new" },
    ]);
    setLoading(false);
    if (error) alert(error.message);
    else router.push(`/confirmation?room=${room}&type=food`);
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white px-6 pt-6 pb-14">
        <Link href={`/services?room=${room}`} className="text-white/70 text-sm hover:text-white">← Back</Link>
        <h1 className="text-2xl font-bold mt-2">🍽️ Food Order</h1>
        <p className="text-white/70 text-sm">Room {room}</p>
      </div>

      <div className="px-6 -mt-6 max-w-md mx-auto">
        {["Starters", "Mains", "Drinks"].map((cat) => {
          const items = menuItems.filter((i) => i.cat === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="mb-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{cat}</h2>
              <div className="bg-white rounded-2xl shadow-md divide-y divide-gray-100 overflow-hidden">
                {items.map((item) => {
                  const inCart = cart.find((c) => c.id === item.id);
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-4">
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">${item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => remove(item.id)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center">−</button>
                        <span className="w-6 text-center font-bold">{inCart?.qty || 0}</span>
                        <button onClick={() => add(item)} className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{cart.reduce((s, c) => s + c.qty, 0)} items</span>
              <span className="font-bold text-lg">${total}</span>
            </div>
            <textarea placeholder="Special requests (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm mb-3" rows={2} />
            <button onClick={submit} disabled={loading} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300">
              {loading ? "Sending..." : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FoodPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <FoodContent />
    </Suspense>
  );
}
