import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Users, Settings,
    BarChart3, ChevronLeft, Zap, LogOut, Menu,
    ChevronRight, Sparkles, Command, Plus, Bell,
    Search, FolderIcon, Calendar, Heart, Pill, SearchIcon,
    Stethoscope, Activity, ShieldAlert, Check, Video
} from "lucide-react";
import { cn } from "@/lib/utils";
import AIChat from "@/components/dashboard/AIChat";

interface NavItem {
    href: string;
    label: string;
    icon: any;
    badge?: string;
}

const patientNavigation: NavItem[] = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/video", label: "Video Demo & Pitch", icon: Video, badge: "Watch" },
    { href: "/health/symptom-checker", label: "AI Symptom Checker", icon: Stethoscope, badge: "AI" },
    { href: "/health/emg", label: "EMG Muscle Monitor", icon: Activity, badge: "Live" },
    { href: "/health-records", label: "Medical Records", icon: FolderIcon },
    { href: "/tools", label: "Health Tools & Suite", icon: Heart },
    { href: "/map", label: "Find Clinics & Pharmacies", icon: SearchIcon },
    { href: "/pharmacy", label: "Pharmacy & Meds", icon: Pill },
    { href: "/sos", label: "Emergency SOS", icon: ShieldAlert },
];

const doctorNavigation: NavItem[] = [
    { href: "/doctor", label: "Doctor Dashboard", icon: LayoutDashboard },
    { href: "/video", label: "Video Demo & Pitch", icon: Video, badge: "HD" },
    { href: "/doctor#queue", label: "Live Patient Queue", icon: Users, badge: "4 Wait" },
    { href: "/health/lab-analysis", label: "Lab Document Analysis", icon: FolderIcon, badge: "AI" },
    { href: "/health/emg", label: "Clinical EMG Sessions", icon: Activity },
    { href: "/tools", label: "Diagnostic AI Tools", icon: Zap },
    { href: "/health-records", label: "Patient EHR Archive", icon: BarChart3 },
    { href: "/map", label: "Hospital Network", icon: SearchIcon },
    { href: "/tools/prescription-scanner", label: "Rx Prescription AI", icon: Pill },
];

