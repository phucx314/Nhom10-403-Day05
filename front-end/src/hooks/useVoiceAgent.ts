/**
 * useVoiceAgent – kết nối WebSocket tới backend XanhSM AI Agent,
 * ghi âm micro (PCM16), stream audio lên server, và nhận phản hồi
 * của agent dưới dạng typed messages.
 */

import { useRef, useState, useCallback, useEffect } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';
export type RecordingStatus = 'idle' | 'recording' | 'processing';

/** Message nhận từ BE */
export interface BackendMessage {
  type:
    | 'agent_response'
    | 'tool_call'
    | 'tool_response'
    | 'conversation.item.input_audio_transcription.completed'
    | string;
  text?: string;
  transcript?: string;
  tool_name?: string;
  content?: string;
  args?: Record<string, unknown>;
}

// ── Constants ────────────────────────────────────────────────────────────────

const WS_URL = '/ws'; // proxied by vite → ws://localhost:8000/ws
const SAMPLE_RATE = 24000; // OpenAI Realtime API yêu cầu 24 kHz
const CHUNK_MS   = 100;    // gửi mỗi 100 ms

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Chuyển Float32Array → Int16 PCM rồi base64 */
function float32ToBase64Pcm16(float32: Float32Array): string {
  const pcm = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    pcm[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  const bytes = new Uint8Array(pcm.buffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useVoiceAgent(onMessage: (msg: BackendMessage) => void) {
  const wsRef              = useRef<WebSocket | null>(null);
  const audioCtxRef        = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef          = useRef<MediaStream | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [recordingStatus,  setRecordingStatus]  = useState<RecordingStatus>('idle');

  // Keep onMessage stable reference
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  // Buffer for accumulating streaming text from OpenAI
  const textBufferRef = useRef<string>('');

  // ── Connect ────────────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}${WS_URL}`);

    ws.onopen = () => {
      console.log('[WS] Connected to backend');
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg: BackendMessage = JSON.parse(event.data);

        // ── Handle OpenAI streaming text (fallback if transcription event doesn't fire) ──
        if (msg.type === 'response.text.delta') {
          // Accumulate streaming text
          textBufferRef.current += (msg as any).delta ?? '';
          return; // don't forward delta upstream
        }

        if (msg.type === 'response.text.done') {
          // Full text assembled – emit as agent_response fallback
          const fullText = textBufferRef.current.trim();
          textBufferRef.current = '';
          if (fullText) {
            console.log('[WS] OpenAI text response (fallback):', fullText);
            onMessageRef.current({ type: 'agent_response', text: fullText });
          }
          return;
        }

        // ── Filter noisy events from logging ──
        const noisyEvents = new Set([
          'session.created', 'session.updated', 'rate_limits.updated',
          'response.content_part.added', 'response.content_part.done',
          'response.output_item.added', 'response.output_item.done',
          'response.created', 'response.done',
          'input_audio_buffer.committed', 'input_audio_buffer.speech_started',
          'input_audio_buffer.speech_stopped',
        ]);

        if (!noisyEvents.has(msg.type)) {
          console.log('[WS] Received:', msg.type, msg);
        }

        onMessageRef.current(msg);
      } catch {
        // ignore non-JSON
      }
    };


    ws.onerror = (err) => {
      console.error('[WS] Error', err);
      setConnectionStatus('error');
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected');
      setConnectionStatus('closed');
    };

    wsRef.current = ws;
  }, []);

  // ── Disconnect ─────────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    stopRecording();
    wsRef.current?.close();
    wsRef.current = null;
    setConnectionStatus('idle');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Start recording ────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    if (recordingStatus === 'recording') return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[Voice] WS not connected');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioCtxRef.current = ctx;

      const source    = ctx.createMediaStreamSource(stream);
      // createScriptProcessor requires power-of-2 buffer size (256–16384)
      // 4096 @ 24kHz ≈ 170ms, closest valid size to the 100ms target
      const bufSize = 4096;
      const processor = ctx.createScriptProcessor(bufSize, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const float32 = e.inputBuffer.getChannelData(0);
        const b64     = float32ToBase64Pcm16(float32);
        wsRef.current.send(JSON.stringify({
          type:  'input_audio_buffer.append',
          audio: b64,
        }));
      };

      source.connect(processor);
      processor.connect(ctx.destination);

      setRecordingStatus('recording');
      console.log('[Voice] Recording started');
    } catch (err) {
      console.error('[Voice] Microphone error', err);
      setRecordingStatus('idle');
    }
  }, [recordingStatus]);

  // ── Stop recording ─────────────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    // Disconnect audio graph
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;

    // Stop mic
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    // Close audio context
    audioCtxRef.current?.close();
    audioCtxRef.current = null;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Commit audio → triggers transcription event (conversation.item.input_audio_transcription.completed)
      // Do NOT send response.create — that would make OpenAI Realtime generate its own answer
      // independently of the LangGraph agent, causing double/wrong responses.
      wsRef.current.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
      setRecordingStatus('processing');
      console.log('[Voice] Audio committed, waiting for transcription...');
    } else {
      setRecordingStatus('idle');
    }
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────

  useEffect(() => () => { disconnect(); }, [disconnect]);

  // ── Send text directly (e.g. vehicle selection from UI tap) ─────────────────

  const sendTextInput = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[Voice] WS not open, cannot send text');
      return;
    }
    wsRef.current.send(JSON.stringify({ type: 'text_input', text }));
    console.log('[Voice] Sent text_input:', text);
  }, []);

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    connectionStatus,
    recordingStatus,
    setRecordingStatus,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendTextInput,
    isConnected: connectionStatus === 'connected',
  };
}
