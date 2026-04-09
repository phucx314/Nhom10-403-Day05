/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * XanhSM AI Voice Agent – Frontend
 * Tích hợp với Backend FastAPI WebSocket (ws://localhost:8000/ws)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Navigation,
  Wifi,
  WifiOff,
  MicOff,
} from 'lucide-react';
import { Screen, Vehicle, TripData, Message } from './types';
import { useVoiceAgent, BackendMessage } from './hooks/useVoiceAgent';

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

const ConnectionBadge = ({ status }: { status: string }) => {
  const isOk = status === 'connected';
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${isOk ? 'bg-green-100 text-green-700' : status === 'connecting' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
      {isOk ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {isOk ? 'Live' : status}
    </div>
  );
};

const Header = ({ title, connectionStatus, onMenuClick }: { title: string; connectionStatus?: string; onMenuClick?: () => void }) => (
  <header className="fixed top-0 w-full z-50 glass-header flex justify-between items-center px-6 h-20">
    <div className="flex items-center gap-4">
      <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-black/5 transition-colors">
        <Menu className="w-6 h-6 text-primary" />
      </button>
      <h1 className="font-extrabold text-2xl tracking-tight text-primary uppercase">{title}</h1>
      {connectionStatus && <ConnectionBadge status={connectionStatus} />}
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
        className={`flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all duration-200 ${
          activeTab === tab.id ? 'bg-secondary-container text-primary' : 'text-outline hover:text-primary'
        }`}
      >
        <tab.icon className="w-6 h-6" />
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{tab.label}</span>
      </button>
    ))}
  </nav>
);

