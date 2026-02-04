
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { EventRequest } from '../types';

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_requests')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      console.error("Error loading requests:", error);
    } else {
      setRequests(data as EventRequest[]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold text-slate-900 mb-8">רשימת בקשות לאירועים</h1>

      {loading ? (
        <div className="text-center text-neutral-500">טוען נתונים...</div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-neutral-100">
                  <th className="px-8 py-5 text-sm font-bold text-slate-600">לקוח</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-600">תאריך אירוע</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-600">מיקום</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-600">אורחים</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-600">סטטוס</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-600">פרטי תפריט</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900">{req.customerName}</div>
                      <div className="text-sm text-neutral-500">{req.email}</div>
                    </td>
                    <td className="px-8 py-6 text-slate-700">{new Date(req.eventDate).toLocaleDateString('he-IL')}</td>
                    <td className="px-8 py-6 text-slate-700">{req.location}</td>
                    <td className="px-8 py-6 text-slate-700">{req.guestCount}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 text-xs font-bold rounded-full ${req.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {req.status || 'חדש'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-slate-700">{req.selectedMenuId || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
