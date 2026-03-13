import { useState, useRef, useEffect, useCallback } from "react";

// ─── SYSTEM PROMPT ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an intelligent AI assistant for the company "Timestag Private Limited".
Your job is to act as the official website chatbot and assist visitors by answering questions, explaining services, guiding them through solutions, and generating qualified business leads.

COMPANY CONTEXT:
Reasonify is a technology solutions company that helps businesses grow through digital transformation, AI technologies, and custom software solutions.
Services: Artificial Intelligence solutions, Machine learning applications, Web development, Mobile app development, Data analytics, Automation systems, Digital transformation consulting, Custom software development.

CHATBOT OBJECTIVES:
1. Welcome website visitors professionally.
2. Explain company services clearly.
3. Understand customer problems.
4. Recommend the most relevant service.
5. Collect business leads (name, email, phone, company, requirement).
6. Encourage users to book consultations.
7. Provide quick helpful responses.

PERSONALITY: Professional, Friendly, Knowledgeable, Business-oriented, Clear and concise.

CONVERSATION FLOW:
- Greet warmly, understand intent, suggest relevant services, ask qualification questions, collect lead info, give CTA.
- Keep responses to 2-4 sentences unless more detail is needed.
- Always end with: "Is there anything else I can help you with today?"
- If you don't know: "I'm not completely sure about that. Let me connect you with our team."

