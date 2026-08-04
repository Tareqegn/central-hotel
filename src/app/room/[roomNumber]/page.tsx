"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../supabaseClient';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  icon: string;
  desc: string;
}

interface TranslationSchema {
  welcome: string;
  suiteLocked: string;
  securityMsg: string;
  verifying: string;
  servicesTab: string;
  menuTab: string;
  callWaiter: string;
  roomCleaning: string;
  laundryService: string;
  taxiTransport: string;
  spaBooking: string;
  itemsSelected: string;
  confirmOrder: string;
  orderStatus: string;
  viewProgress: string;
  close: string;
  submit: string;
  specialInstructions: string;
  placeholderNotes: string;
  departureTime: string;
  itemBreakdown: string;
  waiterAlert: string;
  pending: string;
  inProgress: string;
  completed: string;
  subtotal: string;
  serviceTax: string;
  total: string;
  laundryItems: Record<string, string>;
  menu: MenuItem[];
}

const Icons = {
  waiter: () => (
    <svg className="w-5 h-5 stroke-[1.5] text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  bell: () => (
    <svg className="w-5 h-5 stroke-[2] text-neutral-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  cleaning: () => (
    <svg className="w-5 h-5 stroke-[1.5] text-amber-200/80 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  laundry: () => (
    <svg className="w-5 h-5 stroke-[1.5] text-amber-300/80 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  taxi: () => (
    <svg className="w-5 h-5 stroke-[1.5] text-amber-400/80 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-9 5h10M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z" />
      <circle cx="7.5" cy="15.5" r="1.5" />
      <circle cx="16.5" cy="15.5" r="1.5" />
    </svg>
  ),
  spa: () => (
    <svg className="w-5 h-5 stroke-[1.5] text-amber-300/80 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  sun: () => (
    <svg className="w-4 h-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  moon: () => (
    <svg className="w-4 h-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  food: (iconStr: string) => {
    const baseClass = "w-5 h-5 stroke-[1.5] text-amber-400";
    switch (iconStr) {
      case 'croissant': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
      case 'avocado': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" /></svg>;
      case 'sandwich': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
      case 'burger': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>;
      default: return <span className="text-lg">🍽️</span>;
    }
  }
};

