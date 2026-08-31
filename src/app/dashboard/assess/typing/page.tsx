'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Keyboard, Timer, RefreshCw, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. Programming is the art of algorithm design and the craft of debugging errant code. To become a better software engineer, you must write code every day and study the best practices of those who came before you.";

export default function TypingTest() {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const finishTest = () => {
    setIsActive(false);
    setIsFinished(true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      finishTest();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const calculateStats = (currentInput: string) => {
    const timeElapsed = 60 - timeLeft;
    if (timeElapsed === 0) return;

    // Calculate WPM (Standard: 5 characters = 1 word)
    const wordsTyped = currentInput.length / 5;
    const currentWpm = Math.round((wordsTyped / timeElapsed) * 60);
    setWpm(currentWpm);

    // Calculate Accuracy
    let correctChars = 0;
    for (let i = 0; i < currentInput.length; i++) {
      if (currentInput[i] === SAMPLE_TEXT[i]) {
        correctChars++;
      }
    }
    const currentAccuracy = currentInput.length > 0 
      ? Math.round((correctChars / currentInput.length) * 100) 
      : 100;
    setAccuracy(currentAccuracy);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!isActive && !isFinished) {
      setIsActive(true);
    }
    
    // Prevent typing beyond sample length
    if (val.length <= SAMPLE_TEXT.length) {
      setInput(val);
      calculateStats(val);
      
      // Auto-finish if completed
      if (val.length === SAMPLE_TEXT.length) {
        finishTest();
      }
    }
  };

  const resetTest = () => {
    setInput('');
    setTimeLeft(60);
    setIsActive(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    if (inputRef.current) inputRef.current.focus();
  };

  // Render text with highlighting
  const renderText = () => {
    return SAMPLE_TEXT.split('').map((char, i) => {
      let colorClass = 'text-slate-400';
      if (i < input.length) {
        colorClass = input[i] === char ? 'text-green-600 font-bold bg-green-100' : 'text-red-600 font-bold bg-red-100 underline';
      } else if (i === input.length && !isFinished) {
        colorClass = 'text-black bg-[#ffe500] font-black border-b-2 border-black animate-pulse';
      }
      return <span key={i} className={colorClass}>{char}</span>;
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 bg-[#faf8f5] min-h-[calc(100vh-4rem)]">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b-8 border-black">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#23a094] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-2">
            <Keyboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Typing Speed Test</h1>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 font-black text-xl">
            <Timer className="w-6 h-6 text-[#ff4040]" /> 00:{timeLeft.toString().padStart(2, '0')}
          </div>
          <Button onClick={resetTest} className="h-full px-4 rounded-none border-4 border-black bg-[#90c0ff] hover:bg-[#70aaff] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 transition-all">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden relative">
          {isFinished && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center border-4 border-black m-2 p-6 text-center"
            >
              <Trophy className="w-20 h-20 text-[#ffe500] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-4" />
              <h2 className="text-4xl font-black uppercase mb-2">Test Complete!</h2>
              <div className="text-2xl font-bold bg-black text-white px-4 py-2 rotate-2 inline-block mb-6 shadow-[4px_4px_0px_0px_rgba(255,144,232,1)]">
                {wpm} WPM @ {accuracy}%
              </div>
              <div className="flex gap-4">
                <Button onClick={resetTest} className="h-12 px-6 rounded-none border-4 border-black bg-[#ff90e8] hover:bg-[#ff70e0] text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all">
                  Try Again
                </Button>
                <Button onClick={() => window.location.href='/dashboard/assess'} className="h-12 px-6 rounded-none border-4 border-black bg-white hover:bg-slate-100 text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all">
                  Exit
                </Button>
              </div>
            </motion.div>
          )}

          <CardHeader className="bg-[#faf8f5] border-b-4 border-black">
            <CardTitle className="font-bold text-slate-500 uppercase tracking-widest text-sm">
              Type the text below as fast as you can
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 relative">
            <div className="text-2xl leading-relaxed font-mono tracking-tight select-none">
              {renderText()}
            </div>
            
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              disabled={isFinished}
              autoFocus
              className="absolute inset-0 w-full h-full opacity-0 cursor-text resize-none p-8"
              spellCheck="false"
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#ffe500]">
            <CardContent className="p-6 text-center space-y-2">
              <div className="text-xs font-black uppercase tracking-widest text-black/60">Speed</div>
              <div className="text-6xl font-black">{wpm}</div>
              <div className="font-bold">Words / Min</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#90c0ff]">
            <CardContent className="p-6 text-center space-y-2">
              <div className="text-xs font-black uppercase tracking-widest text-black/60">Accuracy</div>
              <div className="text-6xl font-black">{accuracy}<span className="text-4xl">%</span></div>
              <div className="font-bold">Precision</div>
            </CardContent>
          </Card>

          {!isActive && !isFinished && (
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1 text-center font-bold">
              <p>Start typing to begin the test automatically.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
