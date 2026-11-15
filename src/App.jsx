import { useEffect, useState } from "react";
import JSZip from "jszip";
import { createClient } from "@supabase/supabase-js";

const steps = ["Describe", "Customize", "Build"]; // Mobile-first App Builder release
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://sher-ai-swart.vercel.app").replace(/\/$/, "");
const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.2.0";
function AppContent({ accessToken, onSignOut }) {
  const [step, setStep] = useState(0);
  const [idea, setIdea] = useState("");
  const [appName, setAppName] = useState("My New App");
  const [platform, setPlatform] = useState("Mobile PWA / Web App");
  const [notice, setNotice] = useState("");
  const [view, setView] = useState("chat");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [toolText, setToolText] = useState("");
  const [toolResult, setToolResult] = useState("");
  const [toolBusy, setToolBusy] = useState(false);
  const [calculator, setCalculator] = useState("12 * 8");
  const [calculatorResult, setCalculatorResult] = useState("");
  const [listening, setListening] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [imageError, setImageError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [studioPrompt, setStudioPrompt] = useState("");
  const [studioFiles, setStudioFiles] = useState(null);
  const [studioBusy, setStudioBusy] = useState(false);
  const [studioError, setStudioError] = useState("");
  const [studioFile, setStudioFile] = useState("index.html");
  const [upgradeStatus, setUpgradeStatus] = useState("ابھی اپ ڈیٹ چیک نہیں کی گئی۔");
  const [latestVersion, setLatestVersion] = useState("");
  const [checkingUpgrade, setCheckingUpgrade] = useState(false);

  async function checkForUpdates() {
    if (checkingUpgrade) return;
    setCheckingUpgrade(true);
    setUpgradeStatus("نئی اپ ڈیٹ تلاش کی جا رہی ہے…");
    try {
      const response = await fetch(API_BASE_URL + "/app-version.json?check=" + Date.now(), { cache: "no-store" });
      if (!response.ok) throw new Error("اپ ڈیٹ سرور سے رابطہ نہیں ہو سکا۔");
      const manifest = await response.json();
      if (!manifest.version) throw new Error("اپ ڈیٹ کی معلومات درست نہیں ہیں۔");
      setLatestVersion(manifest.version);
      let serviceWorkerUpdated = false;
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          serviceWorkerUpdated = registration.waiting || registration.installing || registration.active;
        }
      }
      if (manifest.version !== APP_VERSION) {
        setUpgradeStatus("نیا ورژن " + manifest.version + " دستیاب ہے۔ ویب ایپ کی نئی فائلیں سرور پر شائع ہونے کے بعد ریفریش کریں۔");
      } else if (serviceWorkerUpdated) {
        setUpgradeStatus("آپ کا ورژن تازہ ترین ہے۔ سروس ورکر نے اپ ڈیٹ چیک کر لی ہے۔");
      } else {
        setUpgradeStatus("SHER AI تازہ ترین ورژن پر ہے۔");
      }
    } catch (error) {
      setUpgradeStatus(error.message || "اپ ڈیٹ چیک نہیں ہو سکی۔ انٹرنیٹ کنکشن چیک کریں۔");
    } finally {
      setCheckingUpgrade(false);
    }
  }

  function refreshUpdatedApp() {
    window.location.reload();
  }

  useEffect(() => {
    checkForUpdates();
    const interval = window.setInterval(() => checkForUpdates(), 15 * 60 * 1000);
    const onFocus = () => checkForUpdates();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  function next() {
    if (step === 0 && !idea.trim()) { setNotice("Please describe the app you want to create."); return; }
    setNotice(""); setStep((s) => Math.min(2, s + 1));
  }
  function back() { setNotice(""); setStep((s) => Math.max(0, s - 1)); }

  async function build() {
    if (!idea.trim() || generating) return;
    setGenerating(true); setNotice("");
    try {
      const response = await fetch(API_BASE_URL + "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
        body: JSON.stringify({ idea, appName, platform })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "AI project generation failed.");
      if (!result.files || typeof result.files !== "object" || Array.isArray(result.files)) throw new Error("SHER AI کو درست project files موصول نہیں ہوئیں۔");
      const zip = new JSZip();
      Object.entries(result.files).forEach(([path, content]) => {
        if (typeof content === "string" && !path.startsWith("/") && !path.split("/").includes("..")) zip.file(path, content);
      });
      zip.file("SHER-AI-README.md", "# " + appName + "\n\nGenerated by SHER AI as a mobile-first project.\n\nIdea: " + idea + "\n\nReview, test, and host over HTTPS before installing as a PWA. This ZIP is source code, not a compiled native APK.\n");
      setStudioFiles(result.files);
      const previewFile = Object.keys(result.files).find(path => /(^|\/)index\.html$/i.test(path)) || Object.keys(result.files)[0];
      setStudioFile(previewFile || "index.html");
      const archive = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(archive);
      const link = document.createElement("a");
      const safeName = appName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-app";
      link.href = url; link.download = safeName + "-source.zip";
      document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setView("studio");
      setNotice("آپ کا موبائل فرینڈلی source ZIP تیار ہے۔ Live Preview بھی کھول دیا گیا ہے۔");
    } catch (error) {
      setNotice(error.message || "Could not generate the project. Please try again.");
    } finally { setGenerating(false); }
  }

  function makeStudioPreview(files) {
    if (!files || typeof files !== "object") return "";
    const htmlPath = Object.keys(files).find(path => /(^|\/)index\.html$/i.test(path)) || Object.keys(files).find(path => /\.html$/i.test(path));
    if (!htmlPath) return "";
    let html = files[htmlPath];
    const directory = htmlPath.includes("/") ? htmlPath.slice(0, htmlPath.lastIndexOf("/") + 1) : "";
    const cssPath = Object.keys(files).find(path => path === directory + "styles.css" || path === "styles.css" || path.endsWith("/styles.css"));
    const jsPath = Object.keys(files).find(path => path === directory + "app.js" || path === "app.js" || path.endsWith("/app.js"));
    if (cssPath) {
      const css = files[cssPath].replace(/<\/style/gi, "<\\/style");
      if (/<\/head>/i.test(html)) html = html.replace(/<\/head>/i, "<style>" + css + "</style></head>");
      else html = "<style>" + css + "</style>" + html;
      html = html.replace(/<link\b[^>]*href=["'][^"']*styles\.css[^"']*["'][^>]*>/gi, "");
    }
    if (jsPath) {
      const js = files[jsPath].replace(/<\/script/gi, "<\\/script");
      const scriptTag = /<script\b[^>]*src=["'][^"']*app\.js[^"']*["'][^>]*>\s*<\/script>/i;
      if (scriptTag.test(html)) html = html.replace(scriptTag, "<script>" + js + "</script>");
      else html = html.replace(/<\/body>/i, "<script>" + js + "</script></body>");
    }
    return html;
  }

  async function generateStudio() {
    const prompt = studioPrompt.trim();
    if (!prompt || studioBusy) return;
    setStudioBusy(true); setStudioError(""); setStudioFiles(null);
    try {
      const response = await fetch(API_BASE_URL + "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
        body: JSON.stringify({ idea: prompt, appName: "SHER AI Studio Project", platform: "Responsive Web App / Website", studioMode: true })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "پروجیکٹ تیار نہیں ہو سکا۔");
      if (!result.files || typeof result.files !== "object" || Array.isArray(result.files)) throw new Error("درست project files موصول نہیں ہوئیں۔");
      setStudioFiles(result.files);
      const first = Object.keys(result.files).find(path => /index\.html$/i.test(path)) || Object.keys(result.files)[0];
      setStudioFile(first || "index.html");
    } catch (error) {
      setStudioError(error.message || "SHER AI سے رابطہ نہیں ہو سکا۔");
    } finally { setStudioBusy(false); }
  }

  async function downloadStudioProject() {
    if (!studioFiles) return;
    const zip = new JSZip();
    Object.entries(studioFiles).forEach(([path, content]) => {
      if (typeof content === "string" && !path.startsWith("/") && !path.split("/").includes("..")) zip.file(path, content);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "sher-ai-studio-project.zip";
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyStudioCode() {
    if (!studioFiles || !studioFiles[studioFile]) return;
    try {
      await navigator.clipboard.writeText(studioFiles[studioFile]);
      setStudioError("فائل کا کوڈ کاپی ہو گیا۔");
    } catch {
      setStudioError("کاپی کی اجازت نہیں ملی؛ کوڈ منتخب کرکے کاپی کریں۔");
    }
  }

  async function attachImage(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
      setChatError("صرف JPG، PNG، WEBP تصویر یا PDF دستاویز منتخب کریں۔"); event.target.value = ""; return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setChatError("فائل 2.5 MB سے کم ہونی چاہیے۔"); event.target.value = ""; return;
    }
    const reader = new FileReader();
    reader.onload = () => { setSelectedImage({ dataUrl: reader.result, mimeType: file.type, name: file.name }); setChatError(""); };
    reader.onerror = () => setChatError("فائل نہیں کھل سکی۔ دوبارہ کوشش کریں۔");
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function speakText(text) {
    if (!("speechSynthesis" in window)) { setChatError("اس براؤزر میں آواز سے پڑھنے کی سہولت دستیاب نہیں۔"); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = /[\u0600-\u06FF]/.test(text) ? "ur-PK" : "en-US";
    window.speechSynthesis.speak(utterance);
  }

  async function runSmartTool() {
    const text = toolText.trim();
    if (!text || toolBusy) return;
    setToolBusy(true); setToolResult("");
    try {
      const response = await fetch(API_BASE_URL + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken }, body: JSON.stringify({ messages: [{ role: "user", content: text }] }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "AI tool request failed.");
      setToolResult(result.answer || "کوئی جواب موصول نہیں ہوا۔");
    } catch (error) { setToolResult(error.message || "درخواست مکمل نہیں ہو سکی۔"); }
    finally { setToolBusy(false); }
  }

  function calculate() {
    const expression = calculator.trim();
    if (!expression || !/^[0-9+\-*/().%\s]+$/.test(expression)) {
      setCalculatorResult("صرف اعداد اور + − × ÷ ( ) استعمال کریں۔");
      return;
    }
    try {
      const value = Function("return (" + expression + ")")();
      setCalculatorResult(Number.isFinite(value) ? String(value) : "درست حساب درج کریں۔");
    } catch {
      setCalculatorResult("حساب درست نہیں۔");
    }
  }

  function startVoiceInput() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) { setChatError("آپ کے براؤزر میں voice typing دستیاب نہیں۔ Chrome میں دوبارہ کوشش کریں۔"); return; }
    const recognition = new Speech();
    recognition.lang = /[\\u0600-\\u06FF]/.test(chatInput) ? "ur-PK" : "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); setChatError("مائیک استعمال نہیں ہو سکا۔ براہِ کرم اجازت دیں۔"); };
    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      setChatInput((previous) => (previous ? previous + " " : "") + spoken);
    };
    recognition.start();
  }

  async function generateImage() {
    const prompt = imagePrompt.trim();
    if (!prompt || imageLoading) return;
    setImageLoading(true); setImageError(""); setGeneratedImage("");
    try {
      const response = await fetch(API_BASE_URL + "/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
        body: JSON.stringify({ prompt })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "تصویر تیار نہیں ہو سکی۔");
      if (!result.image || !result.mimeType) throw new Error("AI سے تصویر موصول نہیں ہوئی۔");
      setGeneratedImage("data:" + result.mimeType + ";base64," + result.image);
    } catch (error) {
      setImageError(error.message || "تصویر بنانے کی درخواست مکمل نہیں ہو سکی۔");
    } finally { setImageLoading(false); }
  }

  async function sendChat(event) {
    event.preventDefault();
    const text = chatInput.trim();
    if ((!text && !selectedImage) || chatLoading) return;
    const messageText = text || "Please describe and analyze the attached image.";
    const nextMessages = [...chatMessages, { role: "user", content: messageText }].slice(-12);
    setChatMessages(nextMessages); setChatInput(""); setChatError(""); setChatLoading(true);
    try {
      const payload = { messages: nextMessages };
      if (selectedImage) payload.image = {
        mimeType: selectedImage.mimeType,
        data: selectedImage.dataUrl.split(",")[1]
      };
      const response = await fetch(API_BASE_URL + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "SHER AI سے رابطہ نہیں ہو سکا۔");
      if (!result.answer) throw new Error("SHER AI کو خالی جواب ملا۔");
      setChatMessages([...nextMessages, { role: "assistant", content: result.answer }].slice(-12));
      setSelectedImage(null);
    } catch (error) {
      setChatInput(previous => previous || text);
      setChatError(error.message || "Could not reach SHER AI. Please try again.");
    } finally { setChatLoading(false); }
  }

  return <main className="shell">
    <header className="topbar">
      <div className="brand"><img className="brand-logo" src="/icons/sher-ai-mark.svg" alt="SHER AI" style={{width:"42px",height:"42px",objectFit:"contain"}} /><div><strong>SHER AI</strong><small>YOUR PERSONAL AI ASSISTANT</small></div></div>
      <button className="signout-button" onClick={onSignOut}>خروج</button>
    </header>
    <nav className="workspace-tabs" aria-label="SHER AI tools">
      <button className={view === "chat" ? "workspace-tab active" : "workspace-tab"} onClick={() => setView("chat")}>✦ AI چیٹ</button>
      <button className={view === "studio" ? "workspace-tab active" : "workspace-tab"} onClick={() => setView("studio")}>⚡ Fast Studio</button>
      <button className={view === "builder" ? "workspace-tab active" : "workspace-tab"} onClick={() => setView("builder")}>▣ App Builder</button>
      <button className={view === "smart" ? "workspace-tab active" : "workspace-tab"} onClick={() => setView("smart")}>⚙ Smart Tools</button>
      <button className={view === "images" ? "workspace-tab active" : "workspace-tab"} onClick={() => setView("images")}>✧ Image Studio</button>
      <button className={view === "upgrade" ? "workspace-tab active" : "workspace-tab"} onClick={() => setView("upgrade")}>⬆ Upgrade</button>
    </nav>

    {view === "chat" && <section className="chat-panel">
      <div className="chat-heading"><div className="chat-avatar">✦</div><div><div className="kicker">SHER AI ASSISTANT</div><h1>آپ کا AI اسسٹنٹ</h1><p className="muted">اردو یا English میں کچھ بھی پوچھیں</p></div></div>
      <div className="chat-messages" aria-live="polite">
        {chatMessages.length === 0 && <div className="chat-welcome"><b>السلام علیکم! 👋</b><p>میں SHER AI ہوں۔ آپ سوال پوچھ سکتے ہیں، آئیڈیاز پر بات کر سکتے ہیں یا اپنی تصویر دکھا کر اس کے بارے میں پوچھ سکتے ہیں۔</p><div className="suggestion-chips"><button type="button" onClick={() => setChatInput("مجھے ایک نئی موبائل ایپ بنانے میں مدد دیں۔")}>ایپ بنانے میں مدد</button><button type="button" onClick={() => setChatInput("Explain artificial intelligence in simple words.")}>AI کیا ہے؟</button><button type="button" onClick={() => setChatInput("آج مجھے کوئی نئی چیز سکھائیں۔")}>کچھ نیا سکھائیں</button></div></div>}
        {chatMessages.map((message, index) => <div className={"chat-bubble " + (message.role === "user" ? "user" : "assistant")} key={index}><span>{message.role === "user" ? "آپ" : "SHER AI"}</span><p>{message.content}</p>{message.role === "assistant" && <button type="button" className="speak-button" onClick={() => speakText(message.content)} aria-label="جواب سنیں">🔊 سنیں</button>}</div>)}
        {chatLoading && <div className="chat-bubble assistant"><span>SHER AI</span><p>سوچ رہا ہوں…</p></div>}
      </div>
      {chatError && <div className="notice" role="alert">{chatError}</div>}
      {selectedImage && <div className="attachment-preview">{selectedImage.mimeType === "application/pdf" ? <span className="pdf-icon">PDF</span> : <img src={selectedImage.dataUrl} alt="منتخب کردہ تصویر"/>}<span>{selectedImage.name}</span><button type="button" onClick={() => setSelectedImage(null)} aria-label="Remove file">×</button></div>}
      <form className="chat-form" onSubmit={sendChat}>
        <div className="chat-composer">
          <label className="tool-icon" title="تصویر یا PDF اپ لوڈ کریں">＋<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={attachImage} hidden /></label>
          <textarea rows="2" maxLength="4000" value={chatInput} onChange={event => setChatInput(event.target.value)} placeholder="اپنا پیغام لکھیں..." aria-label="Your message" />
          <button className={listening ? "tool-icon listening" : "tool-icon"} type="button" onClick={startVoiceInput} title="مائیک سے بولیں" aria-label="Voice input">🎙</button>
          <button className="send-button" type="submit" disabled={chatLoading || (!chatInput.trim() && !selectedImage)} aria-label="Send message">{chatLoading ? "…" : "↑"}</button>
        </div>
      </form>
      <p className="chat-footnote">تصاویر اور PDF دستاویزات Gemini کے ذریعے سمجھی جاتی ہیں۔ مائیک آواز کو تحریر میں بدلتا ہے؛ جواب سننے کے لیے ہر AI جواب کے ساتھ اسپیکر بٹن استعمال کریں۔</p>
    </section>}

    {view === "studio" && <section className="panel tool-panel studio-panel">
      <div className="panel-icon">⚡</div><div className="kicker">FAST APP & WEBSITE STUDIO</div>
      <h2>اپنا آئیڈیا لائیو ویب ایپ میں بدلیں</h2>
      <p className="muted">تفصیل لکھیں؛ SHER AI HTML، CSS اور JavaScript فائلیں بنائے گا۔ تیار ہونے پر Live Preview دیکھیں، کوڈ کاپی کریں یا ZIP ڈاؤن لوڈ کریں۔</p>
      <label htmlFor="studioPrompt">آپ کیا بنانا چاہتے ہیں؟</label>
      <textarea id="studioPrompt" rows="5" maxLength="6000" value={studioPrompt} onChange={e=>setStudioPrompt(e.target.value)} placeholder="مثلاً ایک جدید آن لائن اسٹور بنائیں، پروڈکٹ سرچ، کارٹ، موبائل ڈیزائن اور چیک آؤٹ ڈیمو کے ساتھ..."/>
      <div className="smart-actions"><button className="primary" type="button" onClick={generateStudio} disabled={studioBusy || !studioPrompt.trim()}>{studioBusy ? "تیار ہو رہا ہے…" : "⚡ بنائیں اور Preview دیکھیں"}</button></div>
      {studioError && <div className="notice" role="status">{studioError}</div>}
      {studioFiles && <>
        <div className="studio-toolbar"><strong>Live Preview</strong><button className="secondary" type="button" onClick={downloadStudioProject}>ZIP ڈاؤن لوڈ</button></div>
        {makeStudioPreview(studioFiles) ? <iframe className="studio-preview" title="SHER AI live website preview" sandbox="allow-scripts" srcDoc={makeStudioPreview(studioFiles)}/> : <div className="notice">پروجیکٹ میں index.html نہیں ملی؛ کوڈ فائلوں میں موجود ہے، مگر Preview نہیں بن سکا۔</div>}
        <div className="studio-toolbar"><strong>Source Code</strong><button className="secondary" type="button" onClick={copyStudioCode}>کوڈ کاپی کریں</button></div>
        <div className="studio-files"><div className="studio-file-list">{Object.keys(studioFiles).map(path=><button key={path} type="button" className={studioFile===path?"studio-file active":"studio-file"} onClick={()=>setStudioFile(path)}>{path}</button>)}</div><pre className="studio-code" dir="ltr"><code>{studioFiles[studioFile] || ""}</code></pre></div>
        <p className="chat-footnote">یہ Live Preview براؤزر کے اندر چلتا ہے۔ ZIP میں source code ہے؛ مکمل native Android APK یا backend hosting خودکار طور پر تیار نہیں ہوتے۔</p>
      </>}
    </section>}

    {view === "builder" && <>
      <section className="hero"><div className="eyebrow">IDEA TO ANDROID APP</div><h1>موبائل سے اپنی ایپ بنائیں۔<br/><span>کمپیوٹر کی ضرورت نہیں۔</span></h1><p>اردو میں آئیڈیا لکھیں؛ SHER AI موبائل فرینڈلی ایپ کا کوڈ، Live Preview اور ڈاؤن لوڈ کے لیے ZIP تیار کرے گا۔</p></section>
      <nav className="steps" aria-label="Creation steps">{steps.map((label, i) => <div className={"step " + (i === step ? "active " : "") + (i < step ? "done" : "")} key={label}><b>{i < step ? "✓" : "0" + (i+1)}</b><span>{label}</span></div>)}</nav>
      <section className="panel">
        {step === 0 && <><div className="panel-icon">✎</div><div className="kicker">STEP 01 — YOUR IDEA</div><h2>آپ کیا بنانا چاہتے ہیں؟</h2><p className="muted">اردو، ہندی یا English میں اپنی ایپ کی تفصیل لکھیں۔</p><label htmlFor="idea">ایپ کا آئیڈیا</label><textarea id="idea" rows="5" value={idea} onChange={e=>setIdea(e.target.value)} placeholder="مثلاً ایک فوڈ ڈیلیوری ایپ بنائیں..."/><div className="hint">ایپ کے صارفین، اہم فیچرز اور کام کرنے کا طریقہ بتائیں۔</div></>}
        {step === 1 && <><div className="panel-icon">✦</div><div className="kicker">STEP 02 — MAKE IT YOURS</div><h2>اپنی ایپ کو ترتیب دیں</h2><label htmlFor="appName">ایپ کا نام</label><input id="appName" value={appName} onChange={e=>setAppName(e.target.value)}/><label htmlFor="platform">پلیٹ فارم</label><select id="platform" value={platform} onChange={e=>setPlatform(e.target.value)}><option>Mobile PWA / Web App</option><option>Android native starter source (ZIP)</option><option>Android + Web source (ZIP)</option></select><div className="summary"><b>آپ کا آئیڈیا</b><p>{idea}</p></div></>}
        {step === 2 && <><div className="panel-icon">⚡</div><div className="kicker">STEP 03 — BUILD & EXPORT</div><h2>{appName || "آپ کی ایپ"} تیار کریں</h2><p className="muted">SHER AI آپ کے آئیڈیا سے ابتدائی source files بنائے گا اور ZIP میں دے گا؛ Android APK الگ build مرحلے سے بنتی ہے۔</p><div className="summary"><b>ایپ کا آئیڈیا</b><p>{idea}</p><b>پلیٹ فارم</b><p>{platform}</p></div><div className="notice">یہ source ZIP ہے، تیار APK نہیں۔ Mobile PWA کو HTTPS پر شائع کرکے فون میں انسٹال کیا جا سکتا ہے۔ Native APK کے لیے الگ Android build ضروری ہے۔</div></>}
        {notice && <div className="notice" role="status">{notice}</div>}
        <div className="actions">{step > 0 && <button className="secondary" onClick={back}>واپس</button>}{step < 2 ? <button className="primary" onClick={next}>اگلا مرحلہ <span>→</span></button> : <button className="primary" onClick={build} disabled={generating}>{generating ? "تیار ہو رہا ہے…" : "Source ZIP بنائیں"} <span>↓</span></button>}</div>
      </section>
    </>}

    {view === "smart" && <section className="panel tool-panel"><div className="panel-icon">⚙</div><div className="kicker">PERSONAL PRODUCTIVITY</div><h2>اسمارٹ ٹولز</h2><div className="smart-card"><h3>تیز حساب کتاب</h3><p className="muted">جمع، تفریق، ضرب، تقسیم اور فیصد کے لیے۔</p><input value={calculator} onChange={e=>setCalculator(e.target.value)} dir="ltr" placeholder="مثلاً 1200 * 3"/><button className="primary" type="button" onClick={calculate}>حساب کریں</button>{calculatorResult && <p className="tool-result">نتیجہ: {calculatorResult}</p>}</div><div className="smart-card"><h3>تحریر، ترجمہ اور خلاصہ</h3><p className="muted">متن لکھیں اور SHER AI سے ترجمہ، اصلاح یا خلاصہ کروائیں۔</p><textarea rows="4" value={toolText} onChange={e=>setToolText(e.target.value)} placeholder="مثلاً اس عبارت کا اردو میں ترجمہ کریں..."/><div className="smart-actions"><button className="secondary" type="button" onClick={()=>setToolText("اس متن کا اردو میں ترجمہ کریں:\
"+toolText)}>اردو ترجمہ</button><button className="secondary" type="button" onClick={()=>setToolText("اس تحریر کو بہتر اور پروفیشنل بنائیں:\
"+toolText)}>تحریر بہتر کریں</button><button className="primary" type="button" disabled={toolBusy || !toolText.trim()} onClick={runSmartTool}>{toolBusy ? "کام ہو رہا ہے…" : "SHER AI سے پوچھیں"}</button></div>{toolResult && <div className="tool-result"><p>{toolResult}</p><button type="button" className="speak-button" onClick={()=>speakText(toolResult)}>🔊 جواب سنیں</button></div>}</div><div className="smart-card"><h3>App Builder</h3><p className="muted">تین مراحل والا ایپ بلڈر الگ ٹیب میں دستیاب ہے۔</p><button className="secondary" type="button" onClick={()=>{setView("builder");setStep(0);}}>App Builder کھولیں</button></div></section>}

    {view === "upgrade" && <section className="panel tool-panel">
      <div className="panel-icon">⬆</div>
      <div className="kicker">SHER AI UPDATE CENTER</div>
      <h2>خودکار اپ گریڈ سینٹر</h2>
      <p className="muted">SHER AI کھلتے ہی، ہر 15 منٹ بعد، اور ایپ دوبارہ فعال ہونے پر نئی اپ ڈیٹ چیک کرے گا۔ نئی APK دستیاب ہونے پر ڈاؤن لوڈ کا بٹن دکھائے گا؛ انسٹالیشن آپ کی اجازت سے ہوگی۔</p>
      <div className="smart-card">
        <h3>موجودہ ورژن</h3>
        <p className="tool-result" dir="ltr">v{APP_VERSION}</p>
        <h3 style={{marginTop:"14px"}}>تازہ ترین دستیاب ورژن</h3>
        <p className="tool-result" dir="ltr">{latestVersion ? "v" + latestVersion : "ابھی چیک نہیں کیا"}</p>
        <button className="primary" type="button" disabled={checkingUpgrade} onClick={checkForUpdates}>{checkingUpgrade ? "چیک ہو رہا ہے…" : "ابھی اپ ڈیٹ چیک کریں"}</button>
        {latestVersion && latestVersion !== APP_VERSION && <a className="primary" href="https://github.com/alisher049/SHER-AI/releases/latest/download/SHER-AI.apk" target="_blank" rel="noreferrer" style={{display:"inline-block",textDecoration:"none",marginTop:"10px",padding:"12px 16px",borderRadius:"10px"}}>نئی APK ڈاؤن لوڈ کریں · v{latestVersion}</a>}
        <button className="secondary" type="button" style={{marginLeft:"8px"}} onClick={refreshUpdatedApp}>ویب ایپ ریفریش کریں</button>
        <p className="tool-result" role="status">{upgradeStatus}</p>
      </div>
      <div className="smart-card">
        <h3>Android APK اپ ڈیٹ</h3>
        <p className="muted">Android ایپ کی نئی APK یہاں سے حاصل کریں۔ انسٹالیشن آپ کی اجازت سے ہوگی؛ پرانی APK کو نئی APK سے اپ ڈیٹ کریں۔</p>
        <a className="primary" href="https://github.com/alisher049/SHER-AI/releases/latest/download/SHER-AI.apk" target="_blank" rel="noreferrer" style={{display:"inline-block",textDecoration:"none",marginTop:"8px",padding:"12px 16px",borderRadius:"10px"}}>نئی APK حاصل کریں</a>
      </div>
      <p className="chat-footnote">نوٹ: ویب/PWA ورژن سرور اور Service Worker کے ذریعے اپ ڈیٹ ہو سکتا ہے۔ Android APK کو خودکار طور پر خاموشی سے تبدیل نہیں کیا جا سکتا؛ نئی APK انسٹال کرنے کے لیے Android کی تصدیق ضروری ہے۔</p>
    </section>}

    {view === "images" && <section className="panel tool-panel"><div className="panel-icon">✧</div><div className="kicker">SHER AI CREATIVE STUDIO</div><h2>AI تصویر بنائیں</h2><p className="muted">اردو یا English میں تصویر کی تفصیل لکھیں۔</p><label htmlFor="imagePrompt">تصویر کی تفصیل</label><textarea id="imagePrompt" rows="4" value={imagePrompt} onChange={e=>setImagePrompt(e.target.value)} placeholder="مثلاً برفیلے پہاڑوں کے درمیان ایک خوبصورت گھر، cinematic style..."/><button className="primary" type="button" disabled={!imagePrompt.trim() || imageLoading} onClick={generateImage}>{imageLoading ? "تصویر بن رہی ہے…" : "✧ تصویر بنائیں"}</button>{imageError && <div className="notice" role="alert">{imageError}</div>}{generatedImage && <div className="smart-card"><img src={generatedImage} alt="SHER AI سے تیار کردہ تصویر" style={{display:"block",width:"100%",height:"auto",borderRadius:"14px"}}/><a className="primary" href={generatedImage} download={generatedImage.startsWith("data:image/jpeg") ? "sher-ai-image.jpg" : "sher-ai-image.png"} style={{display:"inline-block",textDecoration:"none",marginTop:"12px"}}>تصویر ڈاؤن لوڈ کریں</a></div>}<p className="chat-footnote">تصویر بنانے کے لیے Vercel پر GEMINI_API_KEY اور Google AI image model کی دستیابی ضروری ہے۔ استعمال پر Google کی قیمت اور حدود لاگو ہو سکتی ہیں۔</p></section>}

    <footer><span>SHER AI</span><span>آپ کا اپنا AI اسسٹنٹ</span></footer>
  </main>;
}


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://hltlskzpwqrhiedmomfx.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_EKo3T3p1J7vVYqMQdTN2oQ__Ig0O8N6";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const OWNER_EMAIL = "alishermeo049@gmail.com";

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("ur");
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const captureInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", captureInstall);
    return () => window.removeEventListener("beforeinstallprompt", captureInstall);
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }
  const [authMode, setAuthMode] = useState("signin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const t = language === "ur"
    ? {welcome:"SHER AI میں خوش آمدید", subtitle:authMode === "signup" ? "اپنا محفوظ اکاؤنٹ بنائیں۔" : "اپنے Email اور Password سے لاگ اِن کریں۔", email:"Gmail ایڈریس", password:"پاس ورڈ", confirm:"پاس ورڈ دوبارہ درج کریں", submit:authMode === "signup" ? "نیا اکاؤنٹ بنائیں" : "لاگ اِن کریں", invalid:"درست ای میل ایڈریس درج کریں۔", language:"English", switch:authMode === "signup" ? "پہلے سے اکاؤنٹ ہے؟ لاگ اِن کریں" : "نیا اکاؤنٹ بنائیں"}
    : {welcome:"Welcome to SHER AI", subtitle:authMode === "signup" ? "Create your secure account." : "Sign in with your email and password.", email:"Gmail address", password:"Password", confirm:"Confirm password", submit:authMode === "signup" ? "Create account" : "Sign in", invalid:"Enter a valid email address.", language:"اردو", switch:authMode === "signup" ? "Already have an account? Sign in" : "Create a new account"};

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user?.email?.toLowerCase() === OWNER_EMAIL) setSession(data.session);
      else if (data.session) await supabase.auth.signOut();
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession?.user?.email?.toLowerCase() === OWNER_EMAIL) setSession(nextSession);
      else setSession(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function submitAuth(event) {
    event.preventDefault();
    if (!supabase || busy) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) { setAuthError(t.invalid); return; }
    if (cleanEmail !== OWNER_EMAIL) { setAuthError("یہ SHER AI صرف مالک کے Gmail اکاؤنٹ کے لیے ہے۔"); return; }
    if (password.length < 8) { setAuthError("پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے۔"); return; }
    if (authMode === "signup" && password !== confirmPassword) { setAuthError("دونوں پاس ورڈ ایک جیسے نہیں ہیں۔"); return; }
    setEmail(cleanEmail); setBusy(true); setAuthError(""); setAuthMessage("");
    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password });
        if (error) throw error;
        if (data.session?.user?.email?.toLowerCase() === OWNER_EMAIL) {
          setSession(data.session);
        } else {
          setAuthMessage("اکاؤنٹ کی درخواست موصول ہوئی۔ Supabase میں Email Confirmations بند کریں تاکہ OTP یا Magic Link کے بغیر فوراً لاگ اِن ہو سکے۔");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        if (data.session?.user?.email?.toLowerCase() === OWNER_EMAIL) setSession(data.session);
        else { await supabase.auth.signOut(); throw new Error("اس ای میل کو SHER AI میں اجازت نہیں ہے۔"); }
      }
    } catch (error) {
      setAuthError(error.message || "لاگ اِن مکمل نہیں ہو سکا۔ دوبارہ کوشش کریں۔");
    } finally { setBusy(false); }
  }
  function switchAuthMode() {
    setAuthMode(mode => mode === "signin" ? "signup" : "signin");
    setPassword(""); setConfirmPassword(""); setAuthError(""); setAuthMessage("");
  }
  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setSession(null); setEmail(""); setPassword(""); setConfirmPassword(""); setAuthMode("signin");
  }

  if (!authReady) return <main className="auth-shell"><section className="auth-card"><img src="/icons/sher-ai-mark.svg" alt="SHER AI" style={{width:"64px",height:"64px",objectFit:"contain"}} /><h1>SHER AI</h1><p>لوڈ ہو رہا ہے…</p></section></main>;
  if (!session) return <main className="auth-shell" dir={language === "ur" ? "rtl" : "ltr"}>
    <>
    <div className="corner-tools">
      {installPrompt && <button className="corner-tool language-tool" type="button" onClick={installApp}>{language === "ur" ? "ایپ انسٹال کریں" : "Install app"}</button>}
      <button className="corner-tool" type="button" onClick={() => window.location.reload()} aria-label="Refresh">↻</button>
      <button className="corner-tool language-tool" type="button" onClick={() => setLanguage(v => v === "ur" ? "en" : "ur")}>{t.language}</button>
    </div>
    <section className="auth-card">
      <img className="brain auth-brain" src="/icons/sher-ai-mark.svg" alt="SHER AI" style={{width:"76px",height:"76px",objectFit:"contain"}} /><div className="kicker">SHER AI ACCOUNT</div>
      <h1>{t.welcome}</h1>
      <p className="auth-subtitle">{t.subtitle}</p>
      {!supabase ? <div className="notice">سائن اَپ ابھی فعال نہیں ہوا۔ منتظم کو Supabase کی سیٹنگز شامل کرنی ہوں گی۔</div> : <>
      <form onSubmit={submitAuth} className="auth-form">
        <label htmlFor="auth-email">{t.email}</label>
        <input id="auth-email" type="email" autoComplete="email" dir="ltr" value={email} onChange={e=>setEmail(e.target.value)} placeholder="alishermeo049@gmail.com" required disabled={busy} />
        <label htmlFor="auth-password">{t.password}</label>
        <input id="auth-password" type="password" autoComplete={authMode === "signup" ? "new-password" : "current-password"} dir="ltr" minLength="8" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
        {authMode === "signup" && <>
          <label htmlFor="auth-confirm">{t.confirm}</label>
          <input id="auth-confirm" type="password" autoComplete="new-password" dir="ltr" minLength="8" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="••••••••" required />
        </>}
        <button className="primary auth-submit" type="submit" disabled={busy}>{busy ? "براہِ کرم انتظار کریں…" : t.submit}</button>
        <button className="text-button" type="button" disabled={busy} onClick={switchAuthMode}>{t.switch}</button>
      </form>
      {authMessage && <div className="auth-success" role="status">{authMessage}</div>}
      {authError && <div className="notice" role="alert">{authError}</div>}
      <p className="auth-footnote">صرف مالک کا Gmail اکاؤنٹ استعمال ہوگا۔ Supabase میں Email Confirmations بند رکھیں تاکہ لاگ اِن صرف Email + Password سے ہو۔<br/>ایپ انسٹال کرنے کے لیے Chrome کے ⋮ مینو میں “Install app” یا “Add to Home screen” منتخب کریں۔</p>
      </>
    </section>
    </>
  </main>;
  return <AppContent accessToken={session.access_token} onSignOut={signOut} />;
}
