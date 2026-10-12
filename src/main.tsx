import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { supabase } from './lib/supabase.ts';
import './index.css';

function Root() {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabase) {
      setSession(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(!!sess);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === null) {
    return (
      <div className="min-h-screen bg-[#0B0A24] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8B5CF6]/30 border-t-[#8B5CF6] rounded-full animate-spin" />
      </div>
    );
  }

  return <App isAuthenticated={session} onAuth={() => setSession(true)} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
