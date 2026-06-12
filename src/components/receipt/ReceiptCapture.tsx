import { useRef, useState, type ChangeEvent } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { uploadAndProcessReceipt, mapReceiptError, type Receipt } from '@/services/receiptService';

interface Props {
  businessId: string;
  clientId: string;
  source: 'client' | 'business';
  onSuccess: (receipt: Receipt, mock: boolean) => void;
  onCancel?: () => void;
}

export default function ReceiptCapture({ businessId, clientId, source, onSuccess, onCancel }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function handlePick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErrorMsg('');
  }

  async function handleProcess() {
    if (!file) return;
    setProcessing(true);
    setErrorMsg('');
    try {
      const { data, error } = await uploadAndProcessReceipt({ businessId, clientId, file, source });
      if (error || !data) {
        setErrorMsg(mapReceiptError(error?.code));
        return;
      }
      onSuccess(data.receipt, data.mock);
    } catch {
      setErrorMsg(mapReceiptError(undefined));
    } finally {
      setProcessing(false);
    }
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setErrorMsg('');
    if (cameraRef.current) cameraRef.current.value = '';
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="text-body-sm text-on-surface">
          <p className="font-bold">Validación por recibo</p>
          <p className="text-on-surface-variant mt-1">
            Toma una foto del recibo de compra. Validamos que sea único — no se puede registrar la misma compra dos veces.
          </p>
        </div>
      </div>

      {!preview ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-primary/40 bg-primary/5 rounded-xl text-primary hover:bg-primary/10 transition-all active:scale-[0.98]"
          >
            <Camera className="w-8 h-8" />
            <span className="font-bold">Tomar foto</span>
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container transition-all active:scale-[0.98]"
          >
            <Upload className="w-8 h-8" />
            <span className="font-bold">Subir archivo</span>
          </button>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePick}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePick}
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="relative rounded-xl overflow-hidden bg-surface-container border border-outline-variant">
            <img src={preview} alt="Recibo" className="w-full max-h-80 object-contain" />
            {processing && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white gap-2">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-body-sm font-bold">Procesando recibo…</p>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-error-container text-on-error-container rounded-xl text-body-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleProcess}
              disabled={processing}
              className="flex-1 bg-primary text-on-primary px-4 py-3 rounded-xl font-bold disabled:opacity-50 active:scale-[0.98]"
            >
              {processing ? 'Procesando…' : 'Validar y registrar'}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={processing}
              className="px-4 py-3 border border-outline-variant rounded-xl font-bold disabled:opacity-50"
            >
              Cambiar
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={processing}
                className="px-4 py-3 text-on-surface-variant rounded-xl disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
