import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Mail, Trash2, Sparkles, MessageSquare, AlertCircle, CheckCircle2, Send,
} from 'lucide-react';
import {
  listOutbox, clearOutbox, subscribeOutbox, sendManualCampaign,
  type WhatsappMessage,
} from '@/services/whatsappService';

interface WhatsappOutboxProps {
  open: boolean;
  onClose: () => void;
}

const TEMPLATE_LABEL: Record<WhatsappMessage['template'], string> = {
  purchase_recorded: 'Compra registrada',
  last_stamp: 'Último sello',
  card_complete: 'Tarjeta completa',
  manual_campaign: 'Campaña manual',
};

export default function WhatsappOutbox({ open, onClose }: WhatsappOutboxProps) {
  const [messages, setMessages] = useState<WhatsappMessage[]>([]);
  const [tab, setTab] = useState<'outbox' | 'send'>('outbox');
  const [draft, setDraft] = useState({ to: '', body: '' });
  const [sending, setSending] = useState(false);
  const [sentToast, setSentToast] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMessages(listOutbox());
    const unsub = subscribeOutbox(() => setMessages(listOutbox()));
    return unsub;
  }, [open]);

  function handleClear() {
    if (!window.confirm('¿Borrar todos los mensajes simulados?')) return;
    clearOutbox();
  }

  async function handleSendManual() {
    if (!draft.to.trim() || !draft.body.trim()) return;
    setSending(true);
    await sendManualCampaign({
      to: draft.to.trim(),
      body: draft.body.trim(),
      trigger: { actor: 'business' },
    });
    setDraft({ to: '', body: '' });
    setSending(false);
    setSentToast(true);
    setTimeout(() => setSentToast(false), 2000);
    setTab('outbox');
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="bg-surface-container-lowest w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <header className="px-6 py-4 border-b border-outline-variant flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-primary-container text-on-primary-container rounded-xl shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-headline-sm font-bold text-on-surface truncate">
                    Centro de notificaciones
                  </h2>
                  <p className="text-[11px] uppercase tracking-widest font-bold text-primary">
                    Modo simulacro — sin API real
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Banner explicativo */}
            <div className="mx-6 mt-4 p-3 bg-tertiary-container text-on-tertiary-container rounded-xl text-body-sm flex gap-2">
              <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                Los mensajes <strong>no se envían realmente todavía</strong>. Se guardan aquí
                para que veas el contenido exacto que se mandaría. Al activar Meta Cloud API
                (P-3) cambiará la última función del service y todo lo demás seguirá igual.
              </p>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 flex gap-2 border-b border-outline-variant">
              <TabBtn active={tab === 'outbox'} onClick={() => setTab('outbox')} icon={MessageSquare}>
                Outbox ({messages.length})
              </TabBtn>
              <TabBtn active={tab === 'send'} onClick={() => setTab('send')} icon={Send}>
                Enviar manual
              </TabBtn>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {tab === 'outbox' ? (
                messages.length === 0 ? (
                  <div className="py-16 text-center text-on-surface-variant">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-body-md">Aún no hay mensajes simulados.</p>
                    <p className="text-body-sm mt-1">
                      Registra una compra (cliente o empresa) y verás aparecer aquí la notificación
                      que se enviará al cliente.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {messages.map((m: WhatsappMessage) => (
                      <div key={m.id}>
                        <OutboxItem m={m} />
                      </div>
                    ))}
                  </ul>
                )
              ) : (
                <ManualForm
                  draft={draft}
                  setDraft={setDraft}
                  sending={sending}
                  onSend={handleSendManual}
                />
              )}
            </div>

            {/* Footer */}
            {tab === 'outbox' && messages.length > 0 && (
              <footer className="px-6 py-3 border-t border-outline-variant flex justify-between items-center">
                <p className="text-[11px] text-on-surface-variant">
                  Almacenados en local. Se borran al limpiar el navegador.
                </p>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-md font-bold text-error hover:bg-error-container/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Borrar todos
                </button>
              </footer>
            )}

            {sentToast && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-label-md font-bold shadow-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Mensaje simulado en outbox
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

function TabBtn({
  active, onClick, icon: Icon, children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof MessageSquare;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 text-label-md font-bold border-b-2 transition-colors ${
        active ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

interface OutboxItemProps { m: WhatsappMessage }
function OutboxItem({ m }: OutboxItemProps) {
  return (
    <li className="bg-surface-container rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">
            {TEMPLATE_LABEL[m.template]}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-bold bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {m.status}
          </span>
        </div>
        <span className="text-[11px] text-on-surface-variant">
          {new Date(m.createdAt).toLocaleString()}
        </span>
      </div>
      <p className="text-body-sm text-on-surface-variant">
        <strong className="text-on-surface">Para:</strong> <span className="font-mono">{m.to}</span>
      </p>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-sm text-on-surface whitespace-pre-wrap">
        {m.body}
      </div>
      {m.trigger && (
        <p className="text-[11px] text-on-surface-variant">
          Disparado por: {m.trigger.actor}{m.trigger.cardId ? ` · tarjeta ${m.trigger.cardId.slice(0, 8)}…` : ''}
        </p>
      )}
    </li>
  );
}

function ManualForm({
  draft, setDraft, sending, onSend,
}: {
  draft: { to: string; body: string };
  setDraft: (d: { to: string; body: string }) => void;
  sending: boolean;
  onSend: () => void;
}) {
  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h3 className="text-body-md font-bold mb-1">Enviar campaña manual</h3>
        <p className="text-body-sm text-on-surface-variant">
          Útil para probar templates antes de automatizarlos. Mientras estemos en simulacro, el mensaje solo se guardará en el outbox.
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-body-sm font-semibold text-on-surface-variant">Teléfono destino</label>
        <input
          type="tel"
          inputMode="tel"
          value={draft.to}
          onChange={e => setDraft({ ...draft, to: e.target.value })}
          placeholder="+57 300 000 0000"
          className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-body-sm font-semibold text-on-surface-variant">Mensaje</label>
        <textarea
          rows={5}
          value={draft.body}
          onChange={e => setDraft({ ...draft, body: e.target.value })}
          placeholder="Hola, esta semana 2x1 en cafés…"
          className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none resize-none transition-all"
        />
      </div>
      <button
        onClick={onSend}
        disabled={sending || !draft.to.trim() || !draft.body.trim()}
        className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <Send className="w-4 h-4" />
        {sending ? 'Enviando…' : 'Enviar (simulacro)'}
      </button>
    </div>
  );
}
