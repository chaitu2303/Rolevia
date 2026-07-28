'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Minimize2, Maximize2, Cpu, Wifi, WifiOff, Loader2, ChevronDown, Sparkles } from 'lucide-react';
import { buildPrompt, QUICK_RESPONSES } from '@/lib/ai/CareerKnowledgeBase';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  ts: number;
  thinking?: boolean;
}

type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

const SUGGESTED_QUESTIONS = [
  '📄 How do I make my resume ATS-friendly?',
  '💰 How should I negotiate my salary?',
  '🎤 Help me prep for a behavioral interview',
  '🔍 What\'s the best job search strategy?',
  '🔗 How can I optimize my LinkedIn profile?',
];

export function CareerBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      content: `👋 Hi! I'm **CareerBot** — a free AI career coach running **100% on your device**. No API. No data sent anywhere. Ever.\n\nAsk me about resumes, interviews, salary negotiation, LinkedIn, or job search strategy!`,
      ts: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [modelStatus, setModelStatus] = useState<ModelStatus>('idle');
  const [modelProgress, setModelProgress] = useState(0);
  const [modelFile, setModelFile] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const worker = new Worker('/career-ai-worker.js', { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, text, progress, file, error } = e.data;

      if (type === 'MODEL_LOADING') {
        setModelStatus('loading');
        setModelProgress(progress || 0);
        setModelFile(file || '');
      }
      if (type === 'MODEL_READY') {
        setModelStatus('ready');
        setModelProgress(100);
      }
      if (type === 'MODEL_ERROR') {
        setModelStatus('error');
        console.warn('Model load error:', error);
      }
      if (type === 'RESULT') {
        const cleanText = text?.trim() || "I'm not sure about that. Could you rephrase?";
        setMessages(prev => [
          ...prev.filter(m => !m.thinking),
          { id: Date.now().toString(), role: 'bot', content: cleanText, ts: Date.now() }
        ]);
        setIsGenerating(false);
      }
      if (type === 'ERROR') {
        setMessages(prev => [
          ...prev.filter(m => !m.thinking),
          { id: Date.now().toString(), role: 'bot', content: "Sorry, I hit an error. Try rephrasing your question.", ts: Date.now() }
        ]);
        setIsGenerating(false);
      }
    };

    return () => worker.terminate();
  }, []);

  // Load model when chat opens for first time
  useEffect(() => {
    if (open && modelStatus === 'idle' && workerRef.current) {
      setModelStatus('loading');
      workerRef.current.postMessage({ type: 'LOAD_MODEL' });
    }
  }, [open, modelStatus]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getQuickResponse = (msg: string): string | null => {
    for (const qr of QUICK_RESPONSES) {
      if (qr.pattern.test(msg)) return qr.response;
    }
    return null;
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isGenerating) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      ts: Date.now()
    };

    const thinkingMsg: Message = {
      id: 'thinking',
      role: 'bot',
      content: '',
      ts: Date.now(),
      thinking: true
    };

    setMessages(prev => [...prev, userMsg, thinkingMsg]);
    setInput('');
    setIsGenerating(true);

    // Check quick responses first (instant, no model needed)
    const quick = getQuickResponse(text);
    if (quick) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => !m.thinking),
          { id: Date.now().toString(), role: 'bot', content: quick, ts: Date.now() }
        ]);
        setIsGenerating(false);
      }, 600);
      return;
    }

    // Use AI model if ready
    if (modelStatus === 'ready' && workerRef.current) {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const prompt = buildPrompt(text, history);
      workerRef.current.postMessage({ type: 'GENERATE', payload: { prompt } });
    } else {
      // Fallback: knowledge base based response
      setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => !m.thinking),
          {
            id: Date.now().toString(),
            role: 'bot',
            content: `The AI model is still loading${modelStatus === 'loading' ? ` (${modelProgress}%)` : ''}. In the meantime, here's a quick tip:\n\n**Resume:** Always quantify achievements. Instead of "Managed team" try "Led 8-person engineering team delivering 3 features per sprint, reducing release cycle by 40%".\n\nOnce the model is ready, I'll give you much more detailed, personalized advice!`,
            ts: Date.now()
          }
        ]);
        setIsGenerating(false);
      }, 800);
    }
  }, [isGenerating, messages, modelStatus, modelProgress]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const StatusIndicator = () => {
    if (modelStatus === 'ready') return (
      <div className="flex items-center gap-1.5 text-xs font-black text-[#23a094]">
        <Cpu className="w-3.5 h-3.5" />
        <span>ON-DEVICE AI · PRIVATE</span>
      </div>
    );
    if (modelStatus === 'loading') return (
      <div className="flex items-center gap-1.5 text-xs font-black text-[#FFE500]">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>LOADING AI {modelProgress}%</span>
      </div>
    );
    if (modelStatus === 'error') return (
      <div className="flex items-center gap-1.5 text-xs font-black text-gray-400">
        <WifiOff className="w-3.5 h-3.5" />
        <span>SMART MODE</span>
      </div>
    );
    return (
      <div className="flex items-center gap-1.5 text-xs font-black text-gray-400">
        <Cpu className="w-3.5 h-3.5" />
        <span>READY</span>
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-black border-4 border-black text-white flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(255,144,232,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,144,232,1)] hover:translate-x-1 hover:translate-y-1 transition-all group"
            aria-label="Open CareerBot"
          >
            <Bot className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 bg-[#FF90E8] border-2 border-black text-black text-[9px] font-black px-1.5 py-0.5 uppercase">Free</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: minimized ? 'auto' : undefined
            }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-24px)] bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col"
            style={{ maxHeight: minimized ? 'auto' : '600px' }}
          >
            {/* Header */}
            <div className="bg-black text-white px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="bg-[#FF90E8] border-2 border-black w-9 h-9 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black uppercase text-sm flex items-center gap-2">
                  CareerBot
                  <span className="bg-[#FFE500] text-black text-[9px] font-black px-1.5 py-0.5 border border-black/30">ON-DEVICE AI</span>
                </div>
                <StatusIndicator />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setMinimized(!minimized)} className="text-gray-400 hover:text-white transition-colors">
                  {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Model Loading Banner */}
            <AnimatePresence>
              {modelStatus === 'loading' && !minimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#FFE500] border-b-4 border-black px-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black uppercase">Loading AI Model to your device...</span>
                      <span className="text-xs font-black">{modelProgress}%</span>
                    </div>
                    <div className="h-2 bg-white border-2 border-black">
                      <motion.div
                        animate={{ width: `${modelProgress}%` }}
                        className="h-full bg-black"
                      />
                    </div>
                    <p className="text-[10px] font-bold mt-1 text-black/60 truncate">{modelFile || 'Downloading...'}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            {!minimized && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#faf8f5]">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'bot' && (
                      <div className="bg-[#FF90E8] border-2 border-black w-7 h-7 flex items-center justify-center shrink-0 mr-2 mt-1">
                        <Bot className="w-4 h-4 text-black" />
                      </div>
                    )}
                    <div className={`max-w-[85%] px-4 py-3 border-2 border-black text-sm font-medium ${
                      msg.role === 'user'
                        ? 'bg-black text-white rounded-tl-xl rounded-bl-xl rounded-tr-none shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]'
                        : 'bg-white rounded-tr-xl rounded-br-xl rounded-tl-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    }`}>
                      {msg.thinking ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                              <motion.div
                                key={i}
                                animate={{ y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.5 }}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                              />
                            ))}
                          </div>
                          <span className="text-xs">Thinking...</span>
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-strong:font-black prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}

            {/* Suggested Questions */}
            {!minimized && messages.length <= 1 && (
              <div className="px-4 py-2 bg-white border-t-2 border-black flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q.slice(q.indexOf(' ') + 1))}
                    className="whitespace-nowrap bg-[#faf8f5] border-2 border-black px-3 py-1.5 text-xs font-bold hover:bg-[#FFE500] transition-colors shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            {!minimized && (
              <div className="flex items-end gap-2 p-3 border-t-4 border-black bg-white shrink-0">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about resumes, interviews, salary..."
                  disabled={isGenerating}
                  rows={1}
                  className="flex-1 resize-none bg-[#faf8f5] border-2 border-black px-3 py-2 text-sm font-medium focus:outline-none focus:border-black placeholder:text-gray-400 disabled:opacity-60"
                  style={{ maxHeight: '80px' }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isGenerating}
                  className="bg-black text-white w-10 h-10 flex items-center justify-center border-2 border-black shrink-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Privacy Footer */}
            {!minimized && (
              <div className="px-4 py-2 bg-[#faf8f5] border-t-2 border-black text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  🔒 All processing on your device · Zero data sent · Always free
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
