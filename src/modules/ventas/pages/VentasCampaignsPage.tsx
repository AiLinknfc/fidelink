import { useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CampaignsTab } from '../components/dashboard';
import type { VentasContextType } from './VentasPage';

export default function VentasCampaignsPage() {
  const ctx = useOutletContext<VentasContextType>();
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

  return (
    <main className="h-full overflow-y-auto p-6">
      <CampaignsTab campaigns={ctx.campaigns} pixelEvents={ctx.pixelEvents}
        newCampName={newCampName} newCampPlatform={newCampPlatform} newCampBudget={newCampBudget} newCampPixel={newCampPixel}
        setNewCampName={setNewCampName} setNewCampPlatform={setNewCampPlatform} setNewCampBudget={setNewCampBudget} setNewCampPixel={setNewCampPixel}
        handleCreateCampaign={handleCreateCampaign} onRefreshData={ctx.onRefreshData}
        trackingConfig={ctx.trackingConfig} onSaveTrackingConfig={ctx.handleSaveTrackingConfig}
        agentConfig={ctx.agentConfig} onUpdateAgentConfig={ctx.handleUpdateAgentConfig} />
    </main>
  );
}
