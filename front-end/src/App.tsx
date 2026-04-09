/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';

import {
  Car,
  Plane,
  MapPin,
  Bike,
  Utensils,
  Package,
  CreditCard,
  Gift,
  Mic,
  Search,
  Star,
  History,
  Compass,
  Bell,
  User,
  Menu,
  X,
  Keyboard,
  ArrowRight,
  Volume2,
  Navigation,
  ChevronRight
} from 'lucide-react';
import { Screen, Vehicle, TripData, Message } from './types';

// --- Mock Data ---
const VEHICLES: Vehicle[] = [
  {
    id: 'taxi',
    name: 'Xanh SM Taxi',
    description: '4 seater • Eco Friendly',
    price: '85.000đ',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0KUd9mV1DoYSsYZiO9B-Ag3xyZPMiVWqtzffOy4wAHW_ZNndu7zPERc6aym_v77g7MZyZ-WNnCBRHhLttlGPxGXrtm93TkzL-42vo2ElzKzPMx0kgPKDG10z7w32KiYOHqjiS-hfoz0Ci-6eDUjY1qp5_aOgY8Hao5I3wuzaVp3OtcYlNKAe7ZUWISL5cccuAGJ7jUSz03PhTkX7a6J4cfkUsN_vvVsCuru0gRSReKDhoQIaulwXpZ6EckFQ2Sxm9oyM3QsBcaFQQ',
    type: 'taxi'
  },
  {
    id: 'luxury',
    name: 'Xanh SM Luxury',
    description: '4 seater • Premium Comfort',
    price: '120.000đ',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ9ZCDsM9TIVObQ32tv7TyRDBbYGFkO6chWhGvWKQTrCWDitSmXY_louwWW0sjflKZYQcRhrQTNLKuMjGz3-8jlbJzMtrQQ5bp4UpfqUg3EvG83Sk3a8Ln7Phv83_oQ69lscnWpuVQLbQ2Fag4peSmlv1QE2gy-UtIMv5Su_HgvdodeLdqeF_JRIy8xV-UnBvlCCsjZdDllw1cXdGDVoiL1Rsd9QMm1U7bQa-2r_1_xYui8DMpXUJkDpQKvj6afZqw_IaOuJnuHzN5',
    type: 'luxury'
  },
  {
    id: 'bike',
    name: 'Xanh SM Bike',
    description: 'Fastest in traffic',
    price: '25.000đ',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJUd7BQz18BW2CwQ5uCF-cz9rFtd9t5asDai2u4nGKxctnUkBy3Pmjd8n0I2l3hjRsecWvrAp0_2pZ8yeGhdKTq81JDWjqG3RV_QmR2rLnJlpAdxJWFvRI89hLU1FvDExOxXyz27PkyrNoEzVOjoTI8FBcTGcWPRpFXvlrekleipX8oFsvCpqbKzHgY8TCdhb2T1eP74fRjtcCwF5Lsu_IUuOr5Ic3yT0qSefFVVY-8Ix6JLGsD3Iwo22ColBDHMxVbWZoZIUYk8Gv',
    type: 'bike'
  }
];

// --- Components ---

const Header = ({ title, onMenuClick }: { title: ReactNode; onMenuClick?: () => void }) => (
  <header className="fixed top-0 w-full z-50 glass-header flex justify-between items-center px-6 h-20">
    <div className="flex items-center gap-4">
      <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-black/5 transition-colors">
        <Menu className="w-6 h-6 text-primary" />
      </button>
      <h1 className="font-extrabold text-2xl tracking-tight text-primary">{title}</h1>
    </div>
    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border-2 border-primary-container">
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAL1QqJPheg32LRMgCCfc2vLqIhA49BDZHhkBgUzPKSA8TjV8QMvXgUbFWvhrHoNH-8QULOmy2mJTZy4o83ky9e-2c9R42tNvWvtQznU2UsHk1IfqzZ6NhQ_p6GxyLdLf1LlRkoK8f_ojG_XCCfaG0vHM-hJcnK5NHLagbN74x0gwlE-Tv4DCXRzs0VVPGbsND6d9_jt1jGzQXVCQ4f3gTCetdqrgHrNPFo_ONS6qJTlCPcrtgWBlYJjHr64-KpuA7jqTUhrWrm2OSJ"
        alt="Profile"
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  </header>
);