/** Thanh điều khiển giọng nói – giữ để nói, thả để gửi */
const VoiceInteractionBar = ({
  onCancel,
  onPressStart,
  onPressEnd,
  recordingStatus,
}: {
  onCancel: () => void;
  onPressStart: () => void;
  onPressEnd: () => void;
  recordingStatus: 'idle' | 'recording' | 'processing';
}) => {
  const isRecording  = recordingStatus === 'recording';
  const isProcessing = recordingStatus === 'processing';

  return (
    <div className="w-full flex flex-col items-center relative z-50">
      <div className="w-full bg-white/90 backdrop-blur-2xl rounded-t-[3.5rem] shadow-[0_-8px_32px_rgba(0,0,0,0.1)] pt-10 pb-12 px-6">
        <div className="max-w-md mx-auto flex items-center justify-between gap-6">
          {/* Cancel */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onCancel}
              className="w-16 h-16 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 border border-outline-variant"
            >
              <X className="w-6 h-6" />
            </button>
            <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-wider">Cancel</span>
          </div>

          {/* Mic button – press & hold */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <motion.div
                animate={{ scale: isRecording ? [1, 1.3, 1] : 1, opacity: isRecording ? [0.3, 0.15, 0.3] : 0 }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="absolute inset-0 rounded-full bg-red-400"
              />
              <motion.div
                animate={{ scale: isProcessing ? [1, 1.2, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className={`absolute inset-0 rounded-full ${isProcessing ? 'bg-primary/20' : ''}`}
              />
              <button
                onMouseDown={onPressStart}
                onMouseUp={onPressEnd}
                onTouchStart={onPressStart}
                onTouchEnd={onPressEnd}
                className={`relative z-10 w-28 h-28 rounded-full text-white shadow-xl flex items-center justify-center active:scale-95 transition-all ${
                  isRecording
                    ? 'bg-gradient-to-br from-red-500 to-red-600 scale-105'
                    : 'bg-gradient-to-br from-primary to-primary-container'
                } ${isProcessing ? 'animate-pulse' : ''}`}
              >
                {isProcessing ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
              </button>
            </div>
            <span className="text-primary font-black text-sm tracking-[0.2em] uppercase">
              {isRecording ? '🔴 Recording...' : isProcessing ? 'Processing...' : 'Hold to Speak'}
            </span>
          </div>

          {/* Keyboard */}
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
};

// --- Chat Components ---

const MessageBubble = ({ message, onAction }: { message: Message; onAction?: (data: any) => void }) => {
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
            {VEHICLES.map((v) => (
              <button
                key={v.id}
                disabled={message.disabled}
                onClick={() => onAction?.(v)}
                className={`bg-white rounded-3xl p-4 shadow-md border border-outline-variant/20 flex items-center gap-4 transition-all ${message.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary active:scale-95'}`}
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-outline-variant/10">
                  <img src={v.image} alt={v.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow text-left">
                  <h4 className="font-black text-lg">{v.name}</h4>
                  <p className="text-[10px] text-outline font-bold uppercase">{v.description}</p>
                </div>
                <span className="font-black text-primary">{v.price}</span>
              </button>
            ))}
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

// --- Tool Call Badge ---
const ToolBadge = ({ name, args }: { name: string; args?: Record<string, unknown> }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex justify-center mb-4"
  >
    <div className="bg-secondary-container/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-xs font-bold text-primary">
      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      🔧 {name}
      {args && Object.keys(args).length > 0 && (
        <span className="text-outline ml-1">({Object.values(args).join(', ')})</span>
      )}
    </div>
  </motion.div>
);

// ──────────────────────────────────────────────────────────────────────────────
//  Main App
// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [tripData,      setTripData]      = useState<TripData>({ pickup: '', destination: '' });
  const [isTyping,      setIsTyping]      = useState(false);
  const [toolCalls,     setToolCalls]     = useState<{ name: string; args?: Record<string, unknown> }[]>([]);

  const scrollRef            = useRef<HTMLDivElement>(null);
  const bottomRef            = useRef<HTMLDivElement>(null);
  const isNearBottomRef      = useRef(true);
  const isAutoScrolling      = useRef(false);
  const autoScrollTimeout    = useRef<any>(null);
  const tripDataRef          = useRef(tripData);

  useEffect(() => { tripDataRef.current = tripData; }, [tripData]);

  // ── Scroll logic ────────────────────────────────────────────────────────────

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
        autoScrollTimeout.current = setTimeout(() => { isAutoScrolling.current = false; }, 800);
      }, 100);
    }
  }, [messages, isTyping, toolCalls]);

  // ── Message helpers ─────────────────────────────────────────────────────────

  const addMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  // ── Handle BackendMessage from WS ───────────────────────────────────────────

  const handleBackendMessage = useCallback((msg: BackendMessage) => {
    switch (msg.type) {

      // STT transcript – hiện câu người dùng nói
      case 'conversation.item.input_audio_transcription.completed': {
        const transcript = msg.transcript?.trim();
        if (transcript) {
          addMessage({ id: Date.now().toString(), role: 'user', content: transcript });
          setIsTyping(true);
        }
        break;
      }

      // Tool gọi – hiển thị badge nhỏ
      case 'tool_call': {
        if (msg.tool_name) {
          setToolCalls(prev => [...prev, { name: msg.tool_name!, args: msg.args }]);
        }
        break;
      }

      // Tool response – có thể log, không cần show lên chat
      case 'tool_response': {
        console.log('[Tool Response]', msg.tool_name, msg.content);
        break;
      }

      // Agent trả lời text
      case 'agent_response': {
        const text = msg.text?.trim();
        if (!text) break;

        setIsTyping(false);
        setToolCalls([]); // clear tool badges khi có kết quả cuối

        // ── Parse nội dung để khám phá loại tin nhắn ──────────────────────
        // Nếu agent đề xuất chọn xe → hiển thị vehicle-selection
        const hasVehicleSelection = /chọn.*xe|loại xe|vehicle/i.test(text);
        // Nếu agent xác nhận đặt thành công (book_ride trả về) → trip-summary
        const hasBookSuccess = /đặt.*thành công|booking.*success/i.test(text);

        if (hasBookSuccess) {
          // Thử parse pickup/destination từ tripData hiện tại
          const td = tripDataRef.current;
          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: text,
            type: 'trip-summary',
            data: td,
          });
        } else if (hasVehicleSelection) {
          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: text,
            type: 'vehicle-selection',
          });
        } else {
          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: text,
            type: 'text',
          });
        }

        // ── Cập nhật tripData nếu agent mention địa điểm ──────────────────
        // Pattern: "từ X đến Y" hay "đón tại X" / "đến Y"
        const fromMatch = text.match(/từ\s+["']?([^"',\.]+?)["']?\s+đến/i);
        const toMatch   = text.match(/đến\s+["']?([^"',\.]+?)["']?[,\.]/i);
        if (fromMatch || toMatch) {
          setTripData(prev => ({
            ...prev,
            pickup:      fromMatch ? fromMatch[1].trim() : prev.pickup,
            destination: toMatch   ? toMatch[1].trim()   : prev.destination,
          }));
        }

        // Nếu WS vẫn recording → đặt lại idle
        setRecordingToIdle();
        break;
      }

      default:
        break;
    }
  }, [addMessage]);

  // ── Voice Agent hook ────────────────────────────────────────────────────────

  const {
    connectionStatus,
    recordingStatus,
    setRecordingStatus,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendTextInput,
    isConnected,
  } = useVoiceAgent(handleBackendMessage);

  const setRecordingToIdle = useCallback(() => {
    setRecordingStatus('idle');
  }, [setRecordingStatus]);

  // Agent response → reset processing state
  // (done inside handleBackendMessage above)

  // ── Screen actions ──────────────────────────────────────────────────────────

  const startBooking = useCallback(() => {
    setCurrentScreen('chat');
    setMessages([]);
    setTripData({ pickup: '', destination: '' });
    setToolCalls([]);
    connect();

    // Greeting từ agent (local, không cần BE)
    setTimeout(() => {
      addMessage({
        id: '0',
        role: 'assistant',
        content: '👋 Xin chào! Tôi là trợ lý đặt xe AI của XanhSM. Hãy giữ nút mic và nói chuyến đi của bạn!',
        type: 'text',
      });
    }, 500);
  }, [connect, addMessage]);

  const handleCancel = useCallback(() => {
    disconnect();
    setCurrentScreen('home');
    setMessages([]);
    setTripData({ pickup: '', destination: '' });
    setToolCalls([]);
  }, [disconnect]);

  const handlePressStart = useCallback(() => {
    if (!isConnected) {
      console.warn('WS not connected yet');
      return;
    }
    startRecording();
  }, [isConnected, startRecording]);

  const handlePressEnd = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const handleVehicleSelect = useCallback((v: Vehicle) => {
    // 1. Show user selection in chat
    addMessage({ id: Date.now().toString(), role: 'user', content: `Tôi chọn ${v.name}` });
    setTripData(prev => ({ ...prev, selectedVehicle: v }));
    setIsTyping(true);

    // 2. Disable previous vehicle-selection messages
    setMessages(prev => prev.map(m => m.type === 'vehicle-selection' ? { ...m, disabled: true } : m));

    // 3. Notify backend so agent can call check_vehicle + book_ride
    sendTextInput(`Tôi muốn đặt xe ${v.name}`);

    // 4. Optimistically show trip summary after agent responds
    //    (agent_response handler will also update this if BE confirms booking)
    setTimeout(() => {
      setIsTyping(false);
      const td = { ...tripDataRef.current, selectedVehicle: v };
      setTripData(td);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Đã xác nhận xe ${v.name}. Dưới đây là thông tin chuyến đi của bạn, vui lòng xác nhận để đặt xe!`,
        type: 'trip-summary',
        data: td,
      });
    }, 1000);
  }, [addMessage, sendTextInput]);

  const handleAction = useCallback((action: any) => {
    if (action === 'confirm') {
      setMessages(prev => prev.map(m => m.type === 'trip-summary' ? { ...m, disabled: true } : m));
      setCurrentScreen('finding-driver');
    } else if (typeof action === 'object' && action.id) {
      handleVehicleSelect(action);
    }
  }, [handleVehicleSelect]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="h-[100dvh] bg-surface overflow-hidden flex flex-col">
      <Header
        title={currentScreen === 'home' ? 'RideFlow' : 'AI Booking'}
        connectionStatus={currentScreen === 'chat' ? connectionStatus : undefined}
        onMenuClick={() => {}}
      />

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">

          {/* ── HOME ── */}
          {currentScreen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-24 pb-32 px-6 max-w-md mx-auto w-full overflow-y-auto"
            >
              <section className="mb-8">
                <h2 className="text-3xl font-black tracking-tight text-on-surface">Hello, Tạ Vĩnh Phúc</h2>
                <p className="text-on-surface-variant font-medium mt-1">Where can we take you today?</p>
              </section>

              <section className="flex items-center gap-3 mb-10">
                <div onClick={startBooking} className="flex-grow bg-surface-container-highest rounded-2xl h-16 flex items-center px-5 gap-3 shadow-inner cursor-pointer hover:bg-surface-container-high transition-colors">
                  <Search className="w-6 h-6 text-outline" />
                  <span className="text-on-surface-variant font-medium text-lg">Where to?</span>
                </div>
                <button onClick={startBooking} className="flex-shrink-0 w-16 h-16 bg-primary-container shadow-lg shadow-primary/20 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform">
                  <Mic className="w-8 h-8" />
                </button>
              </section>

              <section className="grid grid-cols-4 gap-4 mb-10">
                {[
                  { icon: Car,       label: 'Car' },
                  { icon: Plane,     label: 'Airport' },
                  { icon: MapPin,    label: 'InterCity' },
                  { icon: Bike,      label: 'Bike' },
                  { icon: Utensils,  label: 'Food' },
                  { icon: Package,   label: 'Express' },
                  { icon: CreditCard,label: 'Sub' },
                  { icon: Gift,      label: 'Gift' },
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
                    <p className="text-white/70 text-sm mt-1">Spin to win premium rides &amp; food coupons</p>
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
                    { name: 'Healthy Greens', rating: '4.8 (2.3k+)', tag: 'BEST SELLER', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbvgOhnr0Ayuzu739m6ZMAJNCDiMWBihDo9AAeaaKD55uPQA1luUpfKVYZOEBv2NLyhuO_lPIsJqxUsVLx4Glf3HdT5CXGv2oPf2bC7pR1FFg3VtZx8XmCxqfbFBrTkKtjwPSIROuGyVfQ_gcQty0GC3DMl-bBXMzLVdl5twj4e9_LSRMjjUBIRmk7Osmm6GDxY3ofo81ZAPl1EP6zsqI1WiTAhaSR2QFkPBIW6gojaMrTWD7V8J6WrDd0tiWjwhfVz1mTKcfRfbOB' },
                    { name: 'Stack Burgers',  rating: '4.5 (1.1k+)', tag: '20% OFF',     img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWX1w8wriGCoFQVcXDPDtWYveDUiQg2lYt8IWs0KpA-G3HM9aP98dHaI24zWLc1biwEK76xK15AEKkWLhh08w8VrcFRp42DCKX8JCq5KSsR05M83XRLAGFMDmf8DQo86VQ_3YwOp508GFXK7Hveo89jQ0G4-3lji_c1ibmDEg4MjTCTUiMJlwo14QLB44mQe_kSDQnJgv2x5f7pfNSc9vVXQpQb48Zw3oAeTH-hX5823-TI7qQoGXPtwGB7yF4G7soP2gyk6TiuEJB' },
                  ].map((food, i) => (
                    <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-outline-variant/20 group cursor-pointer">
                      <div className="h-32 relative overflow-hidden">
                        <img src={food.img} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
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

          {/* ── CHAT ── */}
          {currentScreen === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col relative min-h-0 h-full w-full overflow-hidden"
            >
              {/* Map BG */}
              <div className="absolute inset-0 grayscale opacity-20 pointer-events-none">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAX0-2xT9hBmwSOVPQEqqc47U2A3QFMFSLmCJftxyVzOZk3V0QBU8dmj1W03tJrGkxoun-d0mEk6w_JE2NTrzVr_UIof-RzDZHAhan2kJIno-ABPeAAhGFU2JBVse6GBaGtLLJ7C_uAzxIfALLlG84yG9Ipo9cmzIwL0nKCYVQcmveetcBrWes45UDqPpUIH22BT0F07kGpWho2S7L8fmA7KE7idnbKIcDeHdsTUm-Uo6-kmJpl2nTFp3cJyggHEtuL7eTS1wWdqpnO" alt="Map" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>

              {/* Chat messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-24 scroll-smooth min-h-0 relative z-10 w-full" onScroll={handleScroll}>
                <div className="max-w-md mx-auto w-full pb-4">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} onAction={handleAction} />
                  ))}

                  {/* Tool call badges */}
                  {toolCalls.map((tc, i) => (
                    <ToolBadge key={i} name={tc.name} args={tc.args} />
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mb-6">
                      <div className="bg-white p-4 rounded-3xl rounded-tl-none border-l-4 border-primary shadow-md flex gap-1">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-primary rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                    </motion.div>
                  )}
                  <div ref={bottomRef} className="h-4" />
                </div>
              </div>

              {/* Voice bar */}
              <div className="shrink-0 w-full relative z-20 mt-auto pointer-events-none">
                <div className="pointer-events-auto">
                  <VoiceInteractionBar
                    onCancel={handleCancel}
                    onPressStart={handlePressStart}
                    onPressEnd={handlePressEnd}
                    recordingStatus={recordingStatus}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── FINDING DRIVER ── */}
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

      {currentScreen === 'home' && <BottomNav activeTab="home" />}
    </div>
  );
}
