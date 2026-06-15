import { Smartphone, Tablet, Coffee, QrCode, Upload, Settings, Eye, Share2, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useI18n } from '../i18n/index';

export default function Editor() {
  const { t } = useI18n();
  const [cardName, setCardName] = useState('Indigo Coffee Rewards');
  const [points, setPoints] = useState(8);
  const [total, setTotal] = useState(10);

  return (
    <div className="bg-surface min-h-screen">
      <main className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Editor Controls */}
          <section className="lg:col-span-7 space-y-12">
            <div>
              <h2 className="text-headline-lg text-on-surface font-bold">{t('Card Design Studio')}</h2>
              <p className="text-body-lg text-on-surface-variant mt-2">{t('Configure your loyalty program and customize its visual identity.')}</p>
            </div>

            {/* Config Bento Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Identity */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30 space-y-6">
                <label className="text-label-md font-bold text-primary uppercase tracking-widest">Card Identity</label>
                <div className="space-y-2">
                  <span className="text-body-sm font-semibold text-on-surface-variant">Card Name</span>
                  <input 
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all" 
                    placeholder="Enter Card Name" 
                    type="text" 
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-body-sm font-semibold text-on-surface-variant">Category</span>
                  <select className="w-full bg-surface-container-low border border-outline-variant focus:border-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all">
                    <option>Food & Drink</option>
                    <option>Retail & Shopping</option>
                    <option>Health & Beauty</option>
                    <option>Entertainment</option>
                  </select>
                </div>
              </div>

              {/* Points Engine */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30 space-y-6">
                <label className="text-label-md font-bold text-primary uppercase tracking-widest">Points Engine</label>
                <div className="space-y-2">
                  <span className="text-body-sm font-semibold text-on-surface-variant">Point System Type</span>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-label-md font-bold shadow-md">Stamp Based</button>
                    <button className="flex-1 border border-outline-variant text-on-surface-variant px-3 py-2 rounded-lg text-label-md font-bold hover:bg-surface-container transition-colors">Cumulative</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-body-sm font-semibold text-on-surface-variant">Reward Threshold</span>
                  <input 
                    value={total}
                    onChange={(e) => setTotal(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary rounded-xl px-4 py-3 text-body-md outline-none transition-all" 
                    type="number" 
                  />
                </div>
              </div>
            </div>

            {/* QR Customization */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30">
              <div className="flex items-center gap-3 mb-8">
                <QrCode className="text-primary w-6 h-6" />
                <h3 className="text-headline-sm font-bold">QR Style Customization</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-body-sm font-semibold text-on-surface-variant">QR Size</label>
                  <input className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary" type="range" />
                </div>
                <div className="space-y-3">
                  <label className="text-body-sm font-semibold text-on-surface-variant">Primary Color</label>
                  <div className="flex gap-2.5">
                    {['#3525cd', '#006c49', '#684000', '#213145'].map((color, idx) => (
                      <button 
                        key={idx}
                        style={{ backgroundColor: color }}
                        className={`w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform ${idx === 0 ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-body-sm font-semibold text-on-surface-variant">Logo Overlay</label>
                  <button className="w-full border-2 border-dashed border-outline-variant rounded-xl py-2.5 flex items-center justify-center gap-2 text-primary hover:bg-primary/5 transition-colors font-bold text-label-md uppercase">
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </button>
                </div>
              </div>
            </div>

            {/* NFC Settings */}
            <div className="flex items-center justify-between p-6 bg-primary/5 rounded-2xl border border-primary/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-body-md font-bold text-on-surface">Enable NFC Pass</p>
                  <p className="text-body-sm text-on-surface-variant">Allow users to add this card to Apple/Google Wallet</p>
                </div>
              </div>
              <button className="w-12 h-6 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </button>
            </div>
          </section>

          {/* Preview Aside */}
          <aside className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-surface-container p-8 md:p-12 rounded-[32px] flex flex-col items-center gap-8 shadow-inner">
              <div className="w-full flex justify-between items-center px-2">
                <span className="text-label-md font-bold text-on-surface-variant tracking-widest uppercase">{t('Live Preview')}</span>
                <div className="flex gap-3">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <Tablet className="w-5 h-5 text-on-surface-variant opacity-40" />
                </div>
              </div>

              {/* Card Component Preview */}
              <motion.div 
                layout
                className="w-full max-w-[340px] aspect-[1.58/1] rounded-[24px] bg-gradient-to-br from-primary to-[#1e1485] p-6 text-white shadow-2xl relative overflow-hidden loyalty-card-mesh"
              >
                <div className="absolute -top-[20%] -right-[10%] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h4 className="text-headline-sm font-bold truncate max-w-[180px]">{cardName}</h4>
                    <p className="text-label-md opacity-80 uppercase tracking-widest mt-1">Premium Rewards</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <Coffee className="w-6 h-6" />
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 z-10">
                  <div className="flex justify-between items-end mb-2.5">
                    <span className="text-label-md font-bold opacity-80">PROGRESS</span>
                    <span className="text-body-md font-bold">{points} / {total} STAMPS</span>
                  </div>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-secondary shadow-[0_0_12px_rgba(78,222,163,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(points / total) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 50 }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-[32px] font-extrabold tracking-tighter">820</div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold opacity-60">Member Since</p>
                      <p className="text-label-md font-bold">OCT 2023</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Back Side / QR Preview */}
              <div className="w-full max-w-[340px] bg-white rounded-[24px] p-8 shadow-xl flex flex-col items-center gap-6 border border-outline-variant/10">
                <div className="w-48 h-48 bg-surface-container-low rounded-2xl p-4 flex items-center justify-center border-4 border-primary/5">
                  <img 
                    className="w-full h-full object-contain mix-blend-multiply opacity-90" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZT1epGURBNq0E3QCl2bmq_FQHkZq1NQoHxiRP5xqXT0r10WnVpMukkGTQrL4RGHMuj3Gt3Cd6T5p5itXk7JBRtwGesmZ7hjOXGdoCxXmBSksYm76t12wLLe_NphR0NjL0pm9L4Hh96H1pI9yDTW_GrOU60-7gYjKCwWLQfPeDOlUKxuAn3Y24FLvqucCclEh07tfQSSz3lgwvvVdm7TcNFDkoyZ-URxI-qzrbwFEGiv5XG6-tlc28YRUqHX1FCqo9hH0FU8Stdkg" 
                    alt="QR Code" 
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-body-md font-bold text-on-surface">Scan to earn stamps</p>
                  <p className="text-body-sm text-on-surface-variant">Present at register during checkout</p>
                </div>
              </div>

              <div className="flex gap-4 w-full">
                  <button className="flex-1 bg-white/50 backdrop-blur-sm text-on-surface-variant py-3.5 rounded-xl font-bold text-label-md flex items-center justify-center gap-2 hover:bg-white transition-all shadow-sm">
                  <Eye className="w-4 h-4" />
                  {t('Preview Device')}
                </button>
                <button className="flex-1 bg-white/50 backdrop-blur-sm text-on-surface-variant py-3.5 rounded-xl font-bold text-label-md flex items-center justify-center gap-2 hover:bg-white transition-all shadow-sm">
                  <Share2 className="w-4 h-4" />
                  SEND TEST
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
