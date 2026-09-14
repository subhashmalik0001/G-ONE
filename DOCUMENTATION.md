# G-ONE — AI-Powered Healthcare Companion & Assistive Clinical Operating System
## Complete System Architecture, Functional Specification & Engineering Guide

---

## 1. Executive Summary & Vision

### 1.1 The Problem
Modern healthcare faces four critical barriers:
1. **Accessibility Barriers for Paralyzed & Motor-Impaired Patients**: Traditional healthcare software requires touchscreens, keyboards, or precise mouse control. Patients suffering from ALS, locked-in syndrome, quadriplegia, or spinal trauma are left unable to communicate their medical needs independently.
2. **Medical Document Illegibility & Fragmentation**: Prescriptions with handwritten doctor shorthand (`1-0-1`, `b.d.`, `p.c.`) and dense lab reports are difficult for patients to decipher and organize, resulting in medication non-adherence and lost medical histories.
3. **Emergency Triage Delays**: Seconds matter during cardiac emergencies, strokes, or trauma. Locating nearest ICU facilities, notifying emergency contacts, and dispatching medical profiles often takes too long.
4. **Primary Healthcare Bottlenecks**: Triage, routine consultations, mental health check-ins, and chronic disease management overwhelm medical facilities, leading to delayed diagnoses.

### 1.2 The G-ONE Solution
**G-ONE** is an integrated, full-stack, AI-native healthcare platform designed to bridge acute clinical intelligence, personal wellness management, and barrier-free assistive accessibility. It combines:
- **Directional Eye-Control AAC (Augmentative and Alternative Communication)**: A computer vision-driven interface allowing paralyzed individuals to navigate and trigger clinical commands using only eye movements and blinks.
- **Clinical AI Vision Extraction**: Multimodal Google Gemini 3 Vision integration that transcribes handwritten doctor prescriptions and parses lab biomarkers into structured, auto-categorized digital records.
- **Autonomous Emergency System**: Geolocation-aware SOS dispatch with real-time ICU hospital routing and emergency medical ID broadcast.
- **Unified Diagnostic & Wellness Suite**: An end-to-end clinical companion featuring real-time EMG neuromuscular monitoring, virtual doctor consultations, symptom triage, mental health companionship, and personalized maternal/PCOS management.

---

## 2. High-Level Architecture Overview

```
                               ┌─────────────────────────────────────────────────────────┐
                               │                    CLIENT LAYER                         │
                               │  Vite + React 18 + TypeScript + TailwindCSS + Lucide    │
                               └───────────────────────────┬─────────────────────────────┘
                                                           │
               ┌───────────────────────────────────────────┼───────────────────────────────────────────┐
               ▼                                           ▼                                           ▼
┌───────────────────────────────┐           ┌───────────────────────────────┐           ┌───────────────────────────────┐
│     ASSISTIVE & SENSORY       │           │      CLINICAL AI ENGINES      │           │      BACKEND & CLOUD          │
│                               │           │                               │           │                               │
│ • Directional Eye Tracker     │           │ • Google Gemini 3 Flash       │           │ • Supabase Auth (JWT)         │
│   (Python + MediaPipe + WS)   │           │   (Multimodal Vision + OCR)   │           │ • PostgreSQL Relational DB    │
│ • Simulated / Live EMG Engine │           │ • SambaNova Llama-3.3-70B     │           │ • Supabase Storage (Records)  │
│ • Speech Synthesis & WebAudio │           │   (Clinical Reasoning Agent)  │           │ • Local IndexedDB & Cache     │
│ • Anatomic 3D Human Map       │           │ • Rule-Based Fallback Matrix  │           │ • Geolocation & Navigation    │
└───────────────────────────────┘           └───────────────────────────────┘           └───────────────────────────────┘
```

---

## 3. Comprehensive Feature Catalog

### 3.1 Assistive Augmentative Communication (AAC) — Directional Eye Control
* **Route**: `/tools/eye-control`
* **Core Purpose**: Allows patients with severe motor disabilities (ALS, high cervical injury, cerebral palsy) to communicate and control their environment without touching any hardware.
* **Key Mechanisms**:
  - **Zero Cursor Complexity**: Eliminates frustrating mouse-pointer emulation, continuous gaze jitter, and calibration drift.
  - **4-Direction Cardinal Navigation**:
    - **LOOK UP**: Navigates to **Emergency SOS** / Critical Help.
    - **LOOK DOWN**: Navigates to **Physical Comfort / Pain Relief**.
    - **LOOK LEFT**: Navigates to **Hydration & Food / Daily Needs**.
    - **LOOK RIGHT**: Navigates to **Family & Caregiver Calling**.
  - **Two-Blink Selection Confirmation**: Double-blink within an intentional time window (200ms – 650ms) triggers the selected command, avoiding accidental activation.
  - **Dual Operational Modes**:
    1. **Webcam MediaPipe Backend**: Native Python OpenCV + MediaPipe face mesh daemon running via local WebSocket (`ws://localhost:8765`), calculating real-time Eye Aspect Ratio (EAR) and iris gaze vectors.
    2. **Accessible Keyboard / Touch Emulation**: Complete fallback using arrow keys and spacebar for testing, caregivers, or calibrated eye switches.
  - **Multi-Category Speech Synthesis**: Automatically converts confirmed intent into crystal-clear synthesized audio output for nursing staff.

