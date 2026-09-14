import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Activity, Heart, Plus, Calendar,
    ChevronRight, Pill, CheckCircle2, TrendingUp,
    Stethoscope, ShieldAlert, FileText, Sparkles
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const sampleVitalsChart = [
    { date: "10 Sep", bpm: 72 },
    { date: "11 Sep", bpm: 75 },
    { date: "12 Sep", bpm: 68 },
    { date: "13 Sep", bpm: 74 },
    { date: "14 Sep", bpm: 71 },
    { date: "15 Sep", bpm: 78 },
    { date: "16 Sep", bpm: 72 },
];

export default function PatientDashboardView() {
    const navigate = useNavigate();

    const [latestVitals] = useState({
        heart_rate: 72,
        blood_pressure_systolic: 120,
        blood_pressure_diastolic: 80,
        spo2: 98,
        temperature_c: 36.6,
        recorded_at: new Date().toISOString(),
    });

    const [upcomingAppts] = useState([
        {
            id: "1",
            doctor_name: "Dr. Sarah Jenkins",
            specialization: "Cardiologist",
            appointment_type: "online",
            appointment_date: "18 Sep",
            time_slot: "10:30 AM"
        },
        {
            id: "2",
            doctor_name: "Dr. Robert Chen",
            specialization: "Neurologist",
            appointment_type: "offline",
            appointment_date: "22 Sep",
            time_slot: "02:00 PM"
        }
    ]);

    const [activeMeds] = useState([
        { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
        { name: "Atorvastatin", dosage: "20mg", frequency: "Once at night" }
    ]);

    return (
        <div className="space-y-10 max-w-[1400px] mx-auto pb-16">
            {/* Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                <div className="lg:col-span-8 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[11px] font-black uppercase tracking-widest mb-1">
                        <Sparkles className="w-3 h-3 text-[#b8ff00]" />
                        <span>G-ONE Clinical Intelligence</span>
                    </div>
                    <h1 className="text-[36px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-[1.1]" style={{ fontFamily: "var(--font-display)" }}>
                        Your health <span className="text-[#b8ff00] bg-[#05050a] px-3 py-0.5 rounded-xl inline-block rotate-[-1deg]">simplified</span>, G-ONE Medical.
                    </h1>
                    <p className="text-[14px] sm:text-[15px] font-medium text-[#8a8a8a] max-w-md">
                        Welcome back, Sarah. Your vitals and biometric signals are being tracked in real time.
                    </p>
                </div>
                <div className="lg:col-span-4 flex flex-wrap justify-start lg:justify-end gap-3">
                    <button 
                        onClick={() => navigate("/map")}
                        className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-4 py-3 text-[12px] sm:text-[13px] font-bold text-[#05050a] transition-all hover:shadow-md active:scale-95"
                    >
                        <Calendar className="h-4 w-4 text-[#05050a]" /> Book Appointment
                    </button>
                    <button 
                        onClick={() => navigate("/health-records")}
                        className="flex items-center gap-2 rounded-xl bg-[#05050a] px-5 py-3 text-[12px] sm:text-[13px] font-bold text-[#b8ff00] shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="h-4 w-4" /> Log Vitals
                    </button>
                </div>
            </div>

            {/* Main Vitals Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Heart Rate Area Chart */}
                <div className="xl:col-span-8 premium-card rounded-[32px] p-6 sm:p-8 md:p-10 flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Heart Rate Trend</p>
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-[44px] sm:text-[54px] font-black tracking-tighter text-[#05050a]">
                                    {latestVitals.heart_rate}<span className="text-[20px] sm:text-[24px] text-[#8a8a8a] font-bold"> BPM</span>
                                </h2>
                                <Badge variant="success" className="rounded-lg px-2.5 py-1 text-[12px] font-bold flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1 text-emerald-600" /> Tracked
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#8a8a8a] font-medium">7-Day Continuous Monitor</span>
                            <div className="h-2 w-2 rounded-full bg-[#b8ff00] animate-pulse" />
                        </div>
                    </div>

                    <div className="h-[300px] sm:h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sampleVitalsChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="premiumRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#b8ff00" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#b8ff00" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#b0b0b0", fontSize: 11, fontWeight: 700 }} dy={10} />
                                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                                <Tooltip
                                    cursor={{ stroke: "#05050a", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                                    content={({ active, payload }: any) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-[#05050a] text-white p-3.5 rounded-2xl shadow-2xl border border-white/10 font-sans">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#b0b0b0] mb-1">{payload[0].payload.date}</p>
                                                    <p className="text-[18px] font-black text-[#b8ff00]" style={{ fontFamily: "var(--font-mono)" }}>
                                                        {payload[0].value} BPM
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="bpm" 
                                    stroke="#05050a" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#premiumRev)" 
                                    animationDuration={1500} 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vitals Sidebar */}
                <div className="xl:col-span-4 flex flex-col gap-5">
                    {/* EMG Card */}
                    <Link 
                        to="/health/emg"
                        className="flex items-center gap-4 p-5 sm:p-6 bg-white border border-black/5 rounded-[32px] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm hover:shadow-xl hover:shadow-black/5 group"
                    >
                        <div className="h-12 w-12 rounded-2xl bg-[#b8ff00]/15 flex items-center justify-center text-[#05050a] group-hover:bg-[#b8ff00] transition-colors">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-[14px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                                EMG Muscle Monitor
                            </p>
                            <p className="text-[11px] font-bold text-[#8a8a8a] truncate">Session Active • Biceps Brachii</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#b0b0b0] group-hover:text-[#05050a] group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>

                    {/* Blood Pressure Box */}
                    <div className="premium-card rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group border-l-[6px] border-l-red-500 min-h-[190px]">
                        <Heart className="absolute -right-6 -bottom-6 h-28 w-28 text-red-500/5 transition-transform group-hover:scale-110" />
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Blood Pressure</p>
                            <h3 className="text-[38px] sm:text-[42px] font-black tracking-tighter text-[#05050a]" style={{ fontFamily: "var(--font-mono)" }}>
                                {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic}
                            </h3>
                        </div>
                        <div className="pt-4">
                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-600 mb-1">
                                <CheckCircle2 className="h-4 w-4 text-[#b8ff00]" />
                                <span>SpO2: {latestVitals.spo2}% (Normal)</span>
                            </div>
                            <p className="text-[11px] font-medium text-[#8a8a8a]">
                                Recorded today at 09:41 AM
                            </p>
                        </div>
                    </div>

                    {/* Temperature Box */}
                    <div className="bg-[#05050a] rounded-[32px] p-6 sm:p-8 text-white flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 sm:p-8">
                            <Activity className="h-7 w-7 text-[#b8ff00]" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Temperature</p>
                            <p className="text-[15px] font-bold leading-snug">
                                Latest reading: <span className="text-[#b8ff00] text-[20px] font-black" style={{ fontFamily: "var(--font-mono)" }}>{latestVitals.temperature_c}°C</span>
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate("/health-records")}
                            className="text-[11px] font-black uppercase tracking-widest text-[#b8ff00] flex items-center gap-2 group-hover:gap-3 transition-all mt-4"
                        >
                            View Full Report <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Health Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "AI Symptom Checker", path: "/health/symptom-checker", icon: Stethoscope, tag: "24/7 AI" },
                    { label: "Visual First Aid", path: "/tools/first-aid", icon: ShieldAlert, tag: "Instant" },
                    { label: "EMG Fatigue Detection", path: "/health/emg", icon: Activity, tag: "Sensors" },
                    { label: "Find Nearby Clinics", path: "/map", icon: Calendar, tag: "Live Map" },
                ].map((f, i) => (
                    <Link
                        key={i}
                        to={f.path}
                        className="premium-card rounded-2xl p-4 flex flex-col justify-between hover:border-black/10 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <f.icon className="w-5 h-5 text-[#05050a] group-hover:text-[#4c6ef5] transition-colors" />
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#b8ff00] bg-[#05050a] px-2 py-0.5 rounded-md">
                                {f.tag}
                            </span>
                        </div>
                        <p className="text-[13px] font-bold text-[#05050a] tracking-tight">{f.label}</p>
                    </Link>
                ))}
            </div>

            {/* Bottom Section: Appointments & Medications */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Upcoming Consultations */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[19px] sm:text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                            Upcoming Consultations
                        </h3>
                        <button 
                            onClick={() => navigate("/doctor")}
                            className="text-[12px] font-bold text-[#8a8a8a] hover:text-[#05050a] transition-colors"
                        >
                            View OPD Queue
                        </button>
                    </div>
                    <div className="premium-card rounded-[32px] overflow-hidden">
                        <div className="divide-y divide-black/[0.04]">
                            {upcomingAppts.map((app) => (
                                <div key={app.id} className="flex items-center gap-4 px-6 sm:px-8 py-5 sm:py-6 transition-colors hover:bg-black/[0.01] group">
                                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-black flex items-center justify-center text-[#b8ff00] font-black text-[12px] shadow-lg shadow-black/5 group-hover:scale-105 transition-transform shrink-0">
                                        {app.doctor_name[4]?.toUpperCase() || "D"}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[14px] sm:text-[15px] font-black text-[#05050a] truncate">{app.doctor_name}</span>
                                        <span className="text-[12px] font-medium text-[#8a8a8a] truncate">
                                            {app.specialization} • {app.appointment_type === "online" ? "Video Consultation" : "In-Person Visit"}
                                        </span>
                                    </div>
                                    <div className="ml-auto flex flex-col items-end gap-1 shrink-0">
                                        <span className="bg-[#b8ff00]/20 text-[#05050a] border border-[#b8ff00]/30 rounded-lg text-[10px] uppercase font-black px-2.5 py-0.5">
                                            {app.appointment_type === "online" ? "Video" : "Clinic"}
                                        </span>
                                        <span className="text-[11px] font-bold text-[#b0b0b0]">
                                            {app.appointment_date} • {app.time_slot}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Active Prescriptions */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[19px] sm:text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                            Active Medications
                        </h3>
                        <Link to="/pharmacy" className="text-[12px] font-bold text-[#8a8a8a] hover:text-[#05050a]">
                            Pharmacy
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {activeMeds.map((med, idx) => (
                            <div key={idx} className="premium-card rounded-[24px] p-5 sm:p-6 flex items-center gap-4 transition-all text-left group">
                                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#b8ff00]/15 flex items-center justify-center text-[#05050a] transition-transform group-hover:rotate-6 shrink-0">
                                    <Pill className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[14px] font-black text-[#05050a] truncate">{med.name}</span>
                                    <span className="text-[12px] font-medium text-[#8a8a8a] truncate">{med.dosage} • {med.frequency}</span>
                                </div>
                                <div className="ml-auto h-2.5 w-2.5 rounded-full bg-[#b8ff00] animate-pulse shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
