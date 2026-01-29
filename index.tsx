
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
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
      console.warn("Supabase not active, demo mode.");
      setTimeout(() => { setSent(true); setLoading(false); }, 1200);
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
      alert("שגיאה בשליחה. אנא וודאו שכל השדות תקינים.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <header className="hero">
        <h1 className="font-serif">יוקרה בכל ביס</h1>
        <p>קייטרינג הדרן הופך כל אירוע ליצירת אמנות קולינרית. אירועי בוטיק בכשרות למהדרין, עם דגש על איכות ללא פשרות.</p>
        <a href="#request" className="nav-btn" style={{padding: '20px 50px', fontSize: '1.2rem'}}>התחילו עכשיו</a>
      </header>

      <section id="request" className="section" style={{marginTop: '-80px'}}>
        <div className="card">
          {sent ? (
            <div style={{textAlign: 'center', padding: '50px 0'}}>
              <i className="fa-solid fa-circle-check" style={{fontSize: '5rem', color: 'var(--gold)', marginBottom: '30px'}}></i>
              <h2 className="font-serif" style={{fontSize: '2.5rem'}}>הבקשה התקבלה!</h2>
              <p style={{color: 'var(--slate)', fontSize: '1.1rem'}}>מנהל אירועים יחזור אליכם בהקדם עם קישור אישי לבניית התפריט המבוקש.</p>
              <button onClick={() => setSent(false)} className="nav-btn" style={{marginTop: '40px', background: 'var(--dark)'}}>שלח בקשה חדשה</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="font-serif" style={{fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px'}}>שריון תאריך לאירוע</h2>
              
              <div className="form-grid">
                <div className="input-wrapper">
                  <label>שם מלא</label>
                  <input required placeholder="ישראל ישראלי" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="input-wrapper">
                  <label>טלפון</label>
                  <input required type="tel" placeholder="050-0000000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <div className="input-wrapper">
                <label>אימייל לקבלת הלינק</label>
                <input required type="email" placeholder="example@gmail.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>

              <div className="form-grid">
                <div className="input-wrapper">
                  <label>תאריך האירוע</label>
                  <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div className="input-wrapper">
                  <label>מספר אורחים</label>
                  <input required type="number" placeholder="50" value={form.guests} onChange={e => setForm({...form, guests: Number(e.target.value)})} />
                </div>
              </div>

              <button disabled={loading} className="nav-btn" style={{width: '100%', padding: '22px', fontSize: '1.2rem', marginTop: '20px'}}>
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
  const navigate = useNavigate();

  const toggle = (dishId: string) => {
    setSelections(prev => prev.includes(dishId) ? prev.filter(i => i !== dishId) : [...prev, dishId]);
  };

  return (
    <div className="section fade-in">
      <div style={{textAlign: 'center', marginBottom: '60px'}}>
        <h1 className="font-serif" style={{fontSize: '3.5rem'}}>עיצוב תפריט אישי</h1>
        <p style={{color: 'var(--slate)', fontSize: '1.2rem'}}>סמנו את המנות הרצויות ישירות על גבי התפריט החזותי</p>
      </div>

      <div className="menu-layout">
        <div className="interactive-menu">
          <img src="shabat.jpg" alt="Shabat Menu" onError={(e: any) => e.target.src = 'https://images.unsplash.com/photo-1547928576-a4a33237eceb?w=1000'} />
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
          <h3 className="font-serif" style={{fontSize: '1.8rem', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px'}}>
            <i className="fa-solid fa-utensils" style={{color: 'var(--gold)', marginLeft: '12px'}}></i>
            המנות שבחרתם
          </h3>
          
          <div style={{minHeight: '250px', maxHeight: '500px', overflowY: 'auto'}}>
            {selections.length === 0 ? (
              <p style={{opacity: 0.4, textAlign: 'center', marginTop: '80px', fontStyle: 'italic'}}>לחצו על המנות בתפריט כדי להוסיף אותן...</p>
            ) : (
              selections.map(sid => {
                const dish = SHABAT_DISHES.find(d => d.id === sid);
                return (
                  <div key={sid} style={{background: 'rgba(255,255,255,0.08)', padding: '15px', borderRadius: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontWeight: 'bold'}}>{dish?.name}</span>
                    <i className="fa-solid fa-circle-xmark" style={{cursor: 'pointer', opacity: 0.4}} onClick={() => toggle(sid)}></i>
                  </div>
                );
              })
            )}
          </div>

          <button 
            disabled={selections.length === 0} 
            className="nav-btn" 
            style={{width: '100%', marginTop: '40px', padding: '20px', fontSize: '1.1rem'}}
            onClick={() => {
              alert("תודה רבה! הבחירות שלכם נשמרו. צוות הדרן יצור אתכם קשר לאישור סופי.");
              navigate('/');
            }}
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
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <Nav />
      <main style={{flexGrow: 1}}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/order/:id" element={<MenuBuilder />} />
          <Route path="*" element={<div style={{padding: '100px', textAlign: 'center'}}>דף לא נמצא</div>} />
        </Routes>
      </main>
      <footer style={{background: 'var(--dark)', color: 'white', padding: '80px 5%', textAlign: 'center'}}>
        <h2 className="font-serif" style={{fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '15px'}}>קייטרינג הדרן</h2>
        <p style={{opacity: 0.6, maxWidth: '500px', margin: '0 auto 40px'}}>מומחים לאירועים יוקרתיים, שבתות חתן ואירועי בוטיק. כשרות למהדרין.</p>
        <div style={{display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '1.8rem', opacity: 0.8, marginBottom: '40px'}}>
          <i className="fa-brands fa-whatsapp" style={{cursor: 'pointer'}}></i>
          <i className="fa-brands fa-instagram" style={{cursor: 'pointer'}}></i>
          <i className="fa-brands fa-facebook" style={{cursor: 'pointer'}}></i>
        </div>
        <p style={{fontSize: '0.85rem', opacity: 0.3, letterSpacing: '1px'}}>כל הזכויות שמורות © 2024 - הדרן קייטרינג יוקרה</p>
      </footer>
    </div>
  </Router>
);

// --- MOUNTING ---
const mountRoot = () => {
  const container = document.getElementById('root');
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
  }
};

// Start application
mountRoot();
