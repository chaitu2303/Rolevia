'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Zap, 
  Copy, 
  Loader2, 
  Sparkles, 
  Send, 
  Compass, 
  Target, 
  FileText, 
  HelpCircle, 
  ArrowRight,
  Bot
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Message {
  sender: 'user' | 'copilot';
  text: string;
  recommendation?: {
    label: string;
    link: string;
  };
}

export default function CareerCopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'copilot',
      text: 'Hello! I am your Rolevia Career Intelligence Copilot. Ask me about your ATS scores, skill gap radar, prioritized target applications, or tailored interview preparation.',
      recommendation: {
        label: 'View Career Readiness Hub',
        link: '/dashboard/readiness'
      }
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend })
      });
      const data = await res.json();

      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'copilot',
            text: data.answer,
            recommendation: data.recommendation
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'copilot',
            text: data.error || 'I encountered an error analyzing your career record.'
          }
        ]);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'copilot',
          text: 'Unable to connect to the Career Intelligence Engine.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'What should I do today?', icon: Compass },
    { label: 'Why is my ATS score low?', icon: FileText },
    { label: 'Which skills am I missing?', icon: Target },
    { label: 'Which job should I prioritize?', icon: Zap },
    { label: 'What should I practice for interviews?', icon: HelpCircle }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-black text-white px-3 py-1 text-xs font-black uppercase tracking-widest rounded">
              Rolevia Copilot
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Grounded Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight mt-2">
            Personal Career Copilot
          </h1>
          <p className="text-sm font-semibold text-slate-600">
            Real-time guidance grounded in your master profile, ATS scan history, and interview milestones.
          </p>
        </div>

        <Link
          href="/dashboard/readiness"
          className="self-start sm:self-auto px-4 py-2 bg-white border-2 border-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition"
        >
          Readiness Radar
        </Link>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Suggested Action Inquiries</p>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p, i) => {
            const Icon = p.icon;
            return (
              <button
                key={i}
                onClick={() => handleSend(p.label)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded text-xs font-bold hover:bg-slate-50 active:translate-y-0.5 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Icon className="w-3.5 h-3.5 text-black" />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="bg-white border-3 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg min-h-[420px] flex flex-col justify-between space-y-6">
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-xl text-xs sm:text-sm font-medium ${
                  m.sender === 'user'
                    ? 'bg-black text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-900 border border-slate-300 rounded-bl-none'
                }`}
              >
                {m.sender === 'copilot' && (
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-emerald-700 mb-1">
                    <Bot className="w-3.5 h-3.5" /> Rolevia Intelligence
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {m.text}
                </div>

                {m.recommendation && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <Link
                      href={m.recommendation.link}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 uppercase tracking-wider"
                    >
                      {m.recommendation.label} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              Grounded Career Model analyzing data...
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 pt-4 border-t-2 border-slate-200"
        >
          <Input
            type="text"
            placeholder="Ask anything about your resume score, missing skills, target jobs, or readiness..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            className="border-2 border-black text-xs font-semibold focus-visible:ring-black"
          />
          <Button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="bg-black text-white hover:bg-slate-800 font-bold uppercase text-xs px-5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Ask
          </Button>
        </form>
      </div>
    </div>
  );
}
