import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, UserPlus, LogIn, ArrowRight } from 'lucide-react';

type Mode = 'login' | 'signup';

interface LoginPageProps {
  onAuth: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuth }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (mode === 'login') {
        const { error } = await supabase!.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) throw error;
        onAuth();
      } else {
        // Sign up
        const { data, error } = await supabase!.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { name: name || email.split('@')[0] },
          },
        });
        if (error) throw error;

        // Upsert the profile row
        if (data.user) {
          await supabase!.from('profiles').upsert([{
            id: data.user.id,
            name: name || email.split('@')[0],
            email: email,
            role: 'Admin',
            active: true,
          }], { onConflict: 'email' });
        }

        if (data.session) {
          onAuth();
        } else {
          setSuccess('Account created! Check your email to confirm, or sign in directly.');
          setMode('login');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0A24] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Luminous Horizon Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-[#8B5CF6]/20 via-[#4F7DFF]/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-[#8B5CF6]/15 via-transparent to-transparent blur-[100px] pointer-events-none" />

      {/* Decorative Horizon Curve */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[1200px] h-[1px] bg-gradient-to-r from-transparent via-[#C4B5FD]/40 to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Card */}
        <div className="bg-[#11102D]/90 backdrop-blur-2xl border border-[rgba(196,181,253,0.16)] rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {/* Logo Presentation */}
          <div className="text-center mb-8">
            <div className="inline-block relative mb-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[rgba(196,181,253,0.25)] shadow-[0_0_30px_rgba(139,92,246,0.35)] mx-auto bg-[#0B0A24]">
                <img
                  src="/edge-logo.jpg"
                  alt="Edge - A MYST Initiative"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-[#C4B5FD] to-transparent rounded-full blur-[1px]" />
            </div>

            <p className="text-[10px] font-semibold tracking-[0.25em] text-[#AAA9C5] uppercase mb-1">
              A MYST INITIATIVE
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#F7F7FF]">
              Edge <span className="text-[#C4B5FD] font-light">Workspace</span>
            </h1>
            <p className="text-xs text-[#AAA9C5] mt-1 font-normal">
              Campus Partnership & Operations Platform
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-[#0B0A24] p-1 rounded-xl mb-6 border border-[rgba(196,181,253,0.1)]">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                  : 'text-[#AAA9C5] hover:text-[#F7F7FF]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                  : 'text-[#AAA9C5] hover:text-[#F7F7FF]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Register
            </button>
          </div>

          {/* Error / Success Alerts */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-left">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <p className="text-xs text-rose-200">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-left">
              <p className="text-xs text-emerald-300">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 bg-[#171638] border border-[rgba(196,181,253,0.16)] rounded-xl text-[#F7F7FF] placeholder-[#AAA9C5]/40 text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                Official Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA9C5]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coordinator@college.edu or team@myst"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#171638] border border-[rgba(196,181,253,0.16)] rounded-xl text-[#F7F7FF] placeholder-[#AAA9C5]/40 text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA9C5]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-11 py-2.5 bg-[#171638] border border-[rgba(196,181,253,0.16)] rounded-xl text-[#F7F7FF] placeholder-[#AAA9C5]/40 text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#AAA9C5] hover:text-[#F7F7FF] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#4F7DFF] hover:from-[#7C3AED] hover:to-[#3B6AEC] text-white text-sm font-semibold rounded-xl shadow-[0_4px_20px_rgba(139,92,246,0.35)] transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-3"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
              ) : mode === 'login' ? (
                <>Sign In to Edge Workspace <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-[11px] text-[#AAA9C5]/60 mt-6 font-normal">
            Edge — B2B Campus Technology Engagement Initiative
          </p>
        </div>
      </div>
    </div>
  );
};
