import { useState } from "react";
import JSZip from "jszip";

const steps = ["Describe", "Customize", "Build"];

function generatedApp(name, idea) {
  const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeIdea = idea.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return [
    'import { useState } from "react";',
    'import "./style.css";',
    "",
    "export default function App() {",
    "  const [items, setItems] = useState([]);",
    '  const [draft, setDraft] = useState("");',
    "  return <main className=\"app\">",
    "    <header><span className=\"mark\">✦</span><div><p className=\"eyebrow\">YOUR NEW PROJECT</p><h1>" + safeName + "</h1></div></header>",
    "    <section className=\"intro\"><p className=\"tag\">PROJECT IDEA</p><p>" + safeIdea + "</p></section>",
    '    <section className="workspace"><h2>Start building</h2><p>This editable starter is ready for your own screens and features.</p>',
    '      <form onSubmit={e => { e.preventDefault(); if(draft.trim()){setItems([...items,draft.trim()]);setDraft("");} }}>',
    '        <label htmlFor="feature">Add a feature or task</label><div className="entry"><input id="feature" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Write your first feature..." /><button>Add</button></div>',
    "      </form><ul>{items.map((item,i)=><li key={i}>{item}</li>)}</ul></section>",
    "    <footer>Generated with SHER AI · Customize this starter to make it yours.</footer>",
    "  </main>;",
    "}"
  ].join("\n");
}

