import { useState } from "react";

const steps = ["Describe", "Customize", "Build"];
export default function App() {
  const [step, setStep] = useState(0);
  const [idea, setIdea] = useState("");
  const [appName, setAppName] = useState("My New App");
  const [platform, setPlatform] = useState("Android APK");
  const [notice, setNotice] = useState("");

  function next() {
    if (step === 0 && !idea.trim()) { setNotice("Please describe the app you want to create."); return; }
    setNotice(""); setStep((s) => Math.min(2, s + 1));
  }
  function back() { setNotice(""); setStep((s) => Math.max(0, s - 1)); }
  function build() {
    setNotice("Project brief prepared. AI code generation and APK compilation still need a configured AI provider and build service.");
  }

  return <main className="shell">
    <header className="topbar"><div className="brand"><div className="brain">🧠</div><div><strong>SHER AI</strong><small>YOUR THREE-STEP APP BUILDER</small></div></div><span className="status">MVP PREVIEW</span></header>
    <section className="hero"><div className="eyebrow">IDEA TO ANDROID APP</div><h1>Build an app.<br/><span>In 3 simple steps.</span></h1><p>Describe your idea, make it yours, and prepare your project for an Android APK.</p></section>
    <nav className="steps" aria-label="Creation steps">{steps.map((label, i) => <div className={`step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`} key={label}><b>{i < step ? "✓" : `0${i+1}`}</b><span>{label}</span></div>)}</nav>
    <section className="panel">
      {step === 0 && <><div className="panel-icon">✎</div><div className="kicker">STEP 01 — YOUR IDEA</div><h2>What should we build?</h2><p className="muted">Explain your app in your own words. You can write in Urdu, Hindi, or English.</p><label htmlFor="idea">Describe your app</label><textarea id="idea" rows="5" value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Example: Make a food delivery app with customer accounts, restaurant listings, and order tracking..."/><div className="hint">Tip: Mention the users, main features, and what the app should do.</div></>}
      {step === 1 && <><div className="panel-icon">✦</div><div className="kicker">STEP 02 — MAKE IT YOURS</div><h2>Customize your app</h2><p className="muted">Choose a name and target platform. You can refine the design later.</p><label htmlFor="appName">App name</label><input id="appName" value={appName} onChange={e=>setAppName(e.target.value)}/><label htmlFor="platform">Build target</label><select id="platform" value={platform} onChange={e=>setPlatform(e.target.value)}><option>Android APK</option><option>Web app</option><option>Android APK + Web app</option></select><div className="summary"><b>Your idea</b><p>{idea}</p></div></>}
      {step === 2 && <><div className="panel-icon">⚡</div><div className="kicker">STEP 03 — BUILD & EXPORT</div><h2>{appName || "Your app"} is ready to prepare</h2><p className="muted">Review your project brief before connecting the AI generation and Android build services.</p><div className="summary"><b>App idea</b><p>{idea}</p><b>Export target</b><p>{platform}</p></div><div className="notice">This starter is an MVP interface, not yet an AI code generator. APK download will become available after the generation backend and cloud build pipeline are connected.</div></>}
      {notice && <div className="notice" role="status">{notice}</div>}
      <div className="actions">{step > 0 && <button className="secondary" onClick={back}>Back</button>}{step < 2 ? <button className="primary" onClick={next}>Continue <span>→</span></button> : <button className="primary" onClick={build}>Prepare project <span>→</span></button>}</div>
    </section>
    <footer><span>SHER AI</span><span>Build boldly. Start simply.</span></footer>
  </main>;
}
