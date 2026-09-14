/**
 * Medical Records Local Store
 * Stores AI-parsed prescriptions and lab reports in localStorage.
 * Each record belongs to a folder (auto-created from clinic/lab name).
 */

import type { AIAnalysisResult, Medicine, Biomarker } from './ai/client';

export interface MedicalFolder {
  id: string;
  name: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  folderId: string;
  type: 'prescription' | 'lab_report';
  // prescription fields
  doctorName?: string;
  clinicName?: string;
  prescriptionDate?: string;
  diagnosis?: string;
  medicines?: Medicine[];
  specialization?: string;
  // lab report fields
  labName?: string;
  testName?: string;
  reportDate?: string;
  biomarkers?: Biomarker[];
  isCritical?: boolean;
  // shared
  summary: string;
  aiConfidence: number;
  fileDataUrl?: string;   // base64 preview stored locally
  fileName?: string;
  createdAt: string;
}

const FOLDERS_KEY = 'gone-medical-folders';
const RECORDS_KEY = 'gone-medical-records';

function readFolders(): MedicalFolder[] {
  try { return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]'); } catch { return []; }
}
function writeFolders(f: MedicalFolder[]) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(f));
}
function readRecords(): MedicalRecord[] {
  try { return JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]'); } catch { return []; }
}
function writeRecords(r: MedicalRecord[]) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(r));
}

export function getFolders(): MedicalFolder[] { return readFolders(); }
export function getRecords(): MedicalRecord[] { return readRecords(); }

export function getOrCreateFolder(name: string): MedicalFolder {
  const folders = readFolders();
  const existing = folders.find(f => f.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  const newFolder: MedicalFolder = {
    id: `folder_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || 'General',
    createdAt: new Date().toISOString(),
  };
  writeFolders([...folders, newFolder]);
  return newFolder;
}

export function createFolder(name: string): MedicalFolder {
  return getOrCreateFolder(name);
}

export function deleteFolder(id: string): void {
  writeFolders(readFolders().filter(f => f.id !== id));
  // also remove records in that folder
  writeRecords(readRecords().filter(r => r.folderId !== id));
}

export function saveRecord(
  analysis: AIAnalysisResult,
  fileDataUrl?: string,
  fileName?: string,
): MedicalRecord {
  const folderName =
    analysis.type === 'prescription'
      ? analysis.details.clinicName || analysis.details.doctorName || 'General'
      : analysis.details.labName || 'Lab Reports';

  const folder = getOrCreateFolder(folderName);

  const record: MedicalRecord = {
    id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    folderId: folder.id,
    type: analysis.type,
    summary: analysis.summary,
    aiConfidence: analysis.confidence,
    fileDataUrl,
    fileName,
    createdAt: new Date().toISOString(),
    ...(analysis.type === 'prescription'
      ? {
          doctorName: analysis.details.doctorName,
          clinicName: analysis.details.clinicName,
          prescriptionDate: analysis.details.date,
          diagnosis: analysis.details.diagnosis,
          medicines: analysis.details.medicines,
          specialization: analysis.details.specialization,
        }
      : {
          labName: analysis.details.labName,
          testName: analysis.details.testName,
          reportDate: analysis.details.date,
          biomarkers: analysis.details.biomarkers,
          isCritical: analysis.details.isCritical,
          doctorName: analysis.details.doctorName,
        }),
  };

  writeRecords([record, ...readRecords()]);
  return record;
}

export function deleteRecord(id: string): void {
  writeRecords(readRecords().filter(r => r.id !== id));
}
