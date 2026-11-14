import { useState } from "react";

const steps = ["Describe", "Customize", "Build"];
export default function App() {
  const [step, setStep] = useState(0);
  const [idea, setIdea] = useState("");
  const [appName, setAppName] = useState("My New App");
  const [platform, setPlatform] = useState("Android APK");
  const [notice, setNotice] = useState("");
  const [view, setView] = useState("builder");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  function next() {
    if (step === 0 && !idea.trim()) { setNotice("Please describe the app you want to create."); return; }
    setNotice(""); setStep((s) => Math.min(2, s + 1));
  }
  function back() { setNotice(""); setStep((s) => Math.max(0, s - 1)); }
  function build() {
    const project = { appName: appName.trim() || "My New App", platform, idea: idea.trim(), createdAt: new Date().toISOString(), product: "SHER AI" };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (project.appName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-app");
    link.href = url;
    link.download = `${safeName}-project-brief.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice("Your project brief has been exported. AI code generation and APK compilation are the next development step.");
  }

  async function sendChat(event) {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const nextMessages = [...chatMessages, { role: "user", content: text }].slice(-12);
    setChatMessages(nextMessages);
    setChatInput("");
    setChatError("");
    setChatLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "ChatGPT service is not available.");
      setChatMessages([...nextMessages, { role: "assistant", content: data.answer }].slice(-12));
    } catch (error) {
      setChatError(error.message || "Could not reach SHER AI. Please try again.");
    } finally {
      setChatLoading(false);
    }
  }

  return <main className="shell">
    <header className="topbar">
      <div className="brand"><div className="brain">🧠</div><div><strong>SHER AI</strong><small>YOUR THREE-STEP APP BUILDER</small></div></div>
      <button className={view === "chat" ? "mode-button selected" : "mode-button"} onClick={() => setView(view === "chat" ? "builder" : "chat")}>{view === "chat" ? "← App Builder" : "✦ ChatGPT"}</button>
    </header>

    {view === "chat" ? <section className="chat-panel">
      <div className="chat-heading"><div className="chat-avatar">✦</div><div><div className="kicker">SHER AI ASSISTANT</div><h1>ChatGPT</h1><p className="muted">Ask questions, plan your app, or get help in Urdu and English.</p></div></div>
      <div className="chat-messages" aria-live="polite">
        {chatMessages.length === 0 && <div className="chat-welcome"><b>Assalam-o-alaikum! 👋</b><p>Main SHER AI ka assistant hoon. Aap apne app ka idea batayein ya koi sawal poochhein.</p></div>}
        {chatMessages.map((message, index) => <div className={message.role === "user" ? "chat-bubble user" : "chat-bubble assistant"} key={index}><span>{message.role === "user" ? "You" : "SHER AI"}</span><p>{message.content}</p></div>)}
        {chatLoading && <div className="chat-bubble assistant"><span>SHER AI</span><p>Soch raha hoon…</p></div>}
      </div>
      {chatError && <div className="notice" role="alert">{chatError}</div>}
      <form className="chat-form" onSubmit={sendChat}>
        <textarea rows="2" maxLength="4000" value={chatInput} onChange={event => setChatInput(event.target.value)} placeholder="Apna sawal yahan likhein..." aria-label="Your message" />
        <button className="primary" type="submit" disabled={chatLoading || !chatInput.trim()}>{chatLoading ? "Sending…" : "Send ↑"}</button>
      </form>
      <p className="chat-footnote">AI replies use the SHER AI server connection. Usage may be subject to API limits and charges.</p>
    </section> : <>
      <section className="hero"><div className="eyebrow">IDEA TO ANDROID APP</div><h1>Build an app.<br/><span>In 3 simple steps.</span></h1><p>Describe your idea, make it yours, and prepare your project for an Android APK.</p></section>
      <nav className="steps" aria-label="Creation steps">{steps.map((label, i) => <div className={`step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`} key={label}><b>{i < step ? "✓" : `0${i+1}`}</b><span>{label}</span></div>)}</nav>
      <section className="panel">
        {step === 0 && <><div className="panel-icon">✎</div><div className="kicker">STEP 01 — YOUR IDEA</div><h2>What should we build?</h2><p className="muted">Explain your app in your own words. You can write in Urdu, Hindi, or English.</p><label htmlFor="idea">Describe your app</label><textarea id="idea" rows="5" value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Example: Make a food delivery app with customer accounts, restaurant listings, and order tracking..."/><div className="hint">Tip: Mention the users, main features, and what the app should do.</div></>}
        {step === 1 && <><div className="panel-icon">✦</div><div className="kicker">STEP 02 — MAKE IT YOURS</div><h2>Customize your app</h2><p className="muted">Choose a name and target platform. You can refine the design later.</p><label htmlFor="appName">App name</label><input id="appName" value={appName} onChange={e=>setAppName(e.target.value)}/><label htmlFor="platform">Build target</label><select id="platform" value={platform} onChange={e=>setPlatform(e.target.value)}><option>Android APK</option><option>Web app</option><option>Android APK + Web app</option></select><div className="summary"><b>Your idea</b><p>{idea}</p></div></>}
        {step === 2 && <><div className="panel-icon">⚡</div><div className="kicker">STEP 03 — BUILD & EXPORT</div><h2>{appName || "Your app"} is ready to prepare</h2><p className="muted">Review your project brief before connecting the AI generation and Android build services.</p><div className="summary"><b>App idea</b><p>{idea}</p><b>Export target</b><p>{platform}</p></div><div className="notice">This starter can export a project brief. Full AI source-code generation and APK compilation still need the build service.</div></>}
        {notice && <div className="notice" role="status">{notice}</div>}
        <div className="actions">{step > 0 && <button className="secondary" onClick={back}>Back</button>}{step < 2 ? <button className="primary" onClick={next}>Continue <span>→</span></button> : <button className="primary" onClick={build}>Export project brief <span>↓</span></button>}</div>
      </section>
    </>}
    <footer><span>SHER AI</span><span>Build boldly. Start simply.</span></footer>
  </main>;
}
