'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, AlertCircle, CheckCircle2, Loader2, FileWarning } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onTextInput?: (text: string) => void;
  isAnalyzing?: boolean;
  analysisStage?: string;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE_MB = 10;

const ANALYSIS_STAGES = [
  { key: 'READING', label: '01 Reading document' },
  { key: 'MAPPING', label: '02 Mapping sections' },
  { key: 'ATS_CHECK', label: '03 Checking ATS structure' },
  { key: 'EXPERIENCE', label: '04 Understanding experience' },
  { key: 'SKILLS', label: '05 Extracting skills' },
  { key: 'IMPACT', label: '06 Measuring impact' },
  { key: 'TARGET_ROLE', label: '07 Comparing target role' },
  { key: 'REPORT', label: '08 Building your report' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadZone({
  onFileSelect,
  onTextInput,
  isAnalyzing = false,
  analysisStage = '',
  disabled = false,
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPasteText, setShowPasteText] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      return 'Only PDF and DOCX files are supported. Please convert your resume to one of these formats.';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large (${formatFileSize(file.size)}). Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [disabled, handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const currentStageIndex = ANALYSIS_STAGES.findIndex(s => s.key === analysisStage);
  const stageLabel = ANALYSIS_STAGES.find(s => s.key === analysisStage)?.label ?? 'Analyzing...';

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative rounded-3xl border border-border/80 bg-card p-6 md:p-8 flex flex-col gap-6 shadow-sm w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
          {/* Left: Document preview with scanning line */}
          <div className="md:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-[240px] aspect-[1/1.4] bg-white rounded-xl shadow-md border border-slate-200/60 p-4 relative overflow-hidden flex flex-col justify-between select-none">
              
              {/* Sweeping Scanning Line */}
              <motion.div 
                className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_12px_3px_rgba(16,185,129,0.6)] z-20"
                animate={{ top: ["4%", "96%", "4%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Wireframe Mock content */}
              <div className="space-y-4">
                <div className="space-y-1 pb-2 border-b border-slate-100">
                  <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                  <div className="h-2 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-slate-300 rounded w-1/3" />
                  <div className="h-1.5 bg-slate-100 rounded w-full" />
                  <div className="h-1.5 bg-slate-100 rounded w-5/6" />
                  <div className="h-1.5 bg-slate-100 rounded w-11/12" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-slate-300 rounded w-1/4" />
                  <div className="h-1.5 bg-slate-100 rounded w-full" />
                  <div className="h-1.5 bg-slate-100 rounded w-4/5" />
                </div>
              </div>
              <div className="flex gap-1">
                <div className="h-3 bg-slate-100 rounded w-10" />
                <div className="h-3 bg-slate-100 rounded w-14" />
                <div className="h-3 bg-slate-100 rounded w-8" />
              </div>
            </div>
          </div>

          {/* Right: Visual stages checklist */}
          <div className="md:col-span-7 space-y-4 w-full">
            <div>
              <h3 className="font-bold text-lg text-foreground">Document Intelligence Analysis</h3>
              {selectedFile ? (
                <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{selectedFile.name}</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">Analyzing pasted text</p>
              )}
            </div>

            <div className="space-y-2.5">
              {ANALYSIS_STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isActive = idx === currentStageIndex;
                const isPending = idx > currentStageIndex;

                return (
                  <div 
                    key={stage.key} 
                    className={`flex items-center gap-3 transition-colors duration-300 ${
                      isActive ? 'text-foreground font-semibold scale-[1.01]' :
                      isCompleted ? 'text-emerald-600 dark:text-emerald-500' :
                      'text-muted-foreground/60'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-all ${
                      isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-500' :
                      isActive ? 'bg-primary/5 border-primary text-primary' :
                      'bg-transparent border-muted-foreground/30 text-muted-foreground/30'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : isActive ? (
                        <Loader2 className="w-3 h-3 text-primary animate-spin" />
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-current" />
                      )}
                    </div>
                    <span className="text-sm">{stage.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.label
            key="dropzone"
            htmlFor="resume-upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative flex flex-col items-center justify-center gap-4
              rounded-2xl border-2 border-dashed p-10 cursor-pointer
              transition-all duration-200
              ${isDragOver
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/3'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.docx"
              onChange={handleInputChange}
              className="sr-only"
              disabled={disabled}
            />
            <motion.div
              animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
            >
              <Upload className="w-8 h-8 text-primary" />
            </motion.div>
            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-foreground">
                {isDragOver ? 'Drop your resume here' : 'Upload your resume'}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to select
              </p>
              <p className="text-xs text-muted-foreground/70">
                PDF or DOCX · Max {MAX_SIZE_MB}MB
              </p>
            </div>
          </motion.label>
        ) : (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <button
                onClick={clearFile}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Upload Error</p>
              <p className="text-sm text-destructive/80 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paste text option */}
      {!selectedFile && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {!selectedFile && (
        <div>
          <button
            onClick={() => setShowPasteText(v => !v)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 rounded-lg hover:bg-muted/50 flex items-center justify-center gap-2"
          >
            <FileWarning className="w-4 h-4" />
            Paste resume text instead
          </button>

          <AnimatePresence>
            {showPasteText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3"
              >
                <textarea
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  rows={8}
                  className="w-full rounded-xl border border-border bg-muted/30 p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {pastedText.trim().length > 50 && onTextInput && (
                  <button
                    onClick={() => onTextInput(pastedText)}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Analyze Pasted Text
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
