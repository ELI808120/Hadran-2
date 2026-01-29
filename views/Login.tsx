
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('פרטי התחברות שגויים');
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 border border-neutral-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">כניסת מנהלים</h1>
          <p className="text-neutral-500">אנא התחבר כדי לנהל את האירועים</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold text-center">{error}</div>}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 mr-2">אימייל</label>
            <input 
              type="email" 
              className="w-full px-5 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-gold outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 mr-2">סיסמה</label>
            <input 
              type="password" 
              className="w-full px-5 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-gold outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-black transition-all"
          >
            {loading ? 'מתחבר...' : 'התחבר למערכת'}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4 text-neutral-300">
          <div className="flex-grow h-px bg-neutral-200"></div>
          <span>או</span>
          <div className="flex-grow h-px bg-neutral-200"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full mt-8 border-2 border-neutral-100 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-neutral-50 transition-all"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          התחברות עם Google
        </button>
      </div>
    </div>
  );
};

export default Login;