IMPORTANT: Always respond in the same language the user writes in. If they write in Hindi, respond in Hindi. If Spanish, respond in Spanish. Adapt naturally.`;

// ─── LANGUAGES ───────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

const QUICK_REPLIES = {
  en: ["🤖 AI Solutions", "🌐 Web Dev", "📱 Mobile Apps", "📊 Data Analytics", "📅 Book Consultation"],
  hi: ["🤖 AI समाधान", "🌐 वेब डेव", "📱 मोबाइल ऐप", "📊 डेटा एनालिटिक्स", "📅 परामर्श बुक करें"],
  es: ["🤖 Soluciones IA", "🌐 Web Dev", "📱 Apps Móviles", "📊 Analítica", "📅 Consulta"],
  fr: ["🤖 Solutions IA", "🌐 Web Dev", "📱 Apps Mobile", "📊 Analytique", "📅 Consultation"],
  ar: ["🤖 حلول الذكاء", "🌐 تطوير الويب", "📱 تطبيقات", "📊 تحليلات", "📅 استشارة"],
  zh: ["🤖 AI解决方案", "🌐 网页开发", "📱 移动应用", "📊 数据分析", "📅 预约咨询"],
  de: ["🤖 KI-Lösungen", "🌐 Web Dev", "📱 Mobile Apps", "📊 Analytik", "📅 Beratung"],
  pt: ["🤖 Soluções IA", "🌐 Web Dev", "📱 Apps Móveis", "📊 Análise", "📅 Consulta"],
};

const GREETINGS = {
  en: "Hello! Welcome to **Reasonify** ✨\nI'm your AI assistant. How can I help you today?",
  hi: "नमस्ते! **Reasonify** में आपका स्वागत है ✨\nमैं आपका AI सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
  es: "¡Hola! Bienvenido a **Reasonify** ✨\nSoy tu asistente AI. ¿Cómo puedo ayudarte hoy?",
  fr: "Bonjour! Bienvenue chez **Reasonify** ✨\nJe suis votre assistant IA. Comment puis-je vous aider?",
  ar: "مرحباً! أهلاً بك في **Reasonify** ✨\nأنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟",
  zh: "你好！欢迎来到 **Reasonify** ✨\n我是您的AI助手。今天我能帮您什么？",
  de: "Hallo! Willkommen bei **Reasonify** ✨\nIch bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?",
  pt: "Olá! Bem-vindo à **Reasonify** ✨\nSou seu assistente de IA. Como posso ajudá-lo hoje?",
};

// ─── TIMESTAG LOGO SVG (inline recreation of the logo) ───────────────────────
const TimestagLogo = ({ size = 36 }) => (
  <img
    src="/mnt/user-data/uploads/Screenshot__188_.png"
    alt="Timestag"
    style={{ width: size, height: "auto", objectFit: "contain" }}
    onError={(e) => {
      e.target.style.display = "none";
    }}
  />
);

// ─── TYPING DOTS ─────────────────────────────────────────────────────────────
const TypingDots = () => (
  <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "10px 14px" }}>
    {[0, 1, 2].map((i) => (
      <span key={i} style={{
        width: 8, height: 8, borderRadius: "50%",
        background: "linear-gradient(135deg,#10B981,#34D399)",
        display: "inline-block",
        animation: `typingBounce 1.2s infinite ${i * 0.2}s`,
      }} />
    ))}
  </div>
);

// ─── RENDER MARKDOWN-LITE ─────────────────────────────────────────────────────
const renderMD = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");

// ─── LEAD FORM ────────────────────────────────────────────────────────────────
const LeadForm = ({ onSubmit, onClose, lang }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", requirement: "" });
  const [submitted, setSubmitted] = useState(false);
  const labels = {
    en: { title: "Let's Connect", sub: "Our team will reach out within 24hrs", name: "Full Name *", email: "Email Address *", phone: "Phone Number", company: "Company Name", req: "Project Requirement", btn: "Submit & Get Consultation" },
    hi: { title: "संपर्क करें", sub: "हमारी टीम 24 घंटे में संपर्क करेगी", name: "पूरा नाम *", email: "ईमेल *", phone: "फोन नंबर", company: "कंपनी का नाम", req: "प्रोजेक्ट की आवश्यकता", btn: "सबमिट करें" },
    es: { title: "Conectemos", sub: "Nuestro equipo responderá en 24hrs", name: "Nombre Completo *", email: "Email *", phone: "Teléfono", company: "Empresa", req: "Requisito del Proyecto", btn: "Enviar" },
    fr: { title: "Contactons-nous", sub: "Notre équipe répondra dans 24h", name: "Nom Complet *", email: "Email *", phone: "Téléphone", company: "Entreprise", req: "Besoin du Projet", btn: "Envoyer" },
  };
  const L = labels[lang] || labels.en;

  if (submitted) return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
      <div style={{ color: "#10B981", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Thank you!</div>
      <div style={{ color: "#94A3B8", fontSize: 13 }}>Our team will contact you within 24 hours.</div>
      <button onClick={onClose} style={{ marginTop: 16, background: "#10B981", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontWeight: 600 }}>Close</button>
    </div>
  );

  return (
    <div style={{ padding: "16px 18px", overflowY: "auto", maxHeight: 420 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: "#ECFDF5", fontWeight: 700, fontSize: 15 }}>{L.title}</div>
        <div style={{ color: "#6EE7B7", fontSize: 12, marginTop: 2 }}>{L.sub}</div>
      </div>
      {[["name", L.name, "text"], ["email", L.email, "email"], ["phone", L.phone, "tel"], ["company", L.company, "text"]].map(([key, label, type]) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <input
            type={type}
            placeholder={label}
            value={form[key]}
            onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
            style={{ width: "100%", background: "#1F2937", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "9px 12px", color: "#E2E8F0", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          />
        </div>
      ))}
      <textarea
        placeholder={L.req}
        value={form.requirement}
        onChange={e => setForm(p => ({ ...p, requirement: e.target.value }))}
        rows={3}
        style={{ width: "100%", background: "#1F2937", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "9px 12px", color: "#E2E8F0", fontSize: 13, fontFamily: "inherit", outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 12 }}
      />
      <button
        onClick={() => { if (form.name && form.email) { onSubmit(form); setSubmitted(true); } }}
        style={{ width: "100%", background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", border: "none", borderRadius: 10, padding: "11px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
      >
        {L.btn} →
      </button>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function TimestagChatbotV2() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [tab, setTab] = useState("chat"); // chat | lead
  const [messages, setMessages] = useState([{ role: "assistant", content: GREETINGS["en"], ts: Date.now() }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [typing, setTyping] = useState("");
  const [notification, setNotification] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const notifTimerRef = useRef(null);

  // ── scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── focus input when opened
  useEffect(() => {
    if (open && !isMinimized) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, isMinimized]);

  // ── change language → reset greeting
  const changeLang = (code) => {
    setLang(code);
    setShowLangMenu(false);
    setMessages([{ role: "assistant", content: GREETINGS[code] || GREETINGS.en, ts: Date.now() }]);
    setShowQuickReplies(true);
  };

  // ── Voice input setup
  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showNotif("⚠️ Voice not supported in this browser"); return; }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = lang === "hi" ? "hi-IN" : lang === "ar" ? "ar-SA" : lang === "zh" ? "zh-CN" : lang + "-" + lang.toUpperCase();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
      setInput(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); showNotif("⚠️ Could not capture voice"); };
    recognition.start();
  }, [lang, listening]);

  // ── Notification helper
  const showNotif = (msg) => {
    setNotification(msg);
    clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => setNotification(null), 3000);
  };

  // ── Download transcript
  const downloadTranscript = () => {
    const lines = messages.map(m =>
      `[${new Date(m.ts).toLocaleTimeString()}] ${m.role === "user" ? "You" : "Reasonify AI"}: ${m.content.replace(/<[^>]+>/g, "")}`
    ).join("\n\n");
    const blob = new Blob([`Reasonify Chat Transcript\n${"─".repeat(40)}\n\n${lines}`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `reasonify-chat-${Date.now()}.txt`;
    a.click();
  };

  // ── Send message
  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setShowQuickReplies(false);

    const newMsg = { role: "user", content: userText, ts: Date.now() };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      const reply = data?.content?.[0]?.text || "I'm having trouble right now. Please try again shortly.";
      setMessages(prev => [...prev, { role: "assistant", content: reply, ts: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue. Please try again shortly.", ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const currentLang = LANGUAGES.find(l => l.code === lang);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Clash+Display:wght@600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; }

        @keyframes typingBounce {
          0%,80%,100% { transform:translateY(0); opacity:.4; }
          40% { transform:translateY(-7px); opacity:1; }
        }
        @keyframes slideUpChat {
          from { opacity:0; transform:translateY(30px) scale(.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes fadeInMsg {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulseRing {
          0%   { box-shadow:0 0 0 0 rgba(16,185,129,.5); }
          70%  { box-shadow:0 0 0 14px rgba(16,185,129,0); }
          100% { box-shadow:0 0 0 0 rgba(16,185,129,0); }
        }
        @keyframes voicePulse {
          0%,100% { transform:scale(1); box-shadow:0 0 0 0 rgba(239,68,68,.4); }
          50%      { transform:scale(1.08); box-shadow:0 0 0 10px rgba(239,68,68,0); }
        }
        @keyframes notifSlide {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes shimmer {
          0%   { background-position:-200% 0; }
          100% { background-position:200% 0; }
        }

        .chat-win     { animation: slideUpChat .35s cubic-bezier(.34,1.56,.64,1) forwards; }
        .msg-in       { animation: fadeInMsg .25s ease forwards; }
        .fab          { animation: pulseRing 2.5s infinite; }
        .voice-active { animation: voicePulse 1s infinite !important; }
        .notif        { animation: notifSlide .3s ease; }

        .qr-btn {
          background: rgba(16,185,129,.08);
          border: 1px solid rgba(16,185,129,.3);
          color: #6EE7B7;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 12px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
          transition: all .2s;
          white-space: nowrap;
        }
        .qr-btn:hover { background:linear-gradient(135deg,#10B981,#059669); color:#fff; border-color:transparent; transform:translateY(-2px); }

        .tab-btn { background:none; border:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:600; padding:8px 16px; border-radius:8px; transition:all .2s; }
        .tab-active { background:rgba(16,185,129,.15); color:#10B981; }
        .tab-inactive { color:#4B5563; }
        .tab-inactive:hover { color:#9CA3AF; }

        .tool-btn {
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          color: #6B7280;
          border-radius: 8px;
          width: 30px; height: 30px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          transition: all .2s;
        }
        .tool-btn:hover { background:rgba(16,185,129,.12); color:#10B981; border-color:rgba(16,185,129,.3); }

        input::placeholder, textarea::placeholder { color:#4B5563; }
        input:focus, textarea:focus { border-color:rgba(16,185,129,.5) !important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#1F2937; border-radius:4px; }
      `}</style>

      {/* ── PAGE BACKGROUND ── */}
      <div style={{
        width: "100vw", height: "100vh",
        background: "linear-gradient(135deg,#070B14 0%,#0D1421 50%,#071018 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: "relative", overflow: "hidden",
      }}>
        {/* grid texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(16,185,129,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,.03) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
        {/* glow blobs */}
        <div style={{ position:"absolute", top:"-15%", left:"-10%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-10%", right:"-5%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,.06) 0%,transparent 70%)", pointerEvents:"none" }} />

        {/* ── HERO CONTENT ── */}
        <div style={{ textAlign:"center", position:"relative", zIndex:1, padding:"0 20px" }}>
          {/* Logo */}
          <div style={{ marginBottom: 20, display:"flex", justifyContent:"center" }}>
            <div style={{
              background:"rgba(255,255,255,.04)", border:"1px solid rgba(16,185,129,.15)",
              borderRadius:16, padding:"12px 20px", display:"inline-flex", alignItems:"center", gap:10,
            }}>
              <img src="/mnt/user-data/uploads/Screenshot__188_.png" alt="Timestag"
                style={{ height:40, width:"auto", objectFit:"contain" }}
                onError={e => e.target.style.display="none"}
              />
            </div>
          </div>

          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(24px,4.5vw,50px)", fontWeight:800, color:"#F1F5F9", lineHeight:1.1, marginBottom:12 }}>
            Next-Gen{" "}
            <span style={{ background:"linear-gradient(90deg,#10B981,#34D399,#6EE7B7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Digital World
            </span>
          </div>
          <p style={{ color:"#64748B", fontSize:15, maxWidth:420, margin:"0 auto 32px", lineHeight:1.6 }}>
            AI-powered digital transformation, custom software & intelligent automation for your business.
          </p>

          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => setOpen(true)} style={{
              background:"linear-gradient(135deg,#10B981,#059669)", color:"#fff", border:"none",
              borderRadius:12, padding:"13px 28px", fontSize:14, fontWeight:700, cursor:"pointer",
              boxShadow:"0 8px 24px rgba(16,185,129,.35)", fontFamily:"inherit", transition:"all .2s",
            }}>
              💬 Chat with AI Assistant
            </button>
            <button onClick={() => { setOpen(true); setTab("lead"); }} style={{
              background:"transparent", color:"#6EE7B7", border:"1px solid rgba(16,185,129,.35)",
              borderRadius:12, padding:"13px 28px", fontSize:14, fontWeight:600, cursor:"pointer",
              fontFamily:"inherit", transition:"all .2s",
            }}>
              📋 Get Free Consultation
            </button>
          </div>
        </div>

        {/* ── FAB ── */}
        <button
          className="fab"
          onClick={() => { setOpen(v => !v); setIsMinimized(false); }}
          style={{
            position:"fixed", bottom:24, right:24,
            width:60, height:60, borderRadius:"50%",
            background:"linear-gradient(135deg,#10B981,#059669)",
            border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:24, zIndex:1000, transition:"transform .2s",
            boxShadow:"0 8px 20px rgba(16,185,129,.45)",
          }}
        >
          {open ? "✕" : "💬"}
          {hasUnread && !open && (
            <span style={{
              position:"absolute", top:4, right:4,
              width:13, height:13, background:"#EF4444",
              borderRadius:"50%", border:"2px solid #070B14",
            }} />
          )}
        </button>

        {/* ── NOTIFICATION TOAST ── */}
        {notification && (
          <div className="notif" style={{
            position:"fixed", top:20, right:20, zIndex:9999,
            background:"#1F2937", border:"1px solid rgba(16,185,129,.2)",
            borderRadius:10, padding:"10px 16px", color:"#D1FAE5", fontSize:13,
            boxShadow:"0 8px 24px rgba(0,0,0,.4)",
          }}>
            {notification}
          </div>
        )}

        {/* ── CHAT WINDOW ── */}
        {open && (
          <div className="chat-win" style={{
            position:"fixed",
            bottom: isMinimized ? "auto" : 96,
            top: isMinimized ? "auto" : "auto",
            right:24,
            width:"min(430px,calc(100vw - 32px))",
            height: isMinimized ? "auto" : "min(650px,calc(100vh - 120px))",
            background:"#0D1421",
            borderRadius:20,
            boxShadow:"0 28px 72px rgba(0,0,0,.7),0 0 0 1px rgba(16,185,129,.12)",
            display:"flex", flexDirection:"column",
            overflow:"hidden", zIndex:999,
          }}>

            {/* ── HEADER ── */}
            <div style={{
              background:"linear-gradient(135deg,#052e16 0%,#064E3B 100%)",
              padding:"14px 16px",
              borderBottom:"1px solid rgba(16,185,129,.15)",
              flexShrink:0,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {/* Logo in header */}
                <div style={{
                  width:42, height:42, borderRadius:10, overflow:"hidden",
                  background:"rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"center",
                  border:"1px solid rgba(16,185,129,.2)", flexShrink:0,
                }}>
                  <img src="/mnt/user-data/uploads/Screenshot__188_.png" alt="Timestag"
                    style={{ width:38, height:38, objectFit:"contain" }}
                    onError={e => {
                      e.target.style.display="none";
                      e.target.parentNode.innerHTML = '<span style="color:#10B981;font-weight:800;font-size:16px;font-family:Syne,sans-serif">R</span>';
                    }}
                  />
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#ECFDF5", fontSize:14, display:"flex", alignItems:"center", gap:6 }}>
                    Reasonify AI
                    <span style={{ background:"rgba(16,185,129,.2)", color:"#34D399", fontSize:10, padding:"2px 6px", borderRadius:6, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>
                      LIVE
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#34D399", display:"inline-block" }} />
                    <span style={{ color:"#6EE7B7", fontSize:11 }}>Online · Timestag Private Limited</span>
                  </div>
                </div>

                {/* Header action buttons */}
                <div style={{ display:"flex", gap:5 }}>
                  {/* Language selector */}
                  <div style={{ position:"relative" }}>
                    <button className="tool-btn" onClick={() => setShowLangMenu(v => !v)} title="Change language">
                      {currentLang?.flag}
                    </button>
                    {showLangMenu && (
                      <div style={{
                        position:"absolute", top:"110%", right:0, zIndex:100,
                        background:"#111827", border:"1px solid rgba(16,185,129,.2)",
                        borderRadius:12, padding:6, minWidth:160,
                        boxShadow:"0 16px 40px rgba(0,0,0,.5)",
                      }}>
                        {LANGUAGES.map(l => (
                          <button key={l.code} onClick={() => changeLang(l.code)} style={{
                            display:"flex", alignItems:"center", gap:8, width:"100%",
                            background: lang===l.code ? "rgba(16,185,129,.12)" : "transparent",
                            border:"none", borderRadius:8, padding:"7px 10px",
                            color: lang===l.code ? "#10B981" : "#9CA3AF",
                            cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:500,
                            transition:"all .15s",
                          }}>
                            <span>{l.flag}</span><span>{l.label}</span>
                            {lang===l.code && <span style={{ marginLeft:"auto", color:"#10B981" }}>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="tool-btn" onClick={downloadTranscript} title="Download transcript">📥</button>
                  <button className="tool-btn" onClick={() => setIsMinimized(v => !v)} title="Minimize">
                    {isMinimized ? "⬆" : "⬇"}
                  </button>
                  <button className="tool-btn" onClick={() => setOpen(false)} title="Close">✕</button>
                </div>
              </div>

              {/* Tabs */}
              {!isMinimized && (
                <div style={{ display:"flex", gap:4, marginTop:12, background:"rgba(0,0,0,.2)", borderRadius:10, padding:4 }}>
                  <button className={`tab-btn ${tab==="chat" ? "tab-active" : "tab-inactive"}`} onClick={() => setTab("chat")} style={{ flex:1 }}>
                    💬 Chat
                  </button>
                  <button className={`tab-btn ${tab==="lead" ? "tab-active" : "tab-inactive"}`} onClick={() => setTab("lead")} style={{ flex:1 }}>
                    📋 Get Quote
                  </button>
                </div>
              )}
            </div>

            {/* ── BODY ── */}
            {!isMinimized && (
              <>
                {tab === "lead" ? (
                  <div style={{ flex:1, overflowY:"auto" }}>
                    <LeadForm lang={lang}
                      onSubmit={(data) => {
                        showNotif("✅ Lead submitted! We'll contact you soon.");
                        setTab("chat");
                        setMessages(prev => [...prev, {
                          role:"assistant",
                          content:`Thank you **${data.name}**! 🎉 Our team will reach out to you at ${data.email} within 24 hours. Is there anything else I can help you with?`,
                          ts: Date.now(),
                        }]);
                      }}
                      onClose={() => setTab("chat")}
                    />
                  </div>
                ) : (
                  <>
                    {/* ── MESSAGES ── */}
                    <div style={{ flex:1, overflowY:"auto", padding:"14px 12px", display:"flex", flexDirection:"column", gap:10 }}>
                      {messages.map((msg, i) => (
                        <div key={i} className="msg-in" style={{
                          display:"flex",
                          flexDirection: msg.role==="user" ? "row-reverse" : "row",
                          gap:8, alignItems:"flex-end",
                        }}>
                          {/* Avatar */}
                          <div style={{
                            width:30, height:30, borderRadius:"50%", flexShrink:0,
                            background: msg.role==="assistant"
                              ? "linear-gradient(135deg,#10B981,#059669)"
                              : "linear-gradient(135deg,#6366F1,#4F46E5)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:12, fontWeight:700, color:"#fff",
                            boxShadow: msg.role==="assistant"
                              ? "0 2px 8px rgba(16,185,129,.3)"
                              : "0 2px 8px rgba(99,102,241,.3)",
                            overflow:"hidden",
                          }}>
                            {msg.role==="assistant" ? (
                              <img src="/mnt/user-data/uploads/Screenshot__188_.png" alt="T"
                                style={{ width:28, height:28, objectFit:"contain" }}
                                onError={e => { e.target.style.display="none"; e.target.parentNode.innerHTML='<span style="font-size:12px;font-weight:800;color:#fff">R</span>'; }}
                              />
                            ) : "U"}
                          </div>

                          <div style={{ maxWidth:"75%" }}>
                            <div
                              style={{
                                padding:"10px 13px",
                                borderRadius: msg.role==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                background: msg.role==="user"
                                  ? "linear-gradient(135deg,#6366F1,#4F46E5)"
                                  : "linear-gradient(135deg,#131D2E,#1a2535)",
                                color: msg.role==="user" ? "#fff" : "#C7F0DE",
                                fontSize:13.5, lineHeight:1.6,
                                border: msg.role==="assistant" ? "1px solid rgba(16,185,129,.12)" : "none",
                                boxShadow: msg.role==="user"
                                  ? "0 4px 12px rgba(99,102,241,.25)"
                                  : "0 2px 8px rgba(0,0,0,.25)",
                              }}
                              dangerouslySetInnerHTML={{ __html: renderMD(msg.content) }}
                            />
                            <div style={{
                              fontSize:10, color:"#374151", marginTop:3,
                              textAlign: msg.role==="user" ? "right" : "left",
                              paddingLeft: msg.role==="assistant" ? 4 : 0,
                              paddingRight: msg.role==="user" ? 4 : 0,
                            }}>
                              {formatTime(msg.ts)}
                              {msg.role==="user" && " ✓✓"}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Typing indicator */}
                      {loading && (
                        <div className="msg-in" style={{ display:"flex", alignItems:"flex-end", gap:8 }}>
                          <div style={{
                            width:30, height:30, borderRadius:"50%", flexShrink:0,
                            background:"linear-gradient(135deg,#10B981,#059669)",
                            display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden",
                          }}>
                            <img src="/mnt/user-data/uploads/Screenshot__188_.png" alt="T"
                              style={{ width:28, height:28, objectFit:"contain" }}
                              onError={e => { e.target.style.display="none"; e.target.parentNode.innerHTML='<span style="font-size:12px;font-weight:800;color:#fff">R</span>'; }}
                            />
                          </div>
                          <div style={{
                            background:"linear-gradient(135deg,#131D2E,#1a2535)",
                            borderRadius:"16px 16px 16px 4px",
                            border:"1px solid rgba(16,185,129,.12)",
                          }}>
                            <TypingDots />
                          </div>
                        </div>
                      )}
                      <div ref={bottomRef} />
                    </div>

                    {/* ── QUICK REPLIES ── */}
                    {showQuickReplies && !loading && (
                      <div style={{
                        padding:"8px 12px", borderTop:"1px solid rgba(16,185,129,.07)",
                        display:"flex", gap:6, overflowX:"auto", flexShrink:0,
                      }}>
                        {(QUICK_REPLIES[lang] || QUICK_REPLIES.en).map(q => (
                          <button key={q} className="qr-btn" onClick={() => sendMessage(q)}>{q}</button>
                        ))}
                      </div>
                    )}

                    {/* ── INPUT BAR ── */}
                    <div style={{
                      padding:"10px 12px",
                      borderTop:"1px solid rgba(16,185,129,.1)",
                      background:"#080E1A",
                      display:"flex", gap:7, alignItems:"flex-end", flexShrink:0,
                    }}>
                      {/* Voice button */}
                      <button
                        onClick={startVoice}
                        className={listening ? "voice-active" : ""}
                        title={listening ? "Stop recording" : "Voice input"}
                        style={{
                          width:40, height:40, borderRadius:12, flexShrink:0,
                          background: listening
                            ? "linear-gradient(135deg,#EF4444,#DC2626)"
                            : "rgba(255,255,255,.05)",
                          border: listening ? "none" : "1px solid rgba(255,255,255,.08)",
                          color: listening ? "#fff" : "#6B7280",
                          cursor:"pointer", fontSize:16,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          transition:"all .2s",
                        }}
                      >
                        {listening ? "⏹" : "🎤"}
                      </button>

                      {/* Text input */}
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder={lang==="hi" ? "संदेश लिखें..." : lang==="ar" ? "اكتب رسالتك..." : "Type a message... (Enter to send)"}
                        rows={1}
                        style={{
                          flex:1, background:"#131D2E",
                          border:"1px solid rgba(16,185,129,.18)",
                          borderRadius:12, padding:"10px 13px",
                          color:"#E2E8F0", fontSize:13.5,
                          fontFamily:"inherit", outline:"none",
                          resize:"none", maxHeight:100, lineHeight:1.5,
                          direction: lang==="ar" ? "rtl" : "ltr",
                        }}
                        onInput={e => {
                          e.target.style.height = "auto";
                          e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                        }}
                      />

                      {/* Send button */}
                      <button
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        style={{
                          width:40, height:40, borderRadius:12, flexShrink:0,
                          background: input.trim() && !loading
                            ? "linear-gradient(135deg,#10B981,#059669)"
                            : "rgba(255,255,255,.05)",
                          border:"none",
                          color: input.trim() && !loading ? "#fff" : "#374151",
                          cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                          fontSize:15,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          transition:"all .2s",
                          boxShadow: input.trim() && !loading ? "0 4px 12px rgba(16,185,129,.3)" : "none",
                        }}
                      >
                        ➤
                      </button>
                    </div>
                  </>
                )}

                {/* ── FOOTER ── */}
                <div style={{
                  textAlign:"center", padding:"5px 0 7px",
                  color:"#1F2937", fontSize:10.5, background:"#080E1A",
                  borderTop:"1px solid rgba(16,185,129,.05)",
                  flexShrink:0,
                }}>
                  <span style={{ color:"#374151" }}>Powered by </span>
                  <strong style={{ color:"#065F46" }}>Timestag</strong>
                  <span style={{ color:"#374151" }}> · Reasonify AI · </span>
                  <span style={{ color:"#1F2937" }}>v2.0</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}