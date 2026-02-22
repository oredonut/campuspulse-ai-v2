import { useState, useRef, useEffect } from 'react'

const SYSTEM_PROMPT = `You are CampusPulse AI, a supportive mental health and academic assistant for university students. 
Be empathetic, concise, and helpful. Focus on student wellbeing, study tips, stress management, and academic advice.`

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your CampusPulse AI assistant 👋 How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...updated],
        }),
      })

      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response."
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Chat with AI"
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7C6FCD, #5B8DEF)',
          border: 'none', cursor: 'pointer', fontSize: 24,
          boxShadow: '0 4px 20px rgba(124,111,205,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28, zIndex: 999,
          width: 360, height: 500, borderRadius: 16,
          background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          fontFamily: "'DM Sans', sans-serif",
        }}>

          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, rgba(124,111,205,0.3), rgba(91,141,239,0.2))',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>CampusPulse AI</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Always here to help</div>
            </div>
            <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#4CAF50' }} />
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '9px 13px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #7C6FCD, #5B8DEF)'
                    : 'rgba(255,255,255,0.07)',
                  color: '#fff', fontSize: 13, lineHeight: 1.5,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '9px 13px', borderRadius: '14px 14px 14px 4px',
                  background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', fontSize: 13,
                }}>
                  Typing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              rows={1}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 13,
                fontFamily: "'DM Sans', sans-serif", resize: 'none', outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: '0 14px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #7C6FCD, #5B8DEF)',
                color: '#fff', fontSize: 18, cursor: 'pointer',
                opacity: loading || !input.trim() ? 0.4 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const OpenAI = require("openai");

admin.initializeApp();
const db = admin.firestore();

const openai = new OpenAI({
apiKey: functions.config().openai.key,
});

exports.chatbot = functions.https.onCall(async (data, context) => {
if (!context.auth) {
throw new functions.https.HttpsError("unauthenticated");
}

const uid = context.auth.uid;
const userMessage = data.message;

// 🔹 Get latest risk score
const riskSnap = await db
.collection("users")
.doc(uid)
.collection("riskScores")
.orderBy("createdAt", "desc")
.limit(1)
.get();

const riskScore = riskSnap.empty
? 0
: riskSnap.docs[0].data().score;

const riskLevel =
riskScore >= 0.7
? "High"
: riskScore >= 0.4
? "Moderate"
: "Low";

// 🔹 Get last 4 check-ins
const logsSnap = await db
.collection("users")
.doc(uid)
.collection("dailyLogs")
.orderBy("date", "desc")
.limit(4)
.get();

const logs = logsSnap.docs.map(d => d.data());

// 🔥 AI PROMPT (very important)
const systemPrompt = `
You are a calm and supportive mental health assistant for university students.

Risk Level: ${riskLevel}
Recent Logs: ${JSON.stringify(logs)}

Rules:
- Be supportive but not dramatic.
- Do not diagnose.
- If risk is High, encourage speaking to a counselor.
- Offer practical coping suggestions.
- Keep response under 150 words.
`;

const completion = await openai.chat.completions.create({
model: "gpt-4o-mini",
messages: [
{ role: "system", content: systemPrompt },
{ role: "user", content: userMessage }
],
temperature: 0.7,
});

const reply = completion.choices[0].message.content;

// 🔹 Save to chat history
await db
.collection("users")
.doc(uid)
.collection("chats")
.add({
sender: "user",
text: userMessage,
createdAt: admin.firestore.FieldValue.serverTimestamp()
});

await db
.collection("users")
.doc(uid)
.collection("chats")
.add({
sender: "bot",
text: reply,
createdAt: admin.firestore.FieldValue.serverTimestamp()
});

return { reply };
});git