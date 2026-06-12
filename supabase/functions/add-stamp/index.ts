// Edge Function: add-stamp
//
// Suma un sello a la tarjeta del cliente. Ejecuta con service_role para
// evitar que el cliente manipule directamente loyalty_cards/purchases.
//
// POST body: { businessId: string, clientId: string, receiptId?: string }
// El caller debe enviar Authorization: Bearer <JWT> — la función verifica
// que el JWT pertenece a businessId (el negocio es quien aprueba) o a
// clientId (si se aprobó la compra con OCR de recibo previamente).
//
// Despliegue: `supabase functions deploy add-stamp`

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const url = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'METHOD_NOT_ALLOWED' });

  // Verifica el JWT del caller
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json(401, { error: 'NO_AUTH' });

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json(401, { error: 'INVALID_AUTH' });
  const callerId = userData.user.id;

  // Payload
  let body: { businessId?: string; clientId?: string; receiptId?: string };
  try { body = await req.json(); }
  catch { return json(400, { error: 'INVALID_BODY' }); }

  const { businessId, clientId, receiptId } = body;
  if (!businessId || !clientId) return json(400, { error: 'MISSING_FIELDS' });

  // Autorización: caller debe ser el negocio o el cliente dueño del recibo.
  const isBusinessCaller = callerId === businessId;
  const isClientCaller = callerId === clientId;
  if (!isBusinessCaller && !isClientCaller) {
    return json(403, { error: 'FORBIDDEN' });
  }

  // Si el cliente es el caller, exigir receiptId válido y no usado
  if (isClientCaller) {
    if (!receiptId) return json(400, { error: 'RECEIPT_REQUIRED' });
    const { data: receipt, error: rErr } = await admin
      .from('receipts')
      .select('id, business_id, client_id, loyalty_card_id')
      .eq('id', receiptId)
      .maybeSingle();
    if (rErr || !receipt) return json(404, { error: 'RECEIPT_NOT_FOUND' });
    if (receipt.business_id !== businessId || receipt.client_id !== clientId) {
      return json(403, { error: 'RECEIPT_MISMATCH' });
    }
    if (receipt.loyalty_card_id) {
      return json(409, { error: 'RECEIPT_ALREADY_USED' });
    }
  }

  // 1. Config de la tarjeta
  const { data: cfg, error: cfgErr } = await admin
    .from('card_configs')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle();
  if (cfgErr || !cfg) return json(404, { error: 'NO_CARD_CONFIG' });

  // 2. Tarjeta existente
  const { data: existing, error: exErr } = await admin
    .from('loyalty_cards')
    .select('*')
    .eq('business_id', businessId)
    .eq('client_id', clientId)
    .maybeSingle();
  if (exErr) return json(500, { error: 'DB_ERROR', detail: exErr.message });

  if (existing && existing.current_stamps >= existing.total_stamps) {
    return json(409, { error: 'CARD_COMPLETE', card: existing });
  }

  // 3. Insert / Update
  let card: any;
  if (!existing) {
    const { data, error } = await admin.from('loyalty_cards').insert({
      business_id: businessId,
      client_id: clientId,
      current_stamps: 1,
      total_stamps: cfg.total_stamps,
      business_name: cfg.business_name,
      color_hex: cfg.color_hex,
      reward_description: cfg.reward_description,
    }).select().single();
    if (error) return json(500, { error: 'DB_ERROR', detail: error.message });
    card = data;
  } else {
    const { data, error } = await admin.from('loyalty_cards')
      .update({ current_stamps: existing.current_stamps + 1 })
      .eq('id', existing.id)
      .select().single();
    if (error) return json(500, { error: 'DB_ERROR', detail: error.message });
    card = data;
  }

  // 4. Purchase + (opcional) link al recibo
  await admin.from('purchases').insert({
    loyalty_card_id: card.id,
    business_name: cfg.business_name,
  });
  if (receiptId) {
    await admin.from('receipts').update({ loyalty_card_id: card.id }).eq('id', receiptId);
  }

  // 5. Audit
  await admin.from('audit_log').insert({
    actor_id: callerId,
    action: 'stamp.added',
    entity: 'loyalty_cards',
    entity_id: card.id,
    payload: { businessId, clientId, receiptId: receiptId ?? null, source: isClientCaller ? 'client' : 'business' },
  });

  return json(200, { card });
});
