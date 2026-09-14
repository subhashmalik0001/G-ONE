import { useState } from "react";
import {
  Phone,
  MapPin,
  AlertTriangle,
  Heart,
  Thermometer,
  Zap,
  User,
  Shield,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const emergencyContacts = [
  {
    name: "Ambulance",
    number: "108",
    icon: Heart,
    color: "bg-red-500",
  },
  {
    name: "Police",
    number: "100",
    icon: Shield,
    color: "bg-[#05050a]",
  },
  {
    name: "Fire Department",
    number: "101",
    icon: Zap,
    color: "bg-orange-500",
  },
  {
    name: "Women Helpline",
    number: "1091",
    icon: User,
    color: "bg-[#4c6ef5]",
  },
];

const emergencyScenarios = [
  {
    id: "heart-attack",
    title: "Heart Attack",
    description: "Chest pain, shortness of breath, sweating",
    steps: [
      "Call 108 immediately",
      "Help the person sit down and rest in comfortable position",
      "Loosen any tight clothing",
      "Ask if they take prescribed heart medication (e.g. nitroglycerin)",
      "Begin CPR if person is unresponsive and not breathing normally",
    ],
    icon: Heart,
    color: "text-red-500 bg-red-50",
  },
  {
    id: "choking",
    title: "Choking Emergency",
    description: "Cannot speak, difficulty breathing, clutching throat",
    steps: [
      "Encourage the person to cough forcefully",
      "Deliver 5 back blows between shoulder blades with heel of hand",
      "Give 5 quick abdominal thrusts (Heimlich maneuver)",
      "Alternate 5 back blows and 5 abdominal thrusts",
      "Call 108 if blockage does not clear promptly",
    ],
    icon: AlertTriangle,
    color: "text-amber-500 bg-amber-50",
  },
  {
    id: "severe-bleeding",
    title: "Severe Bleeding",
    description: "Heavy or pulsating bleeding from wound",
    steps: [
      "Call 108 if bleeding is severe or persistent",
      "Apply direct firm pressure with clean cloth",
      "Elevate the injured limb above heart level if possible",
      "Do not remove embedded foreign objects",
      "Keep applying continuous pressure until help arrives",
    ],
    icon: Thermometer,
    color: "text-rose-500 bg-rose-50",
  },
];

export default function SOSPage() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const scenario = emergencyScenarios.find((s) => s.id === selectedScenario);

  const handleLocationShare = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        navigator.clipboard.writeText(mapsUrl);
        alert(`Location link copied to clipboard: ${mapsUrl}`);
      },
      () => {
        alert("Unable to retrieve your current location.");
      }
    );
  };

  return (
    <DashboardLayout currentRole="patient">
      <div className="space-y-8 max-w-[1200px] mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Priority Response</span>
            </div>
            <h1 className="text-[34px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
              Emergency SOS
            </h1>
            <p className="text-[14px] text-[#8a8a8a] mt-1 font-medium">
              Instant access to Indian emergency dispatch and live triage protocols.
            </p>
          </div>

          <button
            onClick={handleLocationShare}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#05050a] text-[12px] font-bold text-[#b8ff00] hover:scale-105 transition-all shadow-lg shadow-black/10"
          >
            <MapPin className="w-4 h-4" /> Share My Live GPS
          </button>
        </div>

        {!selectedScenario ? (
          <>
            {/* Speed Dial Section */}
            <div className="space-y-3">
              <h2 className="text-[19px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                Emergency Speed Dial
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {emergencyContacts.map((contact) => {
                  const Icon = contact.icon;
                  return (
                    <a
                      key={contact.number}
                      href={`tel:${contact.number}`}
                      className="premium-card rounded-[28px] p-6 flex flex-col items-center text-center group hover:border-red-500/30 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <div className={`w-14 h-14 flex items-center justify-center rounded-2xl mb-3 ${contact.color} text-white shadow-md group-hover:rotate-6 transition-transform`}>
                        <Icon size={26} />
                      </div>
                      <span className="font-bold text-[14px] text-[#05050a] mb-1">{contact.name}</span>
                      <span className="text-[26px] font-black text-red-600 leading-none" style={{ fontFamily: "var(--font-mono)" }}>
                        {contact.number}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest font-black text-[#b0b0b0] mt-2">
                        Tap to Call
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Emergency Scenarios */}
            <div className="space-y-3">
              <h2 className="text-[19px] font-black tracking-tight text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                First-Aid Action Protocols
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {emergencyScenarios.map((sc) => {
                  const Icon = sc.icon;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => setSelectedScenario(sc.id)}
                      className="premium-card rounded-[28px] p-6 text-left hover:border-black/15 transition-all flex flex-col justify-between group min-h-[170px]"
                    >
                      <div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${sc.color}`}>
                          <Icon size={20} />
                        </div>
                        <h3 className="font-black text-[16px] text-[#05050a] tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
                          {sc.title}
                        </h3>
                        <p className="text-[12px] text-[#8a8a8a] leading-relaxed">
                          {sc.description}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-[#4c6ef5] group-hover:underline mt-4">
                        View Step-by-Step Triage →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Important Disclaimer Notice */}
            <div className="premium-card rounded-[24px] p-5 border-l-[6px] border-l-amber-500 flex items-start gap-4">
              <AlertTriangle className="text-amber-500 w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-[13px] text-[#05050a] uppercase tracking-wider mb-1">
                  Important Clinical Notice
                </h4>
                <p className="text-[12px] text-[#8a8a8a] leading-relaxed">
                  G-ONE provides automated medical guidance and first aid instructions. In critical life-threatening situations, dial 108 or contact nearest hospital emergency department immediately.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div>
            <button
              className="mb-6 flex items-center gap-2 text-[13px] font-bold text-[#05050a] hover:underline"
              onClick={() => setSelectedScenario(null)}
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Scenarios
            </button>

            {scenario && (
              <div className="premium-card rounded-[32px] p-6 sm:p-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${scenario.color}`}>
                    <scenario.icon size={28} />
                  </div>
                  <div>
                    <h2 className="text-[26px] font-black text-[#05050a] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                      {scenario.title}
                    </h2>
                    <p className="text-[14px] text-[#8a8a8a]">{scenario.description}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-[15px] font-black text-[#05050a] tracking-tight uppercase tracking-wider">
                    Emergency Action Protocol:
                  </h3>
                  <div className="space-y-2.5">
                    {scenario.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#fafaf8] border border-black/5">
                        <span className="h-6 w-6 rounded-full bg-[#05050a] text-[#b8ff00] text-[11px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-[13px] font-medium text-[#1a1a2e] leading-relaxed pt-0.5">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href="tel:108"
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl text-[14px] uppercase tracking-wider shadow-xl shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Phone size={20} /> Call Ambulance (108) Now
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}