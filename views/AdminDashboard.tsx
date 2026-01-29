
import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/database';
import { emailService } from '../services/email';
import { EventRequest, OrderStatus } from '../types';
import { MENUS } from '../constants';

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  const [showEmailModal, setShowEmailModal] = useState<{show: boolean, request?: EventRequest}>({show: false});

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await databaseService.getRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (req: EventRequest) => {
    setShowEmailModal({show: true, request: req});
  };

  const confirmApprovalAndSendEmail = async (req: EventRequest) => {
    setSendingEmail(true);
    try {
      const orderLink = `${window.location.origin}/#/order/${req.id}`;
      
      // 1. Send real email via EmailJS
      await emailService.sendApprovalEmail({
        customer_name: req.customerName,
        customer_email: req.email,
        event_date: new Date(req.eventDate).toLocaleDateString('he-IL'),
        location: req.location,
        order_link: orderLink
      });

      // 2. Update status in Supabase
      await databaseService.updateRequestStatus(req.id, OrderStatus.APPROVED);
      
      await loadRequests();
      setShowEmailModal({show: false});
      alert(`ההזמנה אושרה! המייל נשלח לכתובת: ${req.email}`);
    } catch (err) {
      console.error(err);
      alert('אירעה שגיאה בתהליך האישור או בשליחת המייל.');
    } finally {
      setSendingEmail(false);
    }
  };

  const filtered = requests.filter(r => {
    if (activeTab === 'pending') return r.status === OrderStatus.PENDING;
    return r.status !== OrderStatus.PENDING;
  });

  const printWorkOrder = (request: EventRequest) => {
    const menu = MENUS.find(m => m.id === request.selectedMenuId);
    if (!menu || !request.selections) return;

    let html = `
      <div dir="rtl" style="font-family: sans-serif; padding: 40px; border: 2px solid #333;">
        <h1 style="text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 10px; color: #d4af37;">פקודת עבודה - קייטרינג הדרן</h1>
        <div style="display: flex; justify-content: space-between; margin: 20px 0; font-size: 1.1em; background: #fafafa; padding: 15px; border-radius: 8px;">
          <div>
            <strong>לקוח:</strong> ${request.customerName}<br>
            <strong>תאריך:</strong> ${new Date(request.eventDate).toLocaleDateString('he-IL')}<br>
            <strong>מיקום:</strong> ${request.location}
          </div>
          <div style="text-align: left;">
            <strong>כמות אורחים:</strong> ${request.guestCount}<br>
            <strong>תפריט:</strong> ${menu.name}
          </div>
        </div>
        <div style="margin-top: 30px;">
          ${Object.entries(request.selections).map(([catId, itemIds]) => {
            const cat = menu.categories.find(c => c.id === catId);
            return `
              <div style="margin-bottom: 25px;">
                <h3 style="background: #333; color: #fff; padding: 10px 15px; border-radius: 4px;">${cat?.title}</h3>
                <ul style="list-style: none; padding-right: 10px;">
                  ${itemIds.map(iid => {
                    const item = cat?.items.find(i => i.id === iid);
                    return `<li style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 1.1em;">• ${item?.name}</li>`;
                  }).join('')}
                </ul>
              </div>
            `;
          }).join('')}
        </div>
        <div style="margin-top: 50px; text-align: center; font-size: 0.8em; color: #888;">הופק על ידי מערכת הניהול - קייטרינג הדרן</div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">ניהול הזמנות הדרן</h1>
          <p className="text-neutral-500">מרכז הבקרה לניהול פניות ואירועים פעילים.</p>
        </div>
        <div className="flex bg-neutral-100 p-1.5 rounded-2xl shadow-inner">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-md' : 'text-neutral-500 hover:text-slate-700'}`}
          >
            פניות חדשות ({requests.filter(r => r.status === OrderStatus.PENDING).length})
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-md' : 'text-neutral-500 hover:text-slate-700'}`}
          >
            אירועים פעילים ({requests.filter(r => r.status !== OrderStatus.PENDING).length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-32 gap-4">
             <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
             <p className="text-neutral-400 font-medium">טוען נתונים מהענן...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-32 text-center">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300">
              <i className="fa-solid fa-folder-open text-3xl"></i>
            </div>
            <p className="text-neutral-400 font-medium">אין כרגע בקשות להצגה בלשונית זו</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-neutral-100">
                  <th className="px-8 py-5 text-sm font-bold text-slate-600">פרטי לקוח ואירוע</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-600">מיקום וכמות</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-600">סטטוס הזמנה</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-600 text-left">פעולות ניהול</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filtered.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 text-lg mb-0.5">{req.customerName}</div>
                      <div className="text-xs text-neutral-400 mb-2 flex items-center gap-3">
                         <span><i className="fa-solid fa-phone mr-1"></i> {req.phone}</span>
                         <span><i className="fa-solid fa-envelope mr-1"></i> {req.email}</span>
                      </div>
                      <div className="text-sm font-medium text-slate-600">
                        <i className="fa-solid fa-calendar-day text-gold ml-2"></i>
                        {new Date(req.eventDate).toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-slate-900 font-medium mb-1 flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-gold"></i> {req.location}
                      </div>
                      <div className="text-sm text-neutral-500">
                        <i className="fa-solid fa-users text-gold ml-1"></i> {req.guestCount} אורחים
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full border ${
                        req.status === OrderStatus.PENDING ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        req.status === OrderStatus.APPROVED ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        req.status === OrderStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-neutral-50 text-neutral-500 border-neutral-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          req.status === OrderStatus.PENDING ? 'bg-amber-400' :
                          req.status === OrderStatus.APPROVED ? 'bg-blue-400' :
                          req.status === OrderStatus.COMPLETED ? 'bg-emerald-400' : 'bg-neutral-400'
                        }`}></span>
                        {req.status === OrderStatus.PENDING ? 'בקשה חדשה' :
                         req.status === OrderStatus.APPROVED ? 'ממתין לבחירת תפריט' :
                         req.status === OrderStatus.COMPLETED ? 'בחירה הסתיימה' : req.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-left">
                      <div className="flex justify-end gap-3">
                        {req.status === OrderStatus.PENDING && (
                          <button 
                            onClick={() => handleApproveClick(req)}
                            className="bg-gold hover:bg-yellow-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
                          >
                            <i className="fa-solid fa-envelope"></i> אשר ושלח הזמנה
                          </button>
                        )}
                        {req.status === OrderStatus.COMPLETED && (
                          <button 
                            onClick={() => printWorkOrder(req)}
                            className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
                          >
                            <i className="fa-solid fa-print"></i> פקודת עבודה
                          </button>
                        )}
                        {req.status === OrderStatus.APPROVED && (
                          <button 
                            onClick={() => {
                              const link = `${window.location.origin}/#/order/${req.id}`;
                              navigator.clipboard.writeText(link);
                              alert('הלינק האישי הועתק ללוח!');
                            }}
                            className="text-slate-500 hover:text-gold text-xs font-bold flex items-center gap-1 bg-white border border-neutral-200 px-4 py-2 rounded-xl transition-all"
                          >
                            <i className="fa-solid fa-link"></i> העתק לינק שוב
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email Confirmation Modal */}
      {showEmailModal.show && showEmailModal.request && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-serif font-bold text-slate-900">אישור ושליחת תפריט לבחירה</h3>
              <button onClick={() => setShowEmailModal({show: false})} className="text-neutral-400 hover:text-slate-900 transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-grow bg-slate-100/30">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 text-right space-y-4">
                <div className="flex justify-center mb-6">
                   <span className="text-2xl font-serif font-bold text-slate-900">קייטרינג <span className="text-gold">הדרן</span></span>
                </div>
                <p className="text-lg">הודעה ל-<strong>{showEmailModal.request.customerName}</strong> ({showEmailModal.request.email}):</p>
                <div className="bg-slate-50 p-6 rounded-xl border-r-4 border-gold text-sm text-slate-700 leading-relaxed">
                  שלום {showEmailModal.request.customerName}, שמחים לבשר לך שהתאריך שביקשת ({new Date(showEmailModal.request.eventDate).toLocaleDateString('he-IL')}) זמין עבור האירוע ב-{showEmailModal.request.location}. 
                  אנא היכנס לקישור הבא לבחירת המנות:
                  <div className="mt-4 text-gold font-bold">{window.location.origin}/#/order/{showEmailModal.request.id}</div>
                </div>
                <p className="text-xs text-neutral-400 mt-4 italic">* המייל יישלח באמצעות שירות EmailJS המחובר לחשבון המנהל.</p>
              </div>
            </div>
            <div className="p-6 border-t border-neutral-100 flex gap-4">
              <button 
                disabled={sendingEmail}
                onClick={() => confirmApprovalAndSendEmail(showEmailModal.request!)}
                className="flex-grow bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3"
              >
                {sendingEmail ? (
                  <><i className="fa-solid fa-spinner animate-spin"></i> שולח מייל...</>
                ) : (
                  <><i className="fa-solid fa-paper-plane"></i> אישור ושליחת מייל</>
                )}
              </button>
              <button 
                disabled={sendingEmail}
                onClick={() => setShowEmailModal({show: false})}
                className="px-8 border border-neutral-200 text-neutral-500 font-bold rounded-2xl hover:bg-neutral-50 transition-all"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
