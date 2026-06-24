import { useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Megaphone, Smartphone } from 'lucide-react';
import { CampaignsTab } from '../components/dashboard';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';
import type { VentasContextType } from './VentasPage';

export default function VentasCampaignsPage() {
  const ctx = useOutletContext<VentasContextType>();
  const { brand } = useModuleBrand();
  const [chipHovered, setChipHovered] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newCampPlatform, setNewCampPlatform] = useState<'facebook' | 'instagram'>('facebook');
  const [newCampBudget, setNewCampBudget] = useState(10);
  const [newCampPixel, setNewCampPixel] = useState('px-meta-9283-coffee');

  const handleCreateCampaign = (e: FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim()) return;
    ctx.handleAddCampaign({ name: newCampName, platform: newCampPlatform, status: 'active', budget: Number(newCampBudget), pixelId: newCampPixel });
    setNewCampName('');
  };

  const activeCampaigns = ctx.campaigns.filter(c => c.status === 'active').length;

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Barra secundaria ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 h-12
                      flex flex-row items-center justify-between
                      gap-2 select-none overflow-hidden flex-shrink-0">

        {/* LEFT — chip expandible */}
        <div
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white cursor-default transition-all duration-500 ease-in-out min-w-0"
          style={{
            color: brand.colorHex,
            borderColor: chipHovered ? `${brand.colorHex}55` : 'rgb(226 232 240 / 0.6)',
            boxShadow: chipHovered
              ? `0 0 0 3px ${brand.colorHex}18, 0 2px 12px ${brand.colorHex}22`
              : '0 0 0 0px transparent',
            flex: chipHovered ? '1 1 0%' : '0 0 auto',
          }}
          onMouseEnter={() => setChipHovered(true)}
          onMouseLeave={() => setChipHovered(false)}
        >
          <div
            className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-500"
            style={{
              opacity: chipHovered ? 1 : 0,
              background: `linear-gradient(90deg, ${brand.colorHex}06 0%, ${brand.colorHex}14 50%, ${brand.colorHex}06 100%)`,
            }}
          />
          <Megaphone
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
            style={{ transform: chipHovered ? 'rotate(-15deg) scale(1.2)' : 'none' }}
          />
          <span className="text-[12px] font-bold font-sans whitespace-nowrap flex-shrink-0">Campañas y Pixel Logs</span>
          <span
            className="text-[12px] font-light font-sans whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              maxWidth: chipHovered ? '600px' : '0px',
              opacity: chipHovered ? 1 : 0,
              paddingLeft: chipHovered ? '6px' : '0px',
              color: `${brand.colorHex}99`,
            }}
          >
            · Meta Ads, pixel de seguimiento y eventos de conversión
          </span>
        </div>

        {/* RIGHT — contador + simulador */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full flex-shrink-0">
            <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: brand.colorHex }} />
            <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
              {activeCampaigns} {activeCampaigns === 1 ? 'campaña activa' : 'campañas activas'}
            </span>
          </div>
          <button
            onClick={ctx.openSimulator}
            title="Simulador de cliente"
            className="p-1.5 rounded-xl transition-all cursor-pointer flex-shrink-0"
            style={{ backgroundColor: `${brand.colorHex}14`, color: brand.colorHex }}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Contenido scrollable ── */}
      <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-3 pb-6">
        <CampaignsTab
          campaigns={ctx.campaigns}
          pixelEvents={ctx.pixelEvents}
          newCampName={newCampName}
          newCampPlatform={newCampPlatform}
          newCampBudget={newCampBudget}
          newCampPixel={newCampPixel}
          setNewCampName={setNewCampName}
          setNewCampPlatform={setNewCampPlatform}
          setNewCampBudget={setNewCampBudget}
          setNewCampPixel={setNewCampPixel}
          handleCreateCampaign={handleCreateCampaign}
          onRefreshData={ctx.onRefreshData}
          trackingConfig={ctx.trackingConfig}
          onSaveTrackingConfig={ctx.handleSaveTrackingConfig}
          agentConfig={ctx.agentConfig}
          onUpdateAgentConfig={ctx.handleUpdateAgentConfig}
        />
      </main>
    </div>
  );
}
