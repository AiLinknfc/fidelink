/**
 * WhatsApp notification service.
 *
 * ⚠️ MODO SIMULACRO: los mensajes NO se envían realmente. Se persisten en
 * localStorage como un "outbox" inspeccionable desde la UI (Dashboard ›
 * Quick Actions › Campañas WhatsApp).
 *
 * Para activar Meta Cloud API en el futuro, reemplaza únicamente la función
 * `dispatch()` por una llamada HTTP a una Edge Function `send-whatsapp` que
 * encapsule la API real (esto evita exponer el access_token en el browser).
 * Todo lo demás — templates, formato del payload, hooks de purchase — queda igual.
 *
 * Decisión P-3: provider recomendado = Meta Cloud API (cost-free hasta 1000
 * conversaciones/mes, latencia baja, soporte oficial). Migrar a Twilio o
 * 360dialog solo cambia el endpoint dentro de la Edge Function.
 */

import { sendTelegramMessage, isTelegramConfigured } from './telegramService';

const OUTBOX_KEY = 'fidelicard.whatsapp.outbox.v1';
const MAX_STORED = 200;

export type WhatsappTemplate = 'purchase_recorded' | 'last_stamp' | 'card_complete' | 'manual_campaign';

export type WhatsappStatus = 'simulated' | 'queued' | 'sent' | 'failed';

export interface WhatsappMessage {
  id: string;
  to: string;                         // E.164 ideally
  template: WhatsappTemplate;
  params: Record<string, string | number>;
  body: string;                       // texto renderizado, listo para enviar
  status: WhatsappStatus;
  /** Información de origen (qué disparó el mensaje). */
  trigger?: {
    actor: 'client' | 'business' | 'system';
    actorId?: string;
    cardId?: string;
  };
  /** Payload tal como se enviaría a Meta Cloud API (graph.facebook.com /messages). */
  metaPayload: MetaCloudPayload;
  createdAt: string;
  /** Cuando integremos Meta API: id del mensaje devuelto por Graph. */
  externalId?: string;
  error?: string;
}

/** Forma exacta del body POST a `https://graph.facebook.com/<v>/<phone_number_id>/messages` */
interface MetaCloudPayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text' | 'template';
  text?: { body: string };
  template?: {
    name: string;
    language: { code: string };
    components?: Array<{ type: 'body'; parameters: Array<{ type: 'text'; text: string }> }>;
  };
}

// ─── Templates ──────────────────────────────────────────────────────────────

interface PurchaseCtx {
  clientName: string;
  businessName: string;
  currentStamps: number;
  totalStamps: number;
  rewardDescription: string;
}

function renderPurchase(ctx: PurchaseCtx): { template: WhatsappTemplate; body: string } {
  const isComplete = ctx.currentStamps >= ctx.totalStamps;
  const isOnePending = ctx.currentStamps === ctx.totalStamps - 1;

  if (isComplete) {
    return {
      template: 'card_complete',
      body: `🎉 ¡${ctx.clientName}, tu tarjeta de ${ctx.businessName} está completa! Reclama tu recompensa: ${ctx.rewardDescription}.`,
    };
  }
  if (isOnePending) {
    return {
      template: 'last_stamp',
      body: `¡Casi listo, ${ctx.clientName}! Te falta 1 sello para tu recompensa en ${ctx.businessName}: ${ctx.rewardDescription}.`,
    };
  }
  return {
    template: 'purchase_recorded',
    body: `Hola ${ctx.clientName}, tu compra en ${ctx.businessName} fue registrada. Llevas ${ctx.currentStamps}/${ctx.totalStamps} sellos.`,
  };
}

function buildMetaPayload(to: string, body: string): MetaCloudPayload {
  // Modo "text" para mock. En producción muchas notificaciones requieren plantillas
  // pre-aprobadas (template) — la estructura ya está lista para cambiar `type`.
  return {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body },
  };
}

// ─── Outbox storage (mock backend) ──────────────────────────────────────────

function readOutbox(): WhatsappMessage[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WhatsappMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOutbox(messages: WhatsappMessage[]) {
  if (typeof localStorage === 'undefined') return;
  const trimmed = messages.slice(0, MAX_STORED);
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(trimmed));
  } catch {
    // quota exceeded — drop silently in mock mode
  }
}

function notifySubscribers() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('fidelicard:whatsapp:outbox'));
}

export function listOutbox(): WhatsappMessage[] {
  return readOutbox().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function clearOutbox() {
  writeOutbox([]);
  notifySubscribers();
}

export function subscribeOutbox(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => cb();
  window.addEventListener('fidelicard:whatsapp:outbox', handler);
  return () => window.removeEventListener('fidelicard:whatsapp:outbox', handler);
}

// ─── Dispatcher (mock — reemplazar por Edge Function call para activar real) ──

/**
 * Punto de inserción único para cambiar el backend real.
 * Mock actual: guarda en outbox local + console.log.
 * Real: `await supabase.functions.invoke('send-whatsapp', { body: payload })`.
 */
async function dispatch(message: WhatsappMessage): Promise<WhatsappMessage> {
  const stored: WhatsappMessage = { ...message, status: 'simulated' };
  const current = readOutbox();
  writeOutbox([stored, ...current]);
  notifySubscribers();
  // eslint-disable-next-line no-console
  console.info('[whatsapp:simulacro]', stored.template, '→', stored.to, stored.body);
  if (isTelegramConfigured()) {
    const tgText = `<b>[FideliCard] ${stored.template}</b>\n→ ${stored.to}\n${stored.body}`;
    sendTelegramMessage(tgText);
  }
  return stored;
}

// ─── Public API (lo que usa la app) ─────────────────────────────────────────

export async function sendPurchaseNotification(
  params: PurchaseCtx & { to: string | null; trigger?: WhatsappMessage['trigger'] }
): Promise<WhatsappMessage | null> {
  if (!params.to) return null; // sin teléfono → no enviamos nada
  const { template, body } = renderPurchase(params);
  const msg: WhatsappMessage = {
    id: cryptoRandomId(),
    to: params.to,
    template,
    params: {
      clientName: params.clientName,
      businessName: params.businessName,
      currentStamps: params.currentStamps,
      totalStamps: params.totalStamps,
      rewardDescription: params.rewardDescription,
    },
    body,
    status: 'queued',
    trigger: params.trigger,
    metaPayload: buildMetaPayload(params.to, body),
    createdAt: new Date().toISOString(),
  };
  return dispatch(msg);
}

export async function sendManualCampaign(params: {
  to: string;
  body: string;
  trigger?: WhatsappMessage['trigger'];
}): Promise<WhatsappMessage> {
  const msg: WhatsappMessage = {
    id: cryptoRandomId(),
    to: params.to,
    template: 'manual_campaign',
    params: { body: params.body },
    body: params.body,
    status: 'queued',
    trigger: params.trigger,
    metaPayload: buildMetaPayload(params.to, params.body),
    createdAt: new Date().toISOString(),
  };
  return dispatch(msg);
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID();
  }
  return `wa-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