const TRANSLATIONS: Record<string, TranslationSchema> = {
  en: {
    welcome: "Welcome",
    suiteLocked: "Room Secured",
    securityMsg: "Please scan the official room QR code or check in with front desk reception to activate your room page.",
    verifying: "Checking session...",
    servicesTab: "Services",
    menuTab: "Room Service Menu",
    callWaiter: "Call a Waiter",
    roomCleaning: "Room Cleaning",
    laundryService: "Laundry Service",
    taxiTransport: "Taxi & Transport",
    spaBooking: "Spa Booking",
    itemsSelected: "Items Selected",
    confirmOrder: "Place Order",
    orderStatus: "Status",
    viewProgress: "View Status",
    close: "Close",
    submit: "Send Request",
    specialInstructions: "Notes / Special Requests",
    placeholderNotes: "E.g., Allergies, extra towels...",
    departureTime: "Departure Time",
    itemBreakdown: "Item Breakdown",
    waiterAlert: "Call a waiter to come to your room immediately?",
    pending: "Received",
    inProgress: "In Progress",
    completed: "Done",
    subtotal: "Subtotal",
    serviceTax: "Service Fee (10%)",
    total: "Total",
    laundryItems: { shirts: "Shirts", pants: "Pants", others: "Other Items" },
    menu: [
      { id: 1, name: "Continental Breakfast", price: 280, icon: "croissant", desc: "Fresh pastry, seasonal fruit, and coffee." },
      { id: 2, name: "Avocado Toast", price: 220, icon: "avocado", desc: "Sourdough, smashed avocado, and poached egg." },
      { id: 3, name: "Club Sandwich", price: 340, icon: "sandwich", desc: "Triple-decker chicken sandwich with fries." },
      { id: 4, name: "Classic Beef Burger", price: 410, icon: "burger", desc: "Beef patty, cheddar cheese, brioche bun, fries." },
    ]
  },
  am: {
    welcome: "እንኳን ደህና መጡ",
    suiteLocked: "ክፍሉ ተቆልፏል",
    securityMsg: "እባክዎ በክፍልዎ ውስጥ ያለውን የQR ኮድ ይጠቀሙ ወይም ሪሴፕሽን ያነጋግሩ።",
    verifying: "በማረጋገጥ ላይ...",
    servicesTab: "አገልግሎቶች",
    menuTab: "የምግብ ዝርዝር",
    callWaiter: "አስተናጋጅ ጥራ",
    roomCleaning: "ክፍል ማጽዳት",
    laundryService: "የልብስ ማጠቢያ",
    taxiTransport: "ታክሲ",
    spaBooking: "ስፓ",
    itemsSelected: "ምርቶች",
    confirmOrder: "ትዕዛዝ አረጋግጥ",
    orderStatus: "ሁኔታ",
    viewProgress: "ሂደት ተመልከት",
    close: "ዝጋ",
    submit: "ላክ",
    specialInstructions: "ልዩ ማስታወሻዎች",
    placeholderNotes: "ለሰራተኞቹ የሚገለጽ ዝርዝር...",
    departureTime: "የመነሻ ሰዓት",
    itemBreakdown: "ዝርዝር",
    waiterAlert: "አስተናጋጅ ወደ ክፍልዎ እንዲመጣ ጥሪ ይተላለፍ?",
    pending: "በጥበቃ ላይ",
    inProgress: "በመስራት ላይ",
    completed: "ተጠናቋል",
    subtotal: "ንዑስ ድምር",
    serviceTax: "የአገልግሎት ክፍያ (10%)",
    total: "አጠቃላይ ድምር",
    laundryItems: { shirts: "ሸሚዞች", pants: "ሱሪዎች", others: "ሌሎች" },
    menu: [
      { id: 1, name: "ኮንቲነንታል ቁርስ", price: 280, icon: "croissant", desc: "ትኩስ ዳቦ፣ ፍራፍሬ እና ቡና።" },
      { id: 2, name: "አቮካዶ ቶስት", price: 220, icon: "avocado", desc: "አቮካዶ እና እንቁላል።" },
      { id: 3, name: "ክለብ ሳንድዊች", price: 340, icon: "sandwich", desc: "ሳንድዊች ከድንች ጥብስ ጋር።" },
      { id: 4, name: "ክላሲክ በርገር", price: 410, icon: "burger", desc: "የበሬ ሥጋ በርገር ከቺዝ ጋር።" },
    ]
  }
};

interface PageProps {
  params: Promise<{ roomNumber: string }> | { roomNumber: string };
}

