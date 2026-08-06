// Front Desk Check-In & Smart Guest Memory Portal with SMS & Session Tokens[cite: 3]
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
  folioTab: string;
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
  clearCart: string;
  viewCartAndPay: string;
  estimatedArrival: string;
  myFolioTitle: string;
  myFolioSubtitle: string;
  noChargesYet: string;
  stayTotal: string;
  rateServicePrompt: string;
  feedbackPlaceholder: string;
  submitFeedback: string;
  feedbackThankYou: string;
  laundryItems: Record<string, { name: string; price: number }>;
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
  folio: () => (
    <svg className="w-4 h-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  food: (iconStr: string) => {
    const baseClass = "w-5 h-5 stroke-[1.5] text-amber-400";
    switch (iconStr) {
      case 'croissant': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
      case 'avocado': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" /></svg>;
      case 'sandwich': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
      case 'burger': return <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>;
      default: return <span className="text-lg">???</span>;
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
    menuTab: "Menu",
    folioTab: "Folio",
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
    clearCart: "Clear Cart",
    viewCartAndPay: "View Cart & Place Order",
    estimatedArrival: "Est. Arrival",
    myFolioTitle: "My Room Charges",
    myFolioSubtitle: "Running statement of all stay orders",
    noChargesYet: "No accumulated charges recorded yet.",
    stayTotal: "Total Stay Charges",
    rateServicePrompt: "Rate your stay experience & share feedback:",
    feedbackPlaceholder: "Tell us about your stay, specific requests, or suggestions...",
    submitFeedback: "Submit Feedback",
    feedbackThankYou: "Thank you for your feedback!",
    laundryItems: { 
      shirts: { name: "Shirts / Blouses", price: 50 }, 
      pants: { name: "Pants / Trousers", price: 70 }, 
      others: { name: "Other Items", price: 40 } 
    },
    menu: [
      { id: 1, name: "Continental Breakfast", price: 280, icon: "croissant", desc: "Fresh pastry, seasonal fruit, and coffee." },
      { id: 2, name: "Avocado Toast", price: 220, icon: "avocado", desc: "Sourdough, smashed avocado, and poached egg." },
      { id: 3, name: "Club Sandwich", price: 340, icon: "sandwich", desc: "Triple-decker chicken sandwich with fries." },
      { id: 4, name: "Classic Beef Burger", price: 410, icon: "burger", desc: "Beef patty, cheddar cheese, brioche bun, fries." },
    ]
  },
  am: {
    welcome: "እንኳን ደህና መጡ",
    suiteLocked: "ክፍል ተዘግቷል",
    securityMsg: "እባክዎ ትክክለኛውን የክፍል QR ኮድ ይቃኙ ወይም ከፊት ዴስክ ጋር ያረጋግጡ",
    verifying: "መረጃዎችን በማጣራት ላይ...",
    servicesTab: "አገልግሎቶች",
    menuTab: "ምግብ ምናሌ",
    folioTab: "ሂሳብ",
    callWaiter: " አስተናጋጅ ጥራ",
    roomCleaning: "የክፍል ጽዳት",
    laundryService: "የልብስ ማጠቢያ",
    taxiTransport: "ታክሲ",
    spaBooking: "ስፓ",
    itemsSelected: "እቃዎች",
    confirmOrder: "ትዕዛዝ አረጋግጥ",
    orderStatus: "ሁኔታ",
    viewProgress: "ሂደት ይመልከቱ",
    close: "ዝጋ",
    submit: "ላክ",
    specialInstructions: "ልዩ ማስታወሻዎች",
    placeholderNotes: "ለምሳሌ ፡ አለርጂክ, ተጨማሪ ፎጣ...",
    departureTime: "የሚወጡበት ሰዓት",
    itemBreakdown: "ዝርዝር",
    waiterAlert: "አስተናጋጅ ወደ ክፍልዎ እንዲመጣ ይፈልጋሉ?",
    pending: "ተቀባይነት አግኝቷል",
    inProgress: "በሂደት ላይ",
    completed: "ተጠናቋል",
    subtotal: "ንዑስ ድምር",
    serviceTax: "የአገልግሎት ክፍያ (10%)",
    total: "አጠቃላይ ድምር",
    clearCart: "ባዶ ጋሪ",
    viewCartAndPay: "ትዕዛዝ ይመልከቱ",
    estimatedArrival: "ግምታዊ የመድረሻ ሰዓት",
    myFolioTitle: "የክፍልዎ ሂሳቦች",
    myFolioSubtitle: "የሁሉም ቆይታ ትዕዛዞች ዝርዝር",
    noChargesYet: " እስካሁን የተመዘገበ ክፍያ የለም",
    stayTotal: "አጠቃላይ የቆይታ ሂሳብ",
    rateServicePrompt: "አገልግሎቱን ይገመግሙ:",
    feedbackPlaceholder: "ስለ ቆይታዎ አስተያየት ይጻፉ...",
    submitFeedback: "አስተያየት ላክ",
    feedbackThankYou: "ለሰጡን አስተያየት እናመሰግናለን!",
    laundryItems: { 
      shirts: { name: "ሸሚዝ", price: 50 }, 
      pants: { name: "ሱሪ", price: 70 }, 
      others: { name: "ሌሎች እቃዎች", price: 40 } 
    },
    menu: [
      { id: 1, name: "ቁርስ", price: 280, icon: "croissant", desc: "እንጀራ, ዳቦ እና ቡና" },
      { id: 2, name: "አቮካዶ ቶስት", price: 220, icon: "avocado", desc: "አቮካዶ እና እንቁላል" },
      { id: 3, name: "ሳንድዊች", price: 340, icon: "sandwich", desc: "የዶሮ ሳንድዊች ከድንች ጥብስ ጋር" },
      { id: 4, name: "በርገር", price: 410, icon: "burger", desc: "የስጋ በርገር ከቺዝ እና ድንች ጋር" },
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
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Live Announcement Banner State
  const [liveBroadcast, setLiveBroadcast] = useState<{
    message: string;
    priority: 'normal' | 'important' | 'urgent';
    timestamp: string;
  } | null>(null);

  const [rating, setRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [checkoutRequested, setCheckoutRequested] = useState<boolean>(false);

  const [customNote, setCustomNote] = useState<string>('');
  const [taxiTime, setTaxiTime] = useState<string>('');
  const [laundryCounts, setLaundryCounts] = useState<{ shirts: number; pants: number; others: number }>({ shirts: 0, pants: 0, others: 0 });

  const validateGuestSession = async (targetRoom: string) => {
    try {
      const { data, error } = await supabase
        .from('guest_profiles')
        .select('*')
        .eq('room_number', targetRoom)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        setAccessDenied(true);
      } else {
        setSessionData(data);
        setAccessDenied(false);
      }
    } catch (err) {
      console.error("Session validation error:", err);
      setAccessDenied(true);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    validateGuestSession(roomNumber);

    const channel = supabase
      .channel(`room_active_status_${roomNumber}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'guest_profiles', 
        filter: `room_number=eq.${roomNumber}` 
      }, (payload: any) => {
        if (payload.new && payload.new.is_active === false) {
          setAccessDenied(true);
        } else if (payload.new) {
          setSessionData(payload.new);
          setAccessDenied(false);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomNumber]);

  // Real-time listener for guest broadcasts
  useEffect(() => {
    const checkBroadcasts = () => {
      const activeBroadcast = localStorage.getItem('current_hotel_broadcast');
      if (activeBroadcast) setLiveBroadcast(JSON.parse(activeBroadcast));
    };

    checkBroadcasts();
    const interval = setInterval(checkBroadcasts, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const calculateETA = (categoryName: string) => {
    const now = new Date();
    let addMinutes = 15;
    if (categoryName === 'Food Order') addMinutes = 25;
    else if (categoryName === 'Call Waiter') addMinutes = 5;
    else if (categoryName === 'Housekeeping') addMinutes = 20;
    else if (categoryName === 'Laundry') addMinutes = 30;
    else if (categoryName === 'Request Taxi') addMinutes = 15;
    else if (categoryName === 'Spa Booking') addMinutes = 40;

    now.setMinutes(now.getMinutes() + addMinutes);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendRequest = async (categoryName: string, configuredDetails: string) => {
    const estimatedArrival = calculateETA(categoryName);
    const detailsWithEta = `${configuredDetails} | ETA: ${estimatedArrival}`;

    const { data, error } = await supabase
      .from('requests')
      .insert([{ room: String(roomNumber), category: categoryName, note: detailsWithEta, status: 'Pending' }])
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
      const itemsArr = Object.entries(laundryCounts).filter(([_, qty]) => qty > 0).map(([item, qty]) => `${qty} ${t.laundryItems[item].name}`);
      const laundryTotal = Object.entries(laundryCounts).reduce((sum, [item, qty]) => sum + (qty * t.laundryItems[item].price), 0);
      detailsString = itemsArr.length ? `Laundry items: ${itemsArr.join(', ')} | Total: ${laundryTotal} ETB. ` : "";
      if (customNote) detailsString += `Note: ${customNote}`;
    } else {
      detailsString = customNote || `${activeModal} service requested.`;
    }
    handleSendRequest(activeModal || 'General', detailsString);
  };

  const handleFeedbackSubmit = async () => {
    if (rating === 0 && !feedbackText.trim()) return;
    setHasRated(true);

    try {
      await supabase.from('requests').insert([
        {
          room: String(roomNumber),
          category: 'Feedback',
          note: `Rating: ${rating > 0 ? `${rating} Stars` : 'No Rating'} | Comments: ${feedbackText.trim() || 'None'}`,
          status: 'Completed'
        }
      ]);
      fetchActiveRequests();
    } catch (err) {
      console.error('Failed to submit feedback', err);
    }
  };

  const handleCheckoutRequest = async () => {
    setCheckoutRequested(true);

    try {
      await supabase.from('requests').insert([
        {
          room: String(roomNumber),
          category: 'Checkout',
          note: 'Express Checkout Requested by Guest',
          status: 'Pending'
        }
      ]);
      fetchActiveRequests();
    } catch (err) {
      console.error('Failed to request checkout', err);
    }
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

  const subtotalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = t.menu.find((m: MenuItem) => m.id === parseInt(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const serviceFee = Math.round(subtotalPrice * 0.1); 
  const totalPrice = subtotalPrice + serviceFee;

  const handlePlaceOrder = async () => {
    const orderDetails = Object.entries(cart).map(([id, qty]) => {
      const item = t.menu.find((m: MenuItem) => m.id === parseInt(id));
      return `${qty}x ${item?.name}`;
    }).join(", ");

    const fullOrderPayload = `${orderDetails} | Subtotal: ${subtotalPrice} ETB | Service: ${serviceFee} ETB | Total: ${totalPrice} ETB`;

    handleSendRequest('Food Order', fullOrderPayload);
    setCart({});
    setIsCartOpen(false);
  };

  const getDetailedLiveStatus = (category: string, status: string) => {
    const isFood = category === 'Food Order';

    switch (status) {
      case 'Pending': return isFood ? 'Order received. Kitchen is reviewing your ticket.' : 'Request received. Notifying staff team.';
      case 'In Progress': return isFood ? 'Food is being freshly prepared in the kitchen!' : 'Staff member assigned and handling your request.';
      case 'On the Way': return 'Staff member / delivery is on the way to your room!';
      case 'Completed': return 'Request completed successfully!';
      default: return status;
    }
  };

  const extractPriceFromNote = (note: string) => {
    if (!note) return 0;
    if (note.includes('Total: ')) {
      const parts = note.split('Total: ');
      if (parts[1]) {
        const val = parseInt(parts[1]);
        if (!isNaN(val)) return val;
      }
    }
    return 0;
  };

  const totalFolioCharges = activeRequests.reduce((sum, req) => sum + extractPriceFromNote(req.note), 0);

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
          <p className="text-neutral-400 text-xs leading-relaxed font-light">
            Room {roomNumber} is currently between guest stays. If you have just checked in, please contact front desk reception.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-500 font-sans antialiased tracking-tight ${
      darkMode ? 'bg-[#0b0d14] text-neutral-100' : 'bg-[#f7f8fa] text-neutral-900'
    }`}>
      
      {/* Live Announcement Banner */}
      {liveBroadcast && (
        <div className={`w-full max-w-md p-4 mb-4 border rounded-2xl transition-all flex items-center justify-between z-50 ${
          liveBroadcast.priority === 'urgent' 
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-200' 
            : liveBroadcast.priority === 'important'
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
            : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200'
        }`}>
          <div className="flex items-center gap-3 max-w-5xl mx-auto">
            <div className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 animate-pulse text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-black/40">
                  Hotel Announcement ({liveBroadcast.priority})
                </span>
                <span className="text-[10px] opacity-75">{liveBroadcast.timestamp}</span>
              </div>
              <p className="text-xs font-medium mt-0.5 leading-relaxed">{liveBroadcast.message}</p>
            </div>
          </div>
          <button 
            onClick={() => setLiveBroadcast(null)}
            className="text-xs opacity-75 hover:opacity-100 p-1 ml-4"
          >
            ✕
          </button>
        </div>
      )}

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

        {/* 3-Tab Navigation */}
        <div className={`w-full flex p-1.5 rounded-2xl mb-6 border backdrop-blur-md ${
          darkMode ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-neutral-100 border-neutral-200'
        }`}>
          <button 
            onClick={() => setActiveTab('services')} 
            className={`flex-1 py-2 text-[10px] font-semibold rounded-xl transition-all tracking-wider uppercase ${
              activeTab === 'services' 
                ? darkMode ? 'bg-[#1a1e2e] text-amber-400 border border-white/[0.05] shadow-lg' : 'bg-white text-amber-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {t.servicesTab}
          </button>
          <button 
            onClick={() => setActiveTab('menu')} 
            className={`flex-1 py-2 text-[10px] font-semibold rounded-xl transition-all tracking-wider uppercase ${
              activeTab === 'menu' 
                ? darkMode ? 'bg-[#1a1e2e] text-amber-400 border border-white/[0.05] shadow-lg' : 'bg-white text-amber-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {t.menuTab}
          </button>
          <button 
            onClick={() => setActiveTab('folio')} 
            className={`flex-1 py-2 text-[10px] font-semibold rounded-xl transition-all tracking-wider uppercase flex items-center justify-center gap-1.5 ${
              activeTab === 'folio' 
                ? darkMode ? 'bg-[#1a1e2e] text-amber-400 border border-white/[0.05] shadow-lg' : 'bg-white text-amber-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Icons.folio />
            <span>{t.folioTab}</span>
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
                  <div>
                    <span className="text-[11px] font-medium tracking-wide block">{service.title}</span>
                    {service.id === 'Laundry' && <span className="text-[9px] text-amber-400 font-mono">From 40 ETB</span>}
                    {service.id === 'Spa Booking' && <span className="text-[9px] text-amber-400 font-mono">Book Session</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="w-full flex flex-col gap-2.5 pb-32 max-h-[380px] overflow-y-auto pr-1">
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
                    <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-lg text-xs font-bold hover:bg-white/15">-</button>
                    <span className="text-xs font-bold w-3 text-center">{cart[item.id]}</span>
                    <button onClick={() => addToCart(item.id)} className="w-6 h-6 rounded-lg text-xs font-bold hover:bg-white/15">+</button>
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

        {/* My Charges / Folio Tab Content with Rating & Custom Text Feedback Box */}
        {activeTab === 'folio' && (
          <div className="w-full flex flex-col pb-28 max-h-[380px] overflow-y-auto pr-1 space-y-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400">{t.myFolioTitle}</h2>
              <p className="text-[10px] text-neutral-400 font-light">{t.myFolioSubtitle}</p>
            </div>

            {activeRequests.filter(r => r.category !== 'Feedback' && r.category !== 'Checkout').length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs font-light">
                {t.noChargesYet}
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeRequests.filter(r => r.category !== 'Feedback' && r.category !== 'Checkout').map((req) => {
                  const reqPrice = extractPriceFromNote(req.note);
                  return (
                    <div key={req.id} className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${
                      darkMode ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-neutral-50 border-neutral-200'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-semibold tracking-wide text-white block">{req.category}</span>
                          <span className="text-[10px] text-neutral-400 font-light block mt-0.5 max-w-[220px]">
                            {req.note.split(' | ETA:')[0]}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {reqPrice > 0 ? `${reqPrice} ETB` : 'Complimentary'}
                          </span>
                          <span className={`block text-[9px] uppercase tracking-wider mt-0.5 font-medium ${
                            req.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400/80'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-white/[0.04] text-[9px] text-neutral-500 font-mono">
                        <span>{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {req.note.includes('ETA:') && (
                          <span className="text-amber-400/70">
                            ETA: {req.note.split('ETA: ')[1]?.split(' |')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeRequests.filter(r => r.category !== 'Feedback' && r.category !== 'Checkout').length > 0 && (
              <div className={`p-4 rounded-2xl border flex justify-between items-center ${
                darkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'
              }`}>
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400">{t.stayTotal}</span>
                <span className="text-sm font-mono font-bold text-amber-400">{totalFolioCharges} ETB</span>
              </div>
            )}

            {/* --- Stay Feedback & Custom Text Input Widget --- */}
            <div className={`p-4 rounded-2xl border space-y-3 ${darkMode ? 'bg-white/[0.01] border-white/[0.04]' : 'bg-neutral-50 border-neutral-200'}`}>
              
              <div>
                <h3 className="text-xs font-medium text-neutral-200 mb-2">{t.rateServicePrompt}</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        rating === star 
                          ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md' 
                          : darkMode ? 'bg-[#0b0d14] border-white/10 text-neutral-400 hover:text-amber-400 hover:border-amber-500/40' : 'bg-white border-neutral-300 text-neutral-700 hover:border-amber-500'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={t.feedbackPlaceholder}
                  rows={3}
                  className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:border-amber-500 resize-none ${
                    darkMode ? 'bg-[#0b0d14] border-white/10 text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-900'
                  }`}
                />
              </div>

              {hasRated ? (
                <p className="text-[11px] text-amber-400 font-medium text-center py-1">✓ {t.feedbackThankYou}</p>
              ) : (
                <button
                  onClick={handleFeedbackSubmit}
                  className="w-full py-2.5 bg-amber-500 hover:brightness-110 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all"
                >
                  {t.submitFeedback}
                </button>
              )}

              <hr className={darkMode ? 'border-white/[0.04]' : 'border-neutral-200'} />

              {/* Express Checkout */}
              <div>
                <button
                  onClick={handleCheckoutRequest}
                  disabled={checkoutRequested}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    checkoutRequested 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed' 
                      : 'bg-amber-500 hover:brightness-110 text-neutral-950 shadow-lg shadow-amber-500/10'
                  }`}
                >
                  <span>{checkoutRequested ? 'Express Checkout Requested' : 'Request Express Checkout'}</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Floating Collapsible Cart Pill */}
      {Object.keys(cart).length > 0 && !isModalOpen && !isCartOpen && (
        <div className={`fixed ${trackedOrder ? 'bottom-20' : 'bottom-6'} left-5 right-5 max-w-md mx-auto z-30 transition-all duration-300`}>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-neutral-950 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl flex items-center justify-between active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="bg-neutral-950 text-amber-400 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold">
                {Object.values(cart).reduce((a, b) => a + b, 0)}
              </span>
              <span>{t.viewCartAndPay}</span>
            </div>
            <span className="font-mono">{totalPrice} ETB</span>
          </button>
        </div>
      )}

      {/* Expanded Cart Sheet Modal */}
      {isCartOpen && (
        <>
          <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t rounded-t-3xl z-50 p-6 shadow-2xl max-h-[80vh] overflow-y-auto ${
            darkMode ? 'bg-[#121520] border-white/[0.08] text-white' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="w-10 h-1 bg-neutral-600/40 rounded-full mx-auto mb-5 cursor-pointer" onClick={() => setIsCartOpen(false)} />
            
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400">{t.itemsSelected}</span>
                <span className="text-xs font-bold">({Object.values(cart).reduce((a, b) => a + b, 0)})</span>
              </div>
              <button onClick={() => setCart({})} className="text-[10px] text-neutral-400 hover:text-red-400 uppercase tracking-wider font-medium">
                {t.clearCart}
              </button>
            </div>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
              {Object.entries(cart).map(([id, qty]) => {
                const item = t.menu.find((m: MenuItem) => m.id === parseInt(id));
                if (!item) return null;
                return (
                  <div key={id} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-neutral-400 block text-[10px]">{item.price} ETB each</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-300">{item.price * qty} ETB</span>
                      <div className={`flex items-center gap-2 rounded-xl p-1 border ${darkMode ? 'bg-[#0b0d14] border-white/10' : 'bg-neutral-100 border-neutral-300'}`}>
                        <button onClick={() => removeFromCart(id as any)} className="w-5 h-5 text-xs font-bold">-</button>
                        <span className="w-3 text-center text-xs font-bold">{qty}</span>
                        <button onClick={() => addToCart(id as any)} className="w-5 h-5 text-xs font-bold">+</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs mb-6">
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

            <div className="flex gap-3">
              <button onClick={() => setIsCartOpen(false)} className="flex-1 py-3 bg-neutral-800 text-neutral-300 font-medium rounded-xl text-xs uppercase tracking-wider">
                {t.close}
              </button>
              <button onClick={handlePlaceOrder} className="flex-1 py-3 bg-amber-500 hover:brightness-110 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg">
                {t.confirmOrder}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Active Tracking Banner */}
      {trackedOrder && trackedOrder.category !== 'Feedback' && trackedOrder.category !== 'Checkout' && !isModalOpen && (
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

          <div className="flex items-center gap-3">
            {trackedOrder.status !== 'Completed' && trackedOrder.note && trackedOrder.note.includes('ETA:') && (
              <div className="text-right hidden sm:block">
                <span className="block text-[9px] uppercase tracking-wider text-neutral-400">{t.estimatedArrival}</span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {trackedOrder.note.split('ETA: ')[1]?.split(' |')[0]}
                </span>
              </div>
            )}

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
        </div>
      )}

      {isModalOpen && trackedOrder && (
        <>
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t rounded-t-3xl z-50 p-6 shadow-2xl ${
            darkMode ? 'bg-[#121520] border-white/[0.08] text-white' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="w-10 h-1 bg-neutral-600/40 rounded-full mx-auto mb-6 cursor-pointer" onClick={() => setIsModalOpen(false)} />
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">{trackedOrder.category}</h3>
              {trackedOrder.note && trackedOrder.note.includes('ETA:') && (
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                  {t.estimatedArrival}: {trackedOrder.note.split('ETA: ')[1]?.split(' |')[0]}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-300 mb-4 font-medium">
              {getDetailedLiveStatus(trackedOrder.category, trackedOrder.status)}
            </p>
            <p className="text-[11px] text-neutral-400 mb-6 font-light">{trackedOrder.note.split(' | ETA:')[0]}</p>
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider">{t.itemBreakdown}</label>
                  <span className="text-[10px] font-mono text-amber-400 font-semibold">
                    Est: {Object.entries(laundryCounts).reduce((sum, [key, qty]) => sum + (qty * t.laundryItems[key].price), 0)} ETB
                  </span>
                </div>
                {Object.entries(t.laundryItems).map(([key, item]) => (
                  <div key={key} className={`flex items-center justify-between p-2.5 rounded-xl border ${darkMode ? 'bg-[#0b0d14] border-white/5' : 'bg-neutral-50 border-neutral-200'}`}>
                    <div>
                      <span className={`text-xs block ${darkMode ? 'text-neutral-300' : 'text-neutral-800'}`}>{item.name}</span>
                      <span className="text-[10px] text-amber-400/80 font-mono">{item.price} ETB/pc</span>
                    </div>
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