import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useModuleBrand } from '@/platform/theme/ModuleBrand';

interface SectionRibbonProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  badge?: string;
  badgeNode?: ReactNode;
  transparent?: boolean;
  fullWidth?: boolean;
}

export default function SectionRibbon({ icon: Icon, title, description, badge, badgeNode, transparent, fullWidth }: SectionRibbonProps) {
  const { brand } = useModuleBrand();

  return (
    <div className="relative">
      <div
        className={`flex items-center justify-between gap-4 ${
          fullWidth ? 'py-3' : 'rounded-2xl px-5 py-2'
        } ${
          transparent
            ? 'bg-white/20 backdrop-blur-sm border-b border-white/10'
            : 'bg-white/40 backdrop-blur-sm border border-white/20 shadow-sm'
        }`}
        style={{
          borderColor: transparent
            ? `${brand.colorHex}10`
            : `${brand.colorHex}15`,
          borderBottomColor: transparent ? `${brand.colorHex}10` : undefined,
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div
              className="p-2 rounded-xl shrink-0"
              style={{ backgroundColor: `${brand.colorHex}15`, color: brand.colorHex }}
            >
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <h1
              className="text-base font-bold font-headline tracking-tight truncate"
              style={{ color: brand.colorHex }}
            >
              {title}
            </h1>
            {description && (
              <p className="text-sm text-slate-500 mt-px truncate">{description}</p>
            )}
          </div>
        </div>
        {badgeNode ?? (badge && (
          <span
            className="text-[10px] font-mono font-bold px-2.5 py-1 rounded shrink-0 whitespace-nowrap"
            style={{
              backgroundColor: transparent ? `${brand.colorHex}10` : `${brand.colorHex}12`,
              color: brand.colorHex,
              border: `1px solid ${transparent ? `${brand.colorHex}18` : `${brand.colorHex}20`}`,
            }}
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
