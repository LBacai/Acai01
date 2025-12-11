import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Loader2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError('Credenciais inválidas ou erro no login.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-white/10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">Acesso Administrativo</h1>
          <p className="text-gray-400">Toledos Açaí</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none transition-colors"
              placeholder="admin@toledos.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};
