import React, { useRef, useState } from 'react';
import { Camera, Link as LinkIcon, X } from 'lucide-react';

interface PhotoInputProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  imageClassName?: string;
  alt?: string;
  shape?: 'circle' | 'square';
  size?: number;
  editable?: boolean;
}

export function PhotoInput({
  value,
  onChange,
  className = '',
  imageClassName = '',
  alt = '',
  shape = 'circle',
  size = 96,
  editable = true,
}: PhotoInputProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [urlValue, setUrlValue] = useState(value);

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
        setShowPicker(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      {value ? (
        <img
          src={value}
          alt={alt}
          className={`${shapeClass} object-cover border-4 border-white shadow-md w-full h-full ${imageClassName}`}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className={`${shapeClass} bg-slate-100 border-4 border-white shadow-inner w-full h-full flex items-center justify-center text-slate-400`}>
          <Camera className="w-6 h-6" />
        </div>
      )}

      {editable && (
        <button
          type="button"
          onClick={() => { setUrlValue(value); setShowPicker(true); }}
          className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-1.5 shadow-md transition-colors"
          title="Cambiar foto"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      )}

      {showPicker && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowPicker(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4" /> Editar foto
              </h3>
              <button onClick={() => setShowPicker(false)} className="p-1 rounded hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-center">
                {value && (
                  <img src={value} alt="preview" className={`w-28 h-28 object-cover ${shapeClass} border-4 border-slate-100`} />
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" /> Subir imagen desde mi dispositivo
              </button>

              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="uppercase tracking-wider font-bold">o</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" /> URL de la imagen
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 text-xs p-2 border border-slate-200 rounded-md text-slate-700"
                  />
                  <button
                    onClick={() => {
                      onChange(urlValue);
                      setShowPicker(false);
                    }}
                    className="px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-md"
                  >
                    Usar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
