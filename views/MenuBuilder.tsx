
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Fix: Added SHABAT_DISHES to imports from constants
import { MENUS, SHABAT_DISHES } from '../constants';
import { databaseService } from '../services/database';
import { OrderStatus, EventRequest } from '../types';

const MenuBuilder: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<EventRequest | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string>('shabat');
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
      }).catch((err) => {
        console.error(err);
        setError('אירעה שגיאה בטעינת הנתונים. וודאו שקישור ה-Supabase מוגדר כראוי.');
      });
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
    return (selections[categoryId] || []).length > 0; // Simple check for visual mode
  };

  const isMenuComplete = activeMenu.categories.every(c => (selections[c.id] || []).length > 0);

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
                  שלום <span className="text-white font-medium">{request.customerName}</span>, מוזמנים לבחור את המנות שיככבו באירוע שלכם.
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
          {activeMenu.isVisual ? (
            <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-4 relative overflow-hidden flex flex-col items-center">
              <div className="w-full text-center mb-6">
                 <h2 className="text-2xl font-serif font-bold">לחצו על המנות המבוקשות בטופס</h2>
                 <p className="text-neutral-400 text-sm">המנות המסומנות יופיעו בצ'ק-ליסט משמאל</p>
              </div>
              <div className="relative w-full max-w-[1000px] shadow-2xl rounded-xl overflow-hidden bg-slate-100">
                <img src={activeMenu.backgroundImage} alt="Menu Template" className="w-full block" />
                <div className="absolute inset-0 pointer-events-none">
                  {activeMenu.categories[0].items.map(item => {
                    const isSelected = (selections['all_dishes'] || []).includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        title={item.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection('all_dishes', item.id, 99);
                        }}
                        className={`dish-hotspot pointer-events-auto ${isSelected ? 'selected' : ''}`}
                        style={{
                          top: `${item.top}%`,
                          left: `${item.left}%`,
                          width: `${item.width}%`,
                          height: `${item.height}%`
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            activeMenu.categories.map(cat => (
              <section key={cat.id} className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-8">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                  <h2 className="text-2xl font-serif font-bold text-slate-900">{cat.title}</h2>
                  <div className="text-sm font-bold text-gold">בחירתכם: {(selections[cat.id] || []).length} / {cat.limit}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {cat.items.map(item => {
                    const isSelected = (selections[cat.id] || []).includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => toggleSelection(cat.id, item.id, cat.limit)}
                        className={`flex gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-gold bg-gold/5' : 'border-neutral-50 hover:border-neutral-200'}`}
                      >
                        {item.image && <img src={item.image} className="w-20 h-20 rounded-xl object-cover" />}
                        <div>
                          <h4 className="font-bold text-slate-900">{item.name}</h4>
                          {item.description && <p className="text-xs text-neutral-400">{item.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        <aside className="lg:w-96 shrink-0">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl p-8 sticky top-24 border border-white/5">
            <h3 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
              <i className="fa-solid fa-list-check text-gold"></i>
              המנות שבחרתם
            </h3>
            
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(selections).map(([catId, items]) => {
                if (items.length === 0) return null;
                return (
                  <div key={catId}>
                    <div className="grid gap-2">
                      {items.map(id => {
                        const item = SHABAT_DISHES.find(i => i.id === id) || 
                                     activeMenu.categories.flatMap(c => c.items).find(i => i.id === id);
                        return (
                          <div key={id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                             <span className="text-sm font-medium">{item?.name}</span>
                             <button onClick={() => toggleSelection(catId, id, 99)} className="text-white/30 hover:text-red-400 transition-colors">
                               <i className="fa-solid fa-circle-xmark"></i>
                             </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {Object.values(selections).every(arr => arr.length === 0) && (
                <div className="text-center py-10 opacity-30 italic">
                   טרם נבחרו מנות...
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <button 
                disabled={isSubmitting || Object.values(selections).every(v => v.length === 0)}
                onClick={handleFinish}
                className="w-full py-4 rounded-2xl font-bold text-lg shadow-2xl bg-gold hover:bg-yellow-600 text-white transition-all transform active:scale-95 disabled:bg-white/5 disabled:text-neutral-600 disabled:cursor-not-allowed"
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
