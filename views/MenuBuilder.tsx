
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MENUS } from '../constants';
import { databaseService } from '../services/database';
import { OrderStatus, EventRequest } from '../types';

const MenuBuilder: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<EventRequest | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string>('classic');
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      databaseService.getRequestById(orderId).then(found => {
        if (found) {
          if (found.status === OrderStatus.PENDING) {
            setError('הזמנה זו טרם אושרה על ידי המערכת. אנא המתינו לאישור במייל.');
          } else {
            setRequest(found);
            // Initialize selections for the current active menu
            const menu = MENUS.find(m => m.id === activeMenuId);
            if (menu) {
              const initial: Record<string, string[]> = {};
              menu.categories.forEach(c => initial[c.id] = []);
              setSelections(initial);
            }
          }
        } else {
          setError('הזמנה לא נמצאה במערכת.');
        }
      }).catch(() => setError('אירעה שגיאה בטעינת הנתונים.'));
    }
  }, [orderId, activeMenuId]);

  const activeMenu = useMemo(() => MENUS.find(m => m.id === activeMenuId)!, [activeMenuId]);

  const toggleSelection = (categoryId: string, itemId: string, limit: number) => {
    setSelections(prev => {
      const current = prev[categoryId] || [];
      if (current.includes(itemId)) {
        return { ...prev, [categoryId]: current.filter(id => id !== itemId) };
      }
      if (current.length < limit) {
        return { ...prev, [categoryId]: [...current, itemId] };
      }
      return prev;
    });
  };

  const isCategoryComplete = (categoryId: string, limit: number) => {
    return (selections[categoryId] || []).length === limit;
  };

  const isMenuComplete = activeMenu.categories.every(c => isCategoryComplete(c.id, c.limit));

  const handleFinish = async () => {
    if (!orderId) return;
    setIsSubmitting(true);
    try {
      await databaseService.updateSelections(orderId, activeMenuId, selections);
      alert('הבחירות נשמרו בהצלחה! צוות הדרן יעבור על ההזמנה וייצור איתכם קשר.');
      navigate('/');
    } catch (err) {
      alert('אירעה שגיאה בשמירת הבחירות');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in">
        <div className="bg-white p-12 rounded-[2rem] shadow-2xl text-center max-w-lg border border-red-50">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">{error}</h2>
          <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all">חזור לדף הבית</button>
        </div>
      </div>
    );
  }

  if (!request) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-neutral-500 font-medium">טוען את התפריטים עבורכם...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in">
      {/* Header Info */}
      <div className="bg-slate-900 text-white py-12 mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
               <div className="inline-block bg-gold/20 text-gold text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-gold/30 mb-3">
                  תהליך בחירת מנות
               </div>
               <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">עיצוב התפריט האישי שלכם</h1>
               <p className="text-neutral-400 max-w-xl text-lg font-light leading-relaxed">
                  שלום <span className="text-white font-medium">{request.customerName}</span>, מוזמנים לבחור את המנות שיככבו באירוע שלכם ב-<span className="text-white font-medium">{new Date(request.eventDate).toLocaleDateString('he-IL')}</span> ב-<span className="text-white font-medium">{request.location}</span>.
               </p>
            </div>
            <div className="flex bg-white/5 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
              {MENUS.map(m => (
                <button 
                  key={m.id}
                  onClick={() => setActiveMenuId(m.id)}
                  className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeMenuId === m.id ? 'bg-gold text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
                >
                  {m.name}
                </button>
              ))}
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-8">
        <div className="flex-grow space-y-12">
          {activeMenu.categories.map(cat => (
            <section key={cat.id} className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-8 md:p-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-neutral-50 pb-6">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-slate-900 mb-1">{cat.title}</h2>
                  <p className="text-neutral-500">יש לבחור בדיוק {cat.limit} פריטים מהרשימה מטה</p>
                </div>
                <div className={`px-5 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all ${isCategoryComplete(cat.id, cat.limit) ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-neutral-100'}`}>
                  {isCategoryComplete(cat.id, cat.limit) ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-circle"></i>}
                  בחירתכם: {(selections[cat.id] || []).length} / {cat.limit}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {cat.items.map(item => {
                  const isSelected = (selections[cat.id] || []).includes(item.id);
                  const isLimitReached = (selections[cat.id] || []).length >= cat.limit && !isSelected;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleSelection(cat.id, item.id, cat.limit)}
                      className={`group relative flex flex-col cursor-pointer bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                        isSelected 
                          ? 'border-gold shadow-xl ring-4 ring-gold/5' 
                          : 'border-neutral-100 hover:border-gold/30 hover:shadow-md'
                      } ${isLimitReached ? 'opacity-50 grayscale-[0.5]' : ''}`}
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                          <div className="w-14 h-14 bg-gold text-white rounded-full flex items-center justify-center text-2xl shadow-2xl animate-bounce">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="text-xl font-bold text-slate-900 mb-2">{item.name}</h4>
                        <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <aside className="lg:w-96 shrink-0">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl p-8 sticky top-24 border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-bl-full -z-0"></div>
            
            <h3 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3 relative z-10">
              <i className="fa-solid fa-list-check text-gold"></i>
              סטטוס התפריט
            </h3>
            
            <div className="space-y-8 relative z-10">
              {activeMenu.categories.map(cat => {
                const count = (selections[cat.id] || []).length;
                const isDone = count === cat.limit;
                return (
                  <div key={cat.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`font-bold transition-colors ${isDone ? 'text-gold' : 'text-neutral-400'}`}>
                        {cat.title}
                      </span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${isDone ? 'bg-gold/20 text-gold' : 'bg-white/10 text-neutral-500'}`}>
                        {count}/{cat.limit}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ease-out ${isDone ? 'bg-gold' : 'bg-white/20'}`}
                        style={{ width: `${(count / cat.limit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 relative z-10">
              <button 
                disabled={!isMenuComplete || isSubmitting}
                onClick={handleFinish}
                className={`w-full py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all transform active:scale-95 ${
                  isMenuComplete 
                    ? 'bg-gold hover:bg-yellow-600 text-white cursor-pointer hover:-translate-y-1' 
                    : 'bg-white/5 text-neutral-600 cursor-not-allowed border border-white/5'
                }`}
              >
                {isSubmitting ? 'מעבד...' : 'סיים ושדר הזמנה'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MenuBuilder;
