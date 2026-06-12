/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Welcome from './pages/Welcome.tsx';
import Wallet from './pages/Wallet.tsx';
import BusinessDashboard from './pages/BusinessDashboard.tsx';
import Editor from './pages/Editor.tsx';
import TopBar from './components/layout/TopBar.tsx';
// BottomNav deshabilitado temporalmente (ver docs/ROADMAP.md · N1).
// Causaba pérdida de contexto empresa→cliente al navegar a /wallet.
// import BottomNav from './components/layout/BottomNav.tsx';
import Sidebar from './components/layout/Sidebar.tsx';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './i18n/index';
import PublicBio from './pages/PublicBio';
import MyCards from './pages/client/MyCards.tsx';
import RegisterPurchaseClient from './pages/client/RegisterPurchase.tsx';
import CardEditor from './pages/business/CardEditor.tsx';
import RegisterPurchaseBusiness from './pages/business/RegisterPurchase.tsx';
import ClientList from './pages/business/ClientList.tsx';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isBusinessRoute = location.pathname.startsWith('/business');

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <TopBar onSidebarOpen={() => setSidebarOpen(true)} />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/business" element={<BusinessDashboard />} />
          <Route path="/editor" element={<Editor />} />
          
          {/* Client Routes */}
          <Route path="/client/my-cards" element={<MyCards />} />
          <Route path="/client/register-purchase" element={<RegisterPurchaseClient />} />
          
          {/* Business Routes */}
          <Route path="/business/card-editor" element={<CardEditor />} />
          <Route path="/business/register-purchase" element={<RegisterPurchaseBusiness />} />
          <Route path="/business/clients" element={<ClientList />} />
          
          {/* Fallbacks */}
          <Route path="/explore" element={<Wallet />} />
          <Route path="/activity" element={<Wallet />} />
          <Route path="/profile" element={<Wallet />} />
          {/* Public mini-bio */}
          <Route path="/bio/:slug" element={<PublicBio />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {isBusinessRoute && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <I18nProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </I18nProvider>
    </Router>
  );
}
