import React, { useState } from 'react';
import { Biography, Review, DemoUserRole } from '../types/biography';
import { Star, MessageSquare, CornerDownRight, Plus, Send, AlertCircle, X, Globe, Check, ChevronDown } from 'lucide-react';

interface ReviewsModuleProps {
  currentBio: Biography;
  role: DemoUserRole;
  onUpdateBio: (updated: Biography) => void;
}

export function ReviewsModule({ currentBio, role, onUpdateBio }: ReviewsModuleProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [syncToGoogle, setSyncToGoogle] = useState(true);
  const [replyTexts, setReplyTexts] = useState<{ [reviewId: string]: string }>({});
  const [mName, setMName] = useState('');
  const [mComment, setMComment] = useState('');
  const [mRating, setMRating] = useState(5);
  const [mErr, setMErr] = useState('');
  const [iName, setIName] = useState('');
  const [iComment, setIComment] = useState('');
  const [iRating, setIRating] = useState(5);
  const [iErr, setIErr] = useState('');

  const reviews = currentBio.reviews || [];
  const googleReviews = currentBio.googleReviews || [];

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  const googleAvgRating = googleReviews.length
    ? (googleReviews.reduce((acc, r) => acc + r.rating, 0) / googleReviews.length).toFixed(1)
    : '—';

  const addReview = (name: string, comment: string, rating: number, sync: boolean) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userName: name,
      rating,
      comment,
      date: new Date().toISOString(),
      googleSynced: sync,
    };
    const updated: Biography = { ...currentBio, reviews: [newRev, ...reviews] };
    if (sync) {
      updated.googleReviews = [{ ...newRev }, ...googleReviews];
    }
    onUpdateBio(updated);
  };

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!iName.trim() || !iComment.trim()) { setIErr('Ingresa tu nombre y un comentario.'); return; }
    addReview(iName, iComment, iRating, false);
    setIName(''); setIComment(''); setIRating(5); setIErr('');
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim() || !mComment.trim()) { setMErr('Ingresa tu nombre y un comentario.'); return; }
    addReview(mName, mComment, mRating, syncToGoogle);
    setMName(''); setMComment(''); setMRating(5); setMErr('');
    setShowModal(false);
  };

  const handleAddReply = (reviewId: string) => {
    const replyText = replyTexts[reviewId];
    if (!replyText || !replyText.trim()) return;
    const updatedReviews = reviews.map((r) =>
      r.id === reviewId ? { ...r, reply: replyText } : r
    );
    onUpdateBio({ ...currentBio, reviews: updatedReviews });
    setReplyTexts({ ...replyTexts, [reviewId]: '' });
  };

  const handleDeleteReview = (reviewId: string) => {
    const updatedReviews = reviews.filter((r) => r.id !== reviewId);
    const updatedGoogle = googleReviews.filter((r) => r.id !== reviewId);
    onUpdateBio({ ...currentBio, reviews: updatedReviews, googleReviews: updatedGoogle });
  };

  const openModal = () => {
    setMName(''); setMComment(''); setMRating(5); setSyncToGoogle(true); setMErr('');
    setShowModal(true);
  };

  return (
    <div className="space-y-2">
      {/* Collapsed toggle bar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-amber-500" />
            <span className="text-sm font-bold text-slate-700">{avgRating}</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <span className="text-xs text-slate-500">
            {reviews.length} {reviews.length === 1 ? 'calificación' : 'calificaciones'}
          </span>
          {googleReviews.length > 0 && (
            <>
              <div className="h-3 w-px bg-slate-200" />
              <span className="text-[10px] text-amber-600 flex items-center gap-1">
                <Globe className="w-3 h-3" /> {googleReviews.length} en Google
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 transition-colors font-medium">
            {collapsed ? 'Ver calificaciones' : 'Ocultar'}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </div>
      </button>

      {/* Expanded content */}
      {!collapsed && <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-500" /> Comunidad y Calificaciones
            </h3>
            <p className="text-xs text-slate-400 mt-1">Conecta con clientes y amigos compartiendo experiencias.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-5 h-5 fill-amber-500" />
                <span className="text-base font-bold text-slate-700">{avgRating}</span>
              </div>
              <div className="h-4 w-px bg-indigo-200" />
              <span className="text-xs font-semibold text-indigo-700">
                {reviews.length} {reviews.length === 1 ? 'Calificación' : 'Calificaciones'}
              </span>
            </div>
            <button onClick={openModal}
              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all active:scale-95 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> Calificar
            </button>
          </div>
        </div>

        {/* Inline quick form */}
        <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
          <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" /> Dejar una Calificación
          </h4>
          {iErr && (
            <div className="mb-3 p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {iErr}
            </div>
          )}
          <form onSubmit={handleInlineSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Tu Nombre</label>
                <input type="text" placeholder="Ej. Paula Valencia" value={iName}
                  onChange={(e) => setIName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Calificación</label>
                <div className="flex items-center gap-1 h-8">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button type="button" key={s} onClick={() => setIRating(s)} className="p-0.5 hover:scale-110 transition-transform">
                      <Star className={`w-5 h-5 ${s <= iRating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Comentario</label>
              <textarea rows={2} placeholder="Escribe tu opinión..." value={iComment}
                onChange={(e) => setIComment(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700" />
            </div>
            <div className="flex justify-end">
              <button type="submit"
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white transition-all flex items-center gap-1">
                Publicar <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Google Reviews */}
        {googleReviews.length > 0 && (
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white border border-amber-200 flex items-center justify-center text-[10px] font-bold text-amber-700">G+</div>
                <div>
                  <span className="text-[11px] font-bold text-amber-800 block leading-tight">Google Reviews</span>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(Number(googleAvgRating)) ? 'fill-amber-500 text-amber-500' : 'text-amber-200'}`} />
                      ))}
                    </div>
                    <span className="text-[9px] font-bold text-amber-700">{googleAvgRating}</span>
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-amber-600 font-medium flex items-center gap-1">
                <Globe className="w-3 h-3" /> {googleReviews.length} sincronizadas
              </span>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {googleReviews.map((rev) => (
                <div key={rev.id} className="p-2.5 rounded-xl bg-white border border-amber-100 flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-[9px] text-amber-700 shrink-0">
                    {rev.userName[0]?.toUpperCase() || 'G'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-slate-700 truncate">{rev.userName}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-2.5 h-2.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-amber-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{rev.comment}</p>
                    {rev.reply && (
                      <div className="mt-1 pl-2 border-l-2 border-amber-300">
                        <span className="text-[8px] font-bold text-amber-700">Respuesta</span>
                        <p className="text-[9px] text-slate-400 italic">{rev.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews feed */}
        <div className="space-y-3.5">
          {reviews.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs italic">
              No hay comentarios todavía. ¡Sé el primero en calificar tu experiencia!
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 shrink-0 rounded-full bg-slate-100 border border-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">
                      {rev.userName[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-700 block truncate">{rev.userName}</span>
                        {rev.googleSynced && (
                          <span className="text-[8px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded font-medium flex items-center gap-0.5 border border-amber-200">
                            <Globe className="w-2.5 h-2.5" /> Google
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(rev.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-1 shrink-0">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 shrink-0 ${s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    {role === 'creador' && (
                      <button onClick={() => handleDeleteReview(rev.id)}
                        className="ml-2 text-rose-500 hover:text-rose-700 text-[10px] font-medium shrink-0">Eliminar</button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-1">{rev.comment}</p>
                {rev.reply ? (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CornerDownRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-700">Propietario</span>
                        <span className="text-[9px] text-indigo-600 px-1 py-0.5 bg-indigo-50 border border-indigo-100 rounded-sm font-semibold">Respuesta Oficial</span>
                      </div>
                      <p className="text-xs text-slate-500 italic mt-0.5 leading-relaxed">{rev.reply}</p>
                    </div>
                  </div>
                ) : (
                  (role === 'creador' || role === 'veterinario' || role === 'estilista') && (
                    <div className="mt-2.5 flex gap-2">
                      <input type="text" placeholder="Escribe una respuesta oficial..."
                        value={replyTexts[rev.id] || ''}
                        onChange={(e) => setReplyTexts({ ...replyTexts, [rev.id]: e.target.value })}
                        className="flex-1 px-3 py-1 text-xs rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-600" />
                      <button onClick={() => handleAddReply(rev.id)}
                        className="px-3 bg-slate-800 text-white font-medium hover:bg-slate-900 rounded-lg text-xs flex items-center gap-1 transition-all active:scale-95">
                        Responder <Send className="w-3" />
                      </button>
                    </div>
                  )
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 relative">
              <button onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-800">Calificar Experiencia</h3>
              </div>
              {mErr && (
                <div className="mb-3 p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {mErr}
                </div>
              )}
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Tu Nombre o Empresa</label>
                  <input type="text" placeholder="Ej. Paula Valencia" value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700" autoFocus />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Calificación</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button type="button" key={s} onClick={() => setMRating(s)} className="p-1 hover:scale-110 transition-transform">
                        <Star className={`w-8 h-8 ${s <= mRating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Tu Mensaje / Experiencia</label>
                  <textarea rows={3} placeholder="Escribe aquí tu opinión..." value={mComment}
                    onChange={(e) => setMComment(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700" />
                </div>
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer group">
                  <div onClick={(e) => { e.stopPropagation(); setSyncToGoogle(!syncToGoogle); }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      syncToGoogle ? 'bg-amber-600 border-amber-600' : 'border-slate-300 bg-white group-hover:border-slate-400'
                    }`}>
                    {syncToGoogle && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-800">Publicar también en Google Reviews</span>
                  </div>
                </label>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="flex-1 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5">
                    Publicar <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>}
    </div>
  );
}
