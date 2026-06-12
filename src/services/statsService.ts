import { supabase } from '@/lib/supabaseClient';

export interface ServiceResult<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

export interface BusinessKpis {
  totalCustomers: number;       // tarjetas únicas del negocio
  activeRecords: number;        // tarjetas con al menos 1 sello
  completedCards: number;       // tarjetas con todos los sellos (recompensa lista o ya redimida)
}

export interface DailyPoint {
  /** ISO date (YYYY-MM-DD) en UTC. */
  date: string;
  /** Etiqueta corta para el eje X (Mon, Tue, ...). */
  label: string;
  /** Compras (sellos) registrados ese día. */
  value: number;
}

export interface RecentPurchase {
  id: string;
  createdAt: string;
  businessName: string;
  customerName: string;
  customerEmail: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** KPIs principales — 3 counts en paralelo, head-only (no descargan filas). */
export async function getBusinessKpis(businessId: string): Promise<ServiceResult<BusinessKpis>> {
  const totalQ = supabase
    .from('loyalty_cards')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId);

  const activeQ = supabase
    .from('loyalty_cards')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gt('current_stamps', 0);

  // "Completed": current_stamps >= total_stamps. Postgrest no compara dos columnas
  // directamente, así que traemos esas filas (solo dos enteros) y filtramos en cliente.
  const completedQ = supabase
    .from('loyalty_cards')
    .select('current_stamps, total_stamps')
    .eq('business_id', businessId);

  const [total, active, completedRows] = await Promise.all([totalQ, activeQ, completedQ]);
  if (total.error) return { data: null, error: total.error };
  if (active.error) return { data: null, error: active.error };
  if (completedRows.error) return { data: null, error: completedRows.error };

  const completedCards = (completedRows.data ?? []).filter(
    (r: any) => (r.current_stamps ?? 0) >= (r.total_stamps ?? 0)
  ).length;

  return {
    data: {
      totalCustomers: total.count ?? 0,
      activeRecords: active.count ?? 0,
      completedCards,
    },
    error: null,
  };
}

/**
 * Devuelve los últimos `days` días (incluyendo hoy) con el conteo de purchases
 * agrupado por día. Hace 1 query y bucketea en cliente.
 */
export async function getPurchasesByDay(
  businessId: string,
  days = 7
): Promise<ServiceResult<DailyPoint[]>> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  // Join via embed: traemos compras + business_id de la tarjeta para filtrar.
  // Postgrest no permite `.eq` sobre columna embebida directamente sin `!inner`.
  const { data, error } = await supabase
    .from('purchases')
    .select('created_at, loyalty_cards!inner(business_id)')
    .eq('loyalty_cards.business_id', businessId)
    .gte('created_at', since.toISOString());

  if (error) return { data: null, error };

  // Inicializa buckets con 0 para cada día (clave: YYYY-MM-DD).
  const buckets = new Map<string, number>();
  const startKey = (d: Date) => d.toISOString().slice(0, 10);
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    buckets.set(startKey(d), 0);
  }

  for (const row of data ?? []) {
    const key = (row as any).created_at.slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const points: DailyPoint[] = Array.from(buckets.entries()).map(([date, value]) => {
    const d = new Date(date + 'T00:00:00Z');
    return { date, label: DAY_LABELS[d.getUTCDay()], value };
  });

  return { data: points, error: null };
}

/** Últimas N compras del negocio con nombre/email del cliente. */
export async function getRecentPurchases(
  businessId: string,
  limit = 5
): Promise<ServiceResult<RecentPurchase[]>> {
  // loyalty_cards embebido !inner para filtrar por business_id; profiles embebido para nombre.
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      id,
      created_at,
      business_name,
      loyalty_cards!inner(
        business_id,
        client_id,
        profiles!loyalty_cards_client_id_fkey(name, email)
      )
    `)
    .eq('loyalty_cards.business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { data: null, error };

  const rows = (data ?? []).map((r: any): RecentPurchase => {
    const prof = r.loyalty_cards?.profiles ?? {};
    return {
      id: r.id,
      createdAt: r.created_at,
      businessName: r.business_name,
      customerName: prof.name ?? '—',
      customerEmail: prof.email ?? '—',
    };
  });

  return { data: rows, error: null };
}

/** Helper UI: convierte una fecha ISO en "hace X". */
export function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - t);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}
