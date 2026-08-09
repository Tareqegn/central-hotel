"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Message {
  id: string;
  room: string;
  sender_type: 'guest' | 'manager';
  message: string;
  created_at: string;
}

export default function GuestChatWidget({ roomNumber }: { roomNumber: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('guest_chats')
        .select('*')
        .eq('room', roomNumber)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel(`room_${roomNumber}_chat`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'guest_chats',
        filter: `room=eq.${roomNumber}`
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, roomNumber]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage;
    setNewMessage('');

    await supabase.from('guest_chats').insert([
      { room: roomNumber, sender_type: 'guest', message: text }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-3.5 rounded-full shadow-2xl transition-all transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-xs uppercase tracking-wider">Live Concierge Chat</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-[#131622] border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col h-[450px] overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#0b0d14] px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Concierge Desk (Room {roomNumber})</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white text-sm">✕</button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0d0f17]">
            {messages.length === 0 ? (
              <p className="text-center text-xs text-neutral-500 mt-16 font-light">
                How can we assist you today? Send a message to our front desk team.
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.sender_type === 'guest' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender_type === 'guest' 
                      ? 'bg-amber-500 text-neutral-950 font-medium rounded-br-none' 
                      : 'bg-[#1a1e2e] border border-white/10 text-neutral-200 rounded-bl-none'
                  }`}>
                    {m.message}
                  </div>
                  <span className="text-[9px] text-neutral-500 mt-1 px-1 font-mono">
                    {m.sender_type === 'guest' ? 'You' : 'Concierge'} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={sendMessage} className="p-3 bg-[#0b0d14] border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask concierge anything..."
              className="flex-1 bg-[#131622] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}