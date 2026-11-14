import {useState, type FormEvent} from 'react';
import {sendMessage,type ChatMessage} from './services/ai';

export default function App(){
 const [messages,setMessages]=useState<ChatMessage[]>([{role:'assistant',content:'السلام علیکم! میں SHER AI ہوں۔ آپ کس چیز میں مدد چاہتے ہیں؟'}]);
 const [draft,setDraft]=useState('');
 const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){
  e.preventDefault();const text=draft.trim();if(!text||busy)return;
  const next=[...messages,{role:'user' as const,content:text}];setMessages(next);setDraft('');setBusy(true);
  try{setMessages([...next,{role:'assistant',content:await sendMessage(next)}]);}
  catch{setMessages([...next,{role:'assistant',content:'معذرت، سروس سے رابطہ نہیں ہو سکا۔ دوبارہ کوشش کریں۔'}]);}
  finally{setBusy(false);}
 }
 return <main className="app-shell">
  <header className="topbar"><div className="brand-mark">✺</div><div><strong>SHER AI</strong><span>SMART INTELLIGENCE</span></div><div className="status"><i/> READY</div></header>
  <section className="hero"><div className="brain">✧</div><p className="eyebrow">YOUR AI COMPANION</p><h1>سوچیں بڑا۔<br/><em>پوچھیں SHER AI سے۔</em></h1><p className="sub">آپ کا ذہین ڈیجیٹل معاون</p></section>
  <section className="chat">{messages.map((m,i)=><div className={`message ${m.role}`} key={i}><span className="message-label">{m.role==='assistant'?'SHER AI':'YOU'}</span><p>{m.content}</p></div>)}{busy&&<div className="typing">SHER AI جواب تیار کر رہا ہے…</div>}</section>
  <form className="composer" onSubmit={submit}><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="اپنا سوال یہاں لکھیں…" aria-label="اپنا پیغام لکھیں"/><button disabled={busy||!draft.trim()} aria-label="Send message">↑</button></form>
  <footer>SHER AI · ابتدائی ورژن 0.1.0</footer>
 </main>;
}