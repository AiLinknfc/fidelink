import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CRMTab } from '../components/dashboard';
import type { VentasContextType } from './VentasPage';

export default function VentasCRMPage() {
  const ctx = useOutletContext<VentasContextType>();
  const [selectedLeadPhone, setSelectedLeadPhone] = useState<string | null>(null);

  return (
    <main className="h-full overflow-y-auto p-6">
      <CRMTab leads={ctx.leads} selectedLeadPhone={selectedLeadPhone} setSelectedLeadPhone={setSelectedLeadPhone} />
    </main>
  );
}
