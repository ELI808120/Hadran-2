
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

/**
 * קייטרינג הדרן - גרסה 2.0 משופרת
 * כוללת ניהול מסד נתונים היברידי, תפריט ויזואלי מלא ועיצוב פרימיום.
 */

// --- CONFIG & ENV ---
// ניסיון גישה למשתנים בכמה דרכים כדי להבטיח חיבור
const getEnv = (key: string) => {
  return (window as any).process?.env?.[key] || (process as any).env?.[key] || '';
};

const SUPABASE_URL = getEnv('SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY');

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http')) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// --- DATA: ALL 93 DISHES FROM CONSTANTS ---
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

// --- DATABASE SERVICE ---
const db = {
  async test() {
    if (!supabase) return { ok: false, msg: 'מפתח חסר (סביבה מוגבלת)' };
    try {
      // בדיקה ע"י שאילתה פשוטה
      const { error } = await supabase.from('event_requests').select('id').limit(1);
      if (error) throw error;
      return { ok: true, msg: 'מחובר ל-Supabase' };
    } catch (e: any) {
      return { ok: false, msg: 'שגיאת התחברות לשרת' };
    }
  },
  async saveRequest(data: any) {
    if (supabase) {
      const { data: res, error } = await supabase.from('event_requests').insert([{ ...data, status: 'PENDING' }]).select().single();
      if (error) throw error;
      return res;
    } else {
      const store = JSON.parse(localStorage.getItem('hadran_orders') || '[]');
      const newOrder = { ...data, id: 'local_' + Date.now(), status: 'PENDING', created_at: new Date().toISOString() };
      store.push(newOrder);
      localStorage.setItem('hadran_orders', JSON.stringify(store));
      return newOrder;
    }
  },
  async fetchAll() {
    if (supabase) {
      const { data, error } = await supabase.from('event_requests').select('*').order('created_at', { ascending: false });
      if (!error) return data;
    }
    return JSON.parse(localStorage.getItem('hadran_orders') || '[]');
  },
  async getById(id: string) {
    if (supabase && !id.startsWith('local_')) {
      const { data, error } = await supabase.from('event_requests').select('*').eq('id', id).maybeSingle();
      if (!error && data) return data;
    }
    return JSON.parse(localStorage.getItem('hadran_orders') || '[]').find((o: any) => o.id === id);
  },
  async updateMenu(id: string, selections: any) {
    if (supabase && !id.startsWith('local_')) {
      const { error } = await supabase.from('event_requests').update({ selections, status: 'COMPLETED' }).eq('id', id);
      if (!error) return;
    }
    const store = JSON.parse(localStorage.getItem('hadran_orders') || '[]');
    const idx = store.findIndex((o: any) => o.id === id);
    if (idx !== -1) {
      store[idx] = { ...store[idx], selections, status: 'COMPLETED' };
      localStorage.setItem('hadran_orders', JSON.stringify(store));
    }
  }
};

// --- COMPONENTS ---

const StatusIndicator = () => {
  const [status, setStatus] = useState<'testing' | 'online' | 'offline'>('testing');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    db.test().then(res => setStatus(res.ok ? 'online' : 'offline'));
  }, []);

  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      style={{
        position: 'fixed', bottom: '20px', left: '20px', zIndex: 3000,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        padding: expanded ? '15px 25px' : '10px', borderRadius: expanded ? '20px' : '50%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}
    >
      <div style={{
        width: '12px', height: '12px', borderRadius: '50%',
        backgroundColor: status === 'online' ? '#10b981' : status === 'offline' ? '#ef4444' : '#f59e0b',
        boxShadow: `0 0 15px ${status === 'online' ? '#10b981' : '#ef4444'}`
      }} />
      {expanded && (
        <div style={{fontSize: '13px', fontWeight: 600}}>
          {status === 'online' ? 'מסד נתונים בענן פעיל' : 'מצב עבודה מקומי (Local)'}
          <div style={{fontSize: '11px', opacity: 0.6, marginTop: '2px'}}>לחצו לסגירה</div>
        </div>
      )}
    </div>
  );
};

const Landing = () => {
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', eventDate: '', location: '', guestCount: 50 });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await db.saveRequest(form);
      setDone(true);
    } catch (e) {
      alert('שגיאה בשמירה. נסה שוב מאוחר יותר.');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="fade-in" style={{textAlign: 'center', padding: '120px 5%'}}>
      <div style={{maxWidth: '650px', margin: '0 auto', background: 'white', padding: '80px', borderRadius: '50px', boxShadow: '0 40px 100px rgba(0,0,0,0.08)'}}>
        <div style={{width: '100px', height: '100px', background: 'var(--gold-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px'}}>
           <i className="fa-solid fa-check" style={{fontSize: '40px', color: 'var(--gold-dark)'}}></i>
        </div>
        <h2 className="font-serif" style={{fontSize: '42px', marginBottom: '25px'}}>הבקשה התקבלה!</h2>
        <p style={{fontSize: '19px', color: 'var(--slate)', lineHeight: 1.6}}>תודה {form.customerName}, צוות הדרן יבדוק את היומן ויחזור אליך בהקדם עם לינק אישי לבחירת המנות.</p>
        <button onClick={() => window.location.reload()} className="nav-btn" style={{marginTop: '50px', padding: '20px 50px'}}>חזרה לדף הבית</button>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <section style={{
        height: '90vh', background: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url("https://images.unsplash.com/photo-1555244162-803834f70033?w=1600")',
        backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', padding: '20px'
      }}>
        <div style={{border: '1px solid var(--gold)', padding: '10px 25px', borderRadius: '50px', color: 'var(--gold)', fontSize: '14px', fontWeight: 700, letterSpacing: '2px', marginBottom: '30px'}} className="fade-in">EXCEPTIONAL CATERING</div>
        <h1 className="font-serif" style={{fontSize: 'clamp(3.5rem, 12vw, 7.5rem)', margin: 0, lineHeight: 0.9}}>קייטרינג <span style={{color: 'var(--gold)', fontStyle: 'italic'}}>הדרן</span></h1>
        <p style={{fontSize: '24px', maxWidth: '850px', fontWeight: 300, marginTop: '35px', opacity: 0.9, lineHeight: 1.5}}>אמנות קולינרית לאירועי יוקרה. טעמים בלתי נשכחים בכשרות מהדרין המהודרת ביותר.</p>
        <div style={{display: 'flex', gap: '20px', marginTop: '60px'}}>
            <a href="#booking" className="nav-btn" style={{padding: '22px 65px', fontSize: '20px'}}>התחילו הזמנה</a>
            <Link to="/admin" style={{background: 'rgba(255,255,255,0.1)', color: 'white', padding: '22px 40px', borderRadius: '50px', textDecoration: 'none', fontWeight: 700, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'}}>אזור מנהלים</Link>
        </div>
      </section>

      <section id="booking" style={{padding: '120px 5%', marginTop: '-150px'}}>
        <div style={{maxWidth: '1000px', margin: '0 auto', background: 'white', borderRadius: '60px', padding: '80px', boxShadow: '0 50px 120px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9'}}>
          <div style={{textAlign: 'center', marginBottom: '60px'}}>
            <h2 className="font-serif" style={{fontSize: '42px', marginBottom: '15px'}}>שריון תאריך לאירוע</h2>
            <p style={{color: 'var(--slate)', opacity: 0.7}}>מלאו את הפרטים ואנו נתחיל לעצב את האירוע שלכם</p>
          </div>
          <form onSubmit={submit} style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '35px'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <label style={{fontWeight: 700, fontSize: '14px', color: 'var(--slate)', marginRight: '10px'}}>שם מלא</label>
              <input required style={{padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', transition: '0.3s'}} placeholder="ישראל ישראלי" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <label style={{fontWeight: 700, fontSize: '14px', color: 'var(--slate)', marginRight: '10px'}}>טלפון</label>
              <input required type="tel" style={{padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none'}} placeholder="050-0000000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <label style={{fontWeight: 700, fontSize: '14px', color: 'var(--slate)', marginRight: '10px'}}>אימייל</label>
              <input required type="email" style={{padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none'}} placeholder="mail@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <label style={{fontWeight: 700, fontSize: '14px', color: 'var(--slate)', marginRight: '10px'}}>תאריך האירוע המבוקש</label>
              <input required type="date" style={{padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none'}} value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <label style={{fontWeight: 700, fontSize: '14px', color: 'var(--slate)', marginRight: '10px'}}>מיקום</label>
              <input required style={{padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none'}} placeholder="שם האולם / עיר" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <label style={{fontWeight: 700, fontSize: '14px', color: 'var(--slate)', marginRight: '10px'}}>כמות אורחים</label>
              <input required type="number" style={{padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none'}} value={form.guestCount} onChange={e => setForm({...form, guestCount: Number(e.target.value)})} />
            </div>
            <button disabled={loading} style={{gridColumn: '1 / -1', padding: '24px', marginTop: '20px', fontSize: '20px'}} className="nav-btn">
              {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'שלח בקשה וקבל אישור'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

const MenuSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [selections, setSelections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) db.getById(id).then(res => { 
        if(res) {
            setOrder(res); 
            if(res.selections?.dishes) setSelections(res.selections.dishes);
        }
        setLoading(false); 
    });
  }, [id]);

  const toggle = (itemId: string) => {
    setSelections(prev => prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]);
  };

  const save = async () => {
    if (!id) return;
    try {
      await db.updateMenu(id, { dishes: selections });
      alert('הבחירות נשמרו בהצלחה! צוות הדרן יכין את הכל עבורכם.');
      navigate('/');
    } catch (e) { alert('שגיאה בשמירה'); }
  };

  if (loading) return <div className="loader-container"><div className="loader-spin"></div></div>;
  if (!order) return <div style={{padding: '150px', textAlign: 'center'}}><h2 className="font-serif">הזמנה לא נמצאה.</h2><Link to="/" className="text-gold">חזרה לדף הבית</Link></div>;

  return (
    <div className="fade-in" style={{padding: '80px 5%'}}>
      <header style={{textAlign: 'center', marginBottom: '80px', maxWidth: '800px', margin: '0 auto 80px'}}>
        <h1 className="font-serif" style={{fontSize: '48px', marginBottom: '20px'}}>בחירת תפריט יוקרה</h1>
        <p style={{fontSize: '20px', opacity: 0.7, lineHeight: 1.6}}>שלום <strong>{order.customerName}</strong>, הנכם מוזמנים לסמן את המנות המועדפות עליכם בתפריט השבת המלא שלנו. הבחירות שלכם יועברו ישירות למטבח.</p>
      </header>
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 400px', gap: '60px', maxWidth: '1600px', margin: '0 auto'}}>
        <div style={{position: 'relative', background: 'white', padding: '20px', borderRadius: '40px', boxShadow: '0 30px 80px rgba(0,0,0,0.12)', border: '1px solid #eee'}}>
          <img src="https://images.unsplash.com/photo-1547928576-a4a33237eceb?w=1400" alt="Shabat Menu" style={{width: '100%', borderRadius: '25px', display: 'block'}} />
          {SHABAT_DISHES.map(dish => (
            <div 
              key={dish.id} 
              title={dish.name}
              className={`dish-hotspot ${selections.includes(dish.id) ? 'selected' : ''}`}
              style={{top: `${dish.top}%`, left: `${dish.left}%`, width: `${dish.width}%`, height: `${dish.height}%`}}
              onClick={() => toggle(dish.id)}
            />
          ))}
        </div>

        <aside style={{background: 'var(--dark)', color: 'white', borderRadius: '45px', padding: '50px', height: 'fit-content', position: 'sticky', top: '120px', border: '1px solid rgba(255,255,255,0.05)'}}>
          <h3 className="font-serif" style={{fontSize: '32px', color: 'var(--gold)', marginBottom: '35px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '20px'}}>המנות שבחרתם ({selections.length})</h3>
          <div style={{maxHeight: '450px', overflowY: 'auto', marginBottom: '40px'}} className="custom-scrollbar">
            {selections.length === 0 ? <p style={{opacity: 0.4, fontStyle: 'italic'}}>לחצו על המנות בתפריט הויזואלי כדי להוסיף אותן...</p> : (
              selections.map(sid => {
                const item = SHABAT_DISHES.find(d => d.id === sid);
                return (
                  <div key={sid} style={{background: 'rgba(255,255,255,0.05)', padding: '18px 25px', borderRadius: '18px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s', border: '1px solid rgba(255,255,255,0.02)'}}>
                    <span style={{fontWeight: 600, fontSize: '15px'}}>{item?.name || 'מנה לא מזוהה'}</span>
                    <i className="fa-solid fa-xmark" style={{cursor: 'pointer', opacity: 0.5, fontSize: '18px'}} onClick={() => toggle(sid)}></i>
                  </div>
                );
              })
            )}
          </div>
          <button disabled={selections.length === 0} onClick={save} className="nav-btn" style={{width: '100%', padding: '22px', borderRadius: '25px', fontSize: '18px'}}>סיים ושמור הזמנה</button>
        </aside>
      </div>
    </div>
  );
};

const Admin = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { db.fetchAll().then(res => { setOrders(res); setLoading(false); }); }, []);

  if (loading) return <div className="loader-container"><div className="loader-spin"></div></div>;

  return (
    <div className="fade-in" style={{padding: '80px 5%', maxWidth: '1400px', margin: '0 auto'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px'}}>
        <div>
           <h1 className="font-serif" style={{fontSize: '48px', margin: 0}}>ניהול אירועים</h1>
           <p style={{opacity: 0.5, marginTop: '10px'}}>צפייה וניהול בקשות האירוח של קייטרינג הדרן</p>
        </div>
        <button onClick={() => window.location.reload()} className="nav-btn" style={{background: 'var(--slate)', display: 'flex', alignItems: 'center', gap: '10px'}}><i className="fa-solid fa-rotate"></i> רענן נתונים</button>
      </div>
      
      <div style={{background: 'white', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 30px 90px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'right'}}>
          <thead style={{background: '#f8fafc'}}>
            <tr style={{borderBottom: '2px solid #edf2f7'}}>
              <th style={{padding: '25px'}}>לקוח / מארח</th>
              <th style={{padding: '25px'}}>תאריך ומיקום</th>
              <th style={{padding: '25px'}}>סטטוס</th>
              <th style={{padding: '25px'}}>בחירות</th>
              <th style={{padding: '25px'}}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{borderBottom: '1px solid #f1f5f9', transition: '0.2s'}} className="hover-row">
                <td style={{padding: '25px'}}>
                  <div style={{fontWeight: 700, fontSize: '17px'}}>{o.customerName}</div>
                  <div style={{fontSize: '13px', color: '#94a3b8', marginTop: '4px'}}>{o.phone} | {o.email}</div>
                </td>
                <td style={{padding: '25px'}}>
                  <div style={{fontWeight: 600}}>{new Date(o.eventDate).toLocaleDateString('he-IL')}</div>
                  <div style={{fontSize: '13px', color: '#94a3b8', marginTop: '4px'}}>{o.location} ({o.guestCount} איש)</div>
                </td>
                <td style={{padding: '25px'}}>
                  <span style={{
                    padding: '8px 18px', borderRadius: '50px', fontSize: '13px', fontWeight: 800,
                    background: o.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                    color: o.status === 'COMPLETED' ? '#166534' : '#92400e',
                    border: `1px solid ${o.status === 'COMPLETED' ? '#bbf7d0' : '#fde68a'}`
                  }}>{o.status === 'COMPLETED' ? 'הושלם' : 'ממתין'}</span>
                </td>
                <td style={{padding: '25px'}}>
                  <div style={{fontSize: '13px', color: 'var(--slate)'}}>
                    {o.selections?.dishes?.length || 0} מנות נבחרו
                  </div>
                </td>
                <td style={{padding: '25px'}}>
                  <Link to={`/order/${o.id}`} style={{color: 'var(--gold-dark)', fontWeight: 800, textDecoration: 'none', background: 'var(--gold-light)', padding: '10px 20px', borderRadius: '12px', fontSize: '14px'}}>צפה ונהל</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div style={{padding: '100px', textAlign: 'center', color: '#94a3b8'}}><i className="fa-regular fa-folder-open" style={{fontSize: '40px', display: 'block', marginBottom: '15px'}}></i>אין הזמנות חדשות במערכת</div>}
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => (
  <Router>
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <nav className="navbar">
        <Link to="/" className="logo font-serif" style={{textDecoration: 'none', color: 'var(--dark)', fontSize: '30px', fontWeight: 800}}>קייטרינג <span style={{color: 'var(--gold)'}}>הדרן</span></Link>
        <div style={{display: 'flex', gap: '30px', alignItems: 'center'}}>
          <Link to="/admin" style={{textDecoration: 'none', color: 'var(--slate)', fontWeight: 700, fontSize: '15px', borderBottom: '2px solid transparent', transition: '0.3s'}} className="nav-link">אזור ניהול</Link>
          <a href="/#booking" className="nav-btn">הזמן עכשיו</a>
        </div>
      </nav>
      
      <main style={{flexGrow: 1}}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/order/:id" element={<MenuSelection />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <footer style={{background: 'var(--dark)', color: 'white', padding: '100px 5%', textAlign: 'center', borderTop: '5px solid var(--gold)'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
            <h2 className="font-serif" style={{fontSize: '42px', color: 'var(--gold)', marginBottom: '30px'}}>קייטרינג הדרן</h2>
            <p style={{opacity: 0.6, maxWidth: '700px', margin: '0 auto 50px', fontSize: '18px', lineHeight: 1.8}}>
                מובילים בתחום הקייטרינג לאירועי יוקרה, שבתות חתן ושמחות משפחתיות. 
                מטבח המהדרין שלנו משלב חומרי גלם משובחים עם הגשה עוצרת נשימה.
            </p>
            <div style={{display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '30px', marginBottom: '50px'}}>
              {/* Fix: Merged duplicate className attributes on social icons */}
              <i className="fa-brands fa-instagram social-icon" style={{cursor: 'pointer', transition: '0.3s'}}></i>
              <i className="fa-brands fa-whatsapp social-icon" style={{cursor: 'pointer', transition: '0.3s'}}></i>
              <i className="fa-solid fa-phone social-icon" style={{cursor: 'pointer', transition: '0.3s'}}></i>
            </div>
            <div style={{opacity: 0.3, fontSize: '13px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)'}}>כל הזכויות שמורות © 2024 קייטרינג הדרן - יוקרה קולינרית בכשרות מהדרין</div>
        </div>
      </footer>
      <StatusIndicator />
    </div>
  </Router>
);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
