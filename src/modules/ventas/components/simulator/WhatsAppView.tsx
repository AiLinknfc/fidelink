import { type FormEvent, type RefObject } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, ShieldCheck, Sparkles, CreditCard, Send } from 'lucide-react';
import type { Message } from '../../types';

interface WhatsAppViewProps {
  agentConfig: any;
  chatMessages: Message[];
  isAiTyping: boolean;
  inputValue: string;
  setInputValue: (val: string) => void;
  handleSendMessage: (e: FormEvent) => Promise<void>;
  triggerCheckoutFromChat: (prodId: string) => void;
  setMobileTab: (tab: 'ad' | 'landing' | 'whatsapp' | 'checkout' | 'delivery') => void;
  chatContainerRef: RefObject<HTMLDivElement | null>;
}

export default function WhatsAppView({
  agentConfig, chatMessages, isAiTyping, inputValue, setInputValue,
  handleSendMessage, triggerCheckoutFromChat, setMobileTab, chatContainerRef
}: WhatsAppViewProps) {
  return (
    <div className="flex flex-col h-full bg-slate-200 text-slate-800 relative">
      <div className="bg-white px-3 py-2.5 flex items-center gap-2 text-slate-900 shadow-md flex-shrink-0 border-b border-slate-200">
        <button onClick={() => setMobileTab('landing')} className="text-slate-600 hover:text-slate-900 mr-0.5 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full bg-indigo-600 hover:scale-105 transition-all text-white font-bold flex items-center justify-center text-xs border border-indigo-400 flex-shrink-0 relative">
          CO
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-slate-900 truncate">{agentConfig.merchantName}</h3>
          <span className="text-[9px] text-slate-500 font-semibold tracking-wide flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Asistente de IA Activo
          </span>
        </div>
        <div className="flex text-slate-400 gap-1.5 flex-shrink-0">
          <Phone className="w-3.5 h-3.5 hover:text-slate-700 cursor-pointer" />
          <Video className="w-3.5 h-3.5 hover:text-slate-700 cursor-pointer" />
          <MoreVertical className="w-3.5 h-3.5 hover:text-slate-700" />
        </div>
      </div>

      <div ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col bg-[url('https://i.pinimg.com/originals/97/e0/47/97e047f547c61bf6fa4de370efba07cc.png')] bg-repeat bg-center">
        <div className="mx-auto my-1 px-2.5 py-1 bg-white/70 backdrop-blur-xs text-[9px] font-bold text-slate-500 rounded-md font-sans shadow-xs flex items-center gap-1 border border-slate-100">
          <ShieldCheck className="w-3 h-3 text-indigo-600" /> Las conversaciones se procesan con IA de Meta
        </div>

        {chatMessages.map((msg) => {
          const isSme = msg.sender === 'assistant';
          return (
            <div key={msg.id} className="space-y-1">
              <div className={`flex flex-col max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-xs leading-relaxed font-sans ${
                isSme ? 'bg-white text-slate-900 self-start rounded-tl-none' : 'bg-[#DCF8C6] text-slate-900 self-end rounded-tr-none'
              }`}>
                <div>{msg.text}</div>
                <span className="text-[8px] text-slate-400 text-right font-sans block mt-1">{msg.timestamp}</span>
              </div>

              {isSme && msg.isPaymentLink && (
                <div className="self-start w-full max-w-[85%] p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-md space-y-3 font-sans">
                  <div className="flex items-center gap-1.5 text-indigo-700">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Orden de Pago Generada</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-950">{msg.paymentProductName}</div>
                    <div className="text-xs font-mono font-bold text-indigo-650 mt-0.5">${msg.paymentAmount} COP</div>
                  </div>
                  <button onClick={() => triggerCheckoutFromChat(msg.paymentUrl || "prod-colombia-pack")}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold font-sans tracking-wide transition-all cursor-pointer">
                    <CreditCard className="w-3.5 h-3.5" /> Proceder al Pago Seguro
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {isAiTyping && (
          <div className="bg-white rounded-2xl px-3.5 py-2.5 text-xs shadow-xs self-start rounded-tl-none flex items-center gap-1 border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-2.5 bg-slate-100 border-t border-slate-200 flex items-center gap-2 flex-shrink-0">
        <input type="text" placeholder="Escribe tu pregunta sobre el caf&eacute;..." value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 px-3 py-2 bg-white rounded-full text-xs border border-slate-200 focus:outline-none text-slate-800 placeholder:text-slate-400" />
        <button type="submit" className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all cursor-pointer">
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
