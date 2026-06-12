// Edge Function: ocr-extract
//
// Recibe una imagen de recibo (base64) + businessId + clientId, extrae los
// datos del recibo, sube la imagen a Storage (bucket `receipts`) y crea
// una fila en `receipts` con UNIQUE (business_id, content_hash).
//
// Si GEMINI_API_KEY está presente → OCR real con Gemini Vision.
// Si no → MODO SIMULACRO: genera datos plausibles determinísticos a
// partir del hash de la imagen. El flujo es idéntico — solo cambia el
// origen de los datos. El anti-duplicado sigue funcionando perfecto
// porque el content_hash se deriva del perceptual_hash de la imagen.
//
// POST body: {
//   businessId: string,
//   clientId: string,
//   imageBase64: string,      // data:image/jpeg;base64,...
//   source: 'client' | 'business'
// }
//
// Variables de entorno:
//   SUPABASE_URL                  (auto)
//   SUPABASE_SERVICE_ROLE_KEY     (auto)
//   SUPABASE_ANON_KEY             (auto)
//   GEMINI_API_KEY                (opcional — activa OCR real)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0';

const url = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? '';
const MOCK_MODE = !geminiKey || geminiKey.startsWith('AIzaSyxx');

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

const PROMPT = `Eres un extractor de datos de recibos de compra. Analiza la imagen y devuelve EXACTAMENTE este JSON, sin texto adicional:
{
  "total": number | null,
  "currency": string | null,
  "date": string | null,
  "time": string | null,
  "nit": string | null,
  "business_name": string | null,
  "items": [{ "name": string, "qty": number | null, "price": number | null }],
  "raw_text": string
}
Si un campo no aparece en el recibo, déjalo en null. No inventes datos.`;