async function downloadProject(project) {
  const zip = new JSZip();
  const folder = zip.folder(project.slug);
  folder.file("package.json", JSON.stringify({
    name: project.slug, version: "1.0.0", private: true, type: "module",
    scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
    dependencies: { "@vitejs/plugin-react": "^4.4.1", vite: "^6.3.5, react: "^19.1.0", "react-dom": "^19.1.0" }
  }, null, 2));
  folder.file("index.html", '<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>' + project.name + '</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>');
  folder.file("src/main.jsx", 'import React from "react"; import { createRoot } from "react-dom/client"; import App from "./App.jsx"; import "./style.css"; createRoot(document.getElementById("root")).render(<App />);');
  folder.file("src/App.jsx", generatedApp(project.name, project.idea));
  folder.file("src/style.css", ':root{font-family:system-ui,sans-serif;color:#eaf2ff;background:#081321}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 80% 0,#193755,#081321 55%)}.app{max-width:760px;margin:auto;padding:28px 20px 50px}header{display:flex;align-items:center;gap:14px;margin:28px 0 44px}.mark{display:grid;place-items:center;width:48px;height:48px;border-radius:15px;background:#153d59;color:#78d9ff;font-size:26px}.eyebrow,.tag{font-size:10px;letter-spacing:2px;color:#79d5ff;font-weight:800}.intro,.workspace{padding:24px;border:1px solid #29445f;border-radius:20px;background:#102239;margin-bottom:18px}.intro p:last-child{line-height:1.7;color:#c5d5e8}.workspace p{color:#9eb1c8;line-height:1.6}label{display:block;margin:24px 0 8px;font-size:13px;font-weight:700}.entry{display:flex;gap:8px}input{min-width:0;flex:1;padding:13px;border-radius:10px;border:1px solid #38536e;background:#081726;color:white}button{border:0;border-radius:10px;padding:0 18px;background:#70d5e8;color:#071522;font-weight:800}li{padding:10px 0;border-bottom:1px solid #29445f}footer{text-align:center;color:#8298b2;font-size:12px;margin-top:28px}');
  folder.file("README.md", "# " + project.name + "\n\nCreated with SHER AI.\n\n## Original idea\n\n" + project.idea + "\n\n## Start\n\n1. Install Node.js.\n2. Run npm install.\n3. Run npm run dev.\n4. Open the local Vite URL.\n\nThis is an editable React starter scaffold, not a complete AI implementation of every feature in the idea.\n");
  folder.file("sher-ai-project.json", JSON.stringify({...project,generator:"SHER AI starter generator",generatorVersion:"0.2.0"},null,2));
  const blob = await zip.generateAsync({type:"blob"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = project.slug + ".zip";
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

export default function App() {
  const [step,setStep] = useState(0);
  const [idea,setIdea] = useState("");
  const [appName,setAppName] = useState("My New App");
  const [platform,setPlatform] = useState("Android APK");
  const [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false);
  function next(){ if(step===0&&!idea.trim()){setNotice("Please describe the app you want to create.");return;} setNotice("");setStep(s=>Math.min(2,s+1)); }
  function back(){setNotice("");setStep(s=>Math.max(0,s-1));}
  async function build(){
    setBusy(true);setNotice("");
    const name=appName.trim()||"My New App";
    const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"my-new-app";
    try{await downloadProject({name,slug,platform,idea:idea.trim(),createdAt:new Date().toISOString()});setNotice("Your editable React starter project ZIP has been downloaded. Open its README for setup instructions.");}
    catch(error){setNotice("The project could not be packaged. Please try again. "+(error?.message||""));}
    finally{setBusy(false);}
  }
  return <main className="shell">
    <header className="topbar"><div className="brand"><div className="brain">🧠</div><div><strong>SHER AI</strong><small>YOUR THREE-STEP APP BUILDER</small></div></div><span className="status">STARTER GENERATOR</span></header>
    <section className="hero"><div className="eyebrow">IDEA TO APP PROJECT</div><h1>Build an app.<br/><span>In 3 simple steps.</span></h1><p>Describe your idea, make it yours, and download an editable React project starter.</p></section>
    <nav className="steps" aria-label="Creation steps">{steps.map((label,i)=><div className={"step "+(i===step?"active ":"")+(i<step?"done":"")} key={label}><b>{i<step?"✓":"0"+(i+1)}</b><span>{label}</span></div>)}</nav>
    <section className="panel">
      {step===0&&<><div className="panel-icon">✎</div><div className="kicker">STEP 01 — YOUR IDEA</div><h2>What should we build?</h2><p className="muted">Explain your app in Urdu, Hindi, or English.</p><label htmlFor="idea">Describe your app</label><textarea id="idea" rows="5" value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Example: A food delivery app with restaurant listings, menus, and order tracking..."/><div className="hint">Mention who will use the app and its most important features.</div></>}
      {step===1&&<><div className="panel-icon">✦</div><div className="kicker">STEP 02 — MAKE IT YOURS</div><h2>Customize your app</h2><p className="muted">Choose a name and target platform.</p><label htmlFor="appName">App name</label><input id="appName" value={appName} onChange={e=>setAppName(e.target.value)}/><label htmlFor="platform">Build target</label><select id="platform" value={platform} onChange={e=>setPlatform(e.target.value)}><option>Android APK</option><option>Web app</option><option>Android APK + Web app</option></select><div className="summary"><b>Your idea</b><p>{idea}</p></div></>}
      {step===2&&<><div className="panel-icon">⚡</div><div className="kicker">STEP 03 — BUILD & EXPORT</div><h2>{appName||"Your app"} is ready</h2><p className="muted">SHER AI will package an editable React starter project into a ZIP file.</p><div className="summary"><b>App idea</b><p>{idea}</p><b>Target platform</b><p>{platform}</p></div><div className="notice">This creates a working React starter scaffold from your description. It does not yet use an AI model to implement every requested feature or compile an APK.</div></>}
      {notice&&<div className="notice" role="status">{notice}</div>}
      <div className="actions">{step>0&&<button className="secondary" onClick={back}>Back</button>}{step<2?<button className="primary" onClick={next}>Continue <span>→</span></button>:<button className="primary" disabled={busy} onClick={build}>{busy?"Creating ZIP…":"Generate & Download"} <span>↓</span></button>}</div>
    </section>
    <footer><span>SHER AI</span><span>Build boldly. Start simply.</span></footer>
  </main>;
}
