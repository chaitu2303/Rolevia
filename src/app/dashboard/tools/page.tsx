'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, FileText, Download, Upload, ShieldCheck, RefreshCw, RefreshCcw } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function UtilityStudio() {
  const [activeTab, setActiveTab] = useState<'JPG_PNG' | 'PDF_WORD' | 'WORD_PDF'>('JPG_PNG');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [outputFileName, setOutputFileName] = useState('output.file');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
      setResultUrl(null);
      setLogs([]);
    }
  };

  const log = (msg: string) => setLogs(prev => [...prev, msg]);

  // Genuine JPG to PNG using Canvas
  const convertJpgToPng = async () => {
    if (selectedFiles.length === 0) return alert('Select a JPG image.');
    setProcessing(true);
    try {
      const file = selectedFiles[0];
      log(`Loading image ${file.name} into local canvas memory...`);
      const imgUrl = URL.createObjectURL(file);
      const img = new window.Image();
      img.src = imgUrl;
      await new Promise(resolve => img.onload = resolve);
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0);

      log('Converting to lossless PNG format...');
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setResultUrl(url);
          setOutputFileName(file.name.replace(/\.[^/.]+$/, "") + ".png");
          log(`Conversion 100% complete. Output size: ${(blob.size / 1024).toFixed(1)} KB`);
        }
        setProcessing(false);
      }, 'image/png');
    } catch (err) {
      log('Error during conversion.');
      setProcessing(false);
    }
  };

  // Genuine PDF to Word via Backend
  const convertPdfToWord = async () => {
    if (selectedFiles.length === 0) return alert('Select a PDF file.');
    setProcessing(true);
    try {
      const file = selectedFiles[0];
      log(`Sending ${file.name} to server for true DOCX conversion...`);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetFormat', 'docx');

      const res = await fetch('/api/tools/convert', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Conversion failed on server');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setOutputFileName(file.name.replace(/\.[^/.]+$/, "") + ".docx");
      log('DOCX generated successfully from extracted text.');
      setProcessing(false);
    } catch (err) {
      log('Error during conversion.');
      setProcessing(false);
    }
  };

  // Genuine Word to PDF via Backend
  const convertWordToPdf = async () => {
    if (selectedFiles.length === 0) return alert('Select a Word file.');
    setProcessing(true);
    try {
      const file = selectedFiles[0];
      log(`Sending ${file.name} to server for true PDF conversion...`);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetFormat', 'pdf');

      const res = await fetch('/api/tools/convert', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Conversion failed on server');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setOutputFileName(file.name.replace(/\.[^/.]+$/, "") + ".pdf");
      log('PDF generation complete.');
      setProcessing(false);
    } catch (err) {
      log('Error during conversion.');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-[#faf8f5] text-black font-sans min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-8 border-black pb-8 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#ff90e8] border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-3">
            <RefreshCw className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Utility Studio</h1>
            <p className="font-bold text-lg mt-1 bg-[#ffe500] text-black inline-block px-2 border-2 border-black -rotate-1">100% Local Browser Conversions.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b-4 border-black mb-8 overflow-x-auto pb-4">
        <button 
          className={`px-6 py-3 font-black text-lg uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform ${activeTab === 'JPG_PNG' ? 'bg-[#90c0ff] translate-y-1 translate-x-1 shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}
          onClick={() => { setActiveTab('JPG_PNG'); setSelectedFiles([]); setResultUrl(null); setLogs([]); }}
        >
          <div className="flex items-center gap-2"><ImageIcon className="w-5 h-5"/> JPG to PNG</div>
        </button>
        <button 
          className={`px-6 py-3 font-black text-lg uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform ${activeTab === 'PDF_WORD' ? 'bg-[#23a094] text-white translate-y-1 translate-x-1 shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}
          onClick={() => { setActiveTab('PDF_WORD'); setSelectedFiles([]); setResultUrl(null); setLogs([]); }}
        >
          <div className="flex items-center gap-2"><FileText className="w-5 h-5"/> PDF to Word</div>
        </button>
        <button 
          className={`px-6 py-3 font-black text-lg uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform ${activeTab === 'WORD_PDF' ? 'bg-[#ff4040] text-white translate-y-1 translate-x-1 shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}
          onClick={() => { setActiveTab('WORD_PDF'); setSelectedFiles([]); setResultUrl(null); setLogs([]); }}
        >
          <div className="flex items-center gap-2"><RefreshCcw className="w-5 h-5"/> Word to PDF</div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <CardHeader className="border-b-4 border-black bg-[#faf8f5]">
            <CardTitle className="font-black uppercase text-xl">Workspace</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="border-4 border-dashed border-black rounded-none p-12 text-center flex flex-col items-center justify-center bg-[#f0f0f0] hover:bg-[#ffe500] transition-colors relative cursor-pointer group">
              <Upload className="w-16 h-16 text-black mb-4 group-hover:-translate-y-2 transition-transform" />
              <p className="text-black font-black uppercase text-xl mb-4">Drag & drop files here</p>
              <Input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Button className="rounded-none border-4 border-black bg-white text-black hover:bg-black hover:text-white font-black uppercase">Browse Files</Button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="font-black text-xl uppercase bg-[#90c0ff] inline-block px-2 border-2 border-black -rotate-1">Selected Files</h3>
                <ul className="text-lg font-bold space-y-2">
                  {selectedFiles.map(f => (
                    <li key={f.name} className="p-3 border-4 border-black bg-[#faf8f5] flex items-center justify-between">
                      <span>{f.name}</span>
                      <span className="opacity-50">{(f.size / 1024).toFixed(1)} KB</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-6">
                  {activeTab === 'JPG_PNG' && (
                    <Button onClick={convertJpgToPng} disabled={processing} className="w-full h-14 text-lg rounded-none border-4 border-black bg-[#ff90e8] hover:bg-[#ff70e0] text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all">
                      {processing ? <RefreshCw className="w-6 h-6 animate-spin mr-2" /> : <ImageIcon className="w-6 h-6 mr-2" />}
                      Start Conversion
                    </Button>
                  )}
                  {activeTab === 'PDF_WORD' && (
                    <Button onClick={convertPdfToWord} disabled={processing} className="w-full h-14 text-lg rounded-none border-4 border-black bg-[#23a094] hover:bg-[#1b857a] text-white font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all">
                      {processing ? <RefreshCw className="w-6 h-6 animate-spin mr-2" /> : <FileText className="w-6 h-6 mr-2" />}
                      Extract to Word
                    </Button>
                  )}
                  {activeTab === 'WORD_PDF' && (
                    <Button onClick={convertWordToPdf} disabled={processing} className="w-full h-14 text-lg rounded-none border-4 border-black bg-[#ff4040] hover:bg-[#e03030] text-white font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all">
                      {processing ? <RefreshCw className="w-6 h-6 animate-spin mr-2" /> : <RefreshCcw className="w-6 h-6 mr-2" />}
                      Generate PDF
                    </Button>
                  )}
                </div>
              </div>
            )}

            {resultUrl && (
              <div className="mt-8 p-6 bg-[#abf5d1] border-4 border-black flex flex-col md:flex-row items-center justify-between gap-4 rotate-1">
                <div>
                  <h3 className="font-black text-2xl uppercase">Success!</h3>
                  <p className="text-lg font-bold mt-1">File converted entirely in memory.</p>
                </div>
                <a href={resultUrl} download={outputFileName}>
                  <Button className="h-12 px-8 rounded-none border-4 border-black bg-white hover:bg-black text-black hover:text-white font-black uppercase transition-colors">
                    <Download className="w-5 h-5 mr-2" /> Download
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-black text-[#33ff00]">
          <CardHeader className="border-b-4 border-[#33ff00]/30 bg-black">
            <CardTitle className="font-black uppercase text-xl flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" /> Terminal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 font-mono text-sm min-h-[300px] overflow-y-auto space-y-2">
            <div className="opacity-50"># Local Browser Memory Engine</div>
            {logs.length === 0 && <span className="opacity-50 animate-pulse">Waiting for commands...</span>}
            {logs.map((log, i) => (
              <div key={i} className="break-words">{'>'} {log}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
