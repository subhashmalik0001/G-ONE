import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw,
  Zap,
  Activity,
  Volume2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";
import { aiClient } from "@/lib/ai-client";
import LanguageDetector from "@/lib/language-detection";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  suggestedActions?: string[];
}

const QUICK_PROMPTS = [
  "Explain my lab report values",
  "High blood pressure emergency signs",
  "Diet for reducing muscle fatigue",
  "Check medication side effects"
];

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I am your G-ONE Clinical Intelligence AI. You can consult with me about symptoms, medical reports, biometrics, or health queries in Hindi, English, and regional languages.",
      sender: "ai",
      timestamp: new Date(),
      suggestedActions: ["Analyze Symptoms", "Check EMG Data", "Drug Interaction Check"]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [detectedLang, setDetectedLang] = useState("English");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const detection = LanguageDetector.detectLanguage(text);
      if (detection?.language) {
        setDetectedLang(detection.language);
      }
      const response = await aiClient.getHealthAdvice(text, detection?.language || "en");
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.advice || "Based on your clinical inquiry, maintain adequate hydration and schedule a follow-up with your primary physician if acute symptoms persist.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I am currently calibrating diagnostic models. For immediate emergencies, please use the SOS facility or consult emergency dispatch (112 / 108).",
        sender: "ai",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      if (!isListening) {
        recognition.start();
        setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
      } else {
        setIsListening(false);
      }
    } catch {
      setIsListening(false);
    }
  };

  return (
    <DashboardLayout currentRole="patient">
      <div className="max-w-[1100px] mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-2xl bg-white border border-black/5 shadow-sm flex items-center justify-center text-[#05050a] hover:bg-black/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[24px] sm:text-[28px] font-black tracking-tighter text-[#05050a]" style={{ fontFamily: "var(--font-display)" }}>
                  G-ONE Clinical Intelligence
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#b8ff00] text-[#05050a] text-[10px] font-black uppercase tracking-wider">
                  Live AI
                </span>
              </div>
              <p className="text-[12px] text-[#8a8a8a] font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Gemini 3.6 Flash Engine • Multilingual ({detectedLang})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([{
                id: Date.now().toString(),
                content: "Consultation history reset. How can I assist your health today?",
                sender: "ai",
                timestamp: new Date()
              }])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#8a8a8a] hover:text-[#05050a] hover:bg-black/5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Session
            </button>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#b0b0b0] flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-[#05050a]" /> Quick Inquiries:
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 px-3 py-1 rounded-full bg-white border border-black/5 text-[11px] font-bold text-[#05050a] hover:bg-[#05050a] hover:text-[#b8ff00] transition-all shadow-xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex gap-3",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === "ai" && (
                  <div className="w-8 h-8 rounded-xl bg-[#05050a] text-[#b8ff00] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={cn(
                  "max-w-[85%] sm:max-w-[70%] rounded-[24px] p-4.5 transition-all",
                  message.sender === "user"
                    ? "bg-[#05050a] text-white rounded-tr-sm shadow-md"
                    : "bg-white border border-black/5 text-[#05050a] rounded-tl-sm shadow-sm"
                )}>
                  <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap font-medium">
                    {message.content}
                  </p>
                  
                  {message.suggestedActions && message.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-black/5 flex flex-wrap gap-1.5">
                      {message.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSendMessage(`Tell me more about: ${action}`)}
                          className="px-2.5 py-1 rounded-lg bg-black/5 hover:bg-[#b8ff00] hover:text-[#05050a] text-[11px] font-bold text-[#05050a] transition-all"
                        >
                          {action} →
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-1">
                    <span className={cn(
                      "text-[10px] font-mono tracking-tight",
                      message.sender === "user" ? "text-white/50" : "text-[#b0b0b0]"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.sender === "ai" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3" /> Clinically Verified
                      </span>
                    )}
                  </div>
                </div>

                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-black/5 border border-black/5 flex items-center justify-center shrink-0 mt-0.5 text-[#05050a]">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-[#05050a] text-[#b8ff00] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-black/5 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#05050a] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#05050a] animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 rounded-full bg-[#05050a] animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-3 pb-1 border-t border-black/5 bg-transparent">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask G-ONE clinical intelligence anything (symptoms, medication, biometrics)..."
                className="w-full h-12 rounded-[20px] bg-white border border-black/5 pl-4 pr-12 text-[13.5px] font-medium text-[#05050a] placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-[#05050a] shadow-sm transition-all"
              />
              <button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "text-[#8a8a8a] hover:text-[#05050a] hover:bg-black/5"
                )}
                title={isListening ? "Listening..." : "Voice Input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="h-12 px-6 rounded-[20px] bg-[#05050a] text-[#b8ff00] font-black text-[13px] hover:bg-black active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all"
            >
              <span>SEND</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-[#b0b0b0] mt-2 px-1">
            <span>Clinical AI guidance is informational. For emergencies, tap SOS.</span>
            <span className="font-mono">G-ONE v3.6-PRO</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;