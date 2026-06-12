const env: any = (import.meta as any).env ?? {};
const BOT_TOKEN: string = env.VITE_TELEGRAM_BOT_TOKEN ?? '';
const CHAT_ID: string = env.VITE_TELEGRAM_CHAT_ID ?? '';

export function isTelegramConfigured(): boolean {
  return !!(BOT_TOKEN && CHAT_ID);
}

/**
 * Envía un mensaje al chat de Telegram configurado en .env.
 * Si BOT_TOKEN o CHAT_ID no están definidos, retorna false silenciosamente.
 * Uso: pruebas/testing sin depender de Meta WhatsApp API.
 */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!isTelegramConfigured()) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
