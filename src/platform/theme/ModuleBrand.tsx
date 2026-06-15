import { createContext, useContext, useState, ReactNode } from 'react';

export type ModuleId = 'fidelizacion' | 'biografias' | 'ventas' | 'admin' | null;

export interface ModuleBrand {
  name: string;
  logo: string;
  color: string;
  colorHex: string;
}

const MODULE_BRANDS: Record<string, ModuleBrand> = {
  fidelizacion: { name: 'Fidelik', logo: 'F', color: 'violet', colorHex: '#7c3aed' },
  biografias:   { name: 'BioLink', logo: 'B', color: 'indigo', colorHex: '#6366f1' },
  ventas:       { name: 'LinkSales', logo: 'L', color: 'emerald', colorHex: '#10b981' },
  admin:        { name: 'Ailink', logo: 'A', color: 'violet', colorHex: '#7c3aed' },
};

interface ModuleBrandContextType {
  activeModule: ModuleId;
  brand: ModuleBrand;
  setModule: (id: ModuleId) => void;
}

const ModuleBrandContext = createContext<ModuleBrandContextType | null>(null);

export function ModuleBrandProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModule] = useState<ModuleId>(null);

  const brand = activeModule ? (MODULE_BRANDS[activeModule] ?? { name: 'Fidelicard', logo: 'F', color: 'violet', colorHex: '#7c3aed' }) : { name: 'Fidelicard', logo: 'F', color: 'violet', colorHex: '#7c3aed' };

  return (
    <ModuleBrandContext.Provider value={{ activeModule, brand, setModule: setActiveModule }}>
      {children}
    </ModuleBrandContext.Provider>
  );
}

export function useModuleBrand() {
  const ctx = useContext(ModuleBrandContext);
  if (!ctx) throw new Error('useModuleBrand must be used within ModuleBrandProvider');
  return ctx;
}
