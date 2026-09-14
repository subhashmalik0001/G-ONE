import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderIcon, FileText, Search, Download, ExternalLink, Grid,
  List as ListIcon, FolderPlus, Upload, Trash2, ArrowLeft, X,
  Plus, AlertTriangle, Pill, TestTube, CheckCircle, ChevronRight,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  getFolders, getRecords, createFolder, deleteFolder, deleteRecord,
  type MedicalFolder, type MedicalRecord,
} from '@/lib/medical-records-store';

// ─── Record Detail Modal ───────────────────────────────────────────────────────
function RecordModal({ record, onClose, onDelete }: { record: MedicalRecord; onClose: () => void; onDelete: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-black/5 overflow-hidden z-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="max-h-[85vh] overflow-y-auto overscroll-contain">
          <div className="p-8 sm:p-10 space-y-7">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    record.type === 'prescription' ? 'bg-[#b8ff00] text-[#05050a]' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {record.type === 'prescription' ? '💊 Prescription' : '🧪 Lab Report'}
                  </span>
                  {record.isCritical && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 animate-pulse">
                      ⚠️ Critical Marker
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700">
                    {Math.round(record.aiConfidence * 100)}% AI Confidence
                  </span>
                </div>
                <h2 className="text-[26px] sm:text-[30px] font-black tracking-tight text-[#05050a] leading-tight">
                  {record.doctorName || record.labName || 'Medical Record'}
                </h2>
                <p className="text-[13px] font-medium text-[#8a8a8a]">
                  {record.clinicName || record.testName} •{' '}
                  {record.prescriptionDate || record.reportDate || record.createdAt?.split('T')[0]}
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-11 w-11 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl bg-[#fafaf8] border border-black/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#b0b0b0] mb-2">AI Summary</p>
              <p className="text-[#05050a] font-medium leading-relaxed text-[14px]">{record.summary}</p>
            </div>

            {/* Diagnosis */}
            {record.type === 'prescription' && record.diagnosis && (
              <div className="p-5 rounded-2xl border border-amber-100 bg-amber-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Diagnosis</p>
                <p className="text-[#05050a] font-bold text-[15px]">{record.diagnosis}</p>
              </div>
            )}

            {/* Medicines */}
            {record.type === 'prescription' && record.medicines && record.medicines.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#b0b0b0]">
                  Medications Prescribed ({record.medicines.length})
                </p>
                {record.medicines.map((med, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-black/5 bg-white flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#05050a] flex items-center justify-center shrink-0">
                        <Pill className="h-5 w-5 text-[#b8ff00]" />
                      </div>
                      <div>
                        <p className="font-black text-[#05050a] text-[15px]">{med.name}</p>
                        <p className="text-[11px] font-bold text-[#b0b0b0] uppercase tracking-wider mt-0.5">
                          {med.dosage} · {med.frequency}
                        </p>
                        {med.instructions && (
                          <p className="text-[11px] text-[#8a8a8a] mt-0.5">{med.instructions}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-black px-3 py-1.5 rounded-lg bg-black/5 text-[#05050a] shrink-0">
                      {med.duration}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Biomarkers */}
            {record.type === 'lab_report' && record.biomarkers && record.biomarkers.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#b0b0b0]">
                  Biomarkers Tested ({record.biomarkers.length})
                </p>
                {record.biomarkers.map((bio, i) => {
                  const low  = bio.value < bio.normal_min;
                  const high = bio.value > bio.normal_max;
                  const outOfRange = low || high;
                  const pct = Math.min(100, Math.max(0,
                    ((bio.value - bio.normal_min) / Math.max(bio.normal_max - bio.normal_min, 0.001)) * 100
                  ));
                  return (
                    <div key={i} className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                      outOfRange ? 'border-red-200 bg-red-50' : 'border-black/5 bg-white'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                          outOfRange ? 'bg-red-500' : 'bg-emerald-500'
                        }`}>
                          {outOfRange ? <AlertTriangle className="h-5 w-5 text-white" /> : <CheckCircle className="h-5 w-5 text-white" />}
                        </div>
                        <div>
                          <p className="font-black text-[#05050a]">{bio.name}</p>
                          <p className="text-[11px] font-bold text-[#b0b0b0] uppercase tracking-wider">{bio.unit}</p>
                          <div className="w-32 h-1.5 bg-black/10 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${outOfRange ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-black text-[20px] ${outOfRange ? 'text-red-600' : 'text-[#05050a]'}`}>
                          {bio.value}
                        </p>
                        <p className="text-[10px] font-bold text-[#b0b0b0]">
                          Ref: {bio.normal_min}–{bio.normal_max}
                          {high && ' ↑'}{low && ' ↓'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Document Preview */}
            {record.fileDataUrl && (
              <div className="rounded-2xl overflow-hidden border border-black/5 max-h-64">
                <img src={record.fileDataUrl} alt="Document" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              {record.fileDataUrl && (
                <a
                  href={record.fileDataUrl}
                  download={record.fileName || 'medical-record'}
                  className="flex-1"
                >
                  <button className="w-full h-14 bg-[#05050a] text-[#b8ff00] rounded-2xl font-black text-[13px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition">
                    <Download className="h-5 w-5" /> DOWNLOAD ORIGINAL
                  </button>
                </a>
              )}
              <button
                onClick={onDelete}
                className="h-14 w-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-100 transition shrink-0"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Record Card ──────────────────────────────────────────────────────────────
function RecordCard({ record, view, onView, onDelete }: {
  record: MedicalRecord;
  view: 'grid' | 'list';
  onView: () => void;
  onDelete: () => void;
}) {
  const isRx = record.type === 'prescription';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group bg-white rounded-[24px] border border-black/5 border-t-[4px] overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
        isRx ? 'border-t-[#b8ff00]' : 'border-t-blue-400'
      } ${view === 'list' ? 'flex items-center gap-5 p-5' : 'flex flex-col p-7 gap-5'}`}
      onClick={onView}
    >
      <div className={`h-14 w-14 rounded-[18px] flex items-center justify-center shadow-lg shrink-0 ${
        isRx ? 'bg-[#05050a] text-[#b8ff00] shadow-black/15' : 'bg-blue-600 text-white shadow-blue-200'
      }`}>
        {isRx ? <Pill className="h-7 w-7" /> : <TestTube className="h-7 w-7" />}
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
            isRx ? 'bg-[#b8ff00]/20 text-[#3a5a00]' : 'bg-blue-50 text-blue-700'
          }`}>
            {isRx ? 'Prescription' : 'Lab Report'}
          </span>
          {record.isCritical && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-600 animate-pulse">
              Critical
            </span>
          )}
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 uppercase">
            {Math.round(record.aiConfidence * 100)}% AI
          </span>
        </div>
        <h4 className="text-[16px] font-black text-[#05050a] truncate leading-tight">
          {record.doctorName || record.labName || 'Unknown'}
        </h4>
        <p className="text-[12px] font-bold text-[#b0b0b0] truncate">
          {record.diagnosis || record.testName || record.clinicName || record.labName}
        </p>
        <p className="text-[11px] text-[#c0c0c0]">
          {record.prescriptionDate || record.reportDate || record.createdAt?.split('T')[0]}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={onView}
          className="flex items-center gap-1.5 px-4 h-10 bg-[#05050a] text-[#b8ff00] rounded-xl text-[11px] font-black hover:scale-105 transition"
        >
          VIEW <ExternalLink className="h-3 w-3" />
        </button>
        <button
          onClick={onDelete}
          className="h-10 w-10 rounded-xl border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 transition"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HealthRecordsPage() {
  const navigate = useNavigate();
  const [folders,     setFolders]     = useState<MedicalFolder[]>([]);
  const [records,     setRecords]     = useState<MedicalRecord[]>([]);
  const [activeFolder,setActiveFolder]= useState<string | null>(null);
  const [selectedRec, setSelectedRec] = useState<MedicalRecord | null>(null);
  const [view,        setView]        = useState<'grid' | 'list'>('grid');
  const [search,      setSearch]      = useState('');

  const refresh = useCallback(() => {
    setFolders(getFolders());
    setRecords(getRecords());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreateFolder = () => {
    const name = window.prompt('Folder name (e.g. "Apollo Hospital"):');
    if (name?.trim()) { createFolder(name.trim()); refresh(); }
  };

  const handleDeleteFolder = (id: string) => {
    const folder = folders.find(f => f.id === id);
    const count  = records.filter(r => r.folderId === id).length;
    if (window.confirm(`Delete "${folder?.name}" and its ${count} record(s)?`)) {
      deleteFolder(id);
      if (activeFolder === id) setActiveFolder(null);
      refresh();
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Delete this medical record permanently?')) {
      deleteRecord(id);
      setSelectedRec(null);
      refresh();
    }
  };

  const filtered = records.filter(r => {
    if (activeFolder && r.folderId !== activeFolder) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return [r.doctorName, r.labName, r.clinicName, r.diagnosis, r.testName, r.summary]
      .some(v => v?.toLowerCase().includes(q));
  });

  const activeF = folders.find(f => f.id === activeFolder);

  return (
    <DashboardLayout currentRole="patient">
      <AnimatePresence>
        {selectedRec && (
          <RecordModal
            key={selectedRec.id}
            record={selectedRec}
            onClose={() => setSelectedRec(null)}
            onDelete={() => handleDeleteRecord(selectedRec.id)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-8 max-w-[1400px] mx-auto pb-20 px-4">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-1">
            {activeFolder && (
              <button
                onClick={() => setActiveFolder(null)}
                className="flex items-center gap-1 text-[11px] font-black text-[#b0b0b0] hover:text-[#05050a] mb-1 transition"
              >
                <ArrowLeft className="h-3 w-3" /> ALL FOLDERS
              </button>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-1">
              <FileText className="w-3 h-3" /> Medical Vault
            </div>
            <h1 className="text-[40px] sm:text-[48px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
              {activeF ? activeF.name : 'Records'}
            </h1>
            <p className="text-[14px] font-medium text-[#8a8a8a]">
              {activeF
                ? `${records.filter(r => r.folderId === activeF.id).length} document(s) in this folder`
                : 'AI-indexed prescriptions and lab reports, organized by clinic.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleCreateFolder}
              className="flex items-center gap-2 rounded-xl border border-black/8 bg-white px-5 py-3 text-[12px] font-black text-[#05050a] hover:shadow-md active:scale-95 transition"
            >
              <FolderPlus className="h-4 w-4" /> NEW FOLDER
            </button>
            <button
              onClick={() => navigate('/tools/prescription-scanner')}
              className="flex items-center gap-2 rounded-xl bg-[#05050a] px-6 py-3 text-[12px] font-black text-[#b8ff00] shadow-xl shadow-black/10 hover:scale-[1.03] active:scale-95 transition"
            >
              <Upload className="h-4 w-4" strokeWidth={3} /> SCAN DOCUMENT
            </button>
          </div>
        </div>

        {/* ── Search + view ───────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-2 pl-5 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-[#b0b0b0] shrink-0" />
            <input
              type="text"
              placeholder="Search by doctor, medication, clinic..."
              className="bg-transparent border-none focus:outline-none text-[13px] font-medium w-full placeholder:text-[#c0c0c0]"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 pr-1">
            {([['grid', Grid], ['list', ListIcon]] as const).map(([v, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`p-2.5 rounded-xl transition ${view === v ? 'bg-[#05050a] text-white shadow-sm' : 'text-[#b0b0b0] hover:text-[#05050a]'}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Folders ─────────────────────────────────────────────── */}
        {!activeFolder && (
          <div className="space-y-4">
            <h3 className="text-[16px] font-black tracking-tight text-[#05050a]">
              Folders <span className="text-[#b0b0b0] font-medium ml-1">({folders.length})</span>
            </h3>
            {folders.length === 0 ? (
              <div className="text-center py-12 text-[#b0b0b0]">
                <FolderIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-[14px] font-medium">No folders yet. Scan a document to auto-create one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {folders.map(folder => {
                  const count = records.filter(r => r.folderId === folder.id).length;
                  return (
                    <motion.div
                      key={folder.id}
                      layout
                      className="group relative bg-white rounded-[22px] border border-black/5 p-5 cursor-pointer hover:border-[#b8ff00] hover:shadow-lg transition-all"
                      onClick={() => setActiveFolder(folder.id)}
                    >
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                        className="absolute top-3 right-3 h-6 w-6 rounded-lg bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <FolderIcon className="h-9 w-9 text-[#05050a] mb-3 group-hover:text-[#b8ff00] transition" />
                      <p className="text-[13px] font-black text-[#05050a] truncate">{folder.name}</p>
                      <p className="text-[10px] font-medium text-[#b0b0b0] mt-0.5">{count} record{count !== 1 ? 's' : ''}</p>
                    </motion.div>
                  );
                })}
                {/* Add folder button */}
                <button
                  onClick={handleCreateFolder}
                  className="bg-black/[0.02] rounded-[22px] border-2 border-dashed border-black/10 p-5 flex flex-col items-center justify-center gap-2 hover:border-[#b8ff00] hover:bg-[#b8ff00]/5 transition group"
                >
                  <Plus className="h-7 w-7 text-[#c0c0c0] group-hover:text-[#b8ff00] transition" />
                  <p className="text-[11px] font-black text-[#c0c0c0] group-hover:text-[#05050a] transition">New Folder</p>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Records ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-black tracking-tight text-[#05050a]">
              Documents <span className="text-[#b0b0b0] font-medium ml-1">({filtered.length})</span>
            </h3>
            {activeFolder && (
              <ChevronRight className="h-4 w-4 text-[#b0b0b0]" />
            )}
          </div>

          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 space-y-4"
            >
              <div className="h-20 w-20 rounded-[28px] bg-black/[0.03] flex items-center justify-center mx-auto">
                <FileText className="h-10 w-10 text-[#c0c0c0]" />
              </div>
              <div>
                <p className="text-[18px] font-black text-[#05050a]">No records yet</p>
                <p className="text-[14px] font-medium text-[#8a8a8a] mt-1">
                  {search ? 'No matches found. Try a different search.' : 'Upload your first prescription or lab report.'}
                </p>
              </div>
              {!search && (
                <button
                  onClick={() => navigate('/tools/prescription-scanner')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#05050a] text-[#b8ff00] rounded-xl text-[13px] font-black hover:scale-105 transition"
                >
                  <Upload className="h-4 w-4" /> Scan Your First Document
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              layout
              className={view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                : 'flex flex-col gap-3'}
            >
              <AnimatePresence>
                {filtered.map(record => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    view={view}
                    onView={() => setSelectedRec(record)}
                    onDelete={() => handleDeleteRecord(record.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}