const BottomNav = ({ activeTab }: { activeTab: string }) => (
  <nav className="fixed bottom-0 w-full z-50 rounded-t-[3rem] glass-nav flex justify-around items-center pt-3 pb-8 px-4">
    {[
      { id: 'home', icon: Compass, label: 'Home' },
      { id: 'activity', icon: History, label: 'Activity' },
      { id: 'discovery', icon: Compass, label: 'Discovery' },
      { id: 'alerts', icon: Bell, label: 'Alerts' },
      { id: 'account', icon: User, label: 'Account' },
    ].map((tab) => (
      <button
        key={tab.id}
        className={`flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all duration-200 ${activeTab === tab.id ? 'bg-secondary-container text-primary' : 'text-outline hover:text-primary'
          }`}
      >
        <tab.icon className="w-6 h-6" />
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{tab.label}</span>
      </button>
    ))}
  </nav>
);

const VoiceInteractionBar = ({ onCancel, onVoiceStart, onVoiceEnd, isRecording }: { onCancel: () => void; onVoiceStart?: () => void; onVoiceEnd?: () => void; isRecording?: boolean }) => (
  <div className="w-full flex flex-col items-center relative z-50">
    <div className="w-full bg-white/90 backdrop-blur-2xl rounded-t-[3.5rem] shadow-[0_-8px_32px_rgba(0,0,0,0.1)] pt-10 pb-12 px-6">
      <div className="max-w-md mx-auto flex items-center justify-between gap-6">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onCancel}
            className="w-16 h-16 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 border border-outline-variant"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-wider">Cancel</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative pointer-events-auto">
            <motion.div
              animate={{ scale: isRecording ? [1, 1.3, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className={`absolute inset-0 rounded-full ${isRecording ? 'bg-red-500/20' : ''}`}
            />
            <button
              onPointerDown={onVoiceStart}
              onPointerUp={onVoiceEnd}
              onPointerLeave={onVoiceEnd}
              className={`relative z-10 w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary-container text-white shadow-xl flex items-center justify-center transition-all ${isRecording ? 'scale-90 !bg-red-500 !from-red-500 !to-red-600 opacity-90' : 'active:scale-95'}`}
            >
              <Mic className="w-12 h-12" />
            </button>
          </div>
          <span className={`font-black text-sm tracking-[0.2em] uppercase ${isRecording ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
            {isRecording ? 'Recording...' : 'Hold to Speak'}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button className="w-16 h-16 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all active:scale-90 border border-outline-variant">
            <Keyboard className="w-6 h-6" />
          </button>
          <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-wider">Type</span>
        </div>
      </div>
    </div>
  </div>
);

// --- Chat Components ---

const MessageBubble = ({ message, onAction }: { message: Message; onAction?: (data: any) => void; key?: string }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 w-full`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`
          p-5 rounded-3xl shadow-sm
          ${isUser
            ? 'bg-primary text-white rounded-tr-none'
            : 'bg-white text-on-surface rounded-tl-none border-l-4 border-primary shadow-md'
          }
        `}>
          <p className={`text-[1.1rem] leading-relaxed ${isUser ? 'font-bold italic' : 'font-medium'}`}>
            {message.content}
          </p>
        </div>

        {message.type === 'vehicle-selection' && (
          <div className="mt-4 flex flex-col gap-3">
            {[
              { id: 'luxury', name: 'Sang trọng', label: '✨ Thoải mái nhất', desc: 'VF 8, VF 9' },
              { id: 'bike', name: 'Bike', label: '💸 Rẻ nhất', desc: 'Xanh SM Bike' },
              { id: 'taxi', name: 'Tiêu chuẩn', label: '📍 Tài xế gần đây nhất', desc: 'Có mặt ngay lập tức' }
            ].map((v) => (
              <button
                key={v.id}
                disabled={message.disabled}
                onClick={() => onAction?.({ id: v.id, name: v.name })}
                className={`bg-white rounded-3xl p-4 shadow-md border border-outline-variant/20 flex items-center gap-4 transition-all ${message.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary active:scale-95'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-outline-variant/10 ${message.disabled ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'}`}>
                  {v.id === 'bike' ? <Bike className="w-6 h-6" /> : v.id === 'luxury' ? <Star className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                </div>
                <div className="flex-grow text-left">
                  <h4 className="font-black text-lg">{v.label}</h4>
                  <p className="text-[12px] text-outline font-bold uppercase">{v.desc}</p>
                </div>
              </button>
            ))}
            {!message.disabled && (
              <button
                onClick={() => onAction?.({ id: 'all', name: 'Hiển thị tất cả loại xe' })}
                className="mt-2 text-primary font-bold text-sm tracking-wide bg-transparent border-none outline-none cursor-pointer flex items-center justify-center gap-2 py-3 hover:text-primary/70 transition-colors"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Search className="w-4 h-4" />
                Hiển thị tất cả loại xe
              </button>
            )}
          </div>
        )}

        {message.type === 'trip-summary' && message.data && (
          <div className="mt-4 bg-white rounded-3xl shadow-xl border border-outline-variant/10 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-primary uppercase tracking-tight">Trip Summary</h3>
                <div className="bg-secondary-fixed text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  {message.data.selectedVehicle?.type}
                </div>
              </div>

              <div className="space-y-6 relative mb-8">
                <div className="absolute left-[11px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-outline-variant opacity-30"></div>
                <div className="flex gap-4 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-outline uppercase tracking-widest">Pickup</p>
                    <p className="text-sm font-bold">{message.data.pickup}</p>
                  </div>
                </div>
                <div className="flex gap-4 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Navigation className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-outline uppercase tracking-widest">Destination</p>
                    <p className="text-sm font-bold">{message.data.destination}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-surface-container-high flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center border border-outline-variant/10">
                    {message.data.selectedVehicle?.type === 'bike' ? <Bike className="w-6 h-6 text-primary" /> : <Car className="w-6 h-6 text-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-black">{message.data.selectedVehicle?.name}</p>
                    <p className="text-[8px] text-outline font-bold uppercase">Total inclusive</p>
                  </div>
                </div>
                <span className="text-lg font-black text-primary">{message.data.selectedVehicle?.price}</span>
              </div>

              <button
                disabled={message.disabled}
                onClick={() => onAction?.('confirm')}
                className={`w-full py-4 rounded-full font-black tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${message.disabled ? 'bg-surface-container-high text-outline cursor-not-allowed' : 'bg-primary text-white active:scale-95'}`}
              >
                <span>CONFIRM BOOKING</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [tripData, setTripData] = useState<TripData>({ pickup: '', destination: '' });
  const [isTyping, setIsTyping] = useState(false);
  const [rating, setRating] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const isAutoScrolling = useRef(false);
  const autoScrollTimeout = useRef<any>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<any>(null);

  // Setup WebSocket connection
  useEffect(() => {
    wsRef.current = new WebSocket('ws://127.0.0.1:8000/ws');

    wsRef.current.onopen = () => {
      console.log('Connected to backend WebSocket');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'user_message') {
          addMessage({ id: Date.now().toString() + Math.random().toString(), role: 'user', content: data.text });
          setIsUserTyping(false);
          setIsTyping(true);
        } else if (data.type === 'agent_response') {
          setIsTyping(false);
          addMessage({ id: Date.now().toString() + Math.random().toString(), role: 'assistant', content: data.text });
        } else if (data.type === 'tool_call') {
          setIsTyping(true);
          if (data.tool_name === 'check_vehicle' || data.tool_name === 'get_vehicle_info') {
            setIsTyping(false);
            const args = typeof data.args === 'string' ? JSON.parse(data.args) : (data.args || {});
            const vType = args.vehicle_type || 'Tùy chọn';

            // CHỈ HIỂN THỊ dialog hỏi loại xe khi Agent cố tình gửi "Tùy chọn" hoặc thiếu thông tin,
            // Tránh hiện khi Agent validation (check_vehicle) xe người dùng vừa voice xong.
            if (vType === 'Tùy chọn' || data.tool_name === 'get_vehicle_info') {
              // Tự động disable toàn bộ card vehicle-selection CŨ
              setMessages(prev => prev.map(m => m.type === 'vehicle-selection' ? { ...m, disabled: true } : m));
              addMessage({
                id: Date.now().toString() + Math.random().toString(),
                role: 'assistant',
                content: "Vui lòng chọn loại xe:",
                type: 'vehicle-selection'
              });
            }
          } else if (data.tool_name === 'book_ride') {
            setIsTyping(false);
            try {
              const args = typeof data.args === 'string' ? JSON.parse(data.args) : data.args;
              const vType = args.vehicle_type || 'taxi';

              let vTypeKey = 'taxi';
              const lowerVType = vType.toLowerCase();
              if (lowerVType.includes('vf8') || lowerVType.includes('vf9') || lowerVType.includes('sang trọng')) vTypeKey = 'luxury';
              if (lowerVType.includes('bike') || lowerVType.includes('máy')) vTypeKey = 'bike';

              const baseVehicle = VEHICLES.find(v => v.type === vTypeKey) || VEHICLES[0];
              const selectedV = { ...baseVehicle, name: vType, type: vType };

              // Đọc 'origin' thay vì 'pickup' theo đúng định nghĩa tool của Python!
              const pickupLoc = args.origin || args.pickup || 'Vị trí hiện tại';
              const activeTrip = { pickup: pickupLoc, destination: args.destination, selectedVehicle: selectedV };
              setTripData(activeTrip);

              // Tự disable mọi card cũ nếu đang có
              setMessages(prev => prev.map(m => (m.type === 'trip-summary' || m.type === 'vehicle-selection' ? { ...m, disabled: true } : m)));

              addMessage({
                id: Date.now().toString() + Math.random().toString(),
                role: 'assistant',
                content: "Dưới đây là tóm tắt chuyến đi của bạn:",
                type: 'trip-summary',
                data: activeTrip
              });
            } catch (e) { }
          }
        } else if (data.type === 'tool_response') {
          // Có thể bỏ qua hiển thị text của tool response
        }
      } catch (e) {
        console.error('Error parsing WS message:', e);
      }
    };

    wsRef.current.onclose = () => {
      console.log('Backend WebSocket closed');
    };

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const handleScroll = () => {
    if (isAutoScrolling.current) return;
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 150;
    }
  };

  useEffect(() => {
    if (isNearBottomRef.current) {
      setTimeout(() => {
        isAutoScrolling.current = true;
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });

        clearTimeout(autoScrollTimeout.current);
        autoScrollTimeout.current = setTimeout(() => {
          isAutoScrolling.current = false;
        }, 800);
      }, 100);
    }
  }, [messages, isTyping]);

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const startBooking = () => {
    setCurrentScreen('chat');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({
        id: '1',
        role: 'assistant',
        content: 'Xin chào! Tôi có thể giúp gì cho chuyến đi của bạn?',
        type: 'text'
      });
    }, 1000);
  };

  const handleVehicleSelect = (v: Vehicle) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text', data: `Tôi chọn xe ${v.name}` }));
    }

    // Disable old cards so user won't press again
    setMessages(prev => prev.map(m => m.type === 'vehicle-selection' ? { ...m, disabled: true } : m));
  };

  const handleAction = (action: any) => {
    if (action === 'confirm') {
      setCurrentScreen('finding-driver');
    } else if (typeof action === 'object' && action.id) {
      handleVehicleSelect(action);
    }
  };

  const handleCancel = () => {
    setCurrentScreen('home');
    setMessages([]);
    setIsUserTyping(false);
    setIsTyping(false);
    setTripData({ pickup: '', destination: '' });
  };

  const handleVoiceStart = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recordRTC = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: StereoAudioRecorder,
        desiredSampRate: 16000
      });
      mediaRecorderRef.current = recordRTC;

      recordRTC.startRecording();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
    }
  };

  const handleVoiceEnd = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.getState() === 'recording') {
      mediaRecorderRef.current.stopRecording(() => {
        setIsRecording(false);
        setIsUserTyping(true); // Hiển thị typing của user

        const audioBlob = mediaRecorderRef.current.getBlob();
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'audio', data: base64Audio }));
          }
        };

        // Dọn dẹp stream (bắt buộc để ngắt dấu chấm đỏ trên tab)
        const stream = mediaRecorderRef.current.stream;
        if (stream) stream.getTracks().forEach((track: any) => track.stop());

        mediaRecorderRef.current.destroy();
        mediaRecorderRef.current = null;
      });
    }
  };

  return (
    <div className="h-[100dvh] bg-surface overflow-hidden flex flex-col">
      <Header title={currentScreen === 'home' ? (
        <span className="uppercase">XanhSM <span style={{ color: '#ecd028' }}>Pro Max</span></span>
      ) : 'XanhCompanion'} />

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-24 pb-32 px-6 max-w-md mx-auto w-full overflow-y-auto"
            >
              <section className="mb-8">
                <h2 className="text-3xl font-black tracking-tight text-on-surface">Hello, Nà ná na na 🖥️⌨️</h2>
                <p className="text-on-surface-variant font-medium mt-1">Where can we take you today?</p>
              </section>

              <section className="flex items-center gap-3 mb-10">
                <div onClick={startBooking} className="flex-grow bg-white/80 backdrop-blur-lg rounded-2xl h-16 flex items-center px-5 gap-3 border border-outline-variant/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer hover:bg-white hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(49,200,207,0.1)] transition-all">
                  <Search className="w-6 h-6 text-outline" />
                  <span className="text-on-surface-variant font-medium text-lg">Where to?</span>
                </div>
                <button onClick={startBooking} className="flex-shrink-0 w-16 h-16 bg-primary-container shadow-lg shadow-primary/20 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform">
                  <Mic className="w-8 h-8" />
                </button>
              </section>

              <section className="grid grid-cols-4 gap-4 mb-10">
                {[
                  { icon: Car, label: 'Car' },
                  { icon: Plane, label: 'Airport' },
                  { icon: MapPin, label: 'InterCity' },
                  { icon: Bike, label: 'Bike' },
                  { icon: Utensils, label: 'Food' },
                  { icon: Package, label: 'Express' },
                  { icon: CreditCard, label: 'Sub' },
                  { icon: Gift, label: 'Gift' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
                    <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center group-hover:bg-secondary-container transition-all group-active:scale-90">
                      <item.icon className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-center">{item.label}</span>
                  </div>
                ))}
              </section>

              <section className="mb-10">
                <div className="relative w-full h-44 rounded-3xl overflow-hidden shadow-xl bg-primary">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrc4AszTjCvPX3cBG4oWnSyd3xeeLHa8QMu-pvrrctcEIpsT6lgkjhTTSnmyuL9fLfyqP75mE0nvueDVzJs_rVVppi3h1H6kgXo0R78mCFCDWVIOd7rSbI4lRFXihnxvckP9KRxDPyCTOBXK7EV3D2wrhiNg7Qh1goJDM0_PFauUsyqTTB0alQ0lbiyCjraJmkHhyhGgJ-1AGRKYxLrTGVphgOLUti3Wuv8FpMOwKVZEjgRvEsq0bV3Zfgz45V5dMmv2TvUG2aZUmS" alt="Promo" className="w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 flex flex-col justify-center px-8">
                    <span className="text-white/80 font-bold text-[10px] uppercase tracking-widest mb-1">Limited Offer</span>
                    <h3 className="text-white text-2xl font-black leading-tight">VÒNG XANH MAY MẮN</h3>
                    <p className="text-white/70 text-sm mt-1">Spin to win premium rides & food coupons</p>
                    <button className="mt-4 bg-white text-primary font-black px-6 py-2 rounded-full text-xs w-max shadow-lg active:scale-95 transition-transform">PLAY NOW</button>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-2xl font-black text-on-surface">Food for you</h3>
                  <span className="text-primary font-bold text-sm cursor-pointer">View all</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      name: 'Healthy Greens',
                      rating: '4.8 (2.3k+)',
                      tag: 'BEST SELLER',
                      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbvgOhnr0Ayuzu739m6ZMAJNCDiMWBihDo9AAeaaKD55uPQA1luUpfKVYZOEBv2NLyhuO_lPIsJqxUsVLx4Glf3HdT5CXGv2oPf2bC7pR1FFg3VtZx8XmCxqfbFBrTkKtjwPSIROuGyVfQ_gcQty0GC3DMl-bBXMzLVdl5twj4e9_LSRMjjUBIRmk7Osmm6GDxY3ofo81ZAPl1EP6zsqI1WiTAhaSR2QFkPBIW6gojaMrTWD7V8J6WrDd0tiWjwhfVz1mTKcfRfbOB'
                    },
                    {
                      name: 'Stack Burgers',
                      rating: '4.5 (1.1k+)',
                      tag: '20% OFF',
                      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWX1w8wriGCoFQVcXDPDtWYveDUiQg2lYt8IWs0KpA-G3HM9aP98dHaI24zWLc1biwEK76xK15AEKkWLhh08w8VrcFRp42DCKX8JCq5KSsR05M83XRLAGFMDmf8DQo86VQ_3YwOp508GFXK7Hveo89jQ0G4-3lji_c1ibmDEg4MjTCTUiMJlwo14QLB44mQe_kSDQnJgv2x5f7pfNSc9vVXQpQb48Zw3oAeTH-hX5823-TI7qQoGXPtwGB7yF4G7soP2gyk6TiuEJB'
                    }
                  ].map((food, i) => (
                    <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-outline-variant/20 group cursor-pointer">
                      <div className="h-32 relative overflow-hidden">
                        <img
                          src={food.img}
                          alt={food.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black text-primary tracking-wider">{food.tag}</div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-sm truncate">{food.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-[10px] text-outline font-bold">{food.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {currentScreen === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col relative min-h-0 h-full w-full overflow-hidden"
            >
              <div className="absolute inset-0 grayscale opacity-20 pointer-events-none">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAX0-2xT9hBmwSOVPQEqqc47U2A3QFMFSLmCJftxyVzOZk3V0QBU8dmj1W03tJrGkxoun-d0mEk6w_JE2NTrzVr_UIof-RzDZHAhan2kJIno-ABPeAAhGFU2JBVse6GBaGtLLJ7C_uAzxIfALLlG84yG9Ipo9cmzIwL0nKCYVQcmveetcBrWes45UDqPpUIH22BT0F07kGpWho2S7L8fmA7KE7idnbKIcDeHdsTUm-Uo6-kmJpl2nTFp3cJyggHEtuL7eTS1wWdqpnO" alt="Map" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-24 scroll-smooth min-h-0 relative z-10 w-full" onScroll={handleScroll}>
                <div className="max-w-md mx-auto w-full pb-4">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} onAction={handleAction} />
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start mb-6"
                    >
                      <div className="bg-white p-4 rounded-3xl rounded-tl-none border-l-4 border-primary shadow-md flex gap-1">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-primary rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                    </motion.div>
                  )}
                  {isUserTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end mb-6"
                    >
                      <div className="bg-primary/10 p-4 rounded-3xl rounded-tr-none shadow-md flex gap-1">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-on-surface rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-on-surface rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-on-surface rounded-full" />
                      </div>
                    </motion.div>
                  )}
                  <div ref={bottomRef} className="h-4" />
                </div>
              </div>

              <div className="shrink-0 w-full relative z-20 mt-auto pointer-events-none">
                <div className="pointer-events-auto">
                  <VoiceInteractionBar onCancel={handleCancel} onVoiceStart={handleVoiceStart} onVoiceEnd={handleVoiceEnd} isRecording={isRecording} />
                </div>
              </div>
            </motion.div>
          )}

          {currentScreen === 'finding-driver' && (
            <motion.div
              key="finding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-surface flex flex-col items-center justify-center px-6"
            >
              <div className="absolute inset-0 grayscale opacity-30 pointer-events-none">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAX0-2xT9hBmwSOVPQEqqc47U2A3QFMFSLmCJftxyVzOZk3V0QBU8dmj1W03tJrGkxoun-d0mEk6w_JE2NTrzVr_UIof-RzDZHAhan2kJIno-ABPeAAhGFU2JBVse6GBaGtLLJ7C_uAzxIfALLlG84yG9Ipo9cmzIwL0nKCYVQcmveetcBrWes45UDqPpUIH22BT0F07kGpWho2S7L8fmA7KE7idnbKIcDeHdsTUm-Uo6-kmJpl2nTFp3cJyggHEtuL7eTS1wWdqpnO" alt="Map" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.1, 0.2] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute inset-0 bg-primary rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.2, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute w-48 h-48 bg-primary rounded-full" />
                  <div className="relative w-32 h-32 rounded-full bg-primary flex items-center justify-center shadow-2xl">
                    <Car className="w-16 h-16 text-white" />
                  </div>
                </div>
                <h2 className="mt-12 text-3xl font-black text-primary tracking-tight uppercase text-center">Finding your driver...</h2>
                <p className="mt-4 text-outline font-bold text-sm tracking-widest uppercase">Connecting to nearby vehicles</p>

                <div className="mt-12 bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl flex flex-col items-center gap-4 w-full max-w-sm">
                  <p className="text-on-surface font-black text-sm tracking-widest uppercase">Rate XanhCompanion</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRating(s)}
                        className={`transition-all duration-300 ${s <= rating ? 'text-primary scale-110 drop-shadow-[0_0_8px_rgba(49,200,207,0.5)]' : 'text-outline-variant hover:text-primary/50'}`}
                      >
                        <Star className={`w-8 h-8 ${s <= rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-primary font-bold text-xs"
                    >
                      Cảm ơn bạn đã đánh giá {rating} sao!
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="fixed bottom-12 w-full px-6 flex flex-col items-center">
                <button onClick={handleCancel} className="w-24 h-24 rounded-full bg-white text-on-surface-variant flex items-center justify-center shadow-2xl border-2 border-outline-variant hover:bg-red-50 hover:text-red-500 transition-all active:scale-90">
                  <X className="w-10 h-10" />
                </button>
                <span className="mt-4 text-outline font-black text-xs tracking-[0.3em] uppercase">Cancel</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {currentScreen === 'home' && (
        <BottomNav activeTab="home" />
      )}
    </div>
  );
}
