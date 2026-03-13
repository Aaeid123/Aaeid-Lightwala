import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are an intelligent AI assistant for the company "Timestag Private Limited".

Your job is to act as the official website chatbot and assist visitors by answering questions, explaining services, guiding them through solutions, and generating qualified business leads.

---

COMPANY CONTEXT

Reasonify is a technology solutions company that helps businesses grow through digital transformation, AI technologies, and custom software solutions.

The company specializes in:
• Artificial Intelligence solutions
• Machine learning applications
• Web development
• Mobile app development
• Data analytics
• Automation systems
• Digital transformation consulting
• Custom software development

Timestag focuses on building scalable, innovative, and intelligent solutions for businesses.

---

CHATBOT OBJECTIVES

Your main responsibilities:
1. Welcome website visitors professionally.
2. Explain company services clearly.
3. Understand customer problems.
4. Recommend the most relevant service.
5. Collect business leads.
6. Encourage users to book consultations.
7. Provide quick helpful responses.

---

CHATBOT PERSONALITY

Be:
• Professional
• Friendly
• Knowledgeable
• Business oriented
• Clear and concise

Avoid overly technical explanations unless the user asks for them.

---

CONVERSATION FLOW

Step 1 — Greeting
Start with: "Hello! Welcome to Reasonify. I'm your AI assistant. How can I help you today?"

Step 2 — Understand User Intent
Ask questions like:
• What kind of solution are you looking for?
• Are you looking for AI development, automation, or software development?
• What industry is your business in?

Step 3 — Suggest Services
Example: If user asks about AI: "Reasonify provides AI and machine learning solutions such as intelligent chatbots, predictive analytics systems, and automation tools that help businesses improve efficiency and decision-making."

Step 4 — Qualification Questions
If the user shows interest, ask:
• What type of business do you run?
• What problem are you trying to solve?
• Do you already have a website or software system?
• What is your expected timeline for the project?

Step 5 — Lead Collection
When the user is interested, politely collect:
• Name
• Email
• Phone number
• Company name
• Project requirement

Example: "Great! I can connect you with our expert team. Could you please share your name and email so we can schedule a consultation?"

Step 6 — Call to Action
Encourage actions like:
• Booking consultation
• Submitting project details
• Contacting the team

Example: "Would you like to schedule a free consultation with our development team?"

Step 7 — Handling Unknown Questions
If you don't know the answer: "I'm not completely sure about that. Let me connect you with our team for detailed assistance."

IMPORTANT RULES
• Do not give incorrect information.
• Always stay polite and helpful.
• Focus on solving business problems.
• Keep responses short and clear (2-4 sentences max unless more detail is needed).
• Encourage the user to contact the team when needed.

