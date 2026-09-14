import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users, Calendar, Zap,
    Clock, ChevronRight, UserPlus, Star,
    TrendingUp, FileText, Sparkles, Stethoscope
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const weeklyPatientVolume = [
    { date: "Mon", patients: 14 },
    { date: "Tue", patients: 22 },
    { date: "Wed", patients: 18 },
    { date: "Thu", patients: 29 },
    { date: "Fri", patients: 24 },
    { date: "Sat", patients: 12 },
    { date: "Sun", patients: 8 },
];

export default function DoctorDashboardView() {
    const navigate = useNavigate();

    const [stats] = useState({
        totalPatients: 142,
        todayAppts: 6,
        avgRating: 4.9,
    });

    const [todayQueue] = useState([
        { id: "1", patientName: "Arthur Dent", bloodGroup: "O+", time: "09:30 AM", type: "in-person" },
        { id: "2", patientName: "Tricia McMillan", bloodGroup: "A+", time: "10:15 AM", type: "online" },
        { id: "3", patientName: "Ford Prefect", bloodGroup: "B-", time: "11:00 AM", type: "in-person" },
        { id: "4", patientName: "Zaphod Beeblebrox", bloodGroup: "AB+", time: "11:45 AM", type: "online" },
    ]);

    const totalWeekly = weeklyPatientVolume.reduce((sum, d) => sum + d.patients, 0);

    return (
        <div className="space-y-10 max-w-[1400px] mx-auto pb-16">
            {/* Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                <div className="lg:col-span-8 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[11px] font-black uppercase tracking-widest mb-1">
                        <Sparkles className="w-3 h-3 text-[#b8ff00]" />
                        <span>Live OPD Clinical Station</span>
                    </div>
                    <h1 className="text-[36px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-[1.1]" style={{ fontFamily: "var(--font-display)" }}>
                        Managing your <span className="text-[#b8ff00] bg-[#05050a] px-3 py-0.5 rounded-xl inline-block rotate-[-1deg]">practice</span>, enhanced by AI.
                    </h1>
                    <p className="text-[14px] sm:text-[15px] font-medium text-[#8a8a8a] max-w-md">
                        Hello, Dr. Alexander. You have {stats.todayAppts} consultations scheduled for today.
                    </p>
                </div>
                <div className="lg:col-span-4 flex flex-wrap justify-start lg:justify-end gap-3">
                    <button 
                        onClick={() => navigate("/doctor#queue")}
                        className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-4 py-3 text-[12px] sm:text-[13px] font-bold text-[#05050a] transition-all hover:shadow-md active:scale-95"
                    >
                        <Calendar className="h-4 w-4 text-[#05050a]" /> Schedule
                    </button>
                    <button 
                        onClick={() => navigate("/health-records")}
                        className="flex items-center gap-2 rounded-xl bg-[#05050a] px-5 py-3 text-[12px] sm:text-[13px] font-bold text-[#b8ff00] shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95"
                    >
                        <Users className="h-4 w-4" /> Patients
                    </button>
                </div>
            </div>

            {/* Main Stats Row */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Weekly Chart */}
                <div className="xl:col-span-8 premium-card rounded-[32px] p-6 sm:p-8 md:p-10 flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">Patient Volume (Weekly)</p>
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-[44px] sm:text-[54px] font-black tracking-tighter text-[#05050a]">
                                    {totalWeekly}
                                </h2>
                                <Badge variant="success" className="rounded-lg px-2.5 py-1 text-[12px] font-bold flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1 text-emerald-600" /> This Week
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#8a8a8a] font-medium">
                            <span>Target: 120 Patients / Week</span>
                            <div className="h-2 w-2 rounded-full bg-[#b8ff00] animate-pulse" />
                        </div>
                    </div>

                    <div className="h-[300px] sm:h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyPatientVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="doctorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#b8ff00" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#b8ff00" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#b0b0b0", fontSize: 11, fontWeight: 700 }} dy={10} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ stroke: "#05050a", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                                    content={({ active, payload }: any) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-[#05050a] text-white p-3.5 rounded-2xl shadow-2xl border border-white/10 font-sans">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#b0b0b0] mb-1">{payload[0].payload.date}</p>
                                                    <p className="text-[18px] font-black text-[#b8ff00]" style={{ fontFamily: "var(--font-mono)" }}>
                                                        {payload[0].value} patients
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="patients" 
                                    stroke="#05050a" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#doctorRev)" 
                                    animationDuration={1500} 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="xl:col-span-4 flex flex-col gap-5">
                    {/* Patient Registry Box */}
                    <div className="premium-card rounded-[32px] p-6 sm:p-8 flex flex-col justify-between flex-1 relative overflow-hidden group min-h-[190px]">
                        <Users className="absolute -right-6 -bottom-6 h-28 w-28 text-black/[0.03] transition-transform group-hover:scale-110" />
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b0b0b0]">My Patients</p>
                            <h3 className="text-[38px] sm:text-[42px] font-black tracking-tighter text-[#05050a]" style={{ fontFamily: "var(--font-mono)" }}>
                                {stats.totalPatients}
                            </h3>
                        </div>
                        <div className="pt-4">
                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 mb-1">
                                <Star className="h-4 w-4 text-[#05050a] fill-[#b8ff00]" />
                                <span>{stats.avgRating.toFixed(1)} Avg. Clinical Rating</span>
                            </div>
                            <p className="text-[11px] font-medium text-[#8a8a8a]">
                                Verified by 84 patient reviews
                            </p>
                        </div>
                    </div>

                    {/* Today's Queue Card */}
                    <div className="bg-[#05050a] rounded-[32px] p-6 sm:p-8 text-white flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 sm:p-8">
                            <Clock className="h-7 w-7 text-[#b8ff00]" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Today's Queue</p>
                            <p className="text-[15px] font-bold leading-snug">
                                You have <span className="text-[#b8ff00] text-[20px] font-black" style={{ fontFamily: "var(--font-mono)" }}>{stats.todayAppts} appointments</span> scheduled today.
                            </p>
                        </div>
                        <a 
                            href="#queue"
                            className="text-[11px] font-black uppercase tracking-widest text-[#b8ff00] flex items-center gap-2 group-hover:gap-3 transition-all mt-4"
                        >
                            View Queue <ChevronRight className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Today's Queue & Quick Actions */}
            <div id="queue" className="grid grid-cols-1 lg:grid-cols-12 gap-8 scroll-mt-28">
                {/* Next in Queue */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[19px] sm:text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                            Next in Queue (Live OPD)
                        </h3>
                        <span className="text-[11px] font-bold text-[#b8ff00] bg-[#05050a] px-3 py-1 rounded-full uppercase tracking-wider">
                            Realtime
                        </span>
                    </div>
                    <div className="premium-card rounded-[32px] overflow-hidden">
                        <div className="divide-y divide-black/[0.04]">
                            {todayQueue.map((patient) => (
                                <div key={patient.id} className="flex items-center gap-4 px-6 sm:px-8 py-5 sm:py-6 transition-colors hover:bg-black/[0.01] group">
                                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#05050a] flex items-center justify-center text-[#b8ff00] font-black text-[12px] shadow-lg shadow-black/5 group-hover:scale-105 transition-transform shrink-0">
                                        {patient.patientName[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[14px] sm:text-[15px] font-black text-[#05050a] truncate">{patient.patientName}</span>
                                        <span className="text-[12px] font-medium text-[#8a8a8a] truncate">
                                            Blood Group: {patient.bloodGroup} • {patient.type === "online" ? "Tele-Consultation" : "In-Clinic Visit"}
                                        </span>
                                    </div>
                                    <div className="ml-auto flex flex-col items-end gap-1 shrink-0">
                                        <span className="bg-[#b8ff00]/20 text-[#05050a] border border-[#b8ff00]/30 rounded-lg text-[10px] uppercase font-black px-2.5 py-0.5">
                                            {patient.type === "online" ? "Video" : "Clinic"}
                                        </span>
                                        <span className="text-[11px] font-bold text-[#b0b0b0]">
                                            {patient.time}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-[19px] sm:text-[20px] font-black tracking-tight text-[#05050a] px-2" style={{ fontFamily: "var(--font-display)" }}>
                        Clinical Actions
                    </h3>
                    <div className="space-y-3">
                        <button 
                            onClick={() => navigate("/health-records")}
                            className="w-full premium-card rounded-[24px] p-5 flex items-center gap-4 transition-all text-left group"
                        >
                            <div className="h-11 w-11 rounded-2xl bg-[#b8ff00]/15 flex items-center justify-center text-[#05050a] transition-transform group-hover:rotate-6 shrink-0">
                                <UserPlus className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[14px] font-black text-[#05050a] truncate">Add New Patient</span>
                                <span className="text-[12px] font-medium text-[#8a8a8a] truncate">Search and register into EHR</span>
                            </div>
                            <ChevronRight className="ml-auto h-4 w-4 text-[#b0b0b0] group-hover:text-[#05050a] group-hover:translate-x-1 transition-all" />
                        </button>

                        <button 
                            onClick={() => navigate("/health/symptom-checker")}
                            className="w-full premium-card rounded-[24px] p-5 flex items-center gap-4 transition-all text-left group"
                        >
                            <div className="h-11 w-11 rounded-2xl bg-black/5 flex items-center justify-center text-[#05050a] transition-transform group-hover:rotate-6 shrink-0">
                                <Stethoscope className="h-5 w-5 text-[#4c6ef5]" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[14px] font-black text-[#05050a] truncate">Clinical Triage Engine</span>
                                <span className="text-[12px] font-medium text-[#8a8a8a] truncate">AI diagnostic assistance</span>
                            </div>
                            <ChevronRight className="ml-auto h-4 w-4 text-[#b0b0b0] group-hover:text-[#05050a] group-hover:translate-x-1 transition-all" />
                        </button>

                        <button 
                            onClick={() => navigate("/tools")}
                            className="w-full premium-card rounded-[24px] p-5 flex items-center gap-4 transition-all text-left group"
                        >
                            <div className="h-11 w-11 rounded-2xl bg-black/5 flex items-center justify-center text-[#05050a] transition-transform group-hover:rotate-6 shrink-0">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[14px] font-black text-[#05050a] truncate">Diagnostic Tools Suite</span>
                                <span className="text-[12px] font-medium text-[#8a8a8a] truncate">12 specialty clinical utilities</span>
                            </div>
                            <ChevronRight className="ml-auto h-4 w-4 text-[#b0b0b0] group-hover:text-[#05050a] group-hover:translate-x-1 transition-all" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