async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const data = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function decodeBase64DataUrl(dataUrl: string): { bytes: Uint8Array; mime: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('INVALID_IMAGE');
  const mime = match[1];
  const bin = atob(match[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, mime };
}

function bytesToBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

// ─── MODO SIMULACRO ─────────────────────────────────────────────
// Genera un payload OCR plausible y determinístico desde el hash de la imagen.
// La misma imagen → siempre los mismos datos. Imágenes distintas → datos distintos.
// Esto preserva el flujo anti-duplicado real: dos fotos idénticas son bloqueadas,
// dos fotos diferentes pasan.
type OcrPayload = {
  total: number | null;
  currency: string | null;
  date: string | null;
  time: string | null;
  nit: string | null;
  business_name: string | null;
  items: { name: string; qty: number | null; price: number | null }[];
  raw_text: string;
};

function seededInt(hex: string, offset: number, mod: number): number {
  const slice = hex.slice(offset, offset + 8);
  return parseInt(slice, 16) % mod;
}

const ITEM_POOL = [
  'Café americano', 'Cappuccino', 'Latte', 'Espresso doble',
  'Croissant', 'Sandwich club', 'Brownie', 'Galletas',
  'Jugo natural', 'Agua mineral', 'Té chai', 'Macchiato',
];

async function mockOcrFromImage(
  bytes: Uint8Array,
  businessName: string | null
): Promise<OcrPayload> {
  const hex = await sha256Hex(bytes);
  const itemCount = 1 + seededInt(hex, 0, 3); // 1-3 items
  const items: OcrPayload['items'] = [];
  let total = 0;
  for (let i = 0; i < itemCount; i++) {
    const idx = seededInt(hex, 8 + i * 4, ITEM_POOL.length);
    const qty = 1 + seededInt(hex, 24 + i * 2, 2); // 1-2 unidades
    const unit = 5000 + seededInt(hex, 30 + i * 2, 25) * 1000; // $5k-$30k COP
    const price = qty * unit;
    items.push({ name: ITEM_POOL[idx], qty, price });
    total += price;
  }
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toISOString().slice(11, 16);
  const nit = `900${hex.slice(0, 6)}`.toUpperCase();
  return {
    total,
    currency: 'COP',
    date,
    time,
    nit,
    business_name: businessName,
    items,
    raw_text: `[SIMULACRO] Recibo generado a partir de imagen ${hex.slice(0, 12)}…`,
  };
}

async function realOcr(bytes: Uint8Array, mime: string): Promise<OcrPayload> {
  const genai = new GoogleGenerativeAI(geminiKey);
  const model = genai.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });
  const result = await model.generateContent([
    PROMPT,
    { inlineData: { mimeType: mime, data: bytesToBase64(bytes) } },
  ]);
  return JSON.parse(result.response.text()) as OcrPayload;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'METHOD_NOT_ALLOWED' });

  // Verifica JWT del caller
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

  // Body
  let body: { businessId?: string; clientId?: string; imageBase64?: string; source?: 'client' | 'business' };
  try { body = await req.json(); }
  catch { return json(400, { error: 'INVALID_BODY' }); }

  const { businessId, clientId, imageBase64, source } = body;
  if (!businessId || !clientId || !imageBase64 || !source) {
    return json(400, { error: 'MISSING_FIELDS' });
  }
  if (callerId !== businessId && callerId !== clientId) {
    return json(403, { error: 'FORBIDDEN' });
  }

  // Decode imagen
  let bytes: Uint8Array;
  let mime: string;
  try {
    const dec = decodeBase64DataUrl(imageBase64);
    bytes = dec.bytes;
    mime = dec.mime;
  } catch {
    return json(400, { error: 'INVALID_IMAGE' });
  }

  // OCR (real o simulacro)
  let ocr: OcrPayload;
  try {
    if (MOCK_MODE) {
      const { data: cfg } = await admin
        .from('card_configs')
        .select('business_name')
        .eq('business_id', businessId)
        .maybeSingle();
      ocr = await mockOcrFromImage(bytes, cfg?.business_name ?? null);
    } else {
      ocr = await realOcr(bytes, mime);
    }
  } catch (e) {
    return json(502, { error: 'OCR_FAILED', detail: String(e) });
  }

  // Perceptual hash de la imagen (sha256 completo de los bytes)
  const perceptualHash = await sha256Hex(bytes);

  // Content hash:
  //   - Modo real: combina campos extraídos por OCR (igual recibo = igual hash).
  //   - Modo simulacro: usa el perceptual_hash (igual imagen = igual hash).
  // En ambos casos, subir DOS VECES la misma imagen es bloqueado por UNIQUE.
  const contentHash = MOCK_MODE
    ? perceptualHash
    : await sha256Hex([
        businessId,
        ocr.nit ?? ocr.business_name ?? '',
        ocr.total ?? '',
        ocr.date ?? '',
        ocr.time ?? '',
      ].join('|'));

  // Storage upload
  const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const storagePath = `${callerId}/${contentHash}.${ext}`;
  const { error: upErr } = await admin.storage
    .from('receipts')
    .upload(storagePath, bytes, { contentType: mime, upsert: false });
  if (upErr && !upErr.message.includes('exists')) {
    return json(500, { error: 'STORAGE_FAILED', detail: upErr.message });
  }

  // Insert receipt — UNIQUE(business_id, content_hash) bloquea duplicados
  const { data: receipt, error: insErr } = await admin.from('receipts').insert({
    business_id: businessId,
    client_id: clientId,
    storage_path: storagePath,
    perceptual_hash: perceptualHash,
    content_hash: contentHash,
    ocr_payload: ocr,
    source,
  }).select().single();

  if (insErr) {
    if (insErr.code === '23505') {
      return json(200, { error: 'RECEIPT_DUPLICATE' });
    }
    return json(500, { error: 'DB_ERROR', detail: insErr.message });
  }

  await admin.from('audit_log').insert({
    actor_id: callerId,
    action: MOCK_MODE ? 'receipt.uploaded.simulated' : 'receipt.uploaded',
    entity: 'receipts',
    entity_id: receipt.id,
    payload: { businessId, clientId, source, total: ocr.total, mock: MOCK_MODE },
  });

  return json(200, { receipt, mock: MOCK_MODE });
});
