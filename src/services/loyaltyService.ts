import { supabase } from '@/lib/supabaseClient';

// Types
export type ProgramType = 'stamp_based' | 'accumulative';

export interface CardConfig {
  id?: string;
  businessId: string;
  colorHex: string;
  totalStamps: number;
  rewardDescription: string;
  businessName: string;
  updatedAt?: string;
  // Branding extendido (B3)
  logoUrl?: string | null;
  description?: string | null;
  category?: string | null;
  address?: string | null;
  website?: string | null;
  // Points Engine
  programType?: ProgramType;
  amountPerPoint?: number | null;
}

export interface BusinessBranding {
  logoUrl: string | null;
  description: string | null;
  category: string | null;
  address: string | null;
  website: string | null;
  programType?: ProgramType;
}

export interface LoyaltyCard {
  id: string;
  businessId: string;
  clientId: string;
  currentStamps: number;
  totalStamps: number;
  businessName: string;
  colorHex: string;
  rewardDescription: string;
  createdAt: string;
  business?: BusinessBranding;
  client?: {
    name: string;
    email: string;
  };
}

export interface Profile {
  id: string;
  name: string;
  role: 'client' | 'business';
  email: string;
}

export interface ServiceResult<T> {
  data: T | null;
  error: { message: string; code?: string; card?: any } | null;
}

// Conversion helpers
function toSnakeCase(cardConfig: Partial<CardConfig>): Record<string, any> {
  const result: Record<string, any> = {};
  if (cardConfig.businessId !== undefined) result.business_id = cardConfig.businessId;
  if (cardConfig.colorHex !== undefined) result.color_hex = cardConfig.colorHex;
  if (cardConfig.totalStamps !== undefined) result.total_stamps = cardConfig.totalStamps;
  if (cardConfig.rewardDescription !== undefined) result.reward_description = cardConfig.rewardDescription;
  if (cardConfig.businessName !== undefined) result.business_name = cardConfig.businessName;
  if (cardConfig.updatedAt !== undefined) result.updated_at = cardConfig.updatedAt;
  if (cardConfig.logoUrl !== undefined) result.logo_url = cardConfig.logoUrl;
  if (cardConfig.description !== undefined) result.description = cardConfig.description;
  if (cardConfig.category !== undefined) result.category = cardConfig.category;
  if (cardConfig.address !== undefined) result.address = cardConfig.address;
  if (cardConfig.website !== undefined) result.website = cardConfig.website;
  if (cardConfig.programType !== undefined) result.program_type = cardConfig.programType;
  if (cardConfig.amountPerPoint !== undefined) result.amount_per_point = cardConfig.amountPerPoint;
  return result;
}

function toCamelCase(row: any): CardConfig {
  return {
    id: row.id,
    businessId: row.business_id,
    colorHex: row.color_hex,
    totalStamps: row.total_stamps,
    rewardDescription: row.reward_description,
    businessName: row.business_name,
    updatedAt: row.updated_at,
    logoUrl: row.logo_url ?? null,
    description: row.description ?? null,
    category: row.category ?? null,
    address: row.address ?? null,
    website: row.website ?? null,
    programType: (row.program_type as ProgramType | undefined) ?? 'stamp_based',
    amountPerPoint: row.amount_per_point != null ? Number(row.amount_per_point) : null,
  };
}

function toLoyaltyCardCamelCase(row: any): LoyaltyCard {
  return {
    id: row.id,
    businessId: row.business_id,
    clientId: row.client_id,
    currentStamps: row.current_stamps,
    totalStamps: row.total_stamps,
    businessName: row.business_name,
    colorHex: row.color_hex,
    rewardDescription: row.reward_description,
    createdAt: row.created_at,
  };
}

// Service functions
export async function getCardConfig(businessId: string): Promise<ServiceResult<CardConfig>> {
  const { data, error } = await supabase
    .from('card_configs')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle();

  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };
  return { data: toCamelCase(data), error: null };
}

export async function upsertCardConfig(businessId: string, config: Partial<CardConfig>): Promise<ServiceResult<CardConfig>> {
  const snakePayload = toSnakeCase({ ...config, businessId });

  const { data, error } = await supabase
    .from('card_configs')
    .upsert(snakePayload, { onConflict: 'business_id' })
    .select()
    .single();

  if (error) return { data: null, error };
  return { data: toCamelCase(data), error: null };
}

