
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// --- CONFIG & CONSTANTS ---
const SUPABASE_URL = (window as any).process?.env?.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (window as any).process?.env?.SUPABASE_ANON_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

enum OrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED'
}

const SHABAT_DISHES = [
    {"id":"s1","name":"סלטים","top":7.85,"left":82.59,"width":3.97,"height":1.69},
    {"id":"s2","name":"בורגול","top":88.51,"left":79.69,"width":11.84,"height":1.14},
    {"id":"f1","name":"סלמון","top":33.01,"left":65.28,"width":9.70,"height":1.51},
    {"id":"m1","name":"צלי בשר","top":68.98,"left":68.61,"width":7.22,"height":1.51},
    {"id":"ch1","name":"צ'ולנט","top":39.29,"left":30.91,"width":11.58,"height":1.51},
    {"id":"d1","name":"פירות יער","top":71.88,"left":55.57,"width":3.80,"height":1.02}
];

// --- DATABASE SERVICE ---
const db = {
  async test() {
    if (!supabase) return { ok: false, msg: 'מפתח Supabase חסר - עובד במצב מקומי' };
    try {
      const { error } = await supabase.from('event_requests').select('id').limit(1);
      if (error) throw error;
      return { ok: true, msg: 'חיבור ענן פעיל' };
    } catch (e: any) {
      return { ok: false, msg: `שגיאת חיבור: ${e.message}` };
    }
  },
  async saveRequest(data: any) {
    if (supabase) {
      const { data: res, error } = await supabase.from('event_requests').insert([{ ...data, status: OrderStatus.PENDING }]).select().single();
      if (error) throw error;
      return res;
    } else {
      const store = JSON.parse(localStorage.getItem('hadran_orders') || '[]');
      const newOrder = { ...data, id: 'local_' + Date.now(), status: OrderStatus.PENDING, created_at: new Date().toISOString() };
      store.push(newOrder);
      localStorage.setItem('hadran_orders', JSON.stringify(store));
      return newOrder;
    }
  },
  async fetchAll() {
    if (supabase) {
      const { data, error } = await supabase.from('event_requests').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return JSON.parse(localStorage.getItem('hadran_orders') || '[]');
  },
  async getById(id: string) {
    if (supabase) {
      const { data, error } = await supabase.from('event_requests').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    }
    return JSON.parse(localStorage.getItem('hadran_orders') || '[]').find((o: any) => o.id === id);
  },
  async updateMenu(id: string, menuId: string, selections: any) {
    if (supabase) {
      const { error } = await supabase.from('event_requests').update({ selected_menu_id: menuId, selections, status: OrderStatus.COMPLETED }).eq('id', id);
      if (error) throw error;
    } else {
      const store = JSON.parse(localStorage.getItem('hadran_orders') || '[]');
      const idx = store.findIndex((o: any) => o.id === id);
      if (idx !== -1) {
        store[idx] = { ...store[idx], selected_menu_id: menuId, selections, status: OrderStatus.COMPLETED };
        localStorage.setItem('hadran_orders', JSON.stringify(store));
      }
    }
  }
};

// --- SHARED COMPONENTS ---
const ConnectionStatus = () => {
  const [status, setStatus] = useState<'testing' | 'online' | 'offline'>('testing');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    db.test().then(res => {
      setStatus(res.ok ? 'online' : 'offline');
      setMsg(res.msg);
    });
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: '20px', left: '20px', zIndex: 2000,
      background: 'white', padding: '10px 20px', borderRadius: '50px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px',
      border: '1px solid #f1f5f9', cursor: 'help'
    }} title={msg}>
      <div style={{
        width: '12px', height: '12px', borderRadius: '50%',
        backgroundColor: status === 'online' ? '#22c55e' : status === 'offline' ? '#ef4444' : '#fbbf24',
        boxShadow: `0 0 10px ${status === 'online' ? '#22c55e' : '#ef4444'}`
      }} />
      <span style={{fontSize: '13px', fontWeight: 600, color: '#64748b'}}>
        {status === 'online' ? 'ענן מחובר' : status === 'offline' ? 'מצב מקומי' : 'בודק קישוריות...'}
      </span>
    </div>
  );
};

// --- PAGES ---
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
      alert('שגיאה בשמירה. וודא שכל השדות תקינים.');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="fade-in" style={{textAlign: 'center', padding: '100px 5%'}}>
      <div style={{maxWidth: '600px', margin: '0 auto', background: 'white', padding: '60px', borderRadius: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.05)'}}>
        <i className="fa-solid fa-circle-check" style={{fontSize: '80px', color: 'var(--gold)', marginBottom: '30px'}}></i>
        <h2 className="font-serif" style={{fontSize: '40px', marginBottom: '20px'}}>הבקשה נרשמה!</h2>
        <p style={{fontSize: '18px', color: 'var(--slate)'}}>תודה {form.customerName}, צוות הדרן יבדוק את הזמינות ב-{form.eventDate} ויחזור אליך בהקדם עם לינק לבחירת התפריט.</p>
        <button onClick={() => window.location.reload()} className="nav-btn" style={{marginTop: '40px'}}>חזרה לדף הבית</button>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <section style={{
        height: '85vh', background: 'linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url("https://images.unsplash.com/photo-1555244162-803834f70033?w=1600")',
        backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white'
      }}>
        <h1 className="font-serif" style={{fontSize: 'clamp(3rem, 10vw, 6rem)', margin: 0}}>קייטרינג <span style={{color: 'var(--gold)', fontStyle: 'italic'}}>הדרן</span></h1>
        <p style={{fontSize: '22px', maxWidth: '800px', fontWeight: 200, marginTop: '20px', opacity: 0.9}}>הופכים כל אירוע ליצירה קולינרית בלתי נשכחת. איכות ללא פשרות בכשרות מהדרין.</p>
        <a href="#booking" className="nav-btn" style={{marginTop: '50px', padding: '20px 60px', fontSize: '20px'}}>הזמן אירוע עכשיו</a>
      </section>

      <section id="booking" style={{padding: '100px 5%', marginTop: '-120px'}}>
        <div style={{maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '40px', padding: '60px', boxShadow: '0 40px 100px rgba(0,0,0,0.1)'}}>
          <h2 className="font-serif" style={{fontSize: '36px', textAlign: 'center', marginBottom: '50px'}}>בקשת שריון תאריך</h2>
          <form onSubmit={submit} style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <label style={{fontWeight: 700, fontSize: '14px', color: 'var(--slate)'}}>שם המארח/ת</label>
              <input required style={{padding: '18px', borderRadius: '15px', border: '1px solid #e2e8f0', background: '#f8fafc'}} placeholder="ישראל ישראלי" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <label style={{fontWeight: 700, fontSize: '14px', color: 'var(--slate)'}}>טלפון</label>
              <input required type="tel" style={{padding: '18px', borderRadius: '15px', border: '1px solid #e2e8f0', background: '#f8fafc'}} placeholder="050-0000000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <label style={{fontWeight: 700, fontSize: '14px', color: 'var(--slate)'}}>אימייל</label>
              <input required type="email" style={{padding: '18px', borderRadius: '15px', border: '1px solid #e2e8f0', background: '#f8fafc'}} placeholder="mail@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <label style={{fontWeight: 700, fontSize: '14px', color: 'var(--slate)'}}>תאריך האירוע</label>
              <input required type="date" style={{padding: '18px', borderRadius: '15px', border: '1px solid #e2e8f0', background: '#f8fafc'}} value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <label style={{fontWeight: 700, fontSize: '14px', color: 'var(--slate)'}}>מיקום</label>
              <input required style={{padding: '18px', borderRadius: '15px', border: '1px solid #e2e8f0', background: '#f8fafc'}} placeholder="עיר / שם אולם" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <label style={{fontWeight: 700, fontSize: '14px', color: 'var(--slate)'}}>מספר אורחים</label>
              <input required type="number" style={{padding: '18px', borderRadius: '15px', border: '1px solid #e2e8f0', background: '#f8fafc'}} value={form.guestCount} onChange={e => setForm({...form, guestCount: Number(e.target.value)})} />
            </div>
            <button disabled={loading} style={{gridColumn: '1 / -1', padding: '20px', marginTop: '20px'}} className="nav-btn">
              {loading ? 'מעבד בקשה...' : 'שלח בקשה וקבל אישור'}
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
    if (id) db.getById(id).then(res => { setOrder(res); setLoading(false); });
  }, [id]);

  const toggle = (itemId: string) => {
    setSelections(prev => prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]);
  };

  const save = async () => {
    if (!id) return;
    try {
      await db.updateMenu(id, 'shabat_visual', { dishes: selections });
      alert('הבחירות נשמרו! ניצור איתך קשר לתיאום סופי.');
      navigate('/');
    } catch (e) { alert('שגיאה בשמירה'); }
  };

  if (loading) return <div className="loader-container"><div className="loader-spin"></div></div>;
  if (!order) return <div style={{padding: '100px', textAlign: 'center'}}>הזמנה לא נמצאה.</div>;

  return (
    <div className="fade-in" style={{padding: '60px 5%'}}>
      <header style={{textAlign: 'center', marginBottom: '60px'}}>
        <h1 className="font-serif" style={{fontSize: '42px'}}>בחירת תפריט אישי</h1>
        <p style={{fontSize: '18px', opacity: 0.7}}>שלום {order.customerName}, מוזמן לסמן את המנות המועדפות עליך בתפריט.</p>
      </header>
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', maxWidth: '1400px', margin: '0 auto'}}>
        <div style={{position: 'relative', background: 'white', padding: '15px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)'}}>
          <img src="https://images.unsplash.com/photo-1547928576-a4a33237eceb?w=1200" alt="Menu" style={{width: '100%', borderRadius: '20px', display: 'block'}} />
          {SHABAT_DISHES.map(dish => (
            <div 
              key={dish.id} 
              className={`dish-hotspot ${selections.includes(dish.id) ? 'selected' : ''}`}
              style={{top: `${dish.top}%`, left: `${dish.left}%`, width: `${dish.width}%`, height: `${dish.height}%`}}
              onClick={() => toggle(dish.id)}
            />
          ))}
        </div>

        <aside style={{background: 'var(--dark)', color: 'white', borderRadius: '35px', padding: '40px', height: 'fit-content', position: 'sticky', top: '120px'}}>
          <h3 className="font-serif" style={{fontSize: '28px', color: 'var(--gold)', marginBottom: '30px'}}>המנות שבחרת ({selections.length})</h3>
          <div style={{maxHeight: '400px', overflowY: 'auto', marginBottom: '30px'}} className="custom-scrollbar">
            {selections.length === 0 ? <p style={{opacity: 0.4}}>טרם נבחרו מנות...</p> : (
              selections.map(sid => (
                <div key={sid} style={{background: 'rgba(255,255,255,0.05)', padding: '15px 20px', borderRadius: '15px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontWeight: 600}}>{SHABAT_DISHES.find(d => d.id === sid)?.name}</span>
                  <i className="fa-solid fa-xmark" style={{cursor: 'pointer', opacity: 0.5}} onClick={() => toggle(sid)}></i>
                </div>
              ))
            )}
          </div>
          <button disabled={selections.length === 0} onClick={save} className="nav-btn" style={{width: '100%', padding: '20px', borderRadius: '20px'}}>סיים ושמור הזמנה</button>
        </aside>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { db.fetchAll().then(res => { setOrders(res); setLoading(false); }); }, []);

  if (loading) return <div className="loader-container"><div className="loader-spin"></div></div>;

  return (
    <div className="fade-in" style={{padding: '60px 5%', maxWidth: '1200px', margin: '0 auto'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
        <h1 className="font-serif" style={{fontSize: '40px'}}>ניהול הזמנות</h1>
        <button onClick={() => window.location.reload()} className="nav-btn" style={{background: '#334155'}}><i className="fa-solid fa-rotate"></i> רענן</button>
      </div>
      
      <div style={{background: 'white', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.05)'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'right'}}>
          <thead style={{background: '#f8fafc'}}>
            <tr style={{borderBottom: '2px solid #edf2f7'}}>
              <th style={{padding: '20px'}}>לקוח</th>
              <th style={{padding: '20px'}}>תאריך ומיקום</th>
              <th style={{padding: '20px'}}>סטטוס</th>
              <th style={{padding: '20px'}}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                <td style={{padding: '20px'}}>
                  <div style={{fontWeight: 700}}>{o.customerName}</div>
                  <div style={{fontSize: '12px', color: '#94a3b8'}}>{o.phone}</div>
                </td>
                <td style={{padding: '20px'}}>
                  <div style={{fontWeight: 600}}>{new Date(o.eventDate).toLocaleDateString('he-IL')}</div>
                  <div style={{fontSize: '12px', color: '#94a3b8'}}>{o.location}</div>
                </td>
                <td style={{padding: '20px'}}>
                  <span style={{
                    padding: '6px 15px', borderRadius: '50px', fontSize: '12px', fontWeight: 700,
                    background: o.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                    color: o.status === 'COMPLETED' ? '#166534' : '#92400e'
                  }}>{o.status === 'COMPLETED' ? 'הושלם' : 'ממתין'}</span>
                </td>
                <td style={{padding: '20px'}}>
                  <Link to={`/order/${o.id}`} style={{color: 'var(--gold)', fontWeight: 700, textDecoration: 'none'}}>צפה</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div style={{padding: '60px', textAlign: 'center', color: '#94a3b8'}}>אין הזמנות להצגה</div>}
      </div>
    </div>
  );
};

// --- APP SETUP ---
const App = () => (
  <Router>
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <nav className="navbar">
        <Link to="/" className="logo font-serif" style={{textDecoration: 'none', color: 'var(--dark)', fontSize: '28px', fontWeight: 700}}>קייטרינג <span style={{color: 'var(--gold)'}}>הדרן</span></Link>
        <div style={{display: 'flex', gap: '25px', alignItems: 'center'}}>
          <Link to="/admin" style={{textDecoration: 'none', color: 'var(--slate)', fontWeight: 600, fontSize: '14px'}}>אזור ניהול</Link>
          <a href="/#booking" className="nav-btn">הזמן עכשיו</a>
        </div>
      </nav>
      <main style={{flexGrow: 1}}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/order/:id" element={<MenuSelection />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer style={{background: 'var(--dark)', color: 'white', padding: '80px 5%', textAlign: 'center'}}>
        <h2 className="font-serif" style={{fontSize: '32px', color: 'var(--gold)', marginBottom: '20px'}}>קייטרינג הדרן</h2>
        <p style={{opacity: 0.5, maxWidth: '600px', margin: '0 auto 40px'}}>אנחנו כאן כדי להפוך את השמחה שלכם לאירוע יוקרתי, טעים ומרגש. איכות ללא פשרות בכל ביס.</p>
        <div style={{display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '24px', marginBottom: '40px'}}>
          <i className="fa-brands fa-instagram" style={{cursor: 'pointer'}}></i>
          <i className="fa-brands fa-whatsapp" style={{cursor: 'pointer'}}></i>
          <i className="fa-solid fa-phone" style={{cursor: 'pointer'}}></i>
        </div>
        <div style={{opacity: 0.2, fontSize: '12px'}}>כל הזכויות שמורות © 2024 קייטרינג הדרן - יוקרה קולינרית</div>
      </footer>
      <ConnectionStatus />
    </div>
  </Router>
);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