---

### 3.2 Medical Records Vault & AI Prescription Scanner
* **Routes**: `/tools/prescription-scanner`, `/health-records`
* **Core Purpose**: Converts messy paper prescriptions and lab test printouts into organized, interactive medical databases.
* **Key Mechanisms**:
  - **Multimodal Gemini 3 Flash Vision Engine**:
    - Deciphers illegible doctor handwriting, abbreviations, and medical shorthand (`1-0-1`, `b.d.`, `p.c.`, `a.c.`, `q.i.d.`, `s.o.s.`).
    - Distinguishes between **Prescriptions** (doctor name, clinic, diagnosis, medicine name, dosage, frequency, course duration) and **Lab Reports** (test name, biomarkers, observed value, unit, reference range, critical flags).
  - **Automatic Categorization & Folder Filing**: Auto-detects clinic/hospital names (e.g., "Apollo Hospitals", "Mayo Clinic") and groups records into searchable folder vaults.
  - **Interactive Search & Vault Modes**:
    - Grid and List views.
    - Real-time search by medicine name, doctor, clinic, or date.
    - Modal viewer showing parsed medication cards with dosage badges and timing instructions.
    - Local and cloud-synced storage persistence.

---

### 3.3 EMG Neuromuscular Live Monitor
* **Routes**: `/health/emg`, `/patient/emg`
* **Core Purpose**: Real-time electromyography monitoring to assess muscle fatigue, motor unit action potentials (MUAP), and neuromuscular strain.
* **Key Mechanisms**:
  - **Multi-Muscle Channel Telemetry**: Real-time signal graphing across Biceps, Forearm Flexors, Gastrocnemius, and Masseter.
  - **Fatigue Indexing & RMS Calculation**: Computes Root Mean Square (RMS) amplitude and Mean Frequency (MNF) to detect early muscle fatigue before physical exhaustion.
  - **AI Neurological Diagnostic Assistant**: Evaluates EMG telemetry patterns against clinical symptom baselines to screen for neuropathy, tremors, or spasticity.

---

### 3.4 Virtual Doctor Avatar & Interactive Consultation
* **Route**: `/virtual-doctor`
* **Core Purpose**: Multimodal AI consultation that simulates a clinical examination with speech synthesis and human avatar responses.
* **Key Mechanisms**:
  - Powered by SambaNova Meta-Llama-3.3-70B for fast conversational diagnostics.
  - Contextual history preservation of patient symptoms, current medications, and past medical history.
  - Safe clinical guardrails: Explicit triage warnings, red-flag emergency detection, and dosage disclaimer checks.

---

### 3.5 Symptom Checker & 3D Interactive Anatomy
* **Route**: `/health/symptom-checker`
* **Core Purpose**: Interactive anatomical body map allowing patients to pinpoint pain locations and receive immediate triage recommendations.
* **Key Mechanisms**:
  - Clickable anatomical body zones (Head & Neck, Chest, Abdomen, Upper Limbs, Lower Limbs, Pelvis).
  - Multi-symptom aggregation with severity sliders and onset duration.
  - Differential diagnostic probability ranking (High / Moderate / Low) with urgency triage (Home Care / Urgent Care / Emergency Room).

---

### 3.6 NeuroMate — Mental Health & Cognitive Wellness
* **Routes**: `/health/mental-health`, `/health/cognitive-health`
* **Core Purpose**: Empathetic mental health companion providing CBT-informed conversations, mood tracking, and neuro-cognitive assessments.
* **Key Mechanisms**:
  - Daily mood and stress level tracking with emotional sentiment trend graphs.
  - Interactive cognitive assessments: Reaction time tests, short-term visual memory recall, and pattern recognition.
  - Emergency crisis detection: Automatically displays 24/7 suicide prevention hotlines and calming breathing exercises if distress signals are detected.

---

### 3.7 SOS Emergency Response Hub
* **Route**: `/sos`
* **Core Purpose**: One-touch emergency trigger for critical life-threatening situations.
* **Key Mechanisms**:
  - **Instant Geolocation Broadcast**: Fetches GPS coordinates and generates live maps for paramedics.
  - **ICU & Trauma Center Locator**: Automatically routes to the nearest verified emergency rooms within a 15km radius.
  - **Emergency Medical Card**: Displays blood group, severe allergies, chronic conditions, and emergency contact phone numbers.

---

### 3.8 Comprehensive Specialized Care Tools
1. **Maternal Health Advisor** (`/tools/maternal-health-advisor`):
   - Trimester-specific developmental milestones, nutrition requirements, and warning sign monitoring (e.g., pre-eclampsia symptoms).