export async function getClientCards(clientId: string): Promise<ServiceResult<LoyaltyCard[]>> {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('client_id', clientId);

  if (error) return { data: null, error };

  const cards = (data ?? []).map(toLoyaltyCardCamelCase);
  if (cards.length === 0) return { data: cards, error: null };

  // Enriquecer con branding del negocio (logo, descripción, categoría, etc.)
  const businessIds = Array.from(new Set(cards.map((c) => c.businessId)));
  const { data: configs, error: cfgErr } = await supabase
    .from('card_configs')
    .select('business_id, business_name, color_hex, reward_description, total_stamps, logo_url, description, category, address, website, program_type')
    .in('business_id', businessIds);

  if (cfgErr || !configs) return { data: cards, error: null };

  const byBusiness = new Map<string, BusinessBranding & { businessName: string; colorHex: string; rewardDescription: string; totalStamps: number }>();
  for (const row of configs as any[]) {
    byBusiness.set(row.business_id, {
      businessName: row.business_name ?? '',
      colorHex: row.color_hex ?? '#3525cd',
      rewardDescription: row.reward_description ?? '',
      totalStamps: row.total_stamps ?? 10,
      logoUrl: row.logo_url ?? null,
      description: row.description ?? null,
      category: row.category ?? null,
      address: row.address ?? null,
      website: row.website ?? null,
      programType: (row.program_type as ProgramType | undefined) ?? 'stamp_based',
    });
  }
  for (const card of cards) {
    const live = byBusiness.get(card.businessId);
    if (live) {
      card.businessName = live.businessName || card.businessName;
      card.colorHex = live.colorHex;
      card.rewardDescription = live.rewardDescription || card.rewardDescription;
      card.totalStamps = live.totalStamps;
      card.business = live;
    }
  }
  return { data: cards, error: null };
}

export async function getBusinessClients(businessId: string): Promise<ServiceResult<LoyaltyCard[]>> {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .select('*, profiles!loyalty_cards_client_id_fkey(name, email)')
    .eq('business_id', businessId);

  if (error) return { data: null, error };
  return {
    data: data.map((row: any) => ({
      ...toLoyaltyCardCamelCase(row),
      client: row.profiles ?? null,
    })),
    error: null,
  };
}