function RoomContent({ roomNumber }: { roomNumber: string }) {
  const searchParams = useSearchParams();

  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);

  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState<string>('services');
  const [activeModal, setActiveModal] = useState<string | null>(null); 
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [lang, setLang] = useState<string>('en'); 
  const t = TRANSLATIONS[lang]; 
  
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [customNote, setCustomNote] = useState<string>('');
  const [taxiTime, setTaxiTime] = useState<string>('');
  const [laundryCounts, setLaundryCounts] = useState<{ shirts: number; pants: number; others: number }>({ shirts: 0, pants: 0, others: 0 });

  useEffect(() => {
    async function validateGuestSession() {
      let token = searchParams.get('token');
      const cachedToken = localStorage.getItem(`room_session_${roomNumber}`);
      
      if (!token && cachedToken) token = cachedToken;

      if (!token) {
        setAccessDenied(true);
        setIsValidating(false);
        return;
      }

      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('room_sessions')
          .select('*')
          .eq('room_number', roomNumber)
          .eq('session_token', token)
          .eq('is_active', true)
          .gt('expires_at', now) 
          .maybeSingle();

        if (error || !data) {
          localStorage.removeItem(`room_session_${roomNumber}`);
          setAccessDenied(true);
        } else {
          localStorage.setItem(`room_session_${roomNumber}`, token);
          setSessionData(data);
          setAccessDenied(false);
        }
      } catch (err) {
        setAccessDenied(true);
      } finally {
        setIsValidating(false);
      }
    }

    validateGuestSession();
  }, [roomNumber, searchParams]);

  const playGuestChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  useEffect(() => {
    if (accessDenied || isValidating) return;

    const findActiveRoomOrder = async () => {
      const { data } = await supabase
        .from('requests')
        .select('*')
        .eq('room', roomNumber)
        .neq('status', 'Completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setActiveOrderId(data[0].id); 
      } else {
        setActiveOrderId(null);
      }
    };

    findActiveRoomOrder();
  }, [roomNumber, accessDenied, isValidating]);

  useEffect(() => {
    if (!activeOrderId) {
      setTrackedOrder(null);
      return;
    }

    const fetchCurrentState = async () => {
      const { data } = await supabase.from('requests').select('*').eq('id', activeOrderId).single();
      if (data) setTrackedOrder(data);
    };
    fetchCurrentState();

    const channel = supabase
      .channel(`live_track_${activeOrderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'requests', filter: `id=eq.${activeOrderId}` }, (payload: any) => {
        setTrackedOrder(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeOrderId]);

  useEffect(() => {
    if (accessDenied || isValidating) return;
    fetchActiveRequests();

    const channel = supabase
      .channel(`room_${roomNumber}_updates`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests', filter: `room=eq.${roomNumber}` }, (payload: any) => {
        if (payload.eventType === 'UPDATE' && payload.old?.status !== payload.new?.status) {
          playGuestChime();
        }
        fetchActiveRequests();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomNumber, accessDenied, isValidating]);

  const fetchActiveRequests = async () => {
    const { data } = await supabase
      .from('requests')
      .select('*')
      .eq('room', roomNumber)
      .order('created_at', { ascending: false });

    if (data) setActiveRequests(data);
  };

  const closeModals = () => {
    setActiveModal(null);
    setCustomNote('');
    setTaxiTime('');
    setLaundryCounts({ shirts: 0, pants: 0, others: 0 });
  };

  const handleSendRequest = async (categoryName: string, configuredDetails: string) => {
    const { data, error } = await supabase
      .from('requests')
      .insert([{ room: String(roomNumber), category: categoryName, note: configuredDetails, status: 'Pending' }])
      .select()
      .single();

    if (!error && data) {
      setActiveOrderId(data.id);
      fetchActiveRequests();
      closeModals();
    }
  };

  const submitModalForm = () => {
    let detailsString = "";
    if (activeModal === 'Call Waiter') detailsString = "Waiter requested to room via call bell.";
    else if (activeModal === 'Request Taxi') detailsString = `Transport scheduled for ${taxiTime || "Asap"}. ${customNote}`;
    else if (activeModal === 'Laundry') {
      const itemsArr = Object.entries(laundryCounts).filter(([_, qty]) => qty > 0).map(([item, qty]) => `${qty} ${item}`);
      detailsString = itemsArr.length ? `Laundry items: ${itemsArr.join(', ')}. ` : "";
      if (customNote) detailsString += `Note: ${customNote}`;
    } else {
      detailsString = customNote || `${activeModal} service requested.`;
    }
    handleSendRequest(activeModal || 'General', detailsString);
  };

  const addToCart = (itemId: number) => setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] > 1) updated[itemId]--;
      else delete updated[itemId];
      return updated;
    });
  };

  // Calculate Subtotal & Total
  const subtotalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = t.menu.find((m: MenuItem) => m.id === parseInt(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const serviceFee = Math.round(subtotalPrice * 0.1); // 10% service charge
  const totalPrice = subtotalPrice + serviceFee;

  const handlePlaceOrder = async () => {
    const orderDetails = Object.entries(cart).map(([id, qty]) => {
      const item = t.menu.find((m: MenuItem) => m.id === parseInt(id));
      return `${qty}x ${item?.name}`;
    }).join(", ");

    const fullOrderPayload = `${orderDetails} | Subtotal: ${subtotalPrice} ETB | Service: ${serviceFee} ETB | Total: ${totalPrice} ETB`;

    handleSendRequest('Food Order', fullOrderPayload);
    setCart({});
  };

  const getDetailedLiveStatus = (category: string, status: string) => {
    const isFood = category === 'Food Order';
    const isWaiter = category === 'Call Waiter';
    const isHousekeeping = category === 'Housekeeping';
    const isLaundry = category === 'Laundry';
    const isTaxi = category === 'Request Taxi';
    const isSpa = category === 'Spa Booking';

    switch (status) {
      case 'Pending': return isFood ? 'Order received. Kitchen is reviewing your ticket.' : 'Request received. Notifying staff team.';
      case 'In Progress':
        if (isFood) return 'Food is being freshly prepared in the kitchen!';
        if (isWaiter) return 'Waiter is preparing to visit your room.';
        if (isHousekeeping) return 'Housekeeping staff assigned to your room.';
        if (isLaundry) return 'Laundry team is processing your items.';
        if (isTaxi) return 'Transport coordination in progress.';
        if (isSpa) return 'Spa appointment being confirmed.';
        return 'Staff member assigned and handling your request.';
      case 'On the Way':
        if (isFood) return 'Your order is packed and now on the way to your room!';
        if (isWaiter) return 'Waiter is on the way to your room!';
        if (isHousekeeping) return 'Housekeeping staff heading to your room now!';
        if (isLaundry) return 'Clean items are on the way to your room!';
        if (isTaxi) return 'Your taxi has arrived or is pulling up!';
        if (isSpa) return 'Spa therapist is ready for your session!';
        return 'Staff member is heading to your room now!';
      case 'Completed':
        if (isFood) return 'Your food has been delivered. Enjoy your meal!';
        if (isWaiter) return 'Waiter assistance has been provided.';
        if (isHousekeeping) return 'Room cleaning service is complete.';
        if (isLaundry) return 'Laundry service has been completed.';
        if (isTaxi) return 'Transport service concluded. Have a great trip!';
        if (isSpa) return 'Spa service completed. Hope you feel relaxed!';
        return 'Request completed successfully!';
      default:
        return status;
    }
  };

  if (isValidating) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0d0f17] text-neutral-400 font-sans antialiased">
        <div className="w-5 h-5 border-[1.5px] border-amber-500/40 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] tracking-[0.25em] uppercase font-light">{t.verifying}</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0d14] p-6 text-center relative overflow-hidden font-sans antialiased">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/[0.07] blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-xs w-full bg-[#131622] border border-white/[0.04] p-8 rounded-2xl shadow-2xl flex flex-col items-center relative z-10">
          <div className="w-16 h-16 mb-4 flex items-center justify-center">
            <img src="/logo.png" alt="Central Yamarech Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-lg font-serif text-white tracking-wide">Central Yamarech</h1>
          <p className="text-[9px] tracking-[0.2em] text-amber-500/85 uppercase mt-1 mb-6 font-medium">{t.suiteLocked}</p>
          <p className="text-neutral-400 text-xs leading-relaxed font-light">{t.securityMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-500 font-sans antialiased tracking-tight ${
      darkMode ? 'bg-[#0b0d14] text-neutral-100' : 'bg-[#f7f8fa] text-neutral-900'
    }`}>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/[0.05] blur-[140px] pointer-events-none rounded-full" />

      <div className={`w-full max-w-md rounded-[2rem] border p-6 sm:p-8 shadow-2xl relative z-10 transition-colors duration-300 ${
        darkMode ? 'bg-[#131622] border-white/[0.04]' : 'bg-white border-neutral-200'
      }`}>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] tracking-widest uppercase font-mono text-neutral-400 font-medium">Room {roomNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-xl border transition-all ${
                darkMode ? 'bg-[#0b0d14] border-white/[0.06] text-amber-400/90 hover:bg-[#1a1e2e]' : 'bg-neutral-100 border-neutral-200 text-neutral-700 shadow-sm'
              }`}
            >
              {lang === 'en' ? 'አማርኛ' : 'English'}
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-all ${
                darkMode ? 'bg-[#0b0d14] border-white/[0.06] text-amber-400/90 hover:bg-[#1a1e2e]' : 'bg-neutral-100 border-neutral-200 text-neutral-600 shadow-sm'
              }`}
            >
              {darkMode ? <Icons.sun /> : <Icons.moon />}
            </button>
          </div>
        </div>

        <header className="w-full text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center">
            <img src="/logo.png" alt="Central Yamarech Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-serif tracking-wide font-normal">Central Yamarech</h1>
          <p className="text-[9px] tracking-[0.25em] text-neutral-400 uppercase mt-1 font-medium">Hawassa Hotel</p>
          
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 tracking-wider font-semibold uppercase">
            Guest: {sessionData?.guest_name || 'Valued Guest'} • Active
          </div>
        </header>

        <div className={`w-full flex p-1.5 rounded-2xl mb-6 border backdrop-blur-md ${
          darkMode ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-neutral-100 border-neutral-200'
        }`}>
          <button 
            onClick={() => setActiveTab('services')} 
            className={`flex-1 py-2.5 text-[11px] font-semibold rounded-xl transition-all tracking-wider uppercase ${
              activeTab === 'services' 
                ? darkMode ? 'bg-[#1a1e2e] text-amber-400 border border-white/[0.05] shadow-lg' : 'bg-white text-amber-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {t.servicesTab}
          </button>
          <button 
            onClick={() => setActiveTab('menu')} 
            className={`flex-1 py-2.5 text-[11px] font-semibold rounded-xl transition-all tracking-wider uppercase ${
              activeTab === 'menu' 
                ? darkMode ? 'bg-[#1a1e2e] text-amber-400 border border-white/[0.05] shadow-lg' : 'bg-white text-amber-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {t.menuTab}
          </button>
        </div>

        {activeTab === 'services' && (
          <div className="w-full flex flex-col gap-4 pb-4">
            
            <div className="relative group w-full mb-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <button 
                onClick={() => handleSendRequest("Call Waiter", "Waiter requested to room immediately via call bell.")} 
                className="relative w-full py-4 px-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-neutral-950 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                <Icons.bell />
                <span>{t.callWaiter}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'Housekeeping', title: t.roomCleaning, icon: <Icons.cleaning /> },
                { id: 'Laundry', title: t.laundryService, icon: <Icons.laundry /> },
                { id: 'Request Taxi', title: t.taxiTransport, icon: <Icons.taxi /> },
                { id: 'Spa Booking', title: t.spaBooking, icon: <Icons.spa /> },
              ].map(service => (
                <button 
                  key={service.id}
                  onClick={() => setActiveModal(service.id)} 
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all group ${
                    darkMode 
                      ? 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.03] hover:border-amber-500/30 text-neutral-300' 
                      : 'bg-neutral-50 hover:bg-white border-neutral-200 text-neutral-800 shadow-sm hover:border-amber-500/30'
                  }`}
                >
                  <div className="group-hover:scale-110 transition-transform origin-left">
                    {service.icon}
                  </div>
                  <span className="text-[11px] font-medium tracking-wide">{service.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="w-full flex flex-col gap-2.5 pb-24 max-h-[380px] overflow-y-auto pr-1">
            
            {/* Order Bill Summary Panel */}
            {Object.keys(cart).length > 0 && (
              <div className={`p-4 rounded-2xl border mb-3 shadow-lg ${
                darkMode ? 'bg-[#0b0d14] border-amber-500/30 text-neutral-200' : 'bg-neutral-50 border-amber-500/30 text-neutral-800'
              }`}>
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">{t.itemsSelected}</span>
                  <span className="text-xs font-bold">{Object.values(cart).reduce((a, b) => a + b, 0)} items</span>
                </div>

                <div className="space-y-1.5 mb-3 text-xs">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = t.menu.find((m: MenuItem) => m.id === parseInt(id));
                    if (!item) return null;
                    return (
                      <div key={id} className="flex justify-between text-neutral-400 font-light">
                        <span>{qty}x {item.name}</span>
                        <span className="font-mono text-neutral-200">{item.price * qty} ETB</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>{t.subtotal}</span>
                    <span className="font-mono">{subtotalPrice} ETB</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>{t.serviceTax}</span>
                    <span className="font-mono">{serviceFee} ETB</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-amber-400 pt-1">
                    <span>{t.total}</span>
                    <span className="font-mono">{totalPrice} ETB</span>
                  </div>
                </div>

                <button 
                  onClick={handlePlaceOrder} 
                  className="w-full mt-4 py-3 bg-amber-500 hover:brightness-110 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-[0.99] transition-all"
                >
                  {t.confirmOrder} • {totalPrice} ETB
                </button>
              </div>
            )}

            {t.menu.map((item: MenuItem) => (
              <div key={item.id} className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all ${
                darkMode ? 'bg-white/[0.02] border-white/[0.03]' : 'bg-neutral-50 border-neutral-200'
              }`}>
                <div className="flex items-center gap-3 pr-2">
                  <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-[#131622] border-white/[0.04]' : 'bg-white border-neutral-200'}`}>
                    {Icons.food(item.icon)}
                  </div>
                  <div>
                    <h3 className="text-xs font-medium tracking-wide">{item.name}</h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1 font-light">{item.desc}</p>
                    <p className="text-xs font-semibold text-amber-400 mt-1">{item.price} ETB</p>
                  </div>
                </div>

                {cart[item.id] ? (
                  <div className={`flex items-center gap-2 rounded-xl p-1 border ${darkMode ? 'bg-[#131622] border-white/[0.08]' : 'bg-white border-neutral-200'}`}>
                    <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-lg text-xs font-bold hover:bg-white/10">-</button>
                    <span className="text-xs font-bold w-3 text-center">{cart[item.id]}</span>
                    <button onClick={() => addToCart(item.id)} className="w-6 h-6 rounded-lg text-xs font-bold hover:bg-white/10">+</button>
                  </div>
                ) : (
                  <button onClick={() => addToCart(item.id)} className={`px-3 py-1.5 rounded-xl text-[10px] uppercase font-semibold tracking-wider border transition-all ${
                    darkMode ? 'bg-white/[0.02] hover:bg-amber-500 hover:text-neutral-950 hover:border-amber-500 border-white/[0.08] text-amber-400' : 'bg-white hover:bg-amber-500 hover:text-neutral-950 border-neutral-200 text-neutral-700'
                  }`}>
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {trackedOrder && !isModalOpen && (
        <div className={`fixed bottom-6 left-5 right-5 max-w-md mx-auto p-4 rounded-2xl flex items-center justify-between shadow-2xl border backdrop-blur-xl z-30 ${
          trackedOrder.status === 'Completed'
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100' 
            : darkMode ? 'bg-[#131622]/95 border-amber-500/30 text-white' : 'bg-white/95 border-neutral-300 text-neutral-900'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${trackedOrder.status === 'Completed' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                {trackedOrder.status === 'Completed' ? 'Request Completed' : `${t.orderStatus}: ${trackedOrder.status}`}
              </p>
              <p className="text-[11px] text-neutral-300 truncate max-w-[170px] font-light">
                {getDetailedLiveStatus(trackedOrder.category, trackedOrder.status)}
              </p>
            </div>
          </div>
          {trackedOrder.status === 'Completed' ? (
            <button onClick={() => { setActiveOrderId(null); setTrackedOrder(null); }} className="bg-emerald-500 text-neutral-950 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-xl active:scale-95 transition-all">
              Dismiss
            </button>
          ) : (
            <button onClick={() => setIsModalOpen(true)} className="bg-amber-500 text-neutral-950 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-xl active:scale-95 transition-all">
              {t.viewProgress}
            </button>
          )}
        </div>
      )}

      {isModalOpen && trackedOrder && (
        <>
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t rounded-t-3xl z-50 p-6 shadow-2xl ${
            darkMode ? 'bg-[#121520] border-white/[0.08] text-white' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="w-10 h-1 bg-neutral-600/40 rounded-full mx-auto mb-6 cursor-pointer" onClick={() => setIsModalOpen(false)} />
            <h3 className="text-sm font-semibold mb-1 uppercase tracking-wider text-amber-400">{trackedOrder.category}</h3>
            <p className="text-xs text-neutral-300 mb-4 font-medium">
              {getDetailedLiveStatus(trackedOrder.category, trackedOrder.status)}
            </p>
            <p className="text-[11px] text-neutral-400 mb-6 font-light">{trackedOrder.note}</p>
            <button onClick={() => setIsModalOpen(false)} className="w-full bg-neutral-800 text-white font-medium py-3 rounded-xl text-xs uppercase tracking-wider">
              {t.close}
            </button>
          </div>
        </>
      )}

      {activeModal && activeModal !== 'Call Waiter' && !isModalOpen && (
        <>
          <div onClick={closeModals} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t rounded-t-3xl z-50 p-6 shadow-2xl ${
            darkMode ? 'bg-[#121520] border-white/[0.08] text-white' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="w-10 h-1 bg-neutral-600/40 rounded-full mx-auto mb-6 cursor-pointer" onClick={closeModals} />
            
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-amber-400">{activeModal}</h3>
              <button onClick={closeModals} className="text-[11px] text-neutral-400 font-medium hover:text-white transition-colors">{t.close}</button>
            </div>

            {activeModal === 'Request Taxi' && (
              <div className="mb-4">
                <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5 tracking-wider">{t.departureTime}</label>
                <input 
                  type="time" 
                  value={taxiTime} 
                  onChange={(e) => setTaxiTime(e.target.value)} 
                  className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:border-amber-500 ${
                    darkMode ? 'bg-[#0b0d14] border-white/10 text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>
            )}

            {activeModal === 'Laundry' && (
              <div className="mb-4 space-y-2">
                <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5 tracking-wider">{t.itemBreakdown}</label>
                {Object.entries(t.laundryItems).map(([key, label]) => (
                  <div key={key} className={`flex items-center justify-between p-2.5 rounded-xl border ${darkMode ? 'bg-[#0b0d14] border-white/5' : 'bg-neutral-50 border-neutral-200'}`}>
                    <span className={`text-xs ${darkMode ? 'text-neutral-300' : 'text-neutral-800'}`}>{label}</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setLaundryCounts(prev => ({ ...prev, [key]: Math.max(0, (prev as any)[key] - 1) }))}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${darkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'}`}
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{(laundryCounts as any)[key]}</span>
                      <button 
                        onClick={() => setLaundryCounts(prev => ({ ...prev, [key]: (prev as any)[key] + 1 }))}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${darkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-6">
               <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5 tracking-wider">{t.specialInstructions}</label>
               <textarea 
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder={t.placeholderNotes}
                  rows={2}
                  className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:border-amber-500 resize-none ${
                    darkMode ? 'bg-[#0b0d14] border-white/10 text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-900'
                  }`}
               />
            </div>

            <button 
              onClick={submitModalForm}
              className="w-full py-3.5 bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-[0.99] transition-all"
            >
              {t.submit}
            </button>

          </div>
        </>
      )}
    </div>
  );
}

export default async function RoomPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const roomNumber = resolvedParams.roomNumber;

  return (
    <Suspense fallback={
      <div className="flex h-screen flex-col items-center justify-center bg-[#0d0f17] text-neutral-400 font-sans antialiased">
        <div className="w-5 h-5 border-[1.5px] border-amber-500/40 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] tracking-[0.25em] uppercase font-light">Loading...</p>
      </div>
    }>
      <RoomContent roomNumber={roomNumber} />
    </Suspense>
  );
}