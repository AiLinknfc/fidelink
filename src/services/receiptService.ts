import { supabase } from '@/lib/supabaseClient';

export interface ReceiptOcr {
  total: number | null;
  currency: string | null;
  date: string | null;
  time: string | null;
  nit: string | null;
  business_name: string | null;
  items: { name: string; qty: number | null; price: number | null }[];
  raw_text: string;
}

export interface Receipt {
  id: string;
  businessId: string;
  clientId: string;
  loyaltyCardId: string | null;
  storagePath: string;
  contentHash: string;
  ocrPayload: ReceiptOcr;
  source: 'client' | 'business';
  createdAt: string;
}

export interface ServiceResult<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

function toCamel(row: any): Receipt {
  return {
    id: row.id,
    businessId: row.business_id,
    clientId: row.client_id,
    loyaltyCardId: row.loyalty_card_id ?? null,
    storagePath: row.storage_path,
    contentHash: row.content_hash,
    ocrPayload: row.ocr_payload,
    source: row.source,
    createdAt: row.created_at,
  };
}

/** Lee un File y devuelve un data URL base64 (con prefijo data:mime;base64,...) */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Sube y procesa un recibo. La Edge Function:
 *  1. extrae datos con Gemini Vision
 *  2. calcula hashes
 *  3. guarda la imagen en Storage
 *  4. inserta en `receipts` con UNIQUE (business_id, content_hash) → bloquea duplicados
 */
export interface ProcessedReceipt {
  receipt: Receipt;
  /** true cuando los datos OCR son simulados (no hay GEMINI_API_KEY en el server). */
  mock: boolean;
}

export async function uploadAndProcessReceipt(input: {
  businessId: string;
  clientId: string;
  file: File;
  source: 'client' | 'business';
}): Promise<ServiceResult<ProcessedReceipt>> {
  const imageBase64 = await fileToDataUrl(input.file);

  const { data, error } = await supabase.functions.invoke('ocr-extract', {
    body: {
      businessId: input.businessId,
      clientId: input.clientId,
      imageBase64,
      source: input.source,
    },
  });

  if (error) {
    const code = (data as any)?.error ?? 'EDGE_ERROR';
    return { data: null, error: { message: code, code } };
  }
  const payload = data as any;
  if (payload?.error) {
    return { data: null, error: { message: payload.error, code: payload.error } };
  }
  return {
    data: { receipt: toCamel(payload.receipt), mock: !!payload.mock },
    error: null,
  };
}

export function mapReceiptError(code: string | undefined): string {
  switch (code) {
    case 'RECEIPT_DUPLICATE': return 'Este recibo ya fue registrado anteriormente. No se puede usar dos veces.';
    case 'OCR_FAILED': return 'No pudimos leer el recibo. Toma otra foto con mejor enfoque y luz.';
    case 'STORAGE_FAILED': return 'No se pudo guardar la imagen del recibo. Intenta de nuevo.';
    case 'FORBIDDEN': return 'No tienes permiso para registrar este recibo.';
    case 'NO_AUTH':
    case 'INVALID_AUTH': return 'Tu sesión expiró. Inicia sesión de nuevo.';
    case 'MISSING_FIELDS': return 'Faltan datos para procesar el recibo.';
    case 'INVALID_IMAGE': return 'La imagen no es válida. Usa una foto JPG o PNG.';
    default: return 'No se pudo procesar el recibo. Intenta de nuevo.';
  }
}
