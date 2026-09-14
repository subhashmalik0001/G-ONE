import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Video,
    ExternalLink,
    Play,
    Sparkles,
    Shield,
    CheckCircle2,
    Activity,
    Eye,
    FileText,
    Share2,
    Layers,
    ArrowLeft,
    Clock,
    Radio
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const GOOGLE_DRIVE_PREVIEW_URL = "https://drive.google.com/file/d/1VHuZ4l26RfKs7Up3OOaH0a2IXZzvTQJ5/preview";
const GOOGLE_DRIVE_SHARE_URL = "https://drive.google.com/file/d/1VHuZ4l26RfKs7Up3OOaH0a2IXZzvTQJ5/view?usp=sharing";
const PITCH_DECK_URL = "https://drive.google.com/file/d/1Ak9xoZT3ulbc2bC182kapJbcK3XQSNg9/view?usp=sharing";

const videoChapters = [
    {
        title: "Offline-First Healthcare Architecture",
        desc: "Wearable → BLE → On-Device Local Processing with zero cloud reliance.",
        time: "00:00",
        icon: Activity,
        tag: "Core Edge"
    },
    {
        title: "Live EMG & Cardiac Biosensing",
        desc: "Dual-channel oscilloscope, real-time waveform telemetry, and signal fallback.",
        time: "02:15",
        icon: Radio,
        tag: "Hardware"
    },
    {
        title: "Hands-Free Assistive Eye-Control AAC",
        desc: "Webcam-based MediaPipe gaze tracking with 2-blink confirmation window.",
        time: "04:30",
        icon: Eye,
        tag: "Accessibility"
    },
    {
        title: "Prescription & Lab Document Intelligence",
        desc: "Gemini 3 Flash multimodal OCR decoding clinical shorthand (1-0-1, b.d., p.c.).",
        time: "06:45",
        icon: FileText,
        tag: "Multimodal AI"
    },
    {
        title: "Dual-Phase Hybrid Report Engine",
        desc: "Instant <100ms rule-based classification + background Qwen 1.5B refinement.",
        time: "08:50",
        icon: Sparkles,
        tag: "Edge LLM"
    },
    {
        title: "Emergency SOS & Geolocation Dispatch",
        desc: "Automated trauma center lookup within 15 km radius and emergency medical card.",
        time: "10:30",
        icon: Shield,
        tag: "Emergency"
    }
];

