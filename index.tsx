
/**
 * קייטרינג הדרן - Main Application
 * Entry point with integrated error handling
 */

import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link, Navigate, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

console.log("🚀 Index.tsx: Script execution started.");

// --- CONFIGURATION ---
const SUPABASE_URL = (window as any).process?.env?.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = (window as any).process?.env?.SUPABASE_ANON_KEY || 'placeholder';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

// --- COMPONENTS ---

const Header = ({ user, onSignOut }: any) => (
  <nav className="h-20 bg-white border-b sticky top-0 z-[100] shadow-sm flex items-center justify-between px-8">
    <Link to="/" className="text-2xl font-serif font-bold italic tracking-tight">קייטרינג <span className="text-gold">הדרן</span></Link>
    <div className="flex gap-6 items-center">
      {user && <Link to="/admin" className="text-sm font-bold text-slate-700">ניהול</Link>}
      <a href="#form" className="bg-gold text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-yellow-600 transition-all">הזמן אירוע</a>
    </div>
  </nav>
);

const LandingPage = () => {
  const [formData, setFormData] = useState({ customerName: '', email: '', phone: '', eventDate: '', location: '', guestCount: 50 });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await supabase.from('event_requests').insert([{ ...formData, status: 'PENDING' }]);
      setStatus('success');
    } catch (err) {
      alert('שגיאת תקשורת עם השרת');
      setStatus('idle');
    }
  };

  return (
    <div className="animate-fade-in">
      <section className="relative h-[80vh] flex items-center justify-center text-center text-white">
        <div className="absolute inset-0 bg-black/60 z-0">
          <img src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1200" className="w-full h-full object-cover mix-blend-overlay" alt="Catering" />
        </div>
        <div className="relative z-10 px-4">
          <h1 className="text-6xl md:text-7xl font-serif font-bold mb-6 italic">קייטרינג <span className="text-gold">הדרן</span></h1>
          <p className="text-xl md:text-2xl font-light mb-12 max-w-2xl mx-auto">מפיקים עבורכם רגעי קסם קולינריים בכשרות מהדרין.</p>
          <a href="#form" className="bg-gold px-12 py-4 rounded-full font-bold text-xl hover:scale-105 transition-all inline-block shadow-2xl">בקש פתיחת הזמנה</a>
        </div>
      </section>

      <section id="form" className="py-24 bg-slate-50 px-4">
        <div className="max-w-4xl mx-auto">
          {status === 'success' ? (
            <div className="bg-white p-20 rounded-[2.5rem] shadow-xl text-center border border-green-50 animate-fade-in">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl"><i className="fa-solid fa-check"></i></div>
               <h2 className="text-4xl font-serif font-bold mb-4">תודה {formData.customerName}!</h2>
               <p className="text-xl text-neutral-500 italic">בקשתך התקבלה. לינק לבחירת התפריט יישלח אליך לאחר אישור המנהל.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-neutral-100 space-y-6">
              <h2 className="text-3xl font-serif font-bold text-center mb-10">שריון תאריך לאירוע</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <input required placeholder="שם מלא" className="w-full p-4 bg-slate-50 rounded-xl outline-none border focus:border-gold" onChange={e => setFormData({...formData, customerName: e.target.value})} />
                <input required type="tel" placeholder="טלפון" className="w-full p-4 bg-slate-50 rounded-xl outline-none border focus:border-gold" onChange={e => setFormData({...formData, phone: e.target.value})} />
                <input required type="date" className="w-full p-4 bg-slate-50 rounded-xl outline-none border focus:border-gold" onChange={e => setFormData({...formData, eventDate: e.target.value})} />
                <input required type="number" placeholder="מספר אורחים" className="w-full p-4 bg-slate-50 rounded-xl outline-none border focus:border-gold" onChange={e => setFormData({...formData, guestCount: Number(e.target.value)})} />
              </div>
              <input required placeholder="מיקום האירוע" className="w-full p-4 bg-slate-50 rounded-xl outline-none border focus:border-gold" onChange={e => setFormData({...formData, location: e.target.value})} />
              <input required type="email" placeholder="אימייל לקבלת לינק" className="w-full p-4 bg-slate-50 rounded-xl outline-none border focus:border-gold" onChange={e => setFormData({...formData, email: e.target.value})} />
              <button disabled={status === 'loading'} className="w-full bg-slate-900 text-white py-5 rounded-xl font-bold text-xl hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50">
                {status === 'loading' ? 'שולח...' : 'שלח בקשה'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

const MenuBuilder = () => {
  const { orderId } = useParams();
  const [selections, setSelections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('event_requests').select('*').eq('id', orderId).maybeSingle().then(({data}) => {
      if (data?.selections?.all) setSelections(data.selections.all);
      setLoading(false);
    });
  }, [orderId]);

  const toggle = (id: string) => setSelections(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  if (loading) return <div className="p-20 text-center">טוען תפריט...</div>;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row gap-8 p-4 md:p-8 animate-fade-in">
      <div className="flex-grow bg-white p-6 rounded-[2rem] shadow-xl relative overflow-auto">
        <h2 className="text-2xl font-serif font-bold text-center mb-6">לחצו על המנות המבוקשות</h2>
        <div className="relative mx-auto max-w-[1000px] border shadow-2xl rounded-lg overflow-hidden">
           <img src="shabat.jpg" className="w-full block" alt="Shabat Menu" />
           {SHABAT_DISHES.map(dish => (
             <div 
              key={dish.id} 
              onClick={() => toggle(dish.id)}
              className={`dish-hotspot ${selections.includes(dish.id) ? 'selected' : ''}`}
              style={{ top: `${dish.top}%`, left: `${dish.left}%`, width: `${dish.width}%`, height: `${dish.height}%` }}
             />
           ))}
        </div>
      </div>
      <aside className="lg:w-80 bg-slate-900 text-white p-8 rounded-[2rem] h-fit sticky top-24 shadow-2xl border border-white/5">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><i className="fa-solid fa-list-check text-gold"></i> הבחירות שלכם</h3>
        <div className="space-y-3 mb-8 max-h-96 overflow-auto custom-scrollbar">
          {selections.map(id => {
            const dish = SHABAT_DISHES.find(d => d.id === id);
            return <div key={id} className="bg-white/5 p-3 rounded-lg text-sm flex justify-between border border-white/5">
              <span>{dish?.name}</span>
              <button onClick={() => toggle(id)} className="text-white/20 hover:text-red-400">×</button>
            </div>;
          })}
        </div>
        <button onClick={() => alert('הבחירות נשמרו!')} className="w-full bg-gold py-4 rounded-xl font-bold hover:bg-yellow-600 transition-all shadow-lg active:scale-95">סיום ושליחה</button>
      </aside>
    </div>
  );
};

// --- APP CORE ---

const App = () => {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}}) => setUser(session?.user));
    supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user));
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header user={user} onSignOut={() => supabase.auth.signOut()} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/order/:orderId" element={<MenuBuilder />} />
            <Route path="/admin" element={<div className="p-20 text-center">כניסת מנהל (בפיתוח)</div>} />
          </Routes>
        </main>
        <footer className="bg-slate-900 text-white py-12 text-center border-t border-white/5">
           <p className="font-serif text-2xl italic mb-4 text-gold">קייטרינג הדרן</p>
           <p className="text-sm opacity-40">© כל הזכויות שמורות - אירועי יוקרה 2024</p>
        </footer>
      </div>
    </Router>
  );
};

// --- MOUNTING ---
const mount = () => {
  console.log("🏁 Index.tsx: Mounting React...");
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
    console.log("✅ Index.tsx: Rendered successfully.");
  } else {
    console.error("❌ Index.tsx: Root element not found.");
  }
};

// Start the app
try {
  mount();
} catch (e) {
  console.error("❌ Index.tsx: Critical mount error", e);
}
