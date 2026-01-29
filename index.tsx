
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// --- INITIALIZATION ---
const SURL = (window as any).process?.env?.SUPABASE_URL || '';
const SKEY = (window as any).process?.env?.SUPABASE_ANON_KEY || '';
const supabase = (SURL && SKEY) ? createClient(SURL, SKEY) : null;

// --- DATA ---
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
    <a href="#booking" className="nav-btn">הזמן אירוע</a>
  </nav>
);

const LandingPage = () => {
  const [form, setForm] = useState({ name: '', phone: '', date: '', guests: 50 });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      console.warn("Supabase not configured, showing demo success.");
      setTimeout(() => setSent(true), 800);
      return;
    }
    const { error } = await supabase.from('event_requests').insert([{
      customerName: form.name,
      phone: form.phone,
      eventDate: form.date,
      guestCount: form.guests,
      status: 'PENDING'
    }]);
    if (!error) setSent(true);
  };

  return (
    <div className="fade-in">
      <header className="hero">
        <h1 className="font-serif">יוקרה בכל ביס</h1>
        <p>חוויה קולינרית יוצאת דופן לאירועי בוטיק. איכות ללא פשרות, כשרות למהדרין.</p>
        <a href="#booking" className="nav-btn" style={{padding: '18px 45px', fontSize: '1.2rem'}}>התחילו עכשיו</a>
      </header>

      <section id="booking" className="section">
        <div className="card">
          {sent ? (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <i className="fa-solid fa-circle-check" style={{fontSize: '5rem', color: 'var(--gold)', marginBottom: '20px'}}></i>
              <h2 className="font-serif">הבקשה התקבלה!</h2>
              <p>ניצור איתכם קשר בהקדם עם לינק לבניית התפריט שלכם.</p>
              <button onClick={() => setSent(false)} className="nav-btn" style={{marginTop: '30px', background: 'var(--dark)'}}>שלח בקשה חדשה</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="font-serif" style={{textAlign: 'center', fontSize: '2.5rem', marginBottom: '30px'}}>שריון תאריך לאירוע</h2>
              <div className="form-grid">
                <input required placeholder="שם מלא" onChange={e => setForm({...form, name: e.target.value})} />
                <input required placeholder="טלפון" type="tel" onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-grid">
                <input required type="date" onChange={e => setForm({...form, date: e.target.value})} />
                <input required type="number" placeholder="מספר אורחים" onChange={e => setForm({...form, guests: Number(e.target.value)})} />
              </div>
              <button className="nav-btn" style={{width: '100%', padding: '20px', fontSize: '1.1rem'}}>שלח בקשת שריון</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

const MenuBuilder = () => {
  const [selections, setSelections] = useState<string[]>([]);
  
  const toggle = (id: string) => {
    setSelections(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="section fade-in">
      <div style={{textAlign: 'center', marginBottom: '40px'}}>
        <h1 className="font-serif" style={{fontSize: '3rem'}}>בחירת תפריט אישי</h1>
        <p>לחצו על המנות המבוקשות ישירות על התפריט</p>
      </div>

      <div className="menu-layout">
        <div className="menu-visual">
          <img src="shabat.jpg" alt="Menu" onError={(e: any) => e.target.src='https://images.unsplash.com/photo-1547928576-a4a33237eceb?w=800'} />
          {SHABAT_DISHES.map(dish => (
            <div 
              key={dish.id}
              className={`hotspot ${selections.includes(dish.id) ? 'selected' : ''}`}
              style={{ top: `${dish.top}%`, left: `${dish.left}%`, width: `${dish.width}%`, height: `${dish.height}%` }}
              onClick={() => toggle(dish.id)}
            />
          ))}
        </div>

        <aside className="sidebar">
          <h3 className="font-serif" style={{fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px'}}>המנות שבחרתם</h3>
          <div style={{minHeight: '200px'}}>
            {selections.length === 0 ? <p style={{opacity: 0.5}}>טרם נבחרו מנות...</p> : selections.map(sid => (
              <div key={sid} style={{background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between'}}>
                <span>{SHABAT_DISHES.find(d => d.id === sid)?.name}</span>
                <span style={{cursor: 'pointer'}} onClick={() => toggle(sid)}>×</span>
              </div>
            ))}
          </div>
          <button className="nav-btn" style={{width: '100%', marginTop: '30px'}} onClick={() => alert('הבחירות נשמרו!')}>סיום ושליחה</button>
        </aside>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <Nav />
    <main style={{minHeight: '80vh'}}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/order/:id" element={<MenuBuilder />} />
        <Route path="*" element={<div style={{textAlign: 'center', padding: '100px'}}>דף לא נמצא</div>} />
      </Routes>
    </main>
    <footer style={{background: 'var(--dark)', color: 'white', padding: '60px 5%', textAlign: 'center'}}>
      <h2 className="font-serif" style={{color: 'var(--gold)', fontSize: '2rem'}}>קייטרינג הדרן</h2>
      <p style={{opacity: 0.5, fontSize: '0.9rem', marginTop: '20px'}}>כל הזכויות שמורות © 2024</p>
    </footer>
  </Router>
);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
