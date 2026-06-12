import { supabase } from '@/lib/supabaseClient';

export type QrTargetType = 'register-purchase' | 'landing' | 'wallet' | 'custom';

export interface QrLink {
  slug: string;
  businessId: string;
  targetUrl: string;
  targetType: QrTargetType;
  payload: Record<string, unknown>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceResult<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

/** Base pública donde resuelven los QR. Cambiar aquí si se migra de dominio. */
export const QR_BASE_URL = 'https://ailink.com.co/c';

/** URL pública completa que se codifica en el QR (es la cara visible al cliente). */
export function buildQrUrl(slug: string): string {
  return `${QR_BASE_URL}/${slug}`;
}

function toCamel(row: any): QrLink {
  return {
    slug: row.slug,
    businessId: row.business_id,
    targetUrl: row.target_url,
    targetType: row.target_type,
    payload: row.payload ?? {},
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Genera un slug estable y único para un negocio (kebab del nombre + sufijo aleatorio corto). */
function suggestSlug(businessName: string): string {
  const base = (businessName || 'card')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

/**
 * Construye el target_url por defecto cuando se crea un QR nuevo.
 * Apunta a la app actual con email del negocio prellenado para que el
 * cliente caiga directo en "registrar compra" tras escanear.
 *
 * IMPORTANTE: NO debe ser `https://ailink.com.co/c/<slug>` — eso crea un
 * loop infinito cuando el Worker/redirect reenvía a esta misma URL.
 */
function buildDefaultTarget(businessEmail: string | null): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ailink.com.co';
  if (businessEmail) {
    return `${origin}/client/register-purchase?email=${encodeURIComponent(businessEmail)}`;
  }
  return `${origin}/`;
}

/** Obtiene el QR principal del negocio. Crea uno si no existe. */
export async function getOrCreatePrimaryQr(
  businessId: string,
  businessName: string,
  businessEmail: string | null = null
): Promise<ServiceResult<QrLink>> {
  const { data: existing, error: selErr } = await supabase
    .from('qr_links')
    .select('*')
    .eq('business_id', businessId)
    .eq('target_type', 'register-purchase')
    .eq('active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (selErr) return { data: null, error: selErr };
  if (existing) {
    // Auto-fix: si el target_url existente es el patrón self-referential viejo
    // (`ailink.com.co/c/<slug>`), lo actualizamos a un destino útil para evitar
    // loops cuando el Worker entre en producción.
    const isSelfLoop = (existing.target_url as string).match(/\/c\/[a-z0-9-]+\/?$/i);
    if (isSelfLoop) {
      const newTarget = buildDefaultTarget(businessEmail);
      const { data: fixed } = await supabase
        .from('qr_links')
        .update({ target_url: newTarget })
        .eq('slug', existing.slug)
        .select()
        .single();
      if (fixed) return { data: toCamel(fixed), error: null };
    }
    return { data: toCamel(existing), error: null };
  }

  const slug = suggestSlug(businessName);
  const { data, error } = await supabase
    .from('qr_links')
    .insert({
      slug,
      business_id: businessId,
      target_url: buildDefaultTarget(businessEmail),
      target_type: 'register-purchase',
      payload: {},
      active: true,
    })
    .select()
    .single();

  if (error) return { data: null, error };
  return { data: toCamel(data), error: null };
}

export async function listQrLinks(businessId: string): Promise<ServiceResult<QrLink[]>> {
  const { data, error } = await supabase
    .from('qr_links')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  if (error) return { data: null, error };
  return { data: (data ?? []).map(toCamel), error: null };
}

export async function updateQrTarget(
  slug: string,
  patch: { targetUrl?: string; targetType?: QrTargetType; payload?: Record<string, unknown>; active?: boolean }
): Promise<ServiceResult<QrLink>> {
  const payload: Record<string, any> = {};
  if (patch.targetUrl !== undefined) payload.target_url = patch.targetUrl;
  if (patch.targetType !== undefined) payload.target_type = patch.targetType;
  if (patch.payload !== undefined) payload.payload = patch.payload;
  if (patch.active !== undefined) payload.active = patch.active;

  const { data, error } = await supabase
    .from('qr_links')
    .update(payload)
    .eq('slug', slug)
    .select()
    .single();
  if (error) return { data: null, error };
  return { data: toCamel(data), error: null };
}

/** Resuelve un slug a su target_url. Pensado para el worker /c/:slug. */
export async function resolveSlug(slug: string): Promise<ServiceResult<string>> {
  const { data, error } = await supabase
    .from('qr_links')
    .select('target_url, active')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return { data: null, error };
  if (!data || !data.active) return { data: null, error: { message: 'NOT_FOUND' } };
  return { data: data.target_url as string, error: null };
}

/** Resuelve un slug al email de la empresa dueña (para prellenar Registrar Compra). */
export async function resolveSlugToBusinessEmail(
  slug: string
): Promise<ServiceResult<{ businessId: string; businessEmail: string }>> {
  const { data: qr, error } = await supabase
    .from('qr_links')
    .select('business_id, active')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return { data: null, error };
  if (!qr || !qr.active) return { data: null, error: { message: 'NOT_FOUND' } };

  const { data: prof, error: profErr } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', qr.business_id)
    .maybeSingle();
  if (profErr) return { data: null, error: profErr };
  if (!prof?.email) return { data: null, error: { message: 'BUSINESS_NOT_FOUND' } };
  return { data: { businessId: qr.business_id, businessEmail: prof.email }, error: null };
}

/**
 * Intenta extraer el slug de un texto escaneado por el QR.
 * Soporta:
 *  - URL completa `https://ailink.com.co/c/<slug>`
 *  - URL con cualquier dominio que termine en `/c/<slug>`
 *  - Slug pelado (sin URL)
 * Devuelve null si no parece un slug de FideliCard.
 */
export function parseScannedSlug(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const urlMatch = t.match(/\/c\/([a-z0-9-]+)(?:[/?#].*)?$/i);
  if (urlMatch) return urlMatch[1];
  if (/^[a-z0-9-]{3,40}$/i.test(t)) return t;
  return null;
}

/**
 * Intenta extraer el `loyalty_card_id` (UUID) del QR personal del cliente.
 * Soporta:
 *  - URL `https://ailink.com.co/card/<uuid>`
 *  - URL con cualquier dominio que termine en `/card/<uuid>`
 *  - UUID pelado
 * Devuelve null si no parece un ID de tarjeta.
 */
export function parseScannedClientCardId(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const uuidRe = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const urlMatch = t.match(/\/card\/([0-9a-f-]+)(?:[/?#].*)?$/i);
  if (urlMatch && uuidRe.test(urlMatch[1])) return urlMatch[1].toLowerCase();
  const bareMatch = t.match(uuidRe);
  if (bareMatch) return bareMatch[1].toLowerCase();
  return null;
}
