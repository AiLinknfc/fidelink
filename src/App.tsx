import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Wallet from './pages/Wallet.tsx';
import BusinessDashboard from './pages/BusinessDashboard.tsx';
import Editor from './pages/Editor.tsx';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { I18nProvider } from './i18n/index';
import PublicBio from './pages/PublicBio';
import MyCards from './pages/client/MyCards.tsx';
import RegisterPurchaseClient from './pages/client/RegisterPurchase.tsx';
import CardEditor from './modules/fidelizacion/pages/CardEditor.tsx';
import RegisterPurchaseBusiness from './modules/fidelizacion/pages/RegisterPurchase.tsx';
import CRM from './modules/fidelizacion/pages/CRM.tsx';
import Automatizaciones from './modules/fidelizacion/pages/Automatizaciones.tsx';
import Payment from './modules/fidelizacion/pages/Payment.tsx';
import AudienciaCRM from './modules/fidelizacion/pages/AudienciaCRM.tsx';
import ClientList from './modules/fidelizacion/pages/ClientList.tsx';
import BrandLoginGate from './components/auth/BrandLoginGate';
import PlatformShell from './platform/layout/PlatformShell';
import ModuleGuard from './platform/auth/ModuleGuard';
import AdminGuard from './platform/auth/AdminGuard';
import { ModuleBrandProvider } from './platform/theme/ModuleBrand';
import BiographyDashboard from './modules/biografias/pages/BiographyDashboard';
import VentasPage from './modules/ventas/pages/VentasPage';
import VentasAnalyticsPage from './modules/ventas/pages/VentasAnalyticsPage';
import VentasCampaignsPage from './modules/ventas/pages/VentasCampaignsPage';
import VentasCRMPage from './modules/ventas/pages/VentasCRMPage';
import VentasProductsPage from './modules/ventas/pages/VentasProductsPage';
import VentasCheckoutPage from './modules/ventas/pages/VentasCheckoutPage';
import VentasDataCollectionPage from './modules/ventas/pages/VentasDataCollectionPage';
import AdminDashboard from './admin/AdminDashboard';
import AdminClients from './admin/AdminClients';
import AdminModules from './admin/AdminModules';
import PromocionesPage from './modules/promociones/pages/PromocionesPage';
import NapilinkPage from './modules/napilink/pages/NapilinkPage';

export default function App() {
  return (
    <Router>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <ModuleBrandProvider>
              <Routes>
              {/* Public login */}
              <Route path="/" element={<BrandLoginGate />} />

              {/* Platform shell wraps all authenticated routes */}
              <Route element={<PlatformShell />}>
                {/* Módulo Fidelización */}
                <Route element={<ModuleGuard module="fidelizacion" />}>
                  <Route path="/business" element={<BusinessDashboard />} />
                  <Route path="/business/card-editor" element={<CardEditor />} />
                  <Route path="/business/register-purchase" element={<RegisterPurchaseBusiness />} />
                  <Route path="/business/clients" element={<ClientList />} />
                  <Route path="/business/crm" element={<CRM />} />
                  <Route path="/business/automatizaciones" element={<Automatizaciones />} />
                  <Route path="/business/payment" element={<Payment />} />
                  <Route path="/business/audiencia-crm" element={<AudienciaCRM />} />
                </Route>

                {/* Módulo Biografías */}
                <Route element={<ModuleGuard module="biografias" />}>
                  <Route path="/biography" element={<BiographyDashboard />} />
                </Route>

                {/* Módulo Ventas */}
                <Route element={<ModuleGuard module="ventas" />}>
                  <Route path="/sales" element={<VentasPage />}>
                    <Route index element={<Navigate to="analytics" replace />} />
                    <Route path="analytics" element={<VentasAnalyticsPage />} />
                    <Route path="campaigns" element={<VentasCampaignsPage />} />
                    <Route path="crm" element={<VentasCRMPage />} />
                    <Route path="products" element={<VentasProductsPage />} />
                    <Route path="checkout" element={<VentasCheckoutPage />} />
                    <Route path="data-collection" element={<VentasDataCollectionPage />} />
                  </Route>
                </Route>

                {/* Admin routes */}
                <Route element={<AdminGuard />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/clients" element={<AdminClients />} />
                  <Route path="/admin/modules" element={<AdminModules />} />
                </Route>

                {/* Client routes (cross-module) */}
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/editor" element={<Editor />} />
                <Route path="/client/my-cards" element={<MyCards />} />
                <Route path="/client/register-purchase" element={<RegisterPurchaseClient />} />
                {/* Módulo Promociones */}
                <Route path="/promociones/:tab?" element={<PromocionesPage />} />
                {/* Módulo Napilink */}
                <Route path="/napilink/:tab?" element={<NapilinkPage />} />

                {/* Legacy fallbacks */}
                <Route path="/explore" element={<Wallet />} />
                <Route path="/activity" element={<Wallet />} />
                <Route path="/profile" element={<Wallet />} />
              </Route>

              {/* Public bio page (no shell) */}
              <Route path="/bio/:slug" element={<PublicBio />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ModuleBrandProvider>
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </Router>
  );
}
