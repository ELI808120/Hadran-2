import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './views/LandingPage';
import MenuBuilder from './views/MenuBuilder';
import AdminDashboard from './views/AdminDashboard';
import ScrollToTop from './src/ScrollToTop';

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl font-serif font-bold text-slate-900 tracking-tight">קייטרינג <span className="text-gold">הדרן</span></span>
            </Link>
            <div className="flex gap-8 items-center">
              {/* <Link to="/admin" className="text-slate-900 font-bold text-sm">ניהול אירועים</Link> */}
              <a href="/#request-form" className="bg-gold text-white px-6 py-3 rounded-full text-sm font-bold shadow-md hover:bg-yellow-600 transition-all transform hover:scale-105 active:scale-95">הזמן אירוע עכשיו</a>
            </div>
          </div>
        </nav>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/order/:orderId" element={<MenuBuilder />} />
          </Routes>
        </main>

        <footer className="bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12 mb-12 text-center md:text-right">
              <div>
                <h2 className="font-serif text-3xl mb-4 italic text-gold">קייטרינג הדרן</h2>
                <p className="text-neutral-400 leading-relaxed">אנחנו לא רק מגישים אוכל, אנחנו יוצרים זיכרונות. אירועים יוקרתיים בכשרות מהדרין.</p>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="font-bold mb-2">צור קשר</h4>
                <p className="text-neutral-400">050-1234567</p>
                <p className="text-neutral-400">hadran@catering.com</p>
                <p className="text-neutral-400">ירושלים והסביבה | מרכז</p>
              </div>
              <div className="flex flex-col gap-4 items-center md:items-start">
                <h4 className="font-bold">עקבו אחרינו</h4>
                <div className="flex gap-6 text-2xl">
                  <i className="fa-brands fa-facebook cursor-pointer hover:text-gold transition-colors"></i>
                  <i className="fa-brands fa-instagram cursor-pointer hover:text-gold transition-colors"></i>
                  <i className="fa-brands fa-whatsapp cursor-pointer hover:text-gold transition-colors"></i>
                </div>
              </div>
            </div>
            <div className="border-t border-white/5 pt-8 text-center">
              <p className="text-xs text-neutral-500">© 2024 כל הזכויות שמורות לקייטרינג הדרן. מעוצב באהבה לאירועים מושלמים.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