export default function VideoPage() {
    const navigate = useNavigate();
    const [playerSource, setPlayerSource] = useState<"drive" | "local">("drive");
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    return (
        <DashboardLayout currentRole="patient">
            <div className="space-y-8 max-w-[1300px] mx-auto pb-20">
                {/* ═══ Header Section ═══ */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-2 shadow-xs">
                            <Video className="w-3.5 h-3.5" />
                            <span>G-ONE OFFICIAL DEMONSTRATION & PITCH</span>
                        </div>
                        <h1
                            className="text-[34px] sm:text-[44px] font-black tracking-tighter text-[#05050a] leading-none"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Product Demo & Walkthrough
                        </h1>
                        <p className="text-[14px] sm:text-[15px] text-[#7a7a85] mt-1.5 font-medium max-w-2xl">
                            Watch the complete end-to-end demonstration of G-ONE — covering offline edge telemetry,
                            assistive eye-control AAC, and clinical document intelligence.
                        </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all shadow-xs cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" /> Dashboard
                        </button>
                        <a
                            href={PITCH_DECK_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all shadow-xs cursor-pointer"
                        >
                            <Layers className="w-4 h-4 text-[#8a8a8a]" /> Pitch Deck
                        </a>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all shadow-xs cursor-pointer"
                        >
                            <Share2 className="w-4 h-4 text-[#8a8a8a]" />
                            {copied ? "Link Copied!" : "Share"}
                        </button>
                        <a
                            href={GOOGLE_DRIVE_SHARE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#05050a] text-[#b8ff00] text-[12px] font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md cursor-pointer"
                        >
                            <ExternalLink className="w-4 h-4" /> Open in Google Drive
                        </a>
                    </div>
                </div>

                {/* ═══ Main Grid: Video Player + Highlights ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left/Main Column: Video Screen */}
                    <div className="lg:col-span-8 space-y-5">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="rounded-[32px] border border-black/10 bg-[#05050a] p-3 sm:p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden"
                        >
                            {/* Player Top Bar */}
                            <div className="flex items-center justify-between px-3 py-2 text-white/70 text-xs mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#b8ff00] animate-pulse" />
                                    <span className="font-bold tracking-wider uppercase text-[10px] text-[#b8ff00]">
                                        {playerSource === "drive" ? "Google Drive HD Stream" : "Local Backup Player"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPlayerSource("drive")}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                                            playerSource === "drive"
                                                ? "bg-white/20 text-white"
                                                : "text-white/40 hover:text-white"
                                        }`}
                                    >
                                        Google Drive
                                    </button>
                                    <button
                                        onClick={() => setPlayerSource("local")}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                                            playerSource === "local"
                                                ? "bg-white/20 text-white"
                                                : "text-white/40 hover:text-white"
                                        }`}
                                    >
                                        Local MP4
                                    </button>
                                </div>
                            </div>

                            {/* Embedded Player Container */}
                            <div className="relative w-full aspect-video rounded-[24px] overflow-hidden bg-black/90 shadow-inner">
                                {playerSource === "drive" ? (
                                    <iframe
                                        src={GOOGLE_DRIVE_PREVIEW_URL}
                                        title="G-ONE Video Demonstration"
                                        className="w-full h-full border-0 rounded-[24px]"
                                        allow="autoplay; fullscreen"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video
                                        controls
                                        playsInline
                                        src="/pixcal.mp4"
                                        className="w-full h-full object-contain rounded-[24px]"
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>

                            {/* Player Bottom Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 px-3 pt-3 text-white">
                                <div>
                                    <h3 className="text-[15px] font-bold tracking-tight text-white">
                                        G-ONE: Complete Product & Engineering Walkthrough
                                    </h3>
                                    <p className="text-[12px] text-white/50">
                                        Recorded live demonstration of edge biosensing, eye-control AAC, and AI triage.
                                    </p>
                                </div>
                                <a
                                    href={GOOGLE_DRIVE_SHARE_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#b8ff00] hover:underline"
                                >
                                    <span>Direct Video Link</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </motion.div>

                        {/* Technology & Core Attributes Highlights */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] block mb-1">
                                    RESOLUTION
                                </span>
                                <span className="text-[16px] font-black text-[#05050a] tracking-tight">Full HD 1080p</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] block mb-1">
                                    ARCHITECTURE
                                </span>
                                <span className="text-[16px] font-black text-[#05050a] tracking-tight">Offline-First</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] block mb-1">
                                    EDGE MODEL
                                </span>
                                <span className="text-[16px] font-black text-[#05050a] tracking-tight">Qwen 1.5B Chat</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] block mb-1">
                                    ACCESSIBILITY
                                </span>
                                <span className="text-[16px] font-black text-[#05050a] tracking-tight">AAC Eye-Control</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Demo Chapters & Product Context */}
                    <div className="lg:col-span-4 space-y-5">
                        {/* Chapters Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35 }}
                            className="bg-white rounded-[32px] border border-black/5 p-6 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.04]">
                                <div>
                                    <h3
                                        className="text-[18px] font-black text-[#05050a] tracking-tight"
                                        style={{ fontFamily: "var(--font-display)" }}
                                    >
                                        Demonstration Chapters
                                    </h3>
                                    <p className="text-[11px] text-[#8a8a8a] font-medium">
                                        Key moments highlighted in the video
                                    </p>
                                </div>
                                <Clock className="w-4 h-4 text-[#8a8a8a]" />
                            </div>

                            <div className="space-y-3">
                                {videoChapters.map((chapter, idx) => {
                                    const IconComponent = chapter.icon;
                                    return (
                                        <div
                                            key={idx}
                                            className="group p-3 rounded-2xl border border-black/[0.03] bg-black/[0.01] hover:bg-black/[0.04] transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-[#05050a] text-[#b8ff00] flex items-center justify-center shrink-0">
                                                        <IconComponent className="w-3 h-3" />
                                                    </div>
                                                    <h4 className="text-[13px] font-black text-[#05050a] tracking-tight group-hover:text-black">
                                                        {chapter.title}
                                                    </h4>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#8a8a8a] bg-white px-2 py-0.5 rounded-md border border-black/5 shrink-0">
                                                    {chapter.tag}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-[#71717a] font-medium pl-8 leading-snug">
                                                {chapter.desc}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Project Identity & Authors Card */}
                        <div className="bg-gradient-to-br from-[#05050a] to-[#141424] rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#b8ff00] blur-[50px] opacity-15" />
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-lg bg-[#b8ff00]/10 border border-[#b8ff00]/20 flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-[#b8ff00]" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#b8ff00]">
                                        PROJECT & TEAM IDENTITY
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-[17px] font-black text-white tracking-tight">
                                        G-ONE Healthcare OS v1.0
                                    </h4>
                                    <p className="text-[12px] text-white/60 mt-1">
                                        Offline-First Assistive Clinical Companion
                                    </p>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-white/10 text-[12px]">
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Team Leader</span>
                                        <span className="font-bold text-white">Subhash</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Core Team</span>
                                        <span className="font-bold text-white">Khushi, Abhiraj</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Mentor</span>
                                        <span className="font-bold text-[#b8ff00]">Sandeep Kumar</span>
                                    </div>
                                </div>

                                <a
                                    href={GOOGLE_DRIVE_SHARE_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#b8ff00] text-[#05050a] text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer shadow-md"
                                >
                                    <Play className="w-3.5 h-3.5 fill-current" /> Watch On Google Drive
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
