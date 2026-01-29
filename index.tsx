
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

const DiagnosticApp = () => {
  const [results, setResults] = useState<{
    supabase: 'pending' | 'ok' | 'error',
    env: 'pending' | 'ok' | 'error',
    react: 'pending' | 'ok',
    db_access: 'pending' | 'ok' | 'error'
  }>({
    supabase: 'pending',
    env: 'pending',
    react: 'ok',
    db_access: 'pending'
  });

  const [details, setDetails] = useState<string[]>([]);

  const addLog = (msg: string) => setDetails(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  useEffect(() => {
    const runDiagnostics = async () => {
      addLog("מתחיל סדרת בדיקות...");

      // 1. Check Env Vars
      const sUrl = (window as any).process?.env?.SUPABASE_URL || "";
      const sKey = (window as any).process?.env?.SUPABASE_ANON_KEY || "";
      
      if (sUrl && sKey && !sUrl.includes("placeholder")) {
        setResults(prev => ({ ...prev, env: 'ok' }));
        addLog("✅ משתני סביבה נמצאו והוגדרו.");
      } else {
        setResults(prev => ({ ...prev, env: 'error' }));
        addLog("❌ משתני סביבה חסרים (SUPABASE_URL / ANON_KEY).");
      }

      // 2. Test Supabase Client
      try {
        const supabase = createClient(sUrl || 'https://xyz.supabase.co', sKey || 'key');
        setResults(prev => ({ ...prev, supabase: 'ok' }));
        addLog("✅ Supabase Client אותחל בהצלחה.");

        // 3. Test Database Connection (Ping)
        addLog("מנסה לתקשר עם בסיס הנתונים...");
        const { data, error } = await supabase.from('event_requests').select('count', { count: 'exact', head: true });
        
        if (error) {
          if (error.message.includes("fetch")) {
            addLog("❌ שגיאת רשת: לא ניתן להגיע לשרת Supabase.");
          } else {
            addLog(`❌ שגיאת DB: ${error.message}`);
          }
          setResults(prev => ({ ...prev, db_access: 'error' }));
        } else {
          setResults(prev => ({ ...prev, db_access: 'ok' }));
          addLog("✅ תקשורת עם בסיס הנתונים עובדת! (טבלה קיימת ונגישה)");
        }
      } catch (err: any) {
        setResults(prev => ({ ...prev, supabase: 'error', db_access: 'error' }));
        addLog(`❌ שגיאה קריטית: ${err.message}`);
      }
    };

    runDiagnostics();
  }, []);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'ok') return <span className="text-emerald-500 font-bold">✅ תקין</span>;
    if (status === 'error') return <span className="text-red-500 font-bold">❌ שגיאה</span>;
    return <span className="text-amber-500 animate-pulse">⏳ בודק...</span>;
  };

  return (
    <div className="min-h-screen p-8 bg-slate-50 flex items-center justify-center">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-2xl w-full border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 border-b pb-4">אבחון קישוריות - קייטרינג הדרן</h1>
        
        <div className="space-y-6 mb-10">
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
            <span className="font-medium text-slate-700">טעינת React (פרונט-אנד):</span>
            <StatusIcon status={results.react} />
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
            <span className="font-medium text-slate-700">משתני סביבה (Environment):</span>
            <StatusIcon status={results.env} />
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
            <span className="font-medium text-slate-700">ספריית Supabase (Library):</span>
            <StatusIcon status={results.supabase} />
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
            <span className="font-medium text-slate-700">גישה לנתונים (Database):</span>
            <StatusIcon status={results.db_access} />
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6">
          <h3 className="text-white/50 text-xs uppercase tracking-widest font-bold mb-4">יומן פעולות מפורט</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto font-monospace text-sm custom-scrollbar">
            {details.map((log, i) => (
              <div key={i} className="text-slate-300 border-l border-white/10 pl-3 py-1">
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-sm mb-6">אם כל הבדיקות ירוקות, האפליקציה תעבוד בצורה מושלמת.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            הרץ בדיקה מחדש
          </button>
        </div>
      </div>
    </div>
  );
};

// Start Diagnostics
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<DiagnosticApp />);