/** Sube el logo del negocio al bucket `logos` (path: <businessId>/logo-<ts>.<ext>) y devuelve la URL pública. */
export async function uploadBusinessLogo(
  businessId: string,
  file: File
): Promise<ServiceResult<string>> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${businessId}/logo-${Date.now()}.${ext}`;

  // Pre-validación rápida: sesión activa (el bucket logos requiere auth para INSERT).
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) {
    return { data: null, error: { message: 'NO_SESSION', code: 'auth' } };
  }

  const { error: upErr } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) {
    // Log full raw error to console for debugging (status, name, stack...)
    // eslint-disable-next-line no-console
    console.error('[uploadBusinessLogo] failed', { path, error: upErr });
    return { data: null, error: { message: upErr.message, code: (upErr as any).statusCode } };
  }
  const { data: pub } = supabase.storage.from('logos').getPublicUrl(path);
  return { data: pub.publicUrl, error: null };
}

/**
 * Resuelve un `loyalty_card_id` (codificado en el QR del cliente) al perfil del cliente.
 * Útil cuando la empresa escanea la cara B de la tarjeta del cliente (B2).
 * RLS: el negocio solo verá tarjetas donde es business_id, así que la búsqueda
 * naturalmente está acotada a "sus clientes".
 */
export async function resolveClientByCardId(
  cardId: string
): Promise<ServiceResult<{ clientId: string; clientEmail: string; businessId: string }>> {
  const { data: card, error } = await supabase
    .from('loyalty_cards')
    .select('client_id, business_id')
    .eq('id', cardId)
    .maybeSingle();
  if (error) return { data: null, error };
  if (!card) return { data: null, error: { message: 'CARD_NOT_FOUND' } };

  const { data: prof, error: profErr } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', card.client_id)
    .maybeSingle();
  if (profErr) return { data: null, error: profErr };
  if (!prof?.email) return { data: null, error: { message: 'CLIENT_NOT_FOUND' } };

  return {
    data: { clientId: card.client_id, clientEmail: prof.email, businessId: card.business_id },
    error: null,
  };
}

export async function findProfileByEmail(email: string): Promise<ServiceResult<Profile>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, role, email')
    .eq('email', email)
    .maybeSingle();

  if (error) return { data: null, error };
  return { data: data ?? null, error: null };
}

/**
 * Llama a la Edge Function add-stamp.
 * Pre-condiciones:
 *  - El caller debe estar autenticado (la sesión Supabase aporta el JWT).
 *  - Si el caller es el cliente, debe pasar receiptId de un recibo válido.
 *  - Si el caller es el negocio, receiptId es opcional.
 */
export async function addStampSecure(input: {
  businessId: string;
  clientId: string;
  receiptId?: string;
}): Promise<ServiceResult<LoyaltyCard>> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) return { data: null, error: { message: 'NO_AUTH' } };

  const { data, error } = await supabase.functions.invoke('add-stamp', {
    body: input,
  });
  if (error) {
    const code = (data as any)?.error ?? 'EDGE_ERROR';
    return { data: null, error: { message: code, code } };
  }
  if ((data as any)?.error) {
    return { data: null, error: { message: (data as any).error, code: (data as any).error, card: (data as any).card } };
  }
  return { data: toLoyaltyCardCamelCase((data as any).card), error: null };
}

/**
 * @deprecated Usar `addStampSecure` (Edge Function). Esta versión expone la lógica
 * en el browser y será removida cuando se rote la anon key (S1).
 */
export async function addStamp(businessId: string, clientId: string): Promise<ServiceResult<LoyaltyCard>> {
  // 1. Fetch card config
  const { data: cardConfig, error: configError } = await getCardConfig(businessId);
  if (configError) return { data: null, error: configError };
  if (!cardConfig) return { data: null, error: { message: 'NO_CARD_CONFIG' } };

  // 2. Check if loyalty card already exists
  const { data: existingCard, error: fetchError } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('business_id', businessId)
    .eq('client_id', clientId)
    .maybeSingle();

  if (fetchError) return { data: null, error: fetchError };

  // 3. Card complete — return early without modifying DB
  if (existingCard && existingCard.current_stamps >= existingCard.total_stamps) {
    return {
      data: null,
      error: { message: 'CARD_COMPLETE', card: toLoyaltyCardCamelCase(existingCard) },
    };
  }

  let updatedCard: any = null;
  let cardWasCreated = false;

  if (!existingCard) {
    // 4. Create new card with current_stamps = 1
    const { data: newCard, error: insertError } = await supabase
      .from('loyalty_cards')
      .insert({
        business_id: businessId,
        client_id: clientId,
        current_stamps: 1,
        total_stamps: cardConfig.totalStamps,
        business_name: cardConfig.businessName,
        color_hex: cardConfig.colorHex,
        reward_description: cardConfig.rewardDescription,
      })
      .select()
      .single();

    if (insertError) return { data: null, error: insertError };
    updatedCard = newCard;
    cardWasCreated = true;
  } else {
    // 5. Increment current_stamps by 1
    const { data: updated, error: updateError } = await supabase
      .from('loyalty_cards')
      .update({ current_stamps: existingCard.current_stamps + 1 })
      .eq('id', existingCard.id)
      .select()
      .single();

    if (updateError) return { data: null, error: updateError };
    updatedCard = updated;
  }

  // 6. Insert purchase record
  const { error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      loyalty_card_id: updatedCard.id,
      business_name: cardConfig.businessName,
    });

  // 7. Compensate if purchase INSERT fails
  if (purchaseError) {
    if (cardWasCreated) {
      await supabase.from('loyalty_cards').delete().eq('id', updatedCard.id);
    } else {
      await supabase
        .from('loyalty_cards')
        .update({ current_stamps: existingCard.current_stamps })
        .eq('id', updatedCard.id);
    }
    return { data: null, error: purchaseError };
  }

  // 8. Return updated card in camelCase
  return { data: toLoyaltyCardCamelCase(updatedCard), error: null };
}

export async function resetCard(loyaltyCardId: string): Promise<ServiceResult<LoyaltyCard>> {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .update({ current_stamps: 0 })
    .eq('id', loyaltyCardId)
    .select()
    .single();

  if (error) return { data: null, error };
  return { data: toLoyaltyCardCamelCase(data), error: null };
}

export function mapLoyaltyError(error: { code?: string; message?: string } | null): string {
  if (!error) return 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
  
  const code = error.code ?? '';
  const message = error.message ?? '';

  if (code === 'CARD_COMPLETE' || message === 'CARD_COMPLETE') {
    return 'Este cliente ya completó su tarjeta.';
  }

  if (code === 'NO_CARD_CONFIG' || message === 'NO_CARD_CONFIG') {
    return 'Esta empresa aún no ha configurado su tarjeta de fidelización.';
  }

  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Error de conexión. Por favor, intenta de nuevo.';
  }

  console.error('[LoyaltyService Error]', code, message);
  return 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
}
