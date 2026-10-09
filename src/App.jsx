import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import DirectoryPage from './pages/DirectoryPage';
import CostCalculatorApp from './pages/CostCalculatorApp';
import GenericAppView from './pages/GenericAppView';
import LoginModal from './components/LoginModal';
import { AuthProvider } from './contexts/AuthContext';
import { getStoredApps } from './utils/appStorage';

function AppShell({ onSignIn }) {
  const location = useLocation();

  let currentAppName = '';
  if (location.pathname.startsWith('/apps/')) {
    const allApps = getStoredApps();
    const matchedApp = allApps.find((a) => a.route === location.pathname);
    currentAppName = matchedApp ? matchedApp.name : 'Application';
  }

  return (
    <div className="app-container">
      <Navbar currentAppName={currentAppName} onSignIn={onSignIn} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<DirectoryPage />} />
          <Route path="/apps/3d-printing-cost-calculator" element={<CostCalculatorApp />} />
          <Route path="/apps/:appId" element={<GenericAppView />} />
        </Routes>
      </main>

      <footer className="apple-global-footer">
        <div className="footer-content">
          <p className="footer-copyright">
            3D Apps Directory &copy; {new Date().getFullYear()} &bull; Internal Product Library
          </p>
          <div className="footer-links">
            <span>Neon Postgres</span>
            <span>&bull;</span>
            <span>Instant Search &amp; Filter</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider onRequireLogin={() => setIsLoginOpen(true)}>
        <AppShell onSignIn={() => setIsLoginOpen(true)} />
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </AuthProvider>
    </BrowserRouter>
  );
}
