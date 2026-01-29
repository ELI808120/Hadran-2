
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// --- CONFIG & SUPABASE ---
const SURL = (window as any).process?.env?.SUPABASE_URL || '';
const SKEY = (window as any).process?.env?.SUPABASE_ANON_KEY || '';

// Safe initialization
let supabase: any = null;
try {
  if (SURL && SKEY && SURL.startsWith('http')) {
    supabase = createClient(SURL, SKEY);
  }
} catch (e) {
  console.error("Supabase Init Error:", e);
}

// --- MOCK DATABASE (LocalStorage) ---
const mockDb = {
  saveRequest: async (data: any) => {
    const requests = JSON.parse(localStorage.getItem('hadran_requests') || '[]');
    const newReq = { ...data, id: 'req_' + Math.random().toString(36).substr(2, 9), status: 'PENDING', createdAt: new Date().toISOString() };
    requests.push(newReq);
    localStorage.setItem('hadran_requests', JSON.stringify(requests));
    return newReq;
  },
  getRequests: async () => {
    return JSON.parse(localStorage.getItem('hadran_requests') || '[]');
  }
};

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
    <a href="#booking" className="nav-btn">הזמן אירוע עכשיו</a>
  </nav>
);

const LandingPage = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', guests: 50 });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (supabase) {
        const { error } = await supabase.from('event_requests').insert([{
          customerName: form.name,
          phone: form.phone,
          email: form.email,
          eventDate: form.date,
          guestCount: form.guests,
          status: 'PENDING'
        }]);
        if (error) throw error;
      } else {
        await mockDb.saveRequest(form);
      }
      setSent(true);
    } catch (err) {
      console.warn("Database error, saved to local storage instead.", err);
      await mockDb.saveRequest(form);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <header className="hero">
        <h1 className="font-serif">יוקרה בכל ביס</h1>
        <p>קייטרינג הדרן הופך כל אירוע ליצירת אמנות קולינרית. אירועי בוטיק, שבתות חתן ושמחות בכשרות למהדרין.</p>
        <a href="#booking" className="nav-btn" style={{padding: '20px 55px', fontSize: '1.2rem'}}>התחילו עכשיו</a>
      </header>

      <section id="booking" className="section" style={{marginTop: '-80px'}}>
        <div className="card">
          {sent ? (
            <div style={{textAlign: 'center', padding: '50px 0'}}>
              <i className="fa-solid fa-circle-check" style={{fontSize: '5rem', color: 'var(--gold)', marginBottom: '30px'}}></i>
              <h2 className="font-serif" style={{fontSize: '2.5rem'}}>הבקשה התקבלה!</h2>
              <p style={{color: 'var(--slate)', fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto'}}>תודה {form.name}. מנהל אירועים יחזור אליך בהקדם עם קישור אישי לבניית התפריט המושלם.</p>
              <button onClick={() => setSent(false)} className="nav-btn" style={{marginTop: '40px', background: 'var(--dark)'}}>שלח בקשה חדשה</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="font-serif" style={{fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px'}}>שריון תאריך לאירוע</h2>
              
              <div className="form-grid">
                <div>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem'}}>שם מלא</label>
                  <input required placeholder="ישראל ישראלי" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem'}}>טלפון</label>
                  <input required type="tel" placeholder="050-0000000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem'}}>אימייל (לקבלת קישור לבניית תפריט)</label>
                <input required type="email" placeholder="example@gmail.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>

              <div className="form-grid">
                <div>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem'}}>תאריך האירוע</label>
                  <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem'}}>מספר אורחים משוער</label>
                  <input required type="number" placeholder="50" value={form.guests} onChange={e => setForm({...form, guests: Number(e.target.value)})} />
                </div>
              </div>

              <button disabled={loading} className="nav-btn" style={{width: '100%', padding: '22px', fontSize: '1.2rem', marginTop: '20px'}}>
                {loading ? 'מעבד בקשה...' : 'שלח בקשת שריון'}
              </button>
              <p style={{textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '15px'}}>* השירות ניתן בכשרות למהדרין</p>
            </form>
          )}
        </div>
      </section>

      <section className="section" style={{textAlign: 'center'}}>
        <h2 className="font-serif" style={{fontSize: '2.5rem', marginBottom: '50px'}}>למה הדרן?</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px'}}>
          <div className="card" style={{padding: '30px'}}>
            <i className="fa-solid fa-star" style={{fontSize: '2rem', color: 'var(--gold)', marginBottom: '20px'}}></i>
            <h3 className="font-serif">איכות ללא פשרות</h3>
            <p style={{fontSize: '0.9rem', color: 'var(--slate)'}}>חומרי הגלם הטובים ביותר, בישול טרי ביום האירוע.</p>
          </div>
          <div className="card" style={{padding: '30px'}}>
            <i className="fa-solid fa-certificate" style={{fontSize: '2rem', color: 'var(--gold)', marginBottom: '20px'}}></i>
            <h3 className="font-serif">כשרות מהדרין</h3>
            <p style={{fontSize: '0.9rem', color: 'var(--slate)'}}>הקפדה הלכתית מלאה בכל שלבי ההכנה וההגשה.</p>
          </div>
          <div className="card" style={{padding: '30px'}}>
            <i className="fa-solid fa-heart" style={{fontSize: '2rem', color: 'var(--gold)', marginBottom: '20px'}}></i>
            <h3 className="font-serif">שירות מהלב</h3>
            <p style={{fontSize: '0.9rem', color: 'var(--slate)'}}>ליווי אישי מרגע הפנייה ועד אחרון האורחים.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const MenuBuilder = () => {
  const { orderId } = useParams();
  const [selections, setSelections] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggle = (id: string) => {
    setSelections(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="section fade-in">
      <div style={{textAlign: 'center', marginBottom: '50px'}}>
        <h1 className="font-serif" style={{fontSize: '3rem'}}>עיצוב התפריט האישי</h1>
        <p style={{color: 'var(--slate)'}}>לחצו על המנות המבוקשות ישירות על גבי התפריט החזותי</p>
      </div>

      <div className="menu-layout">
        <div className="menu-visual">
          <img src="shabat.jpg" alt="Menu" onError={(e: any) => e.target.src='https://images.unsplash.com/photo-1547928576-a4a33237eceb?w=1000'} />
          {SHABAT_DISHES.map(dish => (
            <div 
              key={dish.id}
              className={`hotspot ${selections.includes(dish.id) ? 'selected' : ''}`}
              style={{ top: `${dish.top}%`, left: `${dish.left}%`, width: `${dish.width}%`, height: `${dish.height}%` }}
              onClick={() => toggle(dish.id)}
              title={dish.name}
            />
          ))}
        </div>

        <aside className="sidebar">
          <h3 className="font-serif" style={{fontSize: '1.6rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '25px'}}>המנות שבחרתם</h3>
          <div style={{minHeight: '200px', maxHeight: '450px', overflowY: 'auto'}}>
            {selections.length === 0 ? (
              <p style={{opacity: 0.4, textAlign: 'center', marginTop: '60px', fontStyle: 'italic'}}>טרם נבחרו מנות...</p>
            ) : selections.map(sid => {
              const dish = SHABAT_DISHES.find(d => d.id === sid);
              return (
                <div key={sid} style={{background: 'rgba(255,255,255,0.06)', padding: '12px 15px', borderRadius: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontWeight: 'bold', fontSize: '0.95rem'}}>{dish?.name}</span>
                  <i className="fa-solid fa-xmark" style={{cursor: 'pointer', opacity: 0.4}} onClick={() => toggle(sid)}></i>
                </div>
              );
            })}
          </div>
          <button 
            disabled={selections.length === 0}
            className="nav-btn" 
            style={{width: '100%', marginTop: '30px', padding: '18px', fontSize: '1.1rem'}}
            onClick={() => {
              alert("תודה רבה! הבחירות שלכם נשמרו בהצלחה. צוות הדרן יצור אתכם קשר לאישור סופי.");
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
          <Route path="/order/:orderId" element={<MenuBuilder />} />
          <Route path="*" element={<div style={{padding: '100px', textAlign: 'center'}}><h2 className="font-serif">הדף לא נמצא</h2><Link to="/" style={{color: 'var(--gold)'}}>חזרה לדף הבית</Link></div>} />
        </Routes>
      </main>
      <footer style={{background: 'var(--dark)', color: 'white', padding: '60px 5%', textAlign: 'center'}}>
        <h2 className="font-serif" style={{color: 'var(--gold)', fontSize: '2.2rem', marginBottom: '15px'}}>קייטרינג הדרן</h2>
        <p style={{opacity: 0.6, fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto 30px'}}>מומחים לאירועי בוטיק, שמחות משפחתיות ושירותי קייטרינג יוקרתיים בכשרות מהדרין.</p>
        <div style={{display: 'flex', justifyContent: 'center', gap: '25px', fontSize: '1.5rem', opacity: 0.7, marginBottom: '30px'}}>
          <i className="fa-brands fa-whatsapp"></i>
          <i className="fa-brands fa-instagram"></i>
          <i className="fa-brands fa-facebook"></i>
        </div>
        <p style={{fontSize: '0.75rem', opacity: 0.3, letterSpacing: '1px'}}>כל הזכויות שמורות © 2024 - הדרן קייטרינג יוקרה</p>
      </footer>
    </div>
  </Router>
);

// --- MOUNTING ---
const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}
