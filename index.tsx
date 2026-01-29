
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// --- TYPES ---
enum OrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SELECTION_IN_PROGRESS = 'SELECTION_IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  top?: number;
  left?: number;
  width?: number;
  height?: number;
}

interface MenuTemplate {
  id: string;
  name: string;
  categories: { id: string; title: string; limit: number; items: MenuItem[] }[];
  isVisual?: boolean;
  backgroundImage?: string;
}

interface EventRequest {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  eventDate: string;
  location: string;
  guestCount: number;
  status: OrderStatus;
  createdAt: string;
  selectedMenuId?: string;
  selections?: Record<string, string[]>; 
}

// --- CONSTANTS ---
const SHABAT_DISHES: MenuItem[] = [
    {"id":"s1","name":"סלטים","top":7.85,"left":82.59,"width":3.97,"height":1.69},
    {"id":"s2","name":"בורגול","top":88.51,"left":79.69,"width":11.84,"height":1.14},
    {"id":"f1","name":"סלמון","top":33.01,"left":65.28,"width":9.70,"height":1.51},
    {"id":"m1","name":"צלי בשר","top":68.98,"left":68.61,"width":7.22,"height":1.51},
    {"id":"ch1","name":"צ'ולנט","top":39.29,"left":30.91,"width":11.58,"height":1.51},
    {"id":"d1","name":"פירות יער","top":71.88,"left":55.57,"width":3.80,"height":1.02}
];

const MENUS: MenuTemplate[] = [
  {
    id: 'shabat',
    name: 'תפריט שבת המלא',
    isVisual: true,
    backgroundImage: 'https://images.unsplash.com/photo-1547928576-a4a33237eceb?w=1000', 
    categories: [{ id: 'all_dishes', title: 'בחירת מנות מהתפריט', limit: 99, items: SHABAT_DISHES }]
  }
];

// --- SUPABASE CLIENT ---
const SUPABASE_URL = (window as any).process?.env?.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (window as any).process?.env?.SUPABASE_ANON_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// --- DATABASE SERVICE ---
const dbService = {
  async testConnection() {
    if (!supabase) return { ok: false, message: 'Supabase credentials missing.' };
    try {
      const { data, error } = await supabase.from('event_requests').select('id').limit(1);
      if (error) throw error;
      return { ok: true, message: 'מחובר למסד הנתונים בהצלחה!' };
    } catch (err: any) {
      return { ok: false, message: err.message || 'שגיאת התחברות לשרת.' };
    }
  },
  async saveRequest(request: Omit<EventRequest, 'id' | 'status' | 'createdAt'>) {
    if (supabase) {
      const { data, error } = await supabase
        .from('event_requests')
        .insert([{ ...request, status: OrderStatus.PENDING }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const requests = JSON.parse(localStorage.getItem('hadran_db') || '[]');
      const newReq = { ...request, id: 'local_' + Date.now(), status: OrderStatus.PENDING, createdAt: new Date().toISOString() };
      requests.push(newReq);
      localStorage.setItem('hadran_db', JSON.stringify(requests));
      return newReq;
    }
  },
  async getRequests() {
    if (supabase) {
      const { data, error } = await supabase.from('event_requests').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return JSON.parse(localStorage.getItem('hadran_db') || '[]');
    }
  },
  async getRequestById(id: string) {
    if (supabase) {
      const { data, error } = await supabase.from('event_requests').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    } else {
      const requests = JSON.parse(localStorage.getItem('hadran_db') || '[]');
      return requests.find((r: any) => r.id === id) || null;
    }
  },
  async updateSelections(id: string, menuId: string, selections: Record<string, string[]>) {
    if (supabase) {
      const { error } = await supabase
        .from('event_requests')
        .update({ selected_menu_id: menuId, selections, status: OrderStatus.COMPLETED })
        .eq('id', id);
      if (error) throw error;
    } else {
      const requests = JSON.parse(localStorage.getItem('hadran_db') || '[]');
      const req = requests.find((r: any) => r.id === id);
      if (req) {
        req.selectedMenuId = menuId;
        req.selections = selections;
        req.status = OrderStatus.COMPLETED;
        localStorage.setItem('hadran_db', JSON.stringify(requests));
      }
    }
  }
};

// --- COMPONENTS ---

const ConnectionStatus = () => {
  const [status, setStatus] = useState<'testing' | 'online' | 'offline'>('testing');
  const [showToast, setShowToast] = useState(false);
  const [msg, setMsg] = useState('');

  const check = async () => {
    setStatus('testing');
    const res = await dbService.testConnection();
    setStatus(res.ok ? 'online' : 'offline');
    setMsg(res.message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => { check(); }, []);

  return (
    <>
      <div 
        onClick={check}
        style={{
          position: 'fixed', bottom: '20px', left: '20px', zIndex: 2000,
          background: 'white', padding: '8px 15px', borderRadius: '50px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center',
          gap: '10px', cursor: 'pointer', border: '1px solid #eee'
        }}
      >
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          backgroundColor: status === 'online' ? '#22c55e' : status === 'offline' ? '#ef4444' : '#fbbf24',
          boxShadow: `0 0 10px ${status === 'online' ? '#22c55e' : '#ef4444'}`
        }} />
        <span style={{fontSize: '12px', fontWeight: 'bold'}}>
          {status === 'online' ? 'מסד נתונים מחובר' : status === 'offline' ? 'מצב מקומי (Offline)' : 'בודק חיבור...'}
        </span>
      </div>

      {showToast && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '20px', zIndex: 2000,
          background: status === 'online' ? '#065f46' : '#991b1b', color: 'white',
          padding: '12px 20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {msg}
        </div>
      )}
    </>
  );
};

const LandingPage = () => {
  const [formData, setFormData] = useState({ customerName: '', email: '', phone: '', eventDate: '', location: '', guestCount: 50 });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dbService.saveRequest(formData);
      setSubmitted(true);
    } catch (err) {
      alert('שגיאה בשליחת הבקשה. נסה שוב מאוחר יותר.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="section fade-in text-center">
      <div className="card py-20">
        <i className="fa-solid fa-circle-check text-6xl text-gold mb-6"></i>
        <h2 className="font-serif text-4xl mb-4">תודה {formData.customerName}!</h2>
        <p className="text-xl opacity-70">הבקשה התקבלה. ניצור איתך קשר בהקדם.</p>
        <button onClick={() => setSubmitted(false)} className="nav-btn mt-8">שלח בקשה חדשה</button>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <header className="hero">
        <h1 className="font-serif">יוקרה בכל ביס</h1>
        <p>קייטרינג הדרן הופך כל אירוע ליצירת אמנות קולינרית. איכות ללא פשרות, כשרות למהדרין.</p>
        <a href="#booking" className="nav-btn" style={{padding: '20px 60px', fontSize: '1.2rem'}}>התחילו עכשיו</a>
      </header>

      <section id="booking" className="section" style={{marginTop: '-100px'}}>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <h2 className="font-serif text-3xl text-center mb-10">שריון תאריך לאירוע</h2>
            <div className="form-grid">
              <input required placeholder="שם מלא" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
              <input required type="tel" placeholder="טלפון" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-grid">
              <input required type="email" placeholder="אימייל" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input required type="date" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
            </div>
            <div className="form-grid">
              <input required placeholder="מיקום" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              <input required type="number" placeholder="מספר אורחים" value={formData.guestCount} onChange={e => setFormData({...formData, guestCount: Number(e.target.value)})} />
            </div>
            <button disabled={loading} className="nav-btn" style={{width: '100%', padding: '20px', fontSize: '1.1rem'}}>
              {loading ? 'שולח...' : 'שלח בקשה'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

const MenuBuilder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<EventRequest | null>(null);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      dbService.getRequestById(orderId).then(data => {
        if (data) setRequest(data);
        setLoading(false);
      });
    }
  }, [orderId]);

  const activeMenu = MENUS[0];

  const toggle = (id: string) => {
    setSelections(prev => {
      const current = prev['all_dishes'] || [];
      const next = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
      return { ...prev, ['all_dishes']: next };
    });
  };

  if (loading) return <div className="section text-center"><div className="loader-spin mx-auto"></div></div>;
  if (!request) return <div className="section text-center">הזמנה לא נמצאה.</div>;

  return (
    <div className="section fade-in">
      <h1 className="font-serif text-4xl text-center mb-10">עיצוב התפריט - {request.customerName}</h1>
      <div className="menu-layout">
        <div className="menu-visual">
          <img src={activeMenu.backgroundImage} alt="Menu" />
          {SHABAT_DISHES.map(item => (
            <div 
              key={item.id}
              className={`dish-hotspot ${(selections['all_dishes'] || []).includes(item.id) ? 'selected' : ''}`}
              style={{ top: `${item.top}%`, left: `${item.left}%`, width: `${item.width}%`, height: `${item.height}%` }}
              onClick={() => toggle(item.id)}
            />
          ))}
        </div>
        <aside className="sidebar">
          <h3 className="font-serif text-2xl mb-6">מנות שנבחרו</h3>
          <div className="custom-scrollbar" style={{maxHeight: '400px', overflowY: 'auto'}}>
            {(selections['all_dishes'] || []).map(id => {
              const item = SHABAT_DISHES.find(d => d.id === id);
              return (
                <div key={id} style={{background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between'}}>
                  <span>{item?.name}</span>
                  <i className="fa-solid fa-xmark cursor-pointer" onClick={() => toggle(id)}></i>
                </div>
              );
            })}
          </div>
          <button onClick={() => navigate('/')} className="nav-btn w-full mt-10">שמור בחירות</button>
        </aside>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbService.getRequests().then(data => {
      setRequests(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="section text-center"><div className="loader-spin mx-auto"></div></div>;

  return (
    <div className="section fade-in">
      <h1 className="font-serif text-4xl mb-10">ניהול הזמנות</h1>
      <div className="card">
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'right'}}>
          <thead>
            <tr style={{borderBottom: '2px solid #eee'}}>
              <th className="p-4">לקוח</th>
              <th className="p-4">תאריך</th>
              <th className="p-4">סטטוס</th>
              <th className="p-4">פעולה</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id} style={{borderBottom: '1px solid #eee'}}>
                <td className="p-4"><strong>{r.customerName}</strong></td>
                <td className="p-4">{new Date(r.eventDate).toLocaleDateString('he-IL')}</td>
                <td className="p-4">{r.status}</td>
                <td className="p-4"><Link to={`/order/${r.id}`} className="text-gold">ערוך</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <nav className="navbar">
        <Link to="/" className="logo font-serif">קייטרינג <span>הדרן</span></Link>
        <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
          <Link to="/admin" style={{textDecoration: 'none', color: 'var(--slate)', fontSize: '0.9rem'}}>אזור ניהול</Link>
          <a href="#booking" className="nav-btn">הזמן עכשיו</a>
        </div>
      </nav>
      <main style={{flexGrow: 1}}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/order/:orderId" element={<MenuBuilder />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer style={{background: 'var(--dark)', color: 'white', padding: '60px 5%', textAlign: 'center'}}>
        <h2 className="font-serif text-gold text-3xl mb-4">קייטרינג הדרן</h2>
        <p className="opacity-50">יוקרה קולינרית לאירועים בלתי נשכחים</p>
        
        <button 
          onClick={async () => {
            const res = await dbService.testConnection();
            alert(res.message);
          }}
          style={{
            background: 'none', border: '1px solid var(--gold)', color: 'var(--gold)',
            padding: '10px 20px', borderRadius: '10px', marginTop: '30px', cursor: 'pointer'
          }}
        >
          <i className="fa-solid fa-database" style={{marginLeft: '10px'}}></i>
          בדיקת חיבור למסד הנתונים
        </button>

        <div style={{marginTop: '30px', opacity: 0.3, fontSize: '0.8rem'}}>כל הזכויות שמורות © 2024</div>
      </footer>
      <ConnectionStatus />
    </div>
  </Router>
);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