export default function DashboardLayout({ 
    children,
    currentRole,
    onRoleChange
}: { 
    children: React.ReactNode;
    currentRole?: "patient" | "doctor";
    onRoleChange?: (role: "patient" | "doctor") => void;
}) {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    
    // Auto-detect or use prop role
    const [internalRole, setInternalRole] = useState<"patient" | "doctor">(
        currentRole || (pathname.startsWith("/doctor") ? "doctor" : "patient")
    );

    const role = currentRole || internalRole;

    const setRole = (newRole: "patient" | "doctor") => {
        setInternalRole(newRole);
        if (onRoleChange) onRoleChange(newRole);
        if (newRole === "doctor" && !pathname.startsWith("/doctor")) {
            navigate("/doctor");
        } else if (newRole === "patient" && pathname.startsWith("/doctor")) {
            navigate("/");
        }
    };

    const navigation = role === "doctor" ? doctorNavigation : patientNavigation;

    // ⌘K shortcut for search
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setShowSearch((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const notificationsList = [
        { id: "1", title: "Heart Rate Baseline Updated", desc: "Average resting BPM is 72, within ideal range.", time: "10m ago" },
        { id: "2", title: "EMG Session Logged", desc: "Biceps brachii fatigue recovery score: 94%", time: "1h ago" },
        { id: "3", title: "Clinical AI Model Ready", desc: "Gemini 3.6 Flash diagnostics online and active.", time: "Today" },
    ];

    return (
        <div className="flex min-h-screen bg-mesh-light selection:bg-[#b8ff00] selection:text-[#05050a] font-sans antialiased text-[#1a1a2e]">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md lg:hidden transition-all duration-500"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ═══ Floating Sidebar ═══ */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col p-4 transition-all duration-500 ease-in-out",
                    collapsed ? "w-[104px]" : "w-[280px]",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div
                    className="flex h-full flex-col rounded-[32px] border border-white/60 bg-white/75 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] backdrop-blur-3xl transition-all duration-500 hover:shadow-[0_8px_48px_0_rgba(0,0,0,0.06)] overflow-hidden"
                >
                    {/* Brand / Logo Area */}
                    <div className="flex h-[88px] items-center justify-center border-b border-black/[0.03] px-4 transition-all">
                        <Link to="/" className="flex items-center justify-center group">
                            <img
                                src="/logogone.png"
                                alt="G-ONE"
                                className={cn(
                                    "w-auto object-contain transition-transform group-hover:scale-105",
                                    collapsed ? "h-9" : "h-11 sm:h-12 max-w-[170px]"
                                )}
                            />
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 space-y-1.5 px-4 py-5 overflow-y-auto scrollbar-hide">
                        {!collapsed && (
                            <div className="flex items-center justify-between px-3 pb-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c0c0c0]">
                                    {role === "doctor" ? "INFRASTRUCTURE" : "INFRASTRUCTURE"}
                                </p>
                                <span className="h-1.5 w-1.5 rounded-full bg-[#b8ff00] animate-pulse" />
                            </div>
                        )}
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/" && item.href !== "/doctor" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        "group relative flex items-center gap-3.5 rounded-[18px] px-3.5 py-3.5 text-[14px] font-black tracking-tight transition-all duration-300",
                                        isActive
                                            ? "bg-[#05050a] text-white shadow-[0_10px_20px_-5px_rgba(0,0,0,0.25)]"
                                            : "text-[#8a8a8a] hover:bg-black/5 hover:text-[#05050a] hover:pl-5",
                                        collapsed && "justify-center px-2 hover:pl-2"
                                    )}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <item.icon
                                        className={cn(
                                            "h-[19px] w-[19px] shrink-0 transition-all duration-300",
                                            isActive ? "text-[#b8ff00]" : "text-[#d0d0d0] group-hover:scale-110 group-hover:text-[#05050a]"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    {!collapsed && (
                                        <span className="relative z-10 tracking-tight truncate">{item.label}</span>
                                    )}
                                    {!collapsed && item.badge && (
                                        <span className={cn(
                                            "ml-auto text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                                            isActive ? "bg-[#b8ff00] text-[#05050a]" : "bg-black/5 text-[#8a8a8a]"
                                        )}>
                                            {item.badge}
                                        </span>
                                    )}
                                    {isActive && !collapsed && !item.badge && (
                                        <div className="ml-auto flex items-center gap-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-[#b8ff00]" />
                                            <ChevronRight className="h-4 w-4 text-[#b8ff00]/40" />
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Pro AI Feature Banner */}
                    {!collapsed && (
                        <div className="px-4 pb-4">
                            <div className="rounded-[24px] bg-gradient-to-br from-[#05050a] via-[#141424] to-[#05050a] p-5 shadow-xl shadow-black/15 relative overflow-hidden group border border-white/10">
                                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-[#b8ff00] blur-[40px] opacity-15 group-hover:opacity-25 transition-opacity" />
                                <Sparkles className="absolute -right-2 -top-2 h-16 w-16 text-white/5 rotate-12 transition-transform group-hover:scale-125" />
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#b8ff00]/10 border border-[#b8ff00]/20">
                                        <Sparkles className="h-3 w-3 text-[#b8ff00]" />
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-[#b8ff00]">G-ONE PRO</p>
                                </div>
                                <p className="text-[13px] font-black text-white mb-3 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                                    Clinical Intelligence
                                </p>
                                <button 
                                    onClick={() => navigate("/health/symptom-checker")}
                                    className="w-full rounded-xl bg-[#b8ff00] py-2.5 text-[11px] font-black text-[#05050a] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#b8ff00]/10 uppercase tracking-widest"
                                >
                                    AI SUMMARY
                                </button>
                            </div>
                        </div>
                    )}

                    {/* User Profile & Role Switcher Footer */}
                    <div className={cn("p-3.5 bg-black/[0.01]", collapsed && "flex flex-col items-center justify-center")} style={{ borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                        <div className={cn(
                            "flex items-center gap-3 rounded-2xl p-2 transition-all duration-300 hover:bg-black/5 group",
                            collapsed ? "justify-center" : "px-2"
                        )}>
                            <button
                                onClick={() => setRole(role === "patient" ? "doctor" : "patient")}
                                className="h-10 w-10 shrink-0 rounded-2xl border-2 border-white bg-gradient-to-tr from-[#05050a] to-[#222] flex items-center justify-center text-[12px] font-black text-[#b8ff00] shadow-md transition-transform group-hover:rotate-6 cursor-pointer"
                                title={`Switch to ${role === "patient" ? "Doctor" : "Patient"} View`}
                            >
                                {role === "doctor" ? "DR" : "PT"}
                            </button>
                            {!collapsed && (
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="truncate text-[14px] font-black text-[#05050a] tracking-tight">
                                            {role === "doctor" ? "Dr. Alexander" : "Sarah Connor"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <button
                                            onClick={() => setRole(role === "patient" ? "doctor" : "patient")}
                                            className="text-[9px] font-black uppercase tracking-[0.15em] text-[#b0b0b0] hover:text-[#05050a] text-left transition-colors"
                                        >
                                            {role === "doctor" ? "CHIEF MEDICAL OFFICER" : "PRIMARY PATIENT"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* ═══ Main Content Area ═══ */}
            <main className={cn("flex-1 min-w-0 transition-all duration-500 ease-in-out", collapsed ? "lg:pl-[104px]" : "lg:pl-[280px]")}>
                {/* Modern Floating Header */}
                <div className="sticky top-0 z-30 px-4 sm:px-8 pt-4 sm:pt-6">
                    <header
                        className="flex h-[64px] items-center gap-4 rounded-[18px] border border-white/50 bg-white/70 px-4 sm:px-6 shadow-sm backdrop-blur-xl transition-all"
                        style={{ border: "1px solid rgba(0,0,0,0.05)" }}
                    >
                        <button
                            className="lg:hidden rounded-xl p-2 text-[#05050a] hover:bg-black/5 transition-all"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open Navigation"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {/* Search shortcut button */}
                        <div
                            className="flex items-center gap-2 text-[#8a8a8a] hover:text-[#05050a] transition-colors cursor-pointer group px-2 py-1.5 rounded-xl hover:bg-black/5"
                            onClick={() => setShowSearch(true)}
                        >
                            <Command className="h-4 w-4" />
                            <span className="text-[12px] font-bold uppercase tracking-[0.1em] hidden sm:inline">Search Care</span>
                            <span className="flex items-center gap-1 rounded-md bg-black/5 px-2 py-0.5 text-[10px] font-bold text-[#888] group-hover:bg-black/10 transition-colors">
                                <span className="text-[8px]">⌘</span>K
                            </span>
                        </div>

                        {/* Right side controls */}
                        <div className="ml-auto flex items-center gap-2 sm:gap-3">
                            {/* Role Switcher Pill */}
                            <div className="hidden md:flex items-center bg-black/5 p-1 rounded-xl text-xs font-bold">
                                <button
                                    onClick={() => setRole("patient")}
                                    className={cn(
                                        "px-3 py-1 rounded-lg transition-all text-[11px] font-black",
                                        role === "patient" ? "bg-[#05050a] text-[#b8ff00] shadow-sm" : "text-[#777] hover:text-[#05050a]"
                                    )}
                                >
                                    PATIENT
                                </button>
                                <button
                                    onClick={() => setRole("doctor")}
                                    className={cn(
                                        "px-3 py-1 rounded-lg transition-all text-[11px] font-black",
                                        role === "doctor" ? "bg-[#05050a] text-[#b8ff00] shadow-sm" : "text-[#777] hover:text-[#05050a]"
                                    )}
                                >
                                    DOCTOR
                                </button>
                            </div>

                            {/* Primary Action Button */}
                            {role === "patient" ? (
                                <button 
                                    onClick={() => navigate("/health-records")}
                                    className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#05050a] px-3 sm:px-4 py-2 text-[11px] sm:text-[12px] font-black text-[#b8ff00] shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
                                    <span>NEW RECORD</span>
                                </button>
                            ) : (
                                <button 
                                    onClick={() => navigate("/doctor#queue")}
                                    className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#05050a] px-3 sm:px-4 py-2 text-[11px] sm:text-[12px] font-black text-[#b8ff00] shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
                                    <span>LIVE OPD</span>
                                </button>
                            )}

                            {/* Notifications Toggle */}
                            <div className="relative">
                                <button
                                    className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-all hover:bg-black/5"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    aria-label="Notifications"
                                >
                                    <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-[#05050a]" />
                                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#b8ff00] border border-[#05050a]" />
                                </button>

                                {showNotifications && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-black/5 bg-white p-5 shadow-2xl animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-[14px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                                                    Notifications
                                                </h3>
                                                <button 
                                                    onClick={() => setShowNotifications(false)}
                                                    className="text-[10px] font-bold text-[#b0b0b0] hover:text-[#05050a]"
                                                >
                                                    MARK ALL READ
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {notificationsList.map(n => (
                                                    <div key={n.id} className="p-3 rounded-xl bg-[#fafaf8] border border-black/5 hover:border-black/10 transition-all">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[12px] font-bold text-[#05050a]">{n.title}</p>
                                                            <span className="text-[9px] text-[#b0b0b0]">{n.time}</span>
                                                        </div>
                                                        <p className="text-[11px] text-[#8a8a8a] mt-1">{n.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Sidebar Collapse Toggle Button */}
                            <div className="hidden sm:block">
                                <button
                                    className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white border border-black/5 shadow-sm text-[#05050a] transition-all hover:bg-black/5 active:scale-95"
                                    onClick={() => setCollapsed(!collapsed)}
                                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                                >
                                    <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
                                </button>
                            </div>
                        </div>
                    </header>
                </div>

                {/* Main View Container */}
                <div className="p-4 sm:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <div className="dashboard-grid min-h-[calc(100vh-140px)]">
                        {children}
                    </div>
                </div>

                {/* ⌘K Search Modal */}
                {showSearch && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-all" onClick={() => setShowSearch(false)} />
                        <div className="relative w-full max-w-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex h-[56px] items-center gap-3 rounded-t-2xl bg-white px-5 border border-black/5 border-b-black/10">
                                <Search className="h-4 w-4 text-[#8a8a8a]" />
                                <input
                                    autoFocus
                                    placeholder="Jump to feature, triage, records, vitals..."
                                    className="flex-1 bg-transparent text-[14px] font-medium placeholder:text-[#b0b0b0] focus:outline-none text-[#05050a]"
                                    onKeyDown={(e) => e.key === "Escape" && setShowSearch(false)}
                                />
                                <div className="text-[10px] font-bold text-[#b0b0b0] bg-black/5 px-2 py-0.5 rounded-md">ESC</div>
                            </div>
                            <div className="bg-[#fafaf8] p-3 rounded-b-2xl border border-black/5 border-t-0 space-y-1 max-h-[60vh] overflow-y-auto">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b0b0b0] px-3 py-1">Quick Navigation</p>
                                {navigation.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        onClick={() => setShowSearch(false)}
                                        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-white hover:shadow-sm transition-all group"
                                    >
                                        <item.icon className="h-4 w-4 text-[#8a8a8a] group-hover:text-[#05050a]" />
                                        <span className="text-[13px] font-bold text-[#05050a]">{item.label}</span>
                                        {item.badge && (
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black/5 text-[#666]">
                                                {item.badge}
                                            </span>
                                        )}
                                        <ChevronRight className="ml-auto h-3 w-3 text-[#d0d0d0] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom-right Clinical AI Assistant */}
            <AIChat />
        </div>
    );
}
