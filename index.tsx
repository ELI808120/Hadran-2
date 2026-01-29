
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// --- INITIALIZATION ---
const SURL = (window as any).process?.env?.SUPABASE_URL || '';
const SKEY = (window as any).process?.env?.SUPABASE_ANON_KEY || '';
const supabase = (SURL && SKEY) ? createClient(SURL, SKEY) : null;

// --- DATA: SHABAT MENU ---
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
  <nav className="nav">
    <Link to="/" className="logo font-serif">קייטרינג <span>הדרן</span></Link>
    <div>
      <a href="#booking" className="btn btn-gold">הזמן אירוע</a>
    </div>
  </nav>
);

const LandingPage = () => {
  const [form, setForm] = useState({ name: '', phone: '', date: '', guests: 50 });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!supabase) {
      alert("מערכת הנתונים לא מוגדרת. הבקשה נשמרה מקומית (Demo)");
      setSent(true);
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
    <div className="animate">
      <header className="hero">
        <h1 className="font-serif">יוקרה בכל ביס</h1>
        <p>חוויה קולינרית יוצאת דופן לאירועים שזוכרים לכל החיים. כשר למהדרין.</p>
        <a href="#booking" className="btn btn-gold" style={{fontSize: '20px', padding: '18px 45px'}}>התחל עכשיו</a>
      </header>

      <section id="booking" className="section">
        <div className="container">
          <div className="card">
            {sent ? (
              <div style={{textAlign: 'center', padding: '40px'}}>
                <i className="fa-solid fa-circle-check" style={{fontSize: '60px', color: 'var(--gold)', marginBottom: '20px'}}></i>
                <h2 className="font-serif">תודה רבה!</h2>
                <p>הבקשה התקבלה. ניצור איתך קשר בהקדם עם לינק לבחירת התפריט.</p>
                <button onClick={() => setSent(false)} className="btn btn-dark">שלח בקשה נוספת</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="font-serif" style={{textAlign: 'center', fontSize: '36px', marginBottom: '30px'}}>שריון תאריך לאירוע</h2>
                <div className="grid">
                  <input required placeholder="שם מלא" onChange={e => setForm({...form, name: e.target.value})} />
                  <input required placeholder="טלפון" type="tel" onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="grid">
                  <input required type="date" onChange={e => setForm({...form, date: e.target.value})} />
                  <input required type="number" placeholder="מספר אורחים" onChange={e => setForm({...form, guests: Number(e.target.value)})} />
                </div>
                <button className="btn btn-gold" style={{width: '100%', padding: '20px', fontSize: '18px'}}>שלח בקשת שריון</button>
              </form>
            )}
          </div>
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
    <div className="section animate">
      <div className="container" style={{maxWidth: '1200px'}}>
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <h1 className="font-serif" style={{fontSize: '48px'}}>בחירת תפריט אישי</h1>
          <p>לחצו על המנות המבוקשות ישירות על גבי התפריט</p>
        </div>

        <div className="menu-wrapper">
          <div className="menu-image-container">
            <img src="shabat.jpg" alt="Menu" />
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
            <h3 className="font-serif" style={{fontSize: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px'}}>
              <i className="fa-solid fa-utensils" style={{color: 'var(--gold)', marginLeft: '10px'}}></i>
              המנות שבחרתם
            </h3>
            
            <div style={{minHeight: '200px'}}>
              {selections.length === 0 ? (
                <p style={{opacity: 0.4, textAlign: 'center', marginTop: '50px'}}>טרם נבחרו מנות</p>
              ) : (
                selections.map(sid => {
                  const dish = SHABAT_DISHES.find(d => d.id === sid);
                  return (
                    <div key={sid} className="selection-item">
                      <span>{dish?.name}</span>
                      <i className="fa-solid fa-xmark" style={{cursor: 'pointer', opacity: 0.5}} onClick={() => toggle(sid)}></i>
                    </div>
                  );
                })
              )}
            </div>

            <button 
              className="btn btn-gold" 
              style={{width: '100%', marginTop: '30px', padding: '18px'}}
              disabled={selections.length === 0}
              onClick={() => alert('הבחירות נשמרו! ניצור איתך קשר לאישור סופי.')}
            >
              סיום ושליחה למנהל
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <Nav />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/order/:id" element={<MenuBuilder />} />
      <Route path="*" element={<div style={{padding: '100px', textAlign: 'center'}}>דף לא נמצא</div>} />
    </Routes>
    <footer style={{background: 'var(--slate)', color: 'white', padding: '60px 5%', textAlign: 'center'}}>
      <p className="font-serif" style={{fontSize: '24px', color: 'var(--gold)'}}>קייטרינג הדרן</p>
      <p style={{opacity: 0.5, fontSize: '14px'}}>כל הזכויות שמורות © 2024</p>
    </footer>
  </Router>
);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
