'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Minimize2, Maximize2, Cpu, Wifi, WifiOff, Loader2, ChevronDown, Sparkles } from 'lucide-react';
import { buildPrompt, QUICK_RESPONSES } from '@/lib/ai/CareerKnowledgeBase';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

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
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: '0',
      role: 'bot',
      content: `👋 Hi! I'm **Rolevia Copilot** — a free AI career coach running **100% on your device**. No API. No data sent anywhere. Ever.\n\nAsk me about resumes, interviews, salary negotiation, LinkedIn, or job search strategy!`,
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
      {/* Subtle Copilot Trigger Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center premium-shadow hover:scale-105 transition-all group border-4 border-background"
            aria-label="Open Rolevia Copilot"
          >
            <div className="font-serif font-bold text-xl">R</div>
            <span className="absolute top-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Premium Side Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full md:w-[420px] bg-card border-l border-border flex flex-col premium-shadow"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0 bg-card/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <Image src="/icon.svg" alt="Rolevia Copilot" width={24} height={24} className="object-contain" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm">Rolevia Copilot</h2>
                    <StatusIndicator />
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-card border border-border shadow-sm rounded-tl-sm text-card-foreground'
                      }`}
                    >
                      {msg.thinking ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                              <motion.div
                                key={i}
                                animate={{ y: [0, -3, 0] }}
                                transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.5 }}
                                className="w-1.5 h-1.5 bg-current rounded-full"
                              />
                            ))}
                          </div>
                          <span className="text-xs">Analyzing...</span>
                        </div>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions */}
              {messages.length <= 1 && (
                <div className="px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 bg-background/50">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q.slice(q.indexOf(' ') + 1))}
                      className="whitespace-nowrap bg-card border border-border px-3 py-1.5 rounded-full text-xs font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0 shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-4 bg-card border-t border-border shrink-0">
                <div className="relative flex items-end gap-2 bg-muted/50 rounded-2xl p-2 border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    disabled={isGenerating}
                    rows={1}
                    className="flex-1 resize-none bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-muted-foreground disabled:opacity-60 min-h-[40px] max-h-[120px]"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isGenerating}
                    className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-xl shrink-0 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Rolevia Career Intelligence
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
