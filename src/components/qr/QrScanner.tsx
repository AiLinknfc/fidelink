import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QrScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (text: string) => void;
  title?: string;
  subtitle?: string;
}

const ELEMENT_ID = 'fidelicard-qr-reader';

export default function QrScanner({
  open,
  onClose,
  onScan,
  title = 'Escanear código QR',
  subtitle = 'Apunta la cámara hacia el código QR de la empresa.',
}: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError(null);
    setStarting(true);

    const instance = new Html5Qrcode(ELEMENT_ID, { verbose: false });
    scannerRef.current = instance;

    instance
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        (decoded) => {
          if (cancelled) return;
          onScan(decoded);
        },
        () => { /* per-frame decode failure: ignore */ },
      )
      .then(() => { if (!cancelled) setStarting(false); })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStarting(false);
        const msg = err instanceof Error ? err.message : String(err);
        if (/Permission|NotAllowed/i.test(msg)) {
          setError('Permiso de cámara denegado. Habilítalo en los ajustes del navegador.');
        } else if (/NotFound|device/i.test(msg)) {
          setError('No se detectó cámara en este dispositivo.');
        } else {
          setError('No se pudo iniciar el escáner. Intenta de nuevo.');
        }
      });

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      scannerRef.current = null;
      if (s) {
        s.stop().catch(() => {}).finally(() => { s.clear().catch(() => {}); });
      }
    };
  }, [open, onScan]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="bg-surface-container-lowest w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="text-headline-sm font-bold text-on-surface">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="p-5 space-y-3">
              <p className="text-body-sm text-on-surface-variant">{subtitle}</p>

              <div className="relative rounded-2xl overflow-hidden bg-black aspect-square">
                <div id={ELEMENT_ID} className="w-full h-full" />
                {starting && !error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-body-sm">Iniciando cámara…</p>
                  </div>
                )}
                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 px-6 text-center">
                    <AlertCircle className="w-8 h-8" />
                    <p className="text-body-sm">{error}</p>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-on-surface-variant text-center">
                El QR debe codificar un link de FideliCard (<span className="font-mono">ailink.com.co/c/&lt;slug&gt;</span>).
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
