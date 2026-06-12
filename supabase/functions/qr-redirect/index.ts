// Edge Function: qr-redirect
//
// Resuelve un slug a su target_url y emite un 302. Pensado para servir
// las URLs https://ailink.com.co/c/{slug} (con un proxy/CDN que reenvíe
// /c/:slug a esta función), o directamente como
// https://<project>.functions.supabase.co/qr-redirect?slug=xxx.
//
// Variables de entorno requeridas (configurar con `supabase secrets set`):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Despliegue: `supabase functions deploy qr-redirect --no-verify-jwt`
//   (no-verify-jwt porque el redirect es público — el slug es la "auth").

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const url = Deno.env.get('SUPABASE_URL')!;
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(url, key, { auth: { persistSession: false } });

const FALLBACK_URL = 'https://ailink.com.co/';

Deno.serve(async (req) => {
  try {
    const u = new URL(req.url);
    // Soporta ambos formatos:
    //   /qr-redirect?slug=xxx        (default Supabase)
    //   /qr-redirect/xxx             (cuando el proxy reescribe)
    const fromQuery = u.searchParams.get('slug');
    const fromPath = u.pathname.split('/').filter(Boolean).pop();
    const slug = (fromQuery || fromPath || '').trim().toLowerCase();

    if (!slug || slug === 'qr-redirect') {
      return Response.redirect(FALLBACK_URL, 302);
    }

    const { data, error } = await supabase
      .from('qr_links')
      .select('target_url, active')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data || !data.active) {
      return Response.redirect(FALLBACK_URL, 302);
    }

    // Audit (best-effort, no bloquea)
    supabase.from('audit_log').insert({
      action: 'qr.resolved',
      entity: 'qr_links',
      entity_id: slug,
      payload: { ua: req.headers.get('user-agent') ?? '' },
    }).then(() => {}, () => {});

    return Response.redirect(data.target_url as string, 302);
  } catch (_e) {
    return Response.redirect(FALLBACK_URL, 302);
  }
});