2. **PCOS / PCOD Hormone Tracker** (`/tools/pcos-tracker`):
   - Menstrual cycle regularity tracking, hirsutism/acne scoring, and metabolic lifestyle intervention plans.
3. **NutriGuide & Diet Advisor** (`/health/diet-advisor`):
   - AI meal planner considering diabetic, hypertensive, or renal dietary restrictions.
4. **Sleep Health & Circadian Optimizer** (`/health/sleep-analyzer`):
   - Sleep cycle architecture analysis (Deep, REM, Light) with circadian alignment recommendations.
5. **Vaccine & Immunization Tracker** (`/health/vaccine-tracker`):
   - Age-based vaccine schedules (CDC & WHO standards) with booster reminder notifications.
6. **Medical Misinformation Buster** (`/tools/misinformation-buster`):
   - Validates viral social media health claims against PubMed and peer-reviewed clinical consensus.
7. **Pharmacy & Medicine Locator** (`/pharmacy`):
   - Live availability tracking of essential medications with generic bioequivalent recommendations.
8. **Clinical Map & Clinic Locator** (`/map`):
   - Interactive map with hospital beds, ICU facilities, 24/7 pharmacies, and ambulance contacts.

---

## 4. Technical Architecture & Tech Stack

### 4.1 Frontend Engineering Stack
* **Framework**: React 18 (TypeScript)
* **Build Tooling**: Vite 5 with SWC
* **Styling**: Tailwind CSS + Custom Medical Theme Design System + Base CSS Glassmorphism
* **Motion & Interactions**: Framer Motion
* **Component Primitives**: Radix UI (Dialogs, Dropdowns, Tabs, Tooltips, Accordions)
* **Icons**: Lucide React
* **Data Visualization**: Recharts (EMG live telemetry, biomarker charts, mood trend graphs)
* **Routing**: React Router DOM v6 with future flag optimizations
* **State & Data Fetching**: TanStack React Query + React Context Providers

### 4.2 Backend & Data Layer
* **Authentication**: Supabase Auth (JWT, email/password, role-based metadata)
* **Database**: Supabase PostgreSQL
* **Document Storage**: Supabase Storage (`medical-records` bucket) + LocalStorage / IndexedDB fallback
* **Hardware Interfacing**: Native WebSockets (`ws://localhost:8765`) connecting browser UI to background Python daemons

### 4.3 AI & Machine Learning Infrastructure

| Engine | Model | Primary Use Cases |
|---|---|---|
| **Google Cloud Vertex / AI Studio** | `gemini-3-flash-preview` | Multimodal handwritten prescription parsing, lab report OCR, rapid diagnostic triage |
| **Google Cloud (Fallback)** | `gemini-flash-latest` | Redundant failover during model maintenance or capacity spikes |
| **SambaNova Systems** | `Meta-Llama-3.3-70B-Instruct` | Virtual Doctor consultations, clinical reasoning, empathetic mental health dialogues |
| **Edge Computer Vision** | MediaPipe Face Mesh + OpenCV | Real-time Eye Aspect Ratio (EAR), iris tracking, blink detection |

---

## 5. Security, Privacy & Compliance

1. **HIPAA-Ready Architecture**:
   - Client-side pre-processing of sensitive images.
   - Medical documents stored with signed time-limited upload URLs.
   - Patient health information (PHI) stripped from third-party logs.
2. **Accessible by Design (WCAG 2.1 AAA standards)**:
   - High-contrast visual modes.
   - Full keyboard accessibility alongside directional eye tracking.
   - Minimum 48px touch/click targets for motor-impaired users.
3. **Clinical Safety Disclaimers**:
   - Clear AI diagnostic disclaimers on every diagnostic view.
   - Automated routing to emergency services (911/112/local emergency) for critical symptoms.

---

## 6. Environment Configuration Reference

The platform is configured via `.env` and `.env.local`:

```ini
# Google Gemini AI (Vision OCR & Rapid Triage)
VITE_GOOGLE_AI_STUDIO_KEY=your_gemini_api_key
VITE_GEMINI_TEXT_KEY=your_gemini_api_key
VITE_GEMINI_VISION_KEY=your_gemini_api_key

# SambaNova Systems (Llama-3.3-70B Clinical Reasoning)
VITE_SAMBANOVA_API_KEY=your_sambanova_api_key

# Supabase Cloud Database & Storage
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Core Configuration
VITE_API_URL=http://localhost:3000
VITE_DEV_MODE=true
VITE_APP_NAME=G-ONE
```

---

## 7. How to Run the Complete System

### 1. Web Application
```bash
cd "GONE-WEB"
npm install
npm run dev
# Running on http://localhost:3001
```

### 2. Python Eye Tracker Service (For Directional Eye Control)
```bash
cd "GONE-WEB/scripts/eye-tracker"
source venv/bin/activate
python3 eye_tracker.py
# Running WebSocket server on ws://localhost:8765
```
