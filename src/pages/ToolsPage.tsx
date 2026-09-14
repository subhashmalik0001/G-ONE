import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Camera, 
  Pill, 
  Baby, 
  Moon, 
  Apple, 
  Brain, 
  Heart, 
  Activity, 
  Calendar, 
  Stethoscope, 
  AlertCircle, 
  Book, 
  Smile, 
  Eye,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";

const healthTools = [
  {
    id: "first-aid",
    title: "Visual First-Aid Advisor",
    description: "Upload injury photos for AI-powered first-aid guidance",
    icon: <Camera className="w-5 h-5" />,
    path: "/tools/first-aid",
    status: "Available",
    category: "Emergency"
  },
  {
    id: "report-analysis",
    title: "Lab Report Analysis",
    description: "AI-powered clinical breakdown of lab reports and documents",
    icon: <Activity className="w-5 h-5" />,
    path: "/tools/lab-analysis",
    status: "Available",
    category: "Medical"
  },
  {
    id: "prescription-scanner",
    title: "Prescription Scanner",
    description: "Scan handwritten prescriptions for medicine information and dosage",
    icon: <Pill className="w-5 h-5" />,
    path: "/tools/prescription-scanner",
    status: "Available",
    category: "Medical"
  },
  {
    id: "maternal-health",
    title: "Maternal Health Advisor",
    description: "Comprehensive pregnancy and maternal health guidance",
    icon: <Baby className="w-5 h-5" />,
    path: "/tools/maternal-health-advisor",
    status: "Available",
    category: "Wellness"
  },
  {
    id: "sleep-analyzer",
    title: "Sleep Health Analyzer",
    description: "Analyze sleep patterns and get AI-powered improvement tips",
    icon: <Moon className="w-5 h-5" />,
    path: "/health/sleep-analyzer",
    status: "Available",
    category: "Wellness"
  },
  {
    id: "diet-advisor",
    title: "NutriGuide Indian Diet",
    description: "Personalized nutrition advice tailored for Indian meals",
    icon: <Apple className="w-5 h-5" />,
    path: "/health/diet-advisor",
    status: "Available",
    category: "Nutrition"
  },
  {
    id: "vaccine-tracker",
    title: "Child Vaccine Tracker",
    description: "Track vaccination schedules and child growth milestones",
    icon: <Calendar className="w-5 h-5" />,
    path: "/health/vaccine-tracker",
    status: "Available",
    category: "Pediatric"
  },
  {
    id: "cognitive-health",
    title: "Cognitive Screener",
    description: "Assess brain function and cognitive health through interactive exercises",
    icon: <Brain className="w-5 h-5" />,
    path: "/health/cognitive-health",
    status: "Available",
    category: "Mental Health"
  },
  {
    id: "habit-coach",
    title: "Health Habit Coach",
    description: "Build and maintain healthy lifestyle routines with AI coaching",
    icon: <Smile className="w-5 h-5" />,
    path: "/tools/health-habit-coach",
    status: "Available",
    category: "Wellness"
  },
  {
    id: "pcos-tracker",
    title: "PCOS Health Tracker",
    description: "Track symptoms, cycles, and lifestyle factors for PCOS care",
    icon: <Heart className="w-5 h-5" />,
    path: "/tools/pcos-tracker",
    status: "Available",
    category: "Wellness"
  },
  {
    id: "misinformation-buster",
    title: "Medical Myth Buster",
    description: "Verify health claims and identify medical misinformation with AI",
    icon: <Book className="w-5 h-5" />,
    path: "/tools/misinformation-buster",
    status: "Available",
    category: "Education"
  },
  {
    id: "eye-control",
    title: "Eye Control — Assistive Gaze",
    description: "Control G-ONE with your eyes. Gaze-based communication for paralyzed or non-verbal users.",
    icon: <Eye className="w-5 h-5" />,
    path: "/tools/eye-control",
    status: "Available",
    category: "Accessibility"
  },
];

const categories = ["All", "Emergency", "Medical", "Wellness", "Nutrition", "Pediatric", "Mental Health", "Accessibility"];

export default function ToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  const filteredTools = selectedCategory === "All" 
    ? healthTools 
    : healthTools.filter(tool => tool.category === selectedCategory);

  return (
    <DashboardLayout currentRole="patient">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-2">
              <Sparkles className="w-3 h-3 text-[#b8ff00]" />
              <span>Diagnostic Suite</span>
            </div>
            <h1 className="text-[34px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
              Health Tools
            </h1>
            <p className="text-[14px] text-[#8a8a8a] mt-1 font-medium">
              12 specialized AI healthcare utilities and assistive diagnostic engines.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>

        {/* Category Pill Filters */}
        <div className="premium-card rounded-[24px] p-3 sm:p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all",
                  selectedCategory === category
                    ? "bg-[#05050a] text-[#b8ff00] shadow-sm scale-[1.02]"
                    : "bg-white border border-black/5 text-[#8a8a8a] hover:text-[#05050a] hover:bg-black/5"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[19px] sm:text-[20px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
              {selectedCategory === "All" ? "All Diagnostic Tools" : `${selectedCategory} Tools`}
            </h2>
            <span className="text-[11px] font-bold text-[#8a8a8a]">
              {filteredTools.length} Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => navigate(tool.path)}
                className="premium-card rounded-[28px] p-6 cursor-pointer hover:border-black/10 group flex flex-col justify-between transition-all min-h-[190px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-[#05050a] text-[#b8ff00] flex items-center justify-center transition-transform group-hover:scale-105 shadow-md">
                      {tool.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#05050a] bg-[#b8ff00] px-2.5 py-0.5 rounded-md">
                      {tool.category}
                    </span>
                  </div>

                  <h3 className="font-black text-[16px] text-[#05050a] tracking-tight mb-2 group-hover:text-[#4c6ef5] transition-colors" style={{ fontFamily: "var(--font-display)" }}>
                    {tool.title}
                  </h3>
                  <p className="text-[13px] text-[#8a8a8a] leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-black/[0.04]">
                  <span className="text-[11px] font-bold text-[#b0b0b0]">Launch Engine</span>
                  <ChevronRight className="w-4 h-4 text-[#b0b0b0] group-hover:text-[#05050a] group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}