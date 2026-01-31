
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from "@google/genai";

/**
 * קייטרינג הדרן - גרסה 6.0 (The Masterpiece)
 * שילוב של Supabase, LocalStorage ו-Gemini AI
 */

// --- CONFIGURATION ---
const getEnv = (key: string) => {
  const raw = (window as any).process?.env?.[key] || (process as any).env?.[key] || '';
  return raw.trim();
};

const SB_URL = getEnv('SUPABASE_URL');
const SB_KEY = getEnv('SUPABASE_ANON_KEY');
const GEMINI_KEY = getEnv('API_KEY');

const supabase = (SB_URL && SB_KEY && SB_URL.startsWith('http')) 
  ? createClient(SB_URL, SB_KEY) 
  : null;

const ai = GEMINI_KEY ? new GoogleGenAI({ apiKey: GEMINI_KEY }) : null;

// --- CONSTANTS ---
const SHABAT_DISHES = [
    {"id":"s1","name":"סלטים","top":7.85,"left":82.59,"width":3.97,"height":1.69},
    {"id":"s2","name":"בורגול","top":88.51,"left":79.69,"width":11.84,"height":1.14},
    {"id":"s3","name":"צ'מצ'ורי","top":86.09,"left":83.32,"width":8.20,"height":1.33},
    {"id":"s4","name":"חציל בטחינה","top":83.67,"left":84.56,"width":6.96,"height":1.08},
    {"id":"s5","name":"כרוב אדום","top":81.25,"left":83.71,"width":7.82,"height":1.14},
    {"id":"s6","name":"סלט זיתים","top":78.83,"left":87.64,"width":3.89,"height":1.02},
    {"id":"s7","name":"פלטת ירקות","top":76.42,"left":83.92,"width":7.61,"height":1.33},
    {"id":"s8","name":"חסה ושרי","top":74.24,"left":84.86,"width":7.43,"height":0.84},
    {"id":"s9","name":"חסה בטטה","top":71.64,"left":80.93,"width":10.60,"height":1.02},
    {"id":"s10","name":"פלפלים","top":69.22,"left":79.22,"width":13.08,"height":1.14},
    {"id":"s11","name":"חמוצים","top":66.98,"left":88.84,"width":3.46,"height":0.84},
    {"id":"s12","name":"תפו\"א טונה","top":64.32,"left":86.61,"width":4.91,"height":1.08},
    {"id":"s13","name":"סלק מרוקאי","top":61.97,"left":86.87,"width":4.66,"height":1.33},
    {"id":"s14","name":"סלק בתחמיץ","top":59.55,"left":86.57,"width":4.95,"height":1.39},
    {"id":"s15","name":"חריף מטוגן","top":57.13,"left":85.07,"width":6.45,"height":1.33},
    {"id":"s16","name":"סלט עגבניות","top":54.71,"left":84.82,"width":6.71,"height":1.14},
    {"id":"s17","name":"מתובל ירקות","top":52.29,"left":84.73,"width":6.79,"height":1.33},
    {"id":"s18","name":"גמבה במיונז","top":50.06,"left":84.52,"width":7.78,"height":0.84},
    {"id":"s19","name":"מלפפון בתחמיץ","top":47.52,"left":85.54,"width":5.94,"height":1.33},
    {"id":"s20","name":"כרוב סיני","top":45.28,"left":88.24,"width":4.06,"height":0.84},
    {"id":"s21","name":"כרוב דלעת","top":42.68,"left":79.86,"width":11.67,"height":1.14},
    {"id":"s22","name":"כרוב וגזר","top":40.44,"left":85.59,"width":5.94,"height":0.84},
    {"id":"s23","name":"מטבוחה","top":38.02,"left":88.45,"width":3.03,"height":0.84},
    {"id":"s24","name":"טחינה ירוקה","top":35.61,"left":86.87,"width":4.66,"height":1.08},
    {"id":"s25","name":"גזר ואננס","top":33.25,"left":86.87,"width":4.70,"height":0.78},
    {"id":"s26","name":"גזר פיקנטי","top":30.83,"left":87.51,"width":4.78,"height":1.08},
    {"id":"s27","name":"גזר מרוקאי","top":28.35,"left":87.38,"width":4.91,"height":1.14},
    {"id":"s28","name":"חומוס גרגרים","top":25.99,"left":86.48,"width":5.04,"height":0.78},
    {"id":"s29","name":"חומוס פטריות","top":23.51,"left":84.77,"width":6.75,"height":0.96},
    {"id":"s30","name":"חומוס טחינה","top":21.16,"left":85.20,"width":6.32,"height":0.90},
    {"id":"s31","name":"חציל בתחמיץ","top":18.56,"left":86.44,"width":5.08,"height":1.33},
    {"id":"s32","name":"חציל במיונז","top":16.08,"left":87.21,"width":4.31,"height":1.08},
    {"id":"s33","name":"חציל בטטה","top":13.66,"left":84.60,"width":6.92,"height":1.08},
    {"id":"f1","name":"סלמון","top":33.01,"left":65.28,"width":9.70,"height":1.51},
    {"id":"f2","name":"קציצות דג","top":30.83,"left":64.51,"width":10.43,"height":1.26},
    {"id":"f3","name":"טורטיה","top":28.17,"left":67.37,"width":7.56,"height":1.51},
    {"id":"f4","name":"בלינצ'ס","top":25.69,"left":66.39,"width":8.59,"height":1.33},
    {"id":"f5","name":"מושט","top":23.33,"left":62.50,"width":12.48,"height":1.33},
    {"id":"f6","name":"נסיכה","top":21.16,"left":70.20,"width":4.78,"height":1.26},
    {"id":"f7","name":"גפילטע","top":18.50,"left":66.65,"width":8.33,"height":1.51},
    {"id":"sp1","name":"מרק בטטה","top":45.28,"left":67.03,"width":7.73,"height":1.51},
    {"id":"sp2","name":"מרק ירקות","top":43.04,"left":70.20,"width":5.55,"height":1.33},
    {"id":"sp3","name":"מרק עוף","top":40.68,"left":71.14,"width":4.61,"height":1.26},
    {"id":"m1","name":"צלי בשר","top":68.98,"left":68.61,"width":7.22,"height":1.51},
    {"id":"m2","name":"שניצל אפוי","top":66.56,"left":65.71,"width":9.19,"height":1.51},
    {"id":"m3","name":"עוף ממולא","top":64.14,"left":62.54,"width":12.35,"height":1.51},
    {"id":"m4","name":"סטייק עוף","top":61.97,"left":70.62,"width":4.27,"height":1.26},
    {"id":"m5","name":"כרעיים","top":59.31,"left":69.51,"width":5.38,"height":1.33},
    {"id":"m6","name":"רולדה הודו","top":56.89,"left":65.07,"width":9.83,"height":1.51},
    {"id":"m7","name":"שניצל","top":54.47,"left":72.38,"width":2.52,"height":1.20},
    {"id":"sd1","name":"פסטה","top":42.56,"left":53.05,"width":6.45,"height":1.02},
    {"id":"sd2","name":"אנטיפסטי","top":40.14,"left":55.28,"width":4.23,"height":0.96},
    {"id":"sd3","name":"מוקפצים","top":37.72,"left":53.01,"width":7.52,"height":1.26},
    {"id":"sd4","name":"שעועית עגבניות","top":35.30,"left":47.07,"width":12.44,"height":1.26},
    {"id":"sd5","name":"שעועית פלפל","top":32.64,"left":47.71,"width":11.79,"height":1.33},
    {"id":"sd6","name":"אפונה וגזר","top":30.47,"left":51.98,"width":7.52,"height":0.96},
    {"id":"sd7","name":"תפו\"א פפריקה","top":27.81,"left":49.46,"width":10.04,"height":1.51},
    {"id":"sd8","name":"תפו\"א בצל","top":25.39,"left":47.79,"width":11.71,"height":1.26},
    {"id":"sd9","name":"תפו\"א צ'יפס","top":23.03,"left":52.07,"width":7.43,"height":1.20},
    {"id":"sd10","name":"אורז צהוב","top":20.85,"left":55.28,"width":4.23,"height":0.96},
    {"id":"sd11","name":"אורז כתום","top":18.44,"left":55.19,"width":4.31,"height":0.90},
    {"id":"sd12","name":"אורז פטריות","top":15.77,"left":50.36,"width":9.14,"height":1.26},
    {"id":"sd13","name":"אורז שקדים","top":13.36,"left":47.07,"width":12.44,"height":1.51},
    {"id":"d1","name":"פירות יער","top":71.88,"left":55.57,"width":3.80,"height":1.02},
    {"id":"d2","name":"לוטוס","top":69.28,"left":56.99,"width":2.43,"height":1.14},
    {"id":"d3","name":"נוגט","top":66.86,"left":54.21,"width":5.21,"height":1.51},
    {"id":"d4","name":"טירמיסו","top":64.69,"left":56.64,"width":2.73,"height":0.90},
    {"id":"d5","name":"מוס שוקולד","top":62.03,"left":54.33,"width":5.04,"height":1.51},
    {"id":"d6","name":"סלט פירות","top":59.55,"left":55.06,"width":4.31,"height":1.20},
    {"id":"d7","name":"תפוח","top":57.37,"left":53.39,"width":6.92,"height":1.33},
    {"id":"d8","name":"שוקולד אמיתי","top":54.71,"left":51.17,"width":8.20,"height":1.51},
    {"id":"d9","name":"גלידה וניל","top":49.93,"left":49.29,"width":10.13,"height":3.92},
    {"id":"b1","name":"קוגל תפו\"א בוקר","top":33.61,"left":37.75,"width":4.83,"height":1.51},
    {"id":"b2","name":"פסטרמות","top":31.43,"left":38.34,"width":4.23,"height":0.90},
    {"id":"b3","name":"גפילטע בוקר","top":28.77,"left":37.53,"width":5.08,"height":1.26},
    {"id":"b4","name":"סלט ביצים","top":26.36,"left":38.13,"width":4.44,"height":1.14},
    {"id":"b5","name":"כבד קצוץ","top":24.18,"left":38.56,"width":4.91,"height":1.26},
    {"id":"b6","name":"קוגל אטריות בוקר","top":21.52,"left":37.28,"width":6.19,"height":1.51},
    {"id":"ch1","name":"צ'ולנט","top":39.29,"left":30.91,"width":11.58,"height":1.51},
    {"id":"ch2","name":"שניצל שוקיים","top":45.46,"left":31.80,"width":10.64,"height":1.45},
    {"id":"sh1","name":"סלט טונה","top":80.22,"left":38.43,"width":4.14,"height":1.20},
    {"id":"sh2","name":"הרינג","top":77.75,"left":31.68,"width":10.85,"height":1.33},
    {"id":"sh3","name":"פשטידת פטריות","top":73.21,"left":35.52,"width":7.01,"height":0.96},
    {"id":"sh4","name":"פשטידת בצל","top":70.55,"left":36.98,"width":5.55,"height":1.20},
    {"id":"sh5","name":"קוגל אטריות שלישית","top":68.13,"left":37.23,"width":5.30,"height":1.51},
    {"id":"sh6","name":"פשטידת תפו\"א","top":65.77,"left":35.95,"width":6.58,"height":1.14},
    {"id":"u1","name":"סול מטוגן","top":89.90,"left":38.52,"width":4.06,"height":1.51},
    {"id":"u2","name":"סלמון שדרוג","top":87.48,"left":38.09,"width":4.48,"height":1.51},
    {"id":"u3","name":"שניצל נסיכה","top":85.06,"left":37.23,"width":5.34,"height":1.14}
];

// SQL SCRIPT FOR FIXING SUPABASE
const FIX_SQL = `
create table if not exists event_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text,
  email text,
  phone text,
  event_date date,
  location text,
  guest_count integer,
  status text default 'PENDING',
  selections jsonb default '{}'::jsonb
);

alter table event_requests enable row level security;
create policy "Public Access" on event_requests for all using (true) with check (true);
`;

// --- DATA LAYER (OFFLINE FIRST) ---
const db = {
  async save(order: any) {
    let result = null;
    if (supabase) {
      try {
        const { data, error } = await supabase.from('event_requests').insert([{ ...order, status: 'PENDING' }]).select().single();
        if (!error) result = data;
      } catch (e) { console.warn("Supabase save failed, using local fallback"); }
    }
    const current = JSON.parse(localStorage.getItem('orders_v6') || '[]');
    const newOrder = result || { ...order, id: 'local_' + Date.now(), status: 'PENDING', created_at: new Date().toISOString() };
    localStorage.setItem('orders_v6', JSON.stringify([...current, newOrder]));
    return newOrder;
  },
  async list() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('event_requests').select('*').order('created_at', { ascending: false });
        if (!error) return data;
      } catch (e) { }
    }
    return JSON.parse(localStorage.getItem('orders_v6') || '[]');
  },
  async get(id: string) {
    if (supabase && !id.startsWith('local_')) {
      try {
        const { data, error } = await supabase.from('event_requests').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (e) { }
    }
    return JSON.parse(localStorage.getItem('orders_v6') || '[]').find((o: any) => o.id === id);
  },
  async update(id: string, updates: any) {
    if (supabase && !id.startsWith('local_')) {
      try { await supabase.from('event_requests').update(updates).eq('id', id); } catch (e) { }
    }
    const current = JSON.parse(localStorage.getItem('orders_v6') || '[]');
    const idx = current.findIndex((o: any) => o.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      localStorage.setItem('orders_v6', JSON.stringify(current));
    }
  }
};

// --- GEMINI SERVICE ---
const geminiAssistant = async (prompt: string) => {
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional catering assistant for "Hadran Catering". 
      Based on the following user request, return a JSON array of dish IDs from the list below that match their needs. 
      Only return the IDs, nothing else.
      User Request: "${prompt}"
      Available Dishes: ${JSON.stringify(SHABAT_DISHES.map(d => ({id: d.id, name: d.name})))}`
    });
    const text = response.text.trim();
    const match = text.match(/\[.*\]/s);
    return match ? JSON.parse(match[0]) : [];
  } catch (e) {
    console.error("Gemini failed:", e);
    return null;
  }
};

// --- UI COMPONENTS ---

const Diagnostic = () => {
  const [report, setReport] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const check = async () => {
    const r: any = { ok: false, msg: 'בודק חיבור...' };
    if (!SB_URL || !SB_KEY) r.msg = 'מפתחות SUPABASE חסרים בהגדרות!';
    else if (!supabase) r.msg = 'שגיאת אתחול. בדוק את ה-URL.';
    else {
      try {
        const { error } = await supabase.from('event_requests').select('id').limit(1);
        if (error) r.msg = `שגיאה מהשרת: ${error.message} (${error.code})`;
        else { r.ok = true; r.msg = 'מחובר ל-Supabase בהצלחה! ✅'; }
      } catch (e: any) { r.msg = `שגיאת רשת: ${e.message}`; }
    }
    setReport(r);
  };

  useEffect(() => { check(); }, []);

  return (
    <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '50px', height: '50px', borderRadius: '50%', background: report?.ok ? '#10b981' : '#ef4444',
        border: 'none', color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', cursor: 'pointer'
      }}><i className={`fa-solid ${report?.ok ? 'fa-cloud' : 'fa-plug-circle-exclamation'}`}></i></button>
      {open && (
        <div className="fade-in" style={{
          position: 'absolute', bottom: '60px', left: 0, width: '320px', background: 'white',
          padding: '25px', borderRadius: '25px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', direction: 'rtl'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>סטטוס מערכת</h4>
          <p style={{ fontSize: '13px', color: report?.ok ? '#10b981' : '#991b1b', fontWeight: 700 }}>{report?.msg}</p>
          {!report?.ok && (
            <div style={{ marginTop: '15px' }}>
              <p style={{ fontSize: '11px', opacity: 0.7 }}>כדי לתקן, הרץ את הקוד הזה ב-Supabase SQL Editor:</p>
              <textarea readOnly value={FIX_SQL} style={{ width: '100%', height: '80px', fontSize: '10px', background: '#f8fafc', border: '1px solid #ddd', padding: '5px', borderRadius: '8px' }} />
              <button onClick={() => navigator.clipboard.writeText(FIX_SQL)} style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '8px', background: '#0f172a', color: 'white', cursor: 'pointer' }}>העתק קוד SQL</button>
            </div>
          )}
          <button onClick={check} style={{ width: '100%', marginTop: '10px', padding: '5px', background: 'none', border: '1px solid #eee', cursor: 'pointer' }}>בדוק שוב</button>
        </div>
      )}
    </div>
  );
};

const Landing = () => {
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', eventDate: '', location: '', guestCount: 50 });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await db.save(form);
    setDone(true);
    setLoading(false);
  };

  if (done) return (
    <div className="fade-in" style={{ textAlign: 'center', padding: '150px 20px' }}>
      <div style={{ width: '100px', height: '100px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
        <i className="fa-solid fa-check" style={{ fontSize: '40px', color: '#166534' }}></i>
      </div>
      <h2 className="font-serif" style={{ fontSize: '42px' }}>הבקשה נשלחה!</h2>
      <p style={{ color: '#64748b' }}>צוות קייטרינג הדרן יחזור אליכם בהקדם.</p>
      <button onClick={() => setDone(false)} className="nav-btn" style={{ marginTop: '40px' }}>חזרה לדף הבית</button>
    </div>
  );

  return (
    <div className="fade-in">
      <header style={{ 
        height: '80vh', background: 'linear-gradient(rgba(15,23,42,0.8), rgba(15,23,42,0.8)), url("https://images.unsplash.com/photo-1555244162-803834f70033?w=1600")',
        backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center'
      }}>
        <h1 className="font-serif" style={{ fontSize: 'clamp(4rem, 12vw, 8rem)', margin: 0 }}>קייטרינג <span style={{ color: 'var(--gold)' }}>הדרן</span></h1>
        <p style={{ fontSize: '24px', opacity: 0.9, fontWeight: 300 }}>יוקרה קולינרית בכשרות המהודרת ביותר</p>
        <a href="#book" className="nav-btn" style={{ marginTop: '50px', padding: '20px 60px', fontSize: '20px' }}>הזמינו אירוע</a>
      </header>

      <section id="book" style={{ padding: '100px 5%', marginTop: '-120px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '40px', padding: '60px', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 className="font-serif" style={{ fontSize: '32px' }}>טופס שריון תאריך</h2>
            <p style={{ color: '#64748b' }}>מלאו את הפרטים לקבלת גישה לבחירת מנות</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            <input required placeholder="שם מלא" style={{ padding: '18px', borderRadius: '15px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
            <input required placeholder="טלפון" style={{ padding: '18px', borderRadius: '15px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            <input required type="email" placeholder="אימייל" style={{ padding: '18px', borderRadius: '15px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <input required type="date" style={{ padding: '18px', borderRadius: '15px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} />
            <input required placeholder="מיקום" style={{ padding: '18px', borderRadius: '15px', border: '1px solid #e2e8f0', background: '#f8fafc', gridColumn: 'span 2' }} value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            <button disabled={loading} className="nav-btn" style={{ gridColumn: 'span 2', padding: '22px', fontSize: '18px' }}>
              {loading ? 'שולח...' : 'שלח בקשה'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

const Admin = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await db.list();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loader-container"><div className="loader-spin"></div></div>;

  return (
    <div className="fade-in" style={{ padding: '80px 5%', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="font-serif" style={{ fontSize: '40px', marginBottom: '40px' }}>ניהול אירועים</h1>
      <div style={{ background: 'white', borderRadius: '30px', overflow: 'hidden', border: '1px solid #eee' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '20px' }}>לקוח</th>
              <th style={{ padding: '20px' }}>תאריך</th>
              <th style={{ padding: '20px' }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '20px' }}><strong>{o.customerName}</strong></td>
                <td style={{ padding: '20px' }}>{new Date(o.eventDate).toLocaleDateString('he-IL')}</td>
                <td style={{ padding: '20px' }}><Link to={`/order/${o.id}`} style={{ color: 'var(--gold)', fontWeight: 800 }}>ערוך תפריט</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MenuSelection = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [selections, setSelections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    db.get(id!).then(res => {
      if (res) {
        setOrder(res);
        if (res.selections?.dishes) setSelections(res.selections.dishes);
      }
      setLoading(false);
    });
  }, [id]);

  const toggle = (sid: string) => {
    setSelections(prev => prev.includes(sid) ? prev.filter(i => i !== sid) : [...prev, sid]);
  };

  const handleAiAssistant = async () => {
    if (!aiPrompt) return;
    setAiLoading(true);
    const suggestedIds = await geminiAssistant(aiPrompt);
    if (suggestedIds && suggestedIds.length > 0) {
      setSelections(prev => Array.from(new Set([...prev, ...suggestedIds])));
    }
    setAiLoading(false);
    setAiPrompt('');
  };

  const save = async () => {
    await db.update(id!, { selections: { dishes: selections }, status: 'COMPLETED' });
    alert('התפריט נשמר!');
  };

  if (loading) return <div className="loader-container"><div className="loader-spin"></div></div>;

  return (
    <div className="fade-in" style={{ padding: '50px 5%' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 className="font-serif">בחירת תפריט - {order?.customerName}</h1>
        <div style={{ maxWidth: '600px', margin: '20px auto', display: 'flex', gap: '10px' }}>
           <input 
             placeholder="עוזר AI: רשום מה הסגנון שאתה אוהב..." 
             style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #ddd' }}
             value={aiPrompt}
             onChange={e => setAiPrompt(e.target.value)}
           />
           <button onClick={handleAiAssistant} disabled={aiLoading} className="nav-btn" style={{ padding: '10px 25px' }}>
              {aiLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '50px', maxWidth: '1500px', margin: '0 auto' }}>
        <div style={{ position: 'relative', background: 'white', padding: '15px', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
          <img src="https://images.unsplash.com/photo-1547928576-a4a33237eceb?w=1400" style={{ width: '100%', borderRadius: '20px', display: 'block' }} />
          {SHABAT_DISHES.map(dish => (
            <div 
              key={dish.id} 
              className={`dish-hotspot ${selections.includes(dish.id) ? 'selected' : ''}`}
              style={{ top: `${dish.top}%`, left: `${dish.left}%`, width: `${dish.width}%`, height: `${dish.height}%` }}
              onClick={() => toggle(dish.id)}
            />
          ))}
        </div>

        <aside style={{ background: '#0f172a', color: 'white', padding: '40px', borderRadius: '40px', height: 'fit-content', position: 'sticky', top: '100px' }}>
          <h3 className="font-serif" style={{ color: 'var(--gold)', marginBottom: '25px' }}>מנות שנבחרו ({selections.length})</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {selections.map(sid => (
              <div key={sid} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px', marginBottom: '8px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                {SHABAT_DISHES.find(d => d.id === sid)?.name}
                <i className="fa-solid fa-xmark" style={{ opacity: 0.3, cursor: 'pointer' }} onClick={() => toggle(sid)}></i>
              </div>
            ))}
          </div>
          <button onClick={save} className="nav-btn" style={{ width: '100%', marginTop: '30px' }}>שמור בחירה</button>
        </aside>
      </div>
    </div>
  );
};

// --- APP ---
const App = () => (
  <Router>
    <nav className="navbar">
      <Link to="/" className="logo font-serif" style={{ textDecoration: 'none', color: 'var(--dark)', fontSize: '28px', fontWeight: 800 }}>קייטרינג <span style={{ color: 'var(--gold)' }}>הדרן</span></Link>
      <Link to="/admin" style={{ textDecoration: 'none', color: 'var(--slate)', fontWeight: 700 }}>ניהול</Link>
    </nav>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/order/:id" element={<MenuSelection />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    <Diagnostic />
  </Router>
);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
