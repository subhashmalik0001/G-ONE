import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Sparkles, Loader2, ArrowRight, ArrowLeft,
  FileText, CheckCircle2, Shield, AlertCircle, X, Upload,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { analyzeMedicalImage } from '@/lib/ai/client';
import { saveRecord } from '@/lib/medical-records-store';

type Status = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_BYTES = 10 * 1024 * 1024;

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PrescriptionScannerPage() {
  const navigate = useNavigate();
  const [file,         setFile]         = useState<File | null>(null);
  const [previewUrl,   setPreviewUrl]   = useState<string | null>(null);
  const [previewB64,   setPreviewB64]   = useState<string | null>(null);
  const [previewMime,  setPreviewMime]  = useState<string>('image/jpeg');
  const [status,       setStatus]       = useState<Status>('idle');
  const [progress,     setProgress]     = useState(0);
  const [error,        setError]        = useState<string | null>(null);
  const [isDragging,   setIsDragging]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_KEY = import.meta.env.VITE_GEMINI_VISION_KEY || import.meta.env.VITE_GEMINI_TEXT_KEY || '';

  const loadFile = useCallback(async (selected: File) => {
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, WEBP, or PDF.');
      setStatus('error'); return;
    }
    if (selected.size > MAX_BYTES) {
      setError('File too large. Maximum 10MB allowed.');
      setStatus('error'); return;
    }
    setFile(selected);
    setError(null);
    setStatus('idle');

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreviewUrl(dataUrl);
        setPreviewB64(dataUrl.split(',')[1]);
        setPreviewMime(selected.type);
      };
      reader.readAsDataURL(selected);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) loadFile(dropped);
  }, [loadFile]);

  const handleUpload = async () => {
    if (!file) return;
    if (!API_KEY) {
      setError('Gemini API key not configured. Add VITE_GEMINI_VISION_KEY to your .env file.');
      setStatus('error'); return;
    }

    setStatus('uploading');
    setProgress(20);

    try {
      // Convert to base64
      const { base64, mimeType } = await fileToBase64(file);
      setPreviewB64(base64);
      setPreviewMime(mimeType);
      setProgress(50);

      setStatus('analyzing');
      setProgress(70);

      // Run AI analysis
      const result = await analyzeMedicalImage(base64, mimeType === 'application/pdf' ? 'image/jpeg' : mimeType, API_KEY);
      setProgress(90);

      // Save to local store
      saveRecord(result, previewUrl || undefined, file.name);
      setProgress(100);
      setStatus('complete');
      setTimeout(() => navigate('/health-records'), 2200);
    } catch (err: any) {
      console.error('[Scanner] Error:', err);
      setError(err?.message?.includes('API_KEY') ? 'Invalid API key. Check your .env file.' : (err?.message || 'Failed to analyze document.'));
      setStatus('error');
    }
  };

  return (
    <DashboardLayout currentRole="patient">
      <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/health-records')}
            className="p-2.5 rounded-xl border border-black/8 bg-white hover:bg-black/5 transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#05050a]" />
          </button>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Gemini AI Vision</span>
            </div>
            <h1 className="text-[36px] sm:text-[44px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
              AI Document Scanner
            </h1>
            <p className="text-[14px] text-[#8a8a8a] mt-1 font-medium">
              Upload a prescription or lab report — AI extracts medications, diagnoses, and biomarkers automatically.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Drop Zone ─────────────────────────────────────────────── */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
            className={`
              relative group cursor-pointer aspect-[3/4] rounded-[36px] border-4 transition-all flex flex-col items-center justify-center p-8 text-center select-none
              ${isDragging ? 'border-[#b8ff00] bg-[#b8ff00]/5 scale-[1.01]' : ''}
              ${previewUrl ? 'border-transparent bg-white shadow-2xl' : 'border-dashed border-black/10 bg-black/[0.01] hover:bg-black/[0.02] hover:border-[#b8ff00]/40'}
              ${status !== 'idle' ? 'pointer-events-none' : ''}
            `}
          >
            {previewUrl ? (
              <div className="relative w-full h-full rounded-[28px] overflow-hidden">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    className="h-14 w-14 rounded-2xl bg-white text-[#05050a] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                    onClick={e => { e.stopPropagation(); setPreviewUrl(null); setFile(null); setStatus('idle'); }}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                {/* File name badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2">
                  <p className="text-white text-[11px] font-bold truncate">{file?.name}</p>
                  <p className="text-white/60 text-[10px]">{file ? (file.size / 1024).toFixed(0) + ' KB' : ''}</p>
                </div>
              </div>
            ) : (
              <>
                <motion.div
                  animate={{ y: isDragging ? -8 : 0 }}
                  className="h-20 w-20 rounded-3xl bg-[#05050a] flex items-center justify-center text-[#b8ff00] mb-6 group-hover:scale-110 transition-transform shadow-2xl shadow-black/20"
                >
                  <Camera className="h-10 w-10" />
                </motion.div>
                <h3 className="text-[20px] font-black text-[#05050a] mb-2">
                  {isDragging ? 'Drop it here!' : 'Capture or Drop'}
                </h3>
                <p className="text-[14px] font-medium text-[#b0b0b0] max-w-[200px]">
                  Prescription, lab report, or clinical note — PDF, JPG, PNG up to 10MB
                </p>
                <button className="mt-8 flex items-center gap-2 px-6 py-3 bg-black/5 rounded-xl text-[12px] font-black tracking-widest uppercase hover:bg-[#05050a] hover:text-white transition-all">
                  <Upload className="w-4 h-4" /> CHOOSE FILE
                </button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
            />
          </div>

          {/* ── Status / Action Card ───────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-[36px] border border-black/5 p-8 flex-1 flex flex-col justify-center relative overflow-hidden shadow-sm">
              <div className="absolute -right-10 -top-10 h-40 w-40 bg-[#b8ff00] blur-[100px] opacity-10 pointer-events-none" />

              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-[16px] font-black text-[#05050a]">HIPAA-Grade AI Analysis</h4>
                        <p className="text-[12px] text-[#8a8a8a] font-medium">Gemini 2.5 Flash — clinical-grade parsing</p>
                      </div>
                    </div>
                    <p className="text-[14px] font-medium text-[#8a8a8a] leading-relaxed">
                      AI reads handwritten prescriptions and extracts medications, dosages, and diagnoses. Lab reports are auto-indexed with out-of-range biomarker flagging.
                    </p>
                    <button
                      disabled={!file}
                      onClick={handleUpload}
                      className="w-full h-16 rounded-[20px] bg-[#05050a] text-[#b8ff00] font-black text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-25 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                      {file ? 'INITIALIZE AI ANALYSIS' : 'WAITING FOR DOCUMENT'}
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </motion.div>
                )}

                {(status === 'uploading' || status === 'analyzing') && (
                  <motion.div key="loading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center space-y-6 py-8">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-[32px] border-4 border-black/5 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-[#05050a]" />
                      </div>
                      <div className="absolute -inset-3 rounded-[40px] border border-[#b8ff00]/30 animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-[20px] font-black text-[#05050a] uppercase tracking-tighter">
                        {status === 'uploading' ? 'Processing Document' : 'AI Neural Extraction'}
                      </h3>
                      <p className="text-[13px] font-medium text-[#b0b0b0]">
                        {status === 'uploading'
                          ? 'Converting and preparing your document...'
                          : 'Deciphering medications, dosages, and clinical intent...'}
                      </p>
                    </div>
                    <div className="w-full bg-black/5 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-2 bg-[#b8ff00] rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-[11px] font-black text-[#b0b0b0] uppercase tracking-widest">{progress}% Complete</p>
                  </motion.div>
                )}

                {status === 'complete' && (
                  <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center space-y-6 py-8">
                    <div className="h-20 w-20 rounded-[28px] bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-100">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-[20px] font-black text-[#05050a]">Analysis Complete!</h3>
                      <p className="text-[14px] font-medium text-[#8a8a8a]">Record parsed and saved to your Medical Vault.</p>
                    </div>
                    <div className="text-[11px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-lg animate-pulse">
                      Redirecting to Records Vault...
                    </div>
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center space-y-5 py-6">
                    <div className="h-20 w-20 rounded-[28px] bg-red-50 flex items-center justify-center text-red-500">
                      <AlertCircle className="h-10 w-10" />
                    </div>
                    <h3 className="text-[20px] font-black text-[#05050a]">Analysis Failed</h3>
                    <p className="text-[14px] font-medium text-red-500 max-w-xs">{error || 'An unexpected error occurred.'}</p>
                    <button
                      onClick={() => { setStatus('idle'); setError(null); }}
                      className="px-8 py-3 bg-[#05050a] text-white rounded-xl text-[13px] font-black uppercase tracking-wider hover:scale-105 transition"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Supported formats */}
            <div className="bg-[#fafaf8] rounded-[28px] border border-black/5 p-6">
              <h5 className="text-[11px] font-black uppercase tracking-widest text-[#b0b0b0] mb-4">What AI Can Parse</h5>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Prescriptions', sub: 'Meds & dosages' },
                  { label: 'Lab Reports', sub: 'Biomarker values' },
                  { label: 'Clinical Notes', sub: 'Doctor handwriting' },
                  { label: 'Discharge Summaries', sub: 'Hospital records' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-black/5 shadow-sm">
                    <FileText className="h-4 w-4 text-[#c0c0c0] shrink-0" />
                    <div>
                      <p className="text-[11px] font-black text-[#05050a]">{item.label}</p>
                      <p className="text-[10px] text-[#b0b0b0]">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}