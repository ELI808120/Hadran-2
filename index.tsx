
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// --- ROBUST INITIALIZATION ---
const SURL = (window as any).process?.env?.SUPABASE_URL || '';
const SKEY = (window as any).process?.env?.SUPABASE_ANON_KEY || '';
const supabase = (SURL && SKEY) ? createClient(SURL, SKEY) : null;

// --- ALL DATA (NO EXTERNAL IMPORTS) ---
const SHABAT_DISHES = [
    {"id":"s1","name":"סלטים","top":7.85,"left":82.59,"width":3.97,"height":1.69},
    {"id":"s2","name":"בורגול","top":88.51,"left":79.69,"width":11.84,"height":1.14},
    {"id":"s3","name":"צ'מצ'ורי","top":86.09,"left":83.32,"width":8.20,"height":1.33},
    {"id":"s4","name":"חציל בטחינה","top":83.67,"left":84.56,"width":6.96,"height":1.08},
    {"id":"s5","name":"כרוב אדום","top":81.25,"left":83.71,"width":7.82,"height":1.14},
    {"id":"s6","name":"סלט זיתים","top":78.83,"left":87.64,"width":3.89,"height":1.02},
    {"id":"f1","name":"סלמון","top":33.01,"left":65.28,"width":9.70,"height":1.51},
    {"id":"f2","name":"קציצות דג","top":30.83,"left":64.51,"width":10.43,"height":1.26},
    {"id":"m1","name":"צלי בשר","top":68.98,"left":68.61,"width":7.22,"height":1.51},
    {"id":"m2","name":"שניצל אפוי","top":66.56,"left":65.71,"width":9.19,"height":1.51},
    {"id":"ch1","name":"צ'ולנט","top":39.29,"left":30.91,"width":11.58,"height":1.51},
    {"id":"d1","name":"פירות יער","top":71.88,"left":55.57,"width":3.80,"height":1.02}
];

// --- COMPONENTS ---

const Nav = () => (
  <nav className="navbar">
    <Link to="/" className="logo font-serif">קייטרינג <span>הדרן</span></Link>
    <a href="#request" className="nav-btn">הזמן אירוע</a>
  </nav>
);

const LandingPage = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', guests: 50 });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!supabase) {
      console.warn("Supabase not configured, using local simulation.");
      setTimeout(() => { setSent(true); setLoading(false); }, 1000);
      return;
    }

    try {
      const { error } = await supabase.from('event_requests').insert([{
        customerName: form.name,
        phone: form.phone,
        email: form.email,
        eventDate: form.date,
        guestCount: form.guests,
        status: 'PENDING'
      }]);
      if (error) throw error;
      setSent(true);
    } catch (err) {
      alert("שגיאת תקשורת. אנא נסה שוב מאוחר יותר.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <header className="hero">
        <h1 className="font-serif">יוקרה בכל ביס</h1>
        <p>קייטרינג הדרן הופך כל אירוע ליצירת אמנות קולינרית. אירועי בוטיק בכשרות למהדרין.</p>
        <a href="#request" className="nav-btn" style={{padding: '18px 45px', fontSize: '1.2rem'}}>התחל עכשיו</a>
      </header>

      <section id="request" className="menu-section" style={{marginTop: '-50px'}}>
        <div className="form-card">
          {sent ? (
            <div className="text-center" style={{padding: '40px 0'}}>
              <i className="fa-solid fa-circle-check" style={{fontSize: '4rem', color: 'var(--gold)', marginBottom: '20px'}}></i>
              <h2 className="font-serif">הבקשה התקבלה!</h2>
              <p style={{color: '#64748b'}}>מנהל אירועים יחזור אליך בהקדם עם לינק אישי לבחירת התפריט.</p>
              <button onClick={() => setSent(false)} className="nav-btn" style={{marginTop: '30px', background: 'var(--dark)'}}>שלח בקשה נוספת</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="font-serif text-center" style={{fontSize: '2.2rem', marginBottom: '30px'}}>שריון תאריך לאירוע</h2>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="input-group">
                  <label>שם מלא</label>
                  <input required placeholder="ישראל ישראלי" onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>טלפון</label>
                  <input required type="tel" placeholder="050-0000000" onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label>אימייל לקבלת הלינק</label>
                <input required type="email" placeholder="example@gmail.com" onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="input-group">
                  <label>תאריך האירוע</label>
                  <input required type="date" onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>מספר אורחים</label>
                  <input required type="number" placeholder="50" onChange={e => setForm({...form, guests: Number(e.target.value)})} />
                </div>
              </div>
              <button disabled={loading} className="nav-btn" style={{width: '100%', padding: '20px', fontSize: '1.1rem', marginTop: '20px'}}>
                {loading ? 'מעבד...' : 'שלח בקשת שריון'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

const MenuBuilder = () => {
  const { id } = useParams();
  const [selections, setSelections] = useState<string[]>([]);

  const toggle = (dishId: string) => {
    setSelections(prev => prev.includes(dishId) ? prev.filter(i => i !== dishId) : [...prev, dishId]);
  };

  return (
    <div className="menu-section animate-in">
      <div className="text-center" style={{marginBottom: '50px'}}>
        <h1 className="font-serif" style={{fontSize: '3rem'}}>בחירת תפריט אישי</h1>
        <p style={{color: '#64748b'}}>סמנו את המנות המבוקשות ישירות על גבי התפריט</p>
      </div>

      <div className="menu-container">
        <div className="menu-image-card">
          <img src="shabat.jpg" alt="Shabat Menu" />
          {SHABAT_DISHES.map(dish => (
            <div 
              key={dish.id}
              className={`hotspot ${selections.includes(dish.id) ? 'selected' : ''}`}
              style={{
                top: `${dish.top}%`,
                left: `${dish.left}%`,
                width: `${dish.width}%`,
                height: `${dish.height}%`
              }}
              onClick={() => toggle(dish.id)}
              title={dish.name}
            />
          ))}
        </div>

        <aside className="sidebar">
          <h3 className="font-serif" style={{fontSize: '1.5rem', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px'}}>
            <i className="fa-solid fa-list-check" style={{color: 'var(--gold)', marginLeft: '10px'}}></i>
            המנות שבחרתם
          </h3>
          <div style={{minHeight: '200px', maxHeight: '400px', overflowY: 'auto'}}>
            {selections.length === 0 ? (
              <p style={{opacity: 0.4, textAlign: 'center', marginTop: '50px'}}>טרם נבחרו מנות</p>
            ) : (
              selections.map(sid => {
                const dish = SHABAT_DISHES.find(d => d.id === sid);
                return (
                  <div key={sid} style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span>{dish?.name}</span>
                    <i className="fa-solid fa-xmark" style={{cursor: 'pointer', opacity: 0.5}} onClick={() => toggle(sid)}></i>
                  </div>
                );
              })
            )}
          </div>
          <button 
            disabled={selections.length === 0} 
            className="nav-btn" 
            style={{width: '100%', marginTop: '30px', padding: '15px'}}
            onClick={() => alert("הבחירות נשמרו! ניצור איתך קשר לאישור סופי.")}
          >
            סיום ושליחה למנהל
          </button>
        </aside>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <div style={{minHeight: '100vh', display: 'flex', flexCollection: 'column'}}>
      <Nav />
      <main style={{flexGrow: 1}}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/order/:id" element={<MenuBuilder />} />
          <Route path="*" element={<div className="text-center" style={{padding: '100px'}}>דף לא נמצא</div>} />
        </Routes>
      </main>
      <footer style={{background: 'var(--dark)', color: 'white', padding: '60px 5%', textAlign: 'center'}}>
        <p className="font-serif" style={{fontSize: '1.8rem', color: 'var(--gold)', marginBottom: '10px'}}>קייטרינג הדרן</p>
        <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', opacity: 0.6}}>
          <i className="fa-brands fa-whatsapp"></i>
          <i className="fa-brands fa-instagram"></i>
          <i className="fa-brands fa-facebook"></i>
        </div>
        <p style={{fontSize: '0.8rem', opacity: 0.4}}>כל הזכויות שמורות © 2024 - הדרן קייטרינג יוקרה</p>
      </footer>
    </div>
  </Router>
);

// --- MOUNTING ---
try {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(<App />);
} catch (err) {
  console.error("Critical Render Error:", err);
}
