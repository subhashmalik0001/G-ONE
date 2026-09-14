import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Baby, 
  Heart, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  Calendar,
  Send,
  PhoneCall,
  CheckCircle2
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { aiClient } from "@/lib/ai-client";

const MaternalHealthAdvisorPage = () => {
  const navigate = useNavigate();
  const [gestationalWeek, setGestationalWeek] = useState(24);
  const [inquiry, setInquiry] = useState("");
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const getTrimester = (week: number) => {
    if (week <= 13) return "1st Trimester";
    if (week <= 26) return "2nd Trimester";
    return "3rd Trimester";
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry.trim()) return;

    setIsAsking(true);
    try {
      const prompt = `Patient is at gestational week ${gestationalWeek} (${getTrimester(gestationalWeek)}). Question: ${inquiry}. Provide concise, medically sound prenatal advice. Include emergency red flags if applicable.`;
      const res = await aiClient.getHealthAdvice(prompt, "en");
      setAiAdvice(res.advice);
    } catch {
      setAiAdvice("During pregnancy, any sudden swelling of face/hands, severe headache, vision changes, or pelvic pain requires urgent clinical evaluation. Please contact your obstetrician.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <DashboardLayout currentRole="patient">
      <div className="space-y-6 max-w-[1100px] mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-2">
              <Baby className="w-3.5 h-3.5" />
              <span>Obstetric & Prenatal Telemetry</span>
            </div>
            <h1 className="text-[34px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
              Maternal Health Advisor
            </h1>
            <p className="text-[14px] text-[#8a8a8a] mt-1 font-medium">
              Gestational development guidance, fetal milestone monitoring, and obstetric triage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/sos")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-[12px] font-black hover:bg-red-700 transition-all shadow-sm"
            >
              <PhoneCall className="w-4 h-4" /> Labor SOS (108)
            </button>
            <button
              onClick={() => navigate("/tools")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Tools
            </button>
          </div>
        </div>

        {/* Gestational Progress Banner */}
        <div className="bg-[#05050a] text-white rounded-[28px] p-6 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#b8ff00]">
                {getTrimester(gestationalWeek)}
              </span>
              <h2 className="text-[38px] font-black tracking-tighter mt-1" style={{ fontFamily: "var(--font-display)" }}>
                Week {gestationalWeek}
                <span className="text-[18px] text-white/50 font-normal font-mono"> / 40 Weeks</span>
              </h2>
              <p className="text-[13px] text-white/70 mt-1 max-w-[450px]">
                Baby is approximately the size of an ear of corn (~30 cm, 600g). Hearing is fully developed; taste buds are forming.
              </p>
            </div>

            <div className="w-full sm:w-[260px] bg-white/5 p-4 rounded-2xl border border-white/10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#b8ff00] block mb-2">
                Adjust Gestational Week
              </label>
              <input
                type="range"
                min="1"
                max="40"
                value={gestationalWeek}
                onChange={e => setGestationalWeek(parseInt(e.target.value))}
                className="w-full accent-[#b8ff00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/50 mt-1">
                <span>Week 1</span>
                <span>Week 20</span>
                <span>Week 40</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* AI Prenatal Q&A */}
          <div className="md:col-span-7 bg-white rounded-[28px] border border-black/5 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/5">
              <div className="w-8 h-8 rounded-xl bg-[#05050a] text-[#b8ff00] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-[17px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                Clinical Prenatal Assistant
              </h3>
            </div>

            <form onSubmit={handleAsk} className="space-y-3">
              <textarea
                value={inquiry}
                onChange={e => setInquiry(e.target.value)}
                placeholder="Ask about medications, safe exercise, iron absorption, or symptoms like Braxton Hicks..."
                rows={3}
                className="w-full p-3.5 rounded-2xl border border-black/10 bg-[#fafaf8] text-[13.5px] font-medium text-[#05050a] focus:outline-none focus:ring-2 focus:ring-[#05050a]"
              />
              <button
                type="submit"
                disabled={!inquiry.trim() || isAsking}
                className="w-full h-11 rounded-xl bg-[#05050a] text-[#b8ff00] font-black text-[13px] hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAsking ? (
                  <span>CONSULTING OB-GYN MODELS...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>GET CLINICAL GUIDANCE</span>
                  </>
                )}
              </button>
            </form>

            {aiAdvice && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-[#fafaf8] border border-black/5 text-[13px] leading-relaxed text-[#05050a] font-medium mt-3"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-4 h-4" /> Obstetric AI Evaluation
                </div>
                {aiAdvice}
              </motion.div>
            )}
          </div>

          {/* Red Flag Warning Box */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-[28px] p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-[16px] font-black text-red-900" style={{ fontFamily: "var(--font-display)" }}>
                  Emergency Red Flags
                </h3>
              </div>
              <p className="text-[12.5px] text-red-800 font-medium leading-relaxed">
                Immediately report to emergency maternity triage or dial 108 if experiencing:
              </p>
              <ul className="text-[12px] text-red-800 space-y-1.5 list-disc pl-4 font-medium">
                <li>Sudden severe headache or visual disturbances (scotoma)</li>
                <li>Vaginal bleeding or fluid leakage</li>
                <li>Noticeable decrease in fetal movement kicks (&lt; 10 kicks in 2h)</li>
                <li>High fever (&gt; 38.5°C) or severe chills</li>
                <li>Sudden swelling of the face, hands, or ankles</li>
              </ul>
            </div>

            <div className="bg-white rounded-[28px] border border-black/5 p-6 shadow-sm space-y-3">
              <h3 className="text-[15px] font-black text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                Key Nutrients This Trimester
              </h3>
              <div className="space-y-2 text-[12px] text-[#05050a] font-medium">
                <div className="flex justify-between p-2 rounded-xl bg-[#fafaf8]">
                  <span>Iron + Vitamin C</span>
                  <span className="font-mono text-[#8a8a8a]">27 mg/day</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-[#fafaf8]">
                  <span>Elemental Calcium</span>
                  <span className="font-mono text-[#8a8a8a]">1,000 mg/day</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-[#fafaf8]">
                  <span>Omega-3 DHA (Brain Dev)</span>
                  <span className="font-mono text-[#8a8a8a]">300 mg/day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MaternalHealthAdvisorPage;