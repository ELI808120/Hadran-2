
import React, { useState } from 'react';
import { TESTIMONIALS, MENUS } from '../constants';
import { databaseService } from '../services/database';

const LandingPage: React.FC = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    eventDate: '',
    location: '',
    guestCount: 50,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await databaseService.saveRequest(formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('אירעה שגיאה בשליחת הבקשה. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop" 
            alt="Catering Hero" 
            className="w-full h-full object-cover brightness-[0.4]"
          />
        </div>
        <div className="relative z-10 text-center text-white px-6 max-w-5xl animate-fade-in">
          <div className="inline-block border border-gold/50 px-4 py-1 rounded-full text-gold text-sm tracking-widest uppercase mb-6 backdrop-blur-sm">
            חוויה קולינרית ברמה אחרת
          </div>
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 drop-shadow-2xl leading-[1.1]">
            קייטרינג <span className="text-gold italic">הדרן</span>
          </h1>
          <p className="text-xl md:text-3xl mb-12 opacity-90 font-light max-w-3xl mx-auto leading-relaxed">
            אנחנו הופכים את האירוע שלכם ליצירת אמנות של טעמים, צבעים וניחוחות.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#request-form" className="bg-gold hover:bg-yellow-600 text-white text-xl font-bold px-12 py-5 rounded-full shadow-2xl transition-all transform hover:scale-105">
              התחל פתיחת הזמנה
            </a>
            <a href="#gallery" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 text-xl font-medium px-12 py-5 rounded-full transition-all">
              לצפייה בתפריטים
            </a>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <i className="fa-solid fa-chevron-down text-2xl"></i>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-4">המנות הנבחרות שלנו</h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-6"></div>
          <p className="text-neutral-500 max-w-2xl mx-auto">מבחר מנות מהתפריט הקלאסי והאקסטרה שלנו, המוכנות ממרכיבים טריים בכל יום.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...MENUS[0].categories[0].items.slice(0, 4), ...MENUS[1].categories[1].items.slice(0, 4)].map((item, idx) => (
            <div key={item.id + idx} className="group relative h-80 overflow-hidden rounded-3xl shadow-xl border border-neutral-100">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent flex flex-col justify-end p-8">
                <h3 className="text-2xl font-bold text-white mb-1">{item.name}</h3>
                <p className="text-gold text-sm font-medium">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Request Form */}
      <section id="request-form" className="bg-slate-50 py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-16 border border-neutral-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full -z-0"></div>
            
            {!submitted ? (
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <span className="text-gold font-bold text-sm tracking-widest uppercase mb-2 block">צעד ראשון לשמחה</span>
                  <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">בקשת שריון תאריך</h2>
                  <p className="text-neutral-500">הזינו את פרטי האירוע, ואנו נשלח לכם לינק אישי לבניית התפריט המותאם בדיוק עבורכם.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 mr-2">שם המארח/ת</label>
                      <input 
                        required
                        type="text" 
                        placeholder="ישראל ישראלי"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-neutral-200 focus:ring-2 focus:ring-gold focus:bg-white outline-none transition-all placeholder:text-neutral-300"
                        value={formData.customerName}
                        onChange={e => setFormData({...formData, customerName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 mr-2">טלפון ליצירת קשר</label>
                      <input 
                        required
                        type="tel" 
                        placeholder="050-0000000"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-neutral-200 focus:ring-2 focus:ring-gold focus:bg-white outline-none transition-all placeholder:text-neutral-300"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 mr-2">תאריך האירוע המבוקש</label>
                      <input 
                        required
                        type="date" 
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-neutral-200 focus:ring-2 focus:ring-gold focus:bg-white outline-none transition-all"
                        value={formData.eventDate}
                        onChange={e => setFormData({...formData, eventDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 mr-2">מספר מוזמנים (בערך)</label>
                      <input 
                        required
                        type="number" 
                        placeholder="100"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-neutral-200 focus:ring-2 focus:ring-gold focus:bg-white outline-none transition-all"
                        value={formData.guestCount}
                        onChange={e => setFormData({...formData, guestCount: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 mr-2">מיקום האירוע (כתובת או שם אולם)</label>
                    <input 
                      required
                      type="text" 
                      placeholder="למשל: אולם שירת הים, נתניה"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-neutral-200 focus:ring-2 focus:ring-gold focus:bg-white outline-none transition-all placeholder:text-neutral-300"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 mr-2">כתובת אימייל (לקבלת הלינק)</label>
                    <input 
                      required
                      type="email" 
                      placeholder="example@email.com"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-neutral-200 focus:ring-2 focus:ring-gold focus:bg-white outline-none transition-all placeholder:text-neutral-300"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <button 
                    disabled={isSubmitting}
                    type="submit" 
                    className={`w-full py-5 rounded-2xl text-white font-bold text-xl shadow-xl transition-all transform hover:-translate-y-1 ${isSubmitting ? 'bg-neutral-400' : 'bg-slate-900 hover:bg-black active:scale-95'}`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-spinner animate-spin"></i> מעבד בקשה...
                      </span>
                    ) : 'שלח בקשה וקבל אישור'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-12 relative z-10 animate-fade-in">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-lg border-4 border-white">
                  <i className="fa-solid fa-check"></i>
                </div>
                <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">תודה {formData.customerName}!</h2>
                <p className="text-xl text-neutral-600 mb-10 leading-relaxed">
                  הבקשה נרשמה במערכת. אנו בודקים את הזמינות ב-{new Date(formData.eventDate).toLocaleDateString('he-IL')} במיקום {formData.location}.
                  <br />
                  <span className="font-bold text-slate-900">לינק אישי לבחירת התפריט יישלח אליכם בקרוב!</span>
                </p>
                <button onClick={() => setSubmitted(false)} className="text-gold font-bold hover:text-yellow-600 transition-colors flex items-center gap-2 mx-auto">
                  <i className="fa-solid fa-arrow-right-long"></i> שליחת בקשה נוספת
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-slate-900">מה הלקוחות שלנו אומרים</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="relative bg-white p-10 rounded-3xl shadow-lg border border-neutral-100 overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-gold transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
              <div className="flex text-gold mb-6 text-sm">
                {[...Array(t.rating)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
              </div>
              <p className="text-slate-700 italic text-lg mb-8 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <i className="fa-solid fa-user"></i>
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{t.name}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