ENDING CONVERSATION
End with: "Is there anything else I can help you with today?"`;

const QUICK_REPLIES = [
  "AI Solutions",
  "Web Development",
  "Mobile Apps",
  "Data Analytics",
  "Book a Consultation",
];

const TypingDots = () => (
  <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "10px 14px" }}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#6EE7B7",
          display: "inline-block",
          animation: "bounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
  </div>
);

const Avatar = ({ isBot }) => (
  <div
    style={{
      width: 32,
      height: 32,
      borderRadius: "50%",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      fontWeight: 700,
      background: isBot
        ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
        : "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
      color: "#fff",
      boxShadow: isBot
        ? "0 2px 8px rgba(16,185,129,0.35)"
        : "0 2px 8px rgba(99,102,241,0.35)",
    }}
  >
    {isBot ? "R" : "U"}
  </div>
);

export default function TimestagChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! Welcome to **Reasonify**. I'm your AI assistant. How can I help you today? 👋",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const updatedMessages = [...messages, { role: "user", content: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const reply =
        data?.content?.[0]?.text || "I'm not sure how to answer that. Let me connect you with our team.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.45); }
          70% { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        .chat-window { animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .msg-bubble { animation: msgIn 0.25s ease forwards; }
        .fab-btn { animation: pulse-ring 2s infinite; }
        .quick-btn:hover {
          background: linear-gradient(135deg, #10B981, #059669) !important;
          color: #fff !important;
          border-color: transparent !important;
          transform: translateY(-1px);
        }
        .send-btn:hover { background: #059669 !important; transform: scale(1.05); }
        .msg-user { background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
      `}</style>

      {/* Full-screen centered layout */}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F2027 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Hero text */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(28px, 5vw, 52px)",
              fontWeight: 800,
              color: "#F1F5F9",
              lineHeight: 1.15,
              marginBottom: 12,
            }}
          >
            Timestag{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #10B981, #34D399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Reasonify
            </span>
          </div>
          <p style={{ color: "#94A3B8", fontSize: 16, maxWidth: 420, margin: "0 auto 32px" }}>
            AI-powered digital transformation & custom software solutions
          </p>
          <button
            onClick={() => setOpen(true)}
            style={{
              background: "linear-gradient(135deg, #10B981, #059669)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 32px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
            }}
          >
            💬 Chat with our AI Assistant
          </button>
        </div>

        {/* FAB */}
        <button
          className="fab-btn"
          onClick={() => setOpen((v) => !v)}
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            zIndex: 1000,
            transition: "transform 0.2s",
          }}
        >
          {open ? "✕" : "💬"}
          {hasUnread && !open && (
            <span
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 12,
                height: 12,
                background: "#EF4444",
                borderRadius: "50%",
                border: "2px solid #0F172A",
                animation: "popIn 0.3s ease",
              }}
            />
          )}
        </button>

        {/* Chat Window */}
        {open && (
          <div
            className="chat-window"
            style={{
              position: "fixed",
              bottom: 100,
              right: 28,
              width: "min(420px, calc(100vw - 40px))",
              height: "min(600px, calc(100vh - 130px))",
              background: "#111827",
              borderRadius: 20,
              boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.15)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 999,
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #064E3B 0%, #065F46 100%)",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderBottom: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 18,
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(16,185,129,0.4)",
                }}
              >
                R
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#ECFDF5", fontSize: 15 }}>
                  Reasonify Assistant
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#34D399",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ color: "#6EE7B7", fontSize: 12 }}>Online · Typically replies instantly</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#6EE7B7",
                  borderRadius: 8,
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className="msg-bubble"
                  style={{
                    display: "flex",
                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                    gap: 8,
                    alignItems: "flex-end",
                  }}
                >
                  <Avatar isBot={msg.role === "assistant"} />
                  <div
                    className={msg.role === "user" ? "msg-user" : ""}
                    style={{
                      maxWidth: "75%",
                      padding: "10px 14px",
                      borderRadius:
                        msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background:
                        msg.role === "user"
                          ? undefined
                          : "linear-gradient(135deg, #1F2937 0%, #1a2535 100%)",
                      color: msg.role === "user" ? "#fff" : "#D1FAE5",
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      border: msg.role === "assistant" ? "1px solid rgba(16,185,129,0.12)" : "none",
                      boxShadow:
                        msg.role === "user"
                          ? "0 4px 12px rgba(99,102,241,0.25)"
                          : "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                    dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                  />
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <Avatar isBot />
                  <div
                    style={{
                      background: "#1F2937",
                      borderRadius: "16px 16px 16px 4px",
                      border: "1px solid rgba(16,185,129,0.12)",
                    }}
                  >
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div
                style={{
                  padding: "8px 14px",
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  borderTop: "1px solid rgba(16,185,129,0.08)",
                }}
              >
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    className="quick-btn"
                    onClick={() => sendMessage(q)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(16,185,129,0.3)",
                      color: "#6EE7B7",
                      borderRadius: 20,
                      padding: "5px 12px",
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      transition: "all 0.2s",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              style={{
                padding: "12px 14px",
                borderTop: "1px solid rgba(16,185,129,0.12)",
                display: "flex",
                gap: 8,
                background: "#0F172A",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  background: "#1F2937",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  color: "#E2E8F0",
                  fontSize: 13.5,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(16,185,129,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(16,185,129,0.2)")}
              />
              <button
                className="send-btn"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: input.trim() && !loading ? "#10B981" : "#1F2937",
                  border: "none",
                  color: input.trim() && !loading ? "#fff" : "#4B5563",
                  fontSize: 16,
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                ➤
              </button>
            </div>

            {/* Footer */}
            <div
              style={{
                textAlign: "center",
                padding: "6px 0 8px",
                color: "#374151",
                fontSize: 11,
                background: "#0F172A",
              }}
            >
              Powered by <strong style={{ color: "#065F46" }}>Timestag</strong> · Reasonify AI
            </div>
          </div>
        )}
      </div>
    </>
  );
}