import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    Search,
    ExternalLink,
    Filter,
    Shield,
    Sparkles,
    Check,
    Copy,
    ArrowRight,
    ArrowLeft,
    Layers,
    FileText,
    Activity,
    Eye,
    Radio,
    Clock,
    Award,
    Database,
    Globe,
    Cpu,
    Lock,
    Bookmark,
    AlertCircle,
    Info,
    CheckCircle2,
    X,
    FolderKanban
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
    referenceItems,
    trustedOrganizations,
    evidenceCapabilities,
    allCategories,
    ReferenceItem,
    CategoryType,
    SourceQualityType
} from "@/data/references";

export default function ReferencesPage() {
    const navigate = useNavigate();

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<CategoryType>("All");
    const [selectedCapability, setSelectedCapability] = useState<string | null>(null);
    const [activeModalRef, setActiveModalRef] = useState<ReferenceItem | null>(null);
    const [citationFormat, setCitationFormat] = useState<"apa" | "ieee" | "bibtex">("apa");
    const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

    // Keyboard shortcut (⌘K or Ctrl+K) to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                document.getElementById("ref-search-input")?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Statistics computed dynamically
    const stats = useMemo(() => {
        const totalSources = referenceItems.length;
        const researchPapers = referenceItems.filter(
            (r) => r.category === "Research Papers" || r.sourceType === "Peer Reviewed"
        ).length;
        const clinicalGuidelines = referenceItems.filter(
            (r) => r.category === "Clinical Guidelines" || r.sourceType === "Clinical Guideline"
        ).length;
        const organizationsCount = trustedOrganizations.length;
        const techSources = referenceItems.filter(
            (r) => r.category === "Technical Documentation" || r.sourceType === "Official Documentation"
        ).length;

        return {
            totalSources,
            researchPapers,
            clinicalGuidelines,
            organizationsCount,
            techSources
        };
    }, []);

    // Filtered references
    const filteredReferences = useMemo(() => {
        return referenceItems.filter((item) => {
            // Category filter
            if (selectedCategory !== "All" && item.category !== selectedCategory) {
                return false;
            }

            // Capability filter (from Evidence Matrix)
            if (selectedCapability) {
                const capObj = evidenceCapabilities.find((c) => c.id === selectedCapability);
                if (capObj && !item.relatedCapabilities.includes(capObj.capability)) {
                    return false;
                }
            }

            // Search query filter
            if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase().trim();
                const matchTitle = item.title.toLowerCase().includes(q);
                const matchAuthors = item.authors.some((a) => a.toLowerCase().includes(q));
                const matchOrg = item.organization.toLowerCase().includes(q);
                const matchDesc = item.description.toLowerCase().includes(q);
                const matchRelevance = item.relevance.toLowerCase().includes(q);
                const matchTopics = item.topics.some((t) => t.toLowerCase().includes(q));
                const matchYear = item.year.toString().includes(q);
                const matchDomain = item.domain.toLowerCase().includes(q);

                return (
                    matchTitle ||
                    matchAuthors ||
                    matchOrg ||
                    matchDesc ||
                    matchRelevance ||
                    matchTopics ||
                    matchYear ||
                    matchDomain
                );
            }

            return true;
        });
    }, [searchQuery, selectedCategory, selectedCapability]);

    // Featured references
    const featuredList = useMemo(() => {
        return referenceItems.filter((r) => r.featured);
    }, []);

    // News & coverage
    const newsList = useMemo(() => {
        return referenceItems.filter(
            (r) => r.category === "News & Industry" || r.sourceType === "News" || r.sourceType === "Industry"
        );
    }, []);

    // Technical documentation
    const techDocsList = useMemo(() => {
        return referenceItems.filter(
            (r) => r.category === "Technical Documentation" || r.sourceType === "Official Documentation"
        );
    }, []);

    // Handle citation copy
    const handleCopyCitation = (text: string, format: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedFormat(format);
            setTimeout(() => setCopiedFormat(null), 2500);
        }
    };

    // Quality badge color styling helper
    const getQualityBadgeStyle = (type: SourceQualityType) => {
        switch (type) {
            case "Peer Reviewed":
                return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
            case "Clinical Guideline":
                return "bg-blue-500/10 text-blue-700 border-blue-500/20";
            case "Government":
                return "bg-purple-500/10 text-purple-700 border-purple-500/20";
            case "Academic":
                return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20";
            case "Official Documentation":
                return "bg-amber-500/10 text-amber-800 border-amber-500/20";
            case "Industry":
                return "bg-cyan-500/10 text-cyan-800 border-cyan-500/20";
            case "News":
                return "bg-rose-500/10 text-rose-700 border-rose-500/20";
            default:
                return "bg-black/5 text-black/70 border-black/10";
        }
    };

    return (
        <DashboardLayout currentRole="doctor">
            <div className="space-y-12 max-w-[1360px] mx-auto pb-24 text-[#05050a]">
                {/* ═══════════════════════════════════════════════════════════════
                    1. HERO SECTION
                ═══════════════════════════════════════════════════════════════ */}
                <div className="relative rounded-[36px] bg-gradient-to-br from-[#05050a] via-[#10101c] to-[#05050a] p-8 sm:p-12 text-white shadow-2xl overflow-hidden border border-white/10">
                    {/* Subtle Medical/Scientific Glow Elements */}
                    <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#00E5FF] blur-[110px] opacity-20 pointer-events-none" />
                    <div className="absolute -left-12 -bottom-12 w-80 h-80 rounded-full bg-[#b8ff00] blur-[120px] opacity-15 pointer-events-none" />
                    <div className="absolute right-1/4 bottom-0 w-64 h-64 rounded-full bg-[#7000FF] blur-[100px] opacity-10 pointer-events-none" />

                    <div className="relative z-10 max-w-3xl space-y-4">
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#b8ff00] text-[11px] font-black uppercase tracking-[0.2em] shadow-xs">
                            <BookOpen className="w-3.5 h-3.5 text-[#b8ff00]" />
                            <span>G-ONE • EVIDENCE HUB</span>
                        </div>

                        <h1
                            className="text-[38px] sm:text-[52px] font-black tracking-tighter text-white leading-none"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Evidence & References
                        </h1>

                        <p className="text-[17px] sm:text-[20px] font-semibold text-white/90 tracking-tight leading-snug">
                            The research, clinical guidance, technical documentation, and trusted sources behind G-ONE.
                        </p>

                        <p className="text-[14px] text-white/60 leading-relaxed max-w-2xl font-normal">
                            G-ONE combines edge AI, assistive communication, biosignal monitoring, clinical document
                            intelligence, and healthcare infrastructure. This reference hub provides transparent access to the
                            evidence and resources informing the platform.
                        </p>

                        {/* Credibility Indicator */}
                        <div className="pt-3 flex flex-wrap items-center gap-3 text-[12px] font-bold text-white/70">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#b8ff00]" />
                                Research-backed
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                                Clinically informed
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#b8ff00]" />
                                Transparently sourced
                            </span>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    2. REFERENCE STATISTICS
                ═══════════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-[26px] bg-white border border-black/5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between text-[#8a8a9a] mb-2">
                            <span className="text-[11px] font-black uppercase tracking-widest">Research Papers</span>
                            <FileText className="w-4 h-4 text-[#05050a]" />
                        </div>
                        <div className="text-[32px] font-black text-[#05050a] tracking-tight">{stats.researchPapers}</div>
                        <p className="text-[11px] text-[#8a8a9a] mt-0.5">Peer-reviewed & academic sources</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="p-5 rounded-[26px] bg-white border border-black/5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between text-[#8a8a9a] mb-2">
                            <span className="text-[11px] font-black uppercase tracking-widest">Clinical Guidelines</span>
                            <Award className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-[32px] font-black text-[#05050a] tracking-tight">{stats.clinicalGuidelines}</div>
                        <p className="text-[11px] text-[#8a8a9a] mt-0.5">Standardized clinical protocols</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-5 rounded-[26px] bg-white border border-black/5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between text-[#8a8a9a] mb-2">
                            <span className="text-[11px] font-black uppercase tracking-widest">Health Organizations</span>
                            <Globe className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-[32px] font-black text-[#05050a] tracking-tight">{stats.organizationsCount}</div>
                        <p className="text-[11px] text-[#8a8a9a] mt-0.5">WHO, NIH, IEEE, W3C, HL7 & NHA</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="p-5 rounded-[26px] bg-white border border-black/5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between text-[#8a8a9a] mb-2">
                            <span className="text-[11px] font-black uppercase tracking-widest">Technical Sources</span>
                            <Cpu className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-[32px] font-black text-[#05050a] tracking-tight">{stats.techSources}</div>
                        <p className="text-[11px] text-[#8a8a9a] mt-0.5">Official frameworks & specifications</p>
                    </motion.div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    3. GLOBAL SEARCH & CATEGORY FILTER SYSTEM
                ═══════════════════════════════════════════════════════════════ */}
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative flex items-center">
                        <Search className="absolute left-5 w-5 h-5 text-[#8a8a9a]" />
                        <input
                            id="ref-search-input"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search research, guidelines, technologies, conditions, organizations..."
                            className="w-full h-14 pl-14 pr-24 rounded-2xl bg-white border border-black/10 text-[15px] font-medium placeholder-[#8a8a9a] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#05050a] focus:border-transparent transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-14 p-1 rounded-full text-[#8a8a9a] hover:bg-black/5"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <div className="absolute right-4 hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-black/5 border border-black/5 text-[10px] font-black text-[#8a8a9a]">
                            <span>⌘</span>
                            <span>K</span>
                        </div>
                    </div>

                    {/* Horizontally Scrollable Categories */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide">
                        {allCategories.map((cat) => {
                            const isActive = selectedCategory === cat;
                            const count =
                                cat === "All"
                                    ? referenceItems.length
                                    : referenceItems.filter((r) => r.category === cat).length;

                            return (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setSelectedCapability(null);
                                    }}
                                    className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-black tracking-tight transition-all cursor-pointer ${
                                        isActive
                                            ? "bg-[#05050a] text-[#b8ff00] shadow-md shadow-black/10"
                                            : "bg-white text-[#71717a] border border-black/5 hover:bg-black/5 hover:text-[#05050a]"
                                    }`}
                                >
                                    <span>{cat}</span>
                                    <span
                                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                                            isActive ? "bg-white/20 text-[#b8ff00]" : "bg-black/5 text-[#a0a0b0]"
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    4. EVIDENCE MATRIX (G-ONE EVIDENCE MAP)
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-[32px] border border-black/5 p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-wider mb-1">
                                <Layers className="w-3 h-3" />
                                <span>CORRELATION ENGINE</span>
                            </div>
                            <h2
                                className="text-[24px] sm:text-[28px] font-black text-[#05050a] tracking-tight"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                G-ONE Evidence Map
                            </h2>
                            <p className="text-[13px] text-[#71717a]">
                                Interactive matrix connecting G-ONE capabilities directly to clinical research areas and
                                supporting references. Click any capability to inspect corresponding sources.
                            </p>
                        </div>
                        {selectedCapability && (
                            <button
                                onClick={() => setSelectedCapability(null)}
                                className="self-start text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                Clear Capability Filter
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {evidenceCapabilities.map((cap) => {
                            const isSelected = selectedCapability === cap.id;
                            return (
                                <button
                                    key={cap.id}
                                    onClick={() => {
                                        setSelectedCapability(isSelected ? null : cap.id);
                                        setSelectedCategory("All");
                                    }}
                                    className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                                        isSelected
                                            ? "bg-[#05050a] text-white border-[#05050a] shadow-lg scale-[1.02]"
                                            : "bg-black/[0.015] hover:bg-black/[0.04] text-[#05050a] border-black/5"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-1 mb-1.5">
                                        <span
                                            className={`text-[13px] font-black tracking-tight ${
                                                isSelected ? "text-[#b8ff00]" : "text-[#05050a]"
                                            }`}
                                        >
                                            {cap.capability}
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                isSelected ? "bg-white/20 text-white" : "bg-black/5 text-[#71717a]"
                                            }`}
                                        >
                                            {cap.supportedReferencesCount} refs
                                        </span>
                                    </div>
                                    <p className={`text-[11px] font-semibold mb-1 ${isSelected ? "text-white/80" : "text-[#52525b]"}`}>
                                        {cap.evidenceArea}
                                    </p>
                                    <p className={`text-[10px] leading-snug line-clamp-2 ${isSelected ? "text-white/60" : "text-[#71717a]"}`}>
                                        {cap.description}
                                    </p>
                                    <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-[9px] font-bold">
                                        <span className={isSelected ? "text-[#b8ff00]" : "text-blue-600"}>
                                            {cap.keyMetric}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    5. FEATURED EVIDENCE (HIGHEST IMPACT PAPERS)
                ═══════════════════════════════════════════════════════════════ */}
                {!searchQuery && selectedCategory === "All" && !selectedCapability && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3
                                    className="text-[22px] sm:text-[26px] font-black text-[#05050a] tracking-tight"
                                    style={{ fontFamily: "var(--font-display)" }}
                                >
                                    Featured Evidence
                                </h3>
                                <p className="text-[13px] text-[#71717a]">
                                    Pivotal clinical and engineering publications forming the foundation of G-ONE
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {featuredList.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-[28px] bg-white border border-black/5 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group relative overflow-hidden"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getQualityBadgeStyle(
                                                    item.sourceType
                                                )}`}
                                            >
                                                {item.sourceType}
                                            </span>
                                            <span className="text-[12px] font-bold text-[#8a8a9a]">{item.year}</span>
                                        </div>

                                        <h4 className="text-[16px] font-black text-[#05050a] tracking-tight group-hover:text-black leading-snug">
                                            {item.title}
                                        </h4>

                                        <p className="text-[11px] font-bold text-[#71717a] line-clamp-1">
                                            {item.authors.join(", ")} • {item.organization}
                                        </p>

                                        <p className="text-[12px] text-[#52525b] leading-relaxed line-clamp-3">
                                            {item.description}
                                        </p>

                                        {/* Relevance Callout */}
                                        <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04] text-[11px] text-[#27272a] font-medium leading-relaxed">
                                            <span className="font-black text-[#05050a] block mb-0.5">
                                                Informing G-ONE:
                                            </span>
                                            {item.relevance}
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {item.topics.map((t) => (
                                                <span
                                                    key={t}
                                                    className="px-2 py-0.5 rounded-md bg-black/5 text-[#52525b] text-[10px] font-medium"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-black/5 flex items-center justify-between">
                                        <span className="text-[11px] text-[#8a8a9a] font-medium">{item.domain}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setActiveModalRef(item)}
                                                className="px-3 py-1.5 rounded-lg bg-black/5 text-[#05050a] text-[11px] font-bold hover:bg-black/10 transition-colors cursor-pointer"
                                            >
                                                Cite
                                            </button>
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-[11px] font-black text-[#05050a] hover:underline"
                                            >
                                                <span>Read Source</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    6. ALL REFERENCES (RESEARCH & SOURCE LIBRARY)
                ═══════════════════════════════════════════════════════════════ */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3
                                className="text-[22px] sm:text-[26px] font-black text-[#05050a] tracking-tight"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                Research & Source Library
                            </h3>
                            <p className="text-[13px] text-[#71717a]">
                                Displaying {filteredReferences.length} verified references matching current criteria
                            </p>
                        </div>
                        {(searchQuery || selectedCategory !== "All" || selectedCapability) && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("All");
                                    setSelectedCapability(null);
                                }}
                                className="text-[12px] font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                                Reset All Filters
                            </button>
                        )}
                    </div>

                    {filteredReferences.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-[32px] border border-black/5 space-y-3">
                            <AlertCircle className="w-8 h-8 text-[#8a8a9a] mx-auto" />
                            <h4 className="text-[16px] font-bold text-[#05050a]">No references found</h4>
                            <p className="text-[13px] text-[#8a8a9a] max-w-sm mx-auto">
                                No sources matched "{searchQuery}" under the selected category. Try searching by author, topic, or keyword.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredReferences.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="rounded-[28px] bg-white border border-black/5 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getQualityBadgeStyle(
                                                    item.sourceType
                                                )}`}
                                            >
                                                {item.sourceType}
                                            </span>
                                            <span className="text-[11px] font-bold text-[#8a8a9a]">{item.year}</span>
                                        </div>

                                        <h4 className="text-[15px] font-black text-[#05050a] tracking-tight leading-snug">
                                            {item.title}
                                        </h4>

                                        <div className="text-[11px] text-[#71717a] font-semibold line-clamp-1">
                                            <span>{item.authors.slice(0, 2).join(", ")}</span>
                                            {item.authors.length > 2 && " et al."} • <span>{item.organization}</span>
                                        </div>

                                        <p className="text-[12px] text-[#52525b] leading-relaxed line-clamp-3">
                                            {item.description}
                                        </p>

                                        {/* Dedicated G-ONE Relevance Box */}
                                        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-[#1e3a8a] leading-relaxed">
                                            <span className="font-black text-[#1e3a8a] block mb-0.5">
                                                Why it matters to G-ONE:
                                            </span>
                                            {item.relevance}
                                        </div>

                                        {/* Topics */}
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {item.topics.map((t) => (
                                                <span
                                                    key={t}
                                                    className="px-2 py-0.5 rounded bg-black/5 text-[#71717a] text-[9px] font-medium"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between">
                                        <span className="text-[11px] text-[#8a8a9a] font-medium truncate max-w-[120px]">
                                            {item.domain}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setActiveModalRef(item)}
                                                className="px-2.5 py-1 rounded-lg bg-black/5 text-[#05050a] text-[11px] font-bold hover:bg-black/10 transition-colors cursor-pointer"
                                            >
                                                Details
                                            </button>
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-[11px] font-black text-[#05050a] hover:underline"
                                            >
                                                <span>Read</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    7. TRUSTED HEALTH & RESEARCH ORGANIZATIONS
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-[32px] border border-black/5 p-6 sm:p-8 shadow-sm space-y-5">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-wider mb-1">
                            <Shield className="w-3 h-3" />
                            <span>INSTITUTIONAL AUTHORITIES</span>
                        </div>
                        <h3
                            className="text-[24px] sm:text-[28px] font-black text-[#05050a] tracking-tight"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Trusted Health & Research Organizations
                        </h3>
                        <p className="text-[13px] text-[#71717a] max-w-2xl">
                            The guidelines, clinical evidence standards, and specifications of these established bodies
                            directly inform G-ONE's engineering and healthcare workflows.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trustedOrganizations.map((org) => (
                            <div
                                key={org.acronym}
                                className="p-5 rounded-2xl bg-black/[0.015] border border-black/5 flex flex-col justify-between hover:bg-black/[0.03] transition-colors"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[18px] font-black text-[#05050a] tracking-tight">
                                            {org.acronym}
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#52525b]">
                                            {org.sourceCount} sources cited
                                        </span>
                                    </div>
                                    <h4 className="text-[13px] font-bold text-[#05050a]">{org.name}</h4>
                                    <p className="text-[11px] text-[#71717a] leading-relaxed">{org.description}</p>
                                    <div className="flex flex-wrap gap-1 pt-1">
                                        {org.relevantTopics.map((t) => (
                                            <span
                                                key={t}
                                                className="px-1.5 py-0.5 rounded bg-white text-[9px] font-bold text-[#71717a] border border-black/5"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
                                    <span className="text-[10px] text-[#8a8a9a] uppercase font-bold tracking-wider">
                                        {org.category}
                                    </span>
                                    <a
                                        href={org.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-[11px] font-bold text-[#05050a] hover:underline"
                                    >
                                        <span>Official Site</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Disclaimer */}
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-[12px] text-amber-900">
                        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                        <p className="leading-relaxed">
                            <strong>Source Integrity Notice:</strong> The organizations listed above are referenced strictly for
                            their published guidelines, clinical research, or open specifications. Inclusion in this evidence
                            index does not imply institutional partnership, endorsement, or clinical validation of G-ONE.
                        </p>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    8. NEWS, INDUSTRY & TECHNICAL DOCUMENTATION
                ═══════════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* News & Industry Coverage */}
                    <div className="bg-white rounded-[32px] border border-black/5 p-6 sm:p-7 shadow-sm space-y-4">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#8a8a9a] block mb-1">
                                PRESS & JOURNALISM
                            </span>
                            <h3
                                className="text-[20px] font-black text-[#05050a] tracking-tight"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                Healthcare & Technology Coverage
                            </h3>
                            <p className="text-[12px] text-[#71717a]">
                                Reputable publications examining on-device health AI and accessible eye-tracking
                            </p>
                        </div>

                        <div className="space-y-3">
                            {newsList.map((news) => (
                                <div
                                    key={news.id}
                                    className="p-4 rounded-2xl bg-black/[0.015] border border-black/5 hover:bg-black/[0.03] transition-colors"
                                >
                                    <div className="flex items-center justify-between text-[10px] font-bold text-[#8a8a9a] mb-1">
                                        <span>{news.organization}</span>
                                        <span>{news.year}</span>
                                    </div>
                                    <h4 className="text-[13px] font-black text-[#05050a] leading-snug mb-1">
                                        {news.title}
                                    </h4>
                                    <p className="text-[11px] text-[#71717a] leading-relaxed mb-2">{news.description}</p>
                                    <a
                                        href={news.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] font-black text-[#05050a] hover:underline"
                                    >
                                        <span>Read Article</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Technology Documentation */}
                    <div className="bg-white rounded-[32px] border border-black/5 p-6 sm:p-7 shadow-sm space-y-4">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#8a8a9a] block mb-1">
                                ENGINEERING SPECS
                            </span>
                            <h3
                                className="text-[20px] font-black text-[#05050a] tracking-tight"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                Technology Documentation
                            </h3>
                            <p className="text-[12px] text-[#71717a]">
                                Official frameworks, runtime specifications, and persistence engines powering G-ONE
                            </p>
                        </div>

                        <div className="space-y-3">
                            {techDocsList.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="p-4 rounded-2xl bg-black/[0.015] border border-black/5 hover:bg-black/[0.03] transition-colors"
                                >
                                    <div className="flex items-center justify-between text-[10px] font-bold text-[#8a8a9a] mb-1">
                                        <span>{doc.organization}</span>
                                        <span className="bg-black/5 px-1.5 py-0.5 rounded text-[9px] text-[#52525b]">
                                            {doc.domain}
                                        </span>
                                    </div>
                                    <h4 className="text-[13px] font-black text-[#05050a] leading-snug mb-1">
                                        {doc.title}
                                    </h4>
                                    <div className="p-2 rounded-lg bg-black/[0.02] text-[10px] text-[#52525b] mb-2">
                                        <strong>Implementation in G-ONE:</strong> {doc.relevance}
                                    </div>
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] font-black text-[#05050a] hover:underline"
                                    >
                                        <span>Official Documentation</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    9. SOURCE TRANSPARENCY & CLINICAL DISCLAIMER
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-[32px] border border-black/5 p-6 sm:p-8 shadow-sm space-y-4">
                    <h3
                        className="text-[22px] font-black text-[#05050a] tracking-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        How G-ONE Uses References
                    </h3>
                    <p className="text-[13px] text-[#52525b] leading-relaxed">
                        Scientific research and clinical guidelines are incorporated into G-ONE for:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-[#52525b]">
                        <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#b8ff00] shrink-0" />
                            <span>Understanding physiological signal limits (EMG, heart rate, fatigue)</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#b8ff00] shrink-0" />
                            <span>Informing accessibility decisions for motor-impaired individuals</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#b8ff00] shrink-0" />
                            <span>Designing privacy-preserving local enclave storage</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#b8ff00] shrink-0" />
                            <span>Structuring emergency triage protocols and facility dispatch logic</span>
                        </li>
                    </ul>

                    <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 text-[11px] text-[#71717a] leading-relaxed">
                        <strong>Important Healthcare Disclaimer:</strong> References listed in this Evidence Hub do not
                        constitute direct clinical validation, diagnosis, or personalized medical advice. G-ONE is an assistive
                        and monitoring technology platform designed to empower patients, caregivers, and clinicians. Critical
                        medical determinations must always be confirmed by licensed healthcare professionals.
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    10. FOOTER CARD
                ═══════════════════════════════════════════════════════════════ */}
                <div className="rounded-[32px] bg-gradient-to-r from-[#05050a] via-[#121222] to-[#05050a] p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                    <div>
                        <h4 className="text-[18px] font-black tracking-tight text-white">
                            Built on evidence. Designed for access.
                        </h4>
                        <p className="text-[12px] text-white/60 mt-0.5">
                            G-ONE continuously evolves as healthcare research, clinical guidance, and technology advance.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#b8ff00] text-[#05050a] text-[12px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-md self-start sm:self-auto"
                    >
                        <span>Back to G-ONE</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    REFERENCE DETAIL & CITATION MODAL
                ═══════════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {activeModalRef && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-2xl bg-white rounded-[32px] border border-black/10 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
                            >
                                {/* Modal Header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span
                                                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getQualityBadgeStyle(
                                                    activeModalRef.sourceType
                                                )}`}
                                            >
                                                {activeModalRef.sourceType}
                                            </span>
                                            <span className="text-[12px] font-bold text-[#8a8a9a]">
                                                {activeModalRef.year}
                                            </span>
                                            <span className="text-[11px] font-semibold text-[#8a8a9a]">
                                                • {activeModalRef.category}
                                            </span>
                                        </div>
                                        <h3
                                            className="text-[20px] sm:text-[22px] font-black text-[#05050a] tracking-tight leading-snug"
                                            style={{ fontFamily: "var(--font-display)" }}
                                        >
                                            {activeModalRef.title}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setActiveModalRef(null)}
                                        className="p-2 rounded-full text-[#8a8a9a] hover:bg-black/5 cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Authors & Venue */}
                                <div className="p-3 rounded-2xl bg-black/[0.02] border border-black/5 text-[12px] space-y-1">
                                    <div>
                                        <span className="font-bold text-[#05050a]">Authors:</span>{" "}
                                        <span className="text-[#52525b]">{activeModalRef.authors.join(", ")}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-[#05050a]">Organization / Publisher:</span>{" "}
                                        <span className="text-[#52525b]">{activeModalRef.organization}</span>
                                    </div>
                                    {activeModalRef.journalOrVenue && (
                                        <div>
                                            <span className="font-bold text-[#05050a]">Venue:</span>{" "}
                                            <span className="text-[#52525b]">{activeModalRef.journalOrVenue}</span>
                                        </div>
                                    )}
                                    {activeModalRef.doiOrIsbn && (
                                        <div>
                                            <span className="font-bold text-[#05050a]">Identifier:</span>{" "}
                                            <span className="text-[#52525b]">{activeModalRef.doiOrIsbn}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Summary / Abstract */}
                                <div>
                                    <h4 className="text-[12px] font-black uppercase tracking-wider text-[#8a8a9a] mb-1">
                                        Summary & Abstract
                                    </h4>
                                    <p className="text-[13px] text-[#52525b] leading-relaxed">
                                        {activeModalRef.description}
                                    </p>
                                </div>

                                {/* G-ONE Relevance Callout */}
                                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/60 text-[12px] text-[#1e3a8a] space-y-1">
                                    <span className="font-black block uppercase tracking-wider text-[10px]">
                                        Relevance to G-ONE Platform:
                                    </span>
                                    <p className="leading-relaxed font-medium">{activeModalRef.relevance}</p>
                                </div>

                                {/* Citation Generator */}
                                <div className="space-y-2 pt-2 border-t border-black/5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[12px] font-black uppercase tracking-wider text-[#8a8a9a]">
                                            Citation Generator
                                        </h4>
                                        <div className="flex items-center gap-1 bg-black/5 p-1 rounded-lg">
                                            {(["apa", "ieee", "bibtex"] as const).map((fmt) => (
                                                <button
                                                    key={fmt}
                                                    onClick={() => setCitationFormat(fmt)}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                                                        citationFormat === fmt
                                                            ? "bg-white text-[#05050a] shadow-xs"
                                                            : "text-[#71717a] hover:text-[#05050a]"
                                                    }`}
                                                >
                                                    {fmt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-black/[0.02] border border-black/5 font-mono text-[11px] text-[#3f3f46] leading-relaxed break-words relative">
                                        {citationFormat === "apa" && activeModalRef.citation.apa}
                                        {citationFormat === "ieee" && activeModalRef.citation.ieee}
                                        {citationFormat === "bibtex" && (
                                            <pre className="whitespace-pre-wrap font-mono text-[10px]">
                                                {activeModalRef.citation.bibtex}
                                            </pre>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <button
                                            onClick={() =>
                                                handleCopyCitation(
                                                    activeModalRef.citation[citationFormat],
                                                    citationFormat
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 text-[#05050a] text-[11px] font-black hover:bg-black/10 transition-colors cursor-pointer"
                                        >
                                            {copiedFormat === citationFormat ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>Copy {citationFormat.toUpperCase()} Citation</span>
                                                </>
                                            )}
                                        </button>

                                        <a
                                            href={activeModalRef.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#05050a] text-[#b8ff00] text-[12px] font-black hover:scale-105 active:scale-95 transition-transform"
                                        >
                                            <span>Open Original Source</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>

                                {/* Source Integrity Note */}
                                <div className="text-[10px] text-[#a1a1aa] leading-snug pt-2 border-t border-black/5">
                                    <em>
                                        Source Integrity Note: G-ONE uses this publication as reference and background
                                        material. Inclusion does not imply endorsement or clinical validation of G-ONE.
                                    </em>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
