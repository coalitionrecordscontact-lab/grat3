import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import History from './pages/History';
import Community from './pages/Community.jsx';
import Retrospective from './pages/Retrospective.jsx';
import FontUpload from './pages/FontUpload';
import AppLayout from './components/AppLayout';
import UsernameSetup from './components/UsernameSetup';
import AffirmationsSetup from './components/AffirmationsSetup';
import { base44 } from '@/api/base44Client';

// Auto dark mode based on system preference
function ThemeProvider({ children }) {
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (e) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    apply(mq);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return children;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [user, setUser] = React.useState(null);
  const [checkingUser, setCheckingUser] = React.useState(true);
  const [needsUsername, setNeedsUsername] = React.useState(false);
  const [needsAffirmations, setNeedsAffirmations] = React.useState(false);

  React.useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        queryClientInstance.setQueryData(["current-user"], me);
        if (!me.username) setNeedsUsername(true);
        else if (!me.affirmation_1) setNeedsAffirmations(true);
        // Save timezone if not set or changed
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz && me.timezone !== tz) {
          base44.auth.updateMe({ timezone: tz });
        }
      }
      setCheckingUser(false);
    });
  }, []);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  if (needsUsername) {
    return <UsernameSetup onComplete={(u) => { setNeedsUsername(false); setUser({ ...user, username: u }); queryClientInstance.invalidateQueries({ queryKey: ["current-user"] }); setNeedsAffirmations(true); }} />;
  }

  if (needsAffirmations) {
    return <AffirmationsSetup onComplete={() => { queryClientInstance.invalidateQueries({ queryKey: ["current-user"] }); setNeedsAffirmations(false); }} />;
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/retrospective" element={<Retrospective />} />
        <Route path="/community" element={<Community />} />
        <Route path="/font-upload" element={<FontUpload />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App