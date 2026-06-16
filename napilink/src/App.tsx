import React, { useState, useEffect } from "react";
import {
  Wallet,
  Key,
  Coins,
  Shield,
  Clock,
  Sparkles,
  Camera,
  Star,
  Plus,
  Building,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock3,
  HelpCircle,
  FileText,
  Bookmark,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Info,
  Utensils,
  Flame,
  Coffee,
  Award
} from "lucide-react";
import { ApplicationState, Business, Employee, Tip, ScannedReceiptData } from "./types";
import WalletWidget from "./components/WalletWidget";

// Helper function to render business logos professionally with standard icons instead of raw emojis
function renderBusinessLogo(logo: string) {
  const clean = logo ? logo.trim() : "";
  if (clean === "🥞" || clean === "utensils") {
    return <Utensils className="h-5 w-5 text-amber-600" />;
  }
  if (clean === "✨" || clean === "sparkles") {
    return <Sparkles className="h-5 w-5 text-amber-600" />;
  }
  if (clean === "🥩" || clean === "flame") {
    return <Flame className="h-5 w-5 text-amber-600" />;
  }
  if (clean === "☕" || clean === "coffee") {
    return <Coffee className="h-5 w-5 text-amber-600" />;
  }
  return <Award className="h-5 w-5 text-amber-600" />;
}

export default function App() {
  const [state, setState] = useState<ApplicationState | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "wallet" | "puntos" | "businesses" | "history">("dashboard");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorInput, setErrorInput] = useState<string | null>(null);

  // Estados para creación rápida de Propina
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [customTipAmount, setCustomTipAmount] = useState<string>("");
  const [holdHours, setHoldHours] = useState<number>(2); // Default 2 horas de retractación para seguridad
  const [tipSource, setTipSource] = useState<"wallet" | "points">("wallet");
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  // Controladores de Registro
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [newBizName, setNewBizName] = useState("");
  const [newBizCategory, setNewBizCategory] = useState("Restaurante");
  const [newBizAddress, setNewBizAddress] = useState("");
  const [newBizLogo, setNewBizLogo] = useState("utensils");

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("Mesero");
  const [newEmpBizId, setNewEmpBizId] = useState("");
  const [newEmpBio, setNewEmpBio] = useState("");
  const [newEmpAlias, setNewEmpAlias] = useState("");

  // Escáner OCR de Recibos
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedReceiptData | null>(null);
  const [customReceiptText, setCustomReceiptText] = useState<string>("");
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Notificaciones para el usuario (pago con confirmación / retractado)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  // Inicializar estado cargando de la API
  const refreshState = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/state");
      if (!res.ok) throw new Error("Fallo al conectar con el servidor.");
      const data = await res.json();
      setState(data);
      
      // Auto-seleccionar primer empleado para formulario rápido si no hay selección
      if (data.employees && data.employees.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(data.employees[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setErrorInput("No se pudo cargar la información del servidor local.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  // Mostrar notificación efímera
  const showNotification = (message: string, type: "success" | "info" | "warning" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Función para enviar propina
  const handleSendTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      showNotification("Por favor selecciona un colaborador.", "warning");
      return;
    }
    const amt = parseFloat(customTipAmount);
    if (isNaN(amt) || amt <= 0) {
      showNotification("Por favor ingresa un monto de propina válido.", "warning");
      return;
    }

    try {
      const response = await fetch("/api/tips/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          amountCOP: amt,
          source: tipSource,
          rating,
          review,
          holdHours
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Fallo al enviar propina");
      }

      await refreshState();
      setCustomTipAmount("");
      setReview("");
      setScannedData(null); // Limpiar datos de escáner tras aplicar
      showNotification(`Propina de ${formatCOP(amt)} enviada a la cola segura. Ventana de retractación: ${holdHours}h.`);
    } catch (err: any) {
      showNotification(err.message, "warning");
    }
  };

  // Retractar/Reclamar propina
  const handleRetractTip = async (tipId: string) => {
    if (!confirm("¿Está seguro de que desea retractarse de esta propina? El dinero se devolverá inmediatamente a su billetera.")) return;
    try {
      const response = await fetch("/api/tips/retract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await refreshState();
      showNotification("Propina cancelada con éxito. Fondos devueltos.", "info");
    } catch (err: any) {
      showNotification(err.message, "warning");
    }
  };

  // Confirmar propina antes de tiempo de hold
  const handleConfirmTipEarly = async (tipId: string) => {
    try {
      const response = await fetch("/api/tips/confirm-early", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await refreshState();
      showNotification("Propina confirmada y liberada exitosamente al trabajador.", "success");
    } catch (err: any) {
      showNotification(err.message, "warning");
    }
  };

  // Recarga directa de billetera
  const handleTopup = async (amount: number, alias: string) => {
    try {
      const response = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCOP: amount, paymentAlias: alias })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await refreshState();
      showNotification(`Recarga de ${formatCOP(amount)} procesada exitosamente con tu firma Bre-B.`);
    } catch (err: any) {
      showNotification(err.message, "warning");
    }
  };

  // Actualizar billetera
  const handleUpdateWallet = async (updated: any) => {
    try {
      const response = await fetch("/api/wallet/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (!response.ok) throw new Error("Error actualizando la billetera");
      await refreshState();
    } catch (err: any) {
      showNotification(err.message, "warning");
    }
  };

  // Actualizar Puntos Colombia
  const handleUpdatePuntos = async (updated: any) => {
    try {
      const response = await fetch("/api/puntos/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (!response.ok) throw new Error("Error actualizando Puntos Colombia");
      await refreshState();
      showNotification(updated.linked ? "Puntos Colombia vinculados con la pasarela." : "Puntos Colombia desvinculados.");
    } catch (err: any) {
      showNotification(err.message, "warning");
    }
  };

  // Registrar Negocio
  const handleAddBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;

    try {
      const response = await fetch("/api/businesses/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBizName,
          category: newBizCategory,
          address: newBizAddress,
          logo: newBizLogo
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await refreshState();
      setNewBizName("");
      setNewBizAddress("");
      setShowAddBusiness(false);
      showNotification(`Establecimiento ${result.business.name} registrado con éxito.`);
    } catch (err: any) {
      showNotification(err.message, "warning");
    }
  };

  // Registrar Colaborador
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpBizId) {
      showNotification("Especifica nombre y establecimiento comercial.", "warning");
      return;
    }

    try {
      const response = await fetch("/api/employees/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newEmpName,
          role: newEmpRole,
          businessId: newEmpBizId,
          bio: newEmpBio,
          aliasKey: newEmpAlias || undefined
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      await refreshState();
      setNewEmpName("");
      setNewEmpBio("");
      setNewEmpAlias("");
      setShowAddEmployee(false);
      showNotification(`Colaborador ${result.employee.name} registrado con alias ${result.employee.aliasKey}.`);
    } catch (err: any) {
      showNotification(err.message, "warning");
    }
  };

  // Simulación inteligente / Carga real de recibos para OCR por IA
  const handleScanPredefinedReceipt = async (recipeName: string) => {
    setScanning(true);
    setScannedData(null);
    setShowScannerModal(true);

    let baseText = "Consumo Alimentos Crepes & Waffles Bogotá Usaquén\nTotal a Pagar COP: 64,500";
    if (recipeName === "andres") {
      baseText = "Andrés Carne de Res Chía de la Montaña\nConsumo Mesa: 125,000\nServicio opcional: 20,000\nTotal Factura COP: 145,000";
    } else if (recipeName === "salberto") {
      baseText = "Taza de Origen Café San Alberto\nTotal COP: 25,000";
    }

    try {
      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // Dummy image pixel
          sampleText: baseText
        })
      });

      const resText = await response.json();
      if (!response.ok) throw new Error(resText.error);

      setScannedData(resText.extractedData);
      setCustomTipAmount(resText.extractedData.suggestedTips["10"].toString());
      
      // Auto-seleccionar empleado de ese negocio si existe matches
      if (state) {
        const matchingBiz = state.businesses.find(b => 
          b.name.toLowerCase().includes(resText.extractedData.businessName.toLowerCase().split(" ")[0])
        );
        if (matchingBiz) {
          const emp = state.employees.find(e => e.businessId === matchingBiz.id);
          if (emp) setSelectedEmployeeId(emp.id);
        }
      }

      showNotification(`Recibo escaneado: ${resText.extractedData.businessName} - Valor Total: ${formatCOP(resText.extractedData.totalAmount)}`);
    } catch (err: any) {
      showNotification("Error procesando recibo: " + err.message, "warning");
    } finally {
      setScanning(false);
    }
  };

  // Escaneo libre manual pegando texto o cargando
  const handleManualScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReceiptText.trim()) return;

    setScanning(true);
    try {
      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
          sampleText: customReceiptText
        })
      });

      const resText = await response.json();
      if (!response.ok) throw new Error(resText.error);

      setScannedData(resText.extractedData);
      setCustomTipAmount(resText.extractedData.suggestedTips["10"].toString());
      setShowScannerModal(false);
      showNotification("Recibo analizado. Sugerencias aplicadas al formulario principal.");
    } catch (err: any) {
      showNotification(err.message, "warning");
    } finally {
      setScanning(false);
    }
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Filtrar colaboradores por texto de búsqueda
  const filteredEmployees = state
    ? state.employees.filter(
        (e) =>
          e.name.toLowerCase().includes(searchText.toLowerCase()) ||
          e.role.toLowerCase().includes(searchText.toLowerCase()) ||
          (state.businesses.find((b) => b.id === e.businessId)?.name || "").toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  const totalLockedTips = state
    ? state.tips
        .filter((t) => t.status === "pending")
        .reduce((sum, current) => sum + current.amountCOP, 0)
    : 0;

  if (loading && !state) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800 text-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-700 font-display">Iniciando pasarela de transacciones de propina...</p>
        <p className="text-xs text-slate-400 mt-2">Cargando base de datos segura y llaves criptográficas Bre-B</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans overflow-hidden" id="main-frame">
      
      {/* SIDEBAR NAVIGATION - High Density Theme */}
      <aside className="w-64 bg-white flex flex-col border-r border-slate-200 shrink-0 text-slate-800 select-none">
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-[#f8f80b] rounded-lg flex items-center justify-center font-bold text-slate-950 shadow-sm">
              <Key className="h-4 w-4 text-slate-950 font-black" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight block">Napilink</span>
              <span className="text-[9px] text-amber-600 font-mono tracking-widest block uppercase">Fintech de Propinas</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition text-left ${
                activeTab === "dashboard" ? "bg-amber-100 text-slate-950 font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <TrendingUp className="h-4 w-4 text-amber-500" /> Panel de Control
            </button>
            <button
              onClick={() => setActiveTab("wallet")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition text-left ${
                activeTab === "wallet" ? "bg-amber-100 text-slate-950 font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Wallet className="h-4 w-4 text-amber-500" /> Billetera Digital & Bre-B
            </button>
            <button
              onClick={() => setActiveTab("puntos")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition text-left ${
                activeTab === "puntos" ? "bg-amber-100 text-slate-950 font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Coins className="h-4 w-4 text-amber-500" /> Puntos Colombia
            </button>
            <button
              onClick={() => setActiveTab("businesses")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition text-left ${
                activeTab === "businesses" ? "bg-amber-100 text-slate-950 font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Building className="h-4 w-4 text-amber-500" /> Gestión de Comercios
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition text-left ${
                activeTab === "history" ? "bg-amber-100 text-slate-950 font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Clock3 className="h-4 w-4 text-amber-500" /> Historial de Pagos
            </button>
          </nav>

          <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-2">
            <span className="font-bold text-slate-700 block uppercase tracking-widest text-[9px]">Seguridad Cripto</span>
            <p className="text-[10px] leading-relaxed">Cada transacción es firmada con una llave asimétrica exclusiva Bre-B en nuestro nodo local.</p>
            <div className="flex items-center gap-1.5 text-amber-600 text-[10px] font-mono">
              <Shield className="h-3.5 w-3.5" /> Clave RSA-4096 Activa
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-150 mt-auto bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
              U
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-slate-800 block truncate">Adiestrador Demo</span>
              <span className="text-[10px] text-slate-400 block">ailink.nfc@gmail.com</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-bold text-slate-800 uppercase tracking-wide font-display">
              {activeTab === "dashboard" && "Panel de Control"}
              {activeTab === "wallet" && "Mi Billetera & Llaves de Pago"}
              {activeTab === "puntos" && "Canje de Puntos Aliados"}
              {activeTab === "businesses" && "Establecimientos y Colaboradores"}
              {activeTab === "history" && "Historial de Propinas Procesadas"}
            </h1>
            <span className="bg-yellow-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
              <Shield className="h-3 w-3" /> Conexión Segura Encriptada
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Saldo Disponible</div>
              <div className="text-sm font-extrabold text-slate-800">{state ? formatCOP(state.userWallet.balanceCOP) : "$0"}</div>
            </div>
            {state?.puntosColombia.linked && (
              <div className="text-right">
                <div className="text-[9px] text-pink-500 uppercase font-bold tracking-widest">Puntos Colombia</div>
                <div className="text-sm font-extrabold text-slate-800">{state.puntosColombia.balance.toLocaleString()} pts</div>
              </div>
            )}
            <button 
              onClick={refreshState}
              className="p-1 text-slate-400 hover:text-slate-600 transition" 
              title="Sincronizar base de datos"
            >
              🔄
            </button>
          </div>
        </header>

        {/* NOTIFICACIÓN EFÍMERA */}
        {notification && (
          <div className="bg-white border-l-4 border-yellow-400 text-slate-800 p-3 px-6 text-xs flex items-center justify-between shadow-xl absolute top-18 right-6 z-50 rounded-r-xl max-w-sm animate-fade-in border border-slate-200 shadow-yellow-400/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></div>
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-slate-800 ml-4 font-bold">✕</button>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL SCROLLABLE */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
          
          {/* VISTAS DETALLADAS DEPENDIENDO DEL TIPO TAB */}

          {/* VISTA 1: DASHBOARD (HIGH DENSITY GRID) */}
          {activeTab === "dashboard" && state && (
            <div className="p-6 grid grid-cols-12 gap-6 items-start">
              
              {/* COLUMNA 1: ESCANEAR RECIBO & CREADOR DE PROPINA RÁPIDA (4/12 width) */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                
                {/* WIDGET ESCANEAR RECIBO */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-xs tracking-wider text-slate-500 uppercase">Escanear Recibo / POS</h2>
                    <span className="text-[9px] bg-yellow-100 text-amber-800 p-0.5 px-2 rounded-full uppercase font-bold">Auto-OCR IA</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Toma una foto de la factura para extraer el valor total y calcular automáticamente la propina recomendada de manera justa.
                  </p>

                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center mb-2.5 text-slate-400">
                      <Camera className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 block">Escanear Código o Factura</span>
                    
                    {/* Demo interactiva con un click */}
                    <div className="mt-3 w-full space-y-1.5">
                      <p className="text-[10px] text-slate-400">Simula escaneo rápido de restaurantes registrados:</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleScanPredefinedReceipt("crepes")}
                          className="bg-white border border-slate-200 text-[10px] py-1 px-1 rounded-md hover:border-yellow-400 transition text-slate-600 truncate font-semibold"
                        >
                          Crepes Usaquén
                        </button>
                        <button
                          type="button"
                          onClick={() => handleScanPredefinedReceipt("andres")}
                          className="bg-white border border-slate-200 text-[10px] py-1 px-1 rounded-md hover:border-yellow-400 transition text-slate-600 truncate font-semibold"
                        >
                          Andrés Chía
                        </button>
                        <button
                          type="button"
                          onClick={() => handleScanPredefinedReceipt("salberto")}
                          className="bg-white border border-slate-200 text-[10px] py-1 px-1 rounded-md hover:border-yellow-400 transition text-slate-600 truncate font-semibold"
                        >
                          Café San Alberto
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCustomReceiptText("");
                        setShowScannerModal(true);
                      }}
                      className="mt-3.5 text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-yellow-400/10 px-3 py-1.5 rounded-lg w-full"
                    >
                      Copiar ticket manualmente...
                    </button>
                  </div>

                  {scannedData && (
                    <div className="mt-4 p-3.5 bg-yellow-50/70 border border-yellow-200 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-yellow-200">
                        <span className="font-bold text-slate-800">{scannedData.businessName}</span>
                        <button onClick={() => setScannedData(null)} className="text-slate-400 hover:text-red-500">✕</button>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Valor Cuenta:</span>
                        <span className="font-bold text-slate-800">{formatCOP(scannedData.totalAmount)}</span>
                      </div>
                      <div className="pt-1.5 border-t border-yellow-200 space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold block">Sugerencias de Propinas Auto-calculadas:</span>
                        <div className="grid grid-cols-3 gap-1 grid-flow-row">
                          <button
                            onClick={() => setCustomTipAmount(scannedData.suggestedTips["8"].toString())}
                            className="bg-white hover:bg-yellow-400 hover:text-slate-900 p-1 text-center rounded border border-slate-200 text-[10px] font-bold text-slate-700"
                          >
                            <div>8%</div>
                            <div className="font-mono">{formatCOP(scannedData.suggestedTips["8"])}</div>
                          </button>
                          <button
                            onClick={() => setCustomTipAmount(scannedData.suggestedTips["10"].toString())}
                            className="bg-white hover:bg-yellow-400 hover:text-slate-900 p-1 text-center rounded border border-slate-200 text-[10px] font-bold text-slate-700"
                          >
                            <div>10% (Es)</div>
                            <div className="font-mono">{formatCOP(scannedData.suggestedTips["10"])}</div>
                          </button>
                          <button
                            onClick={() => setCustomTipAmount(scannedData.suggestedTips["15"].toString())}
                            className="bg-white hover:bg-yellow-400 hover:text-slate-900 p-1 text-center rounded border border-slate-200 text-[10px] font-bold text-slate-700"
                          >
                            <div>15% (Ext)</div>
                            <div className="font-mono">{formatCOP(scannedData.suggestedTips["15"])}</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* FORMULARIO DE ENVÍO DE PROPINA */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <h2 className="font-bold text-xs tracking-wider text-slate-500 uppercase mb-3.5">Asignación Rápida de Propina</h2>
                  <form onSubmit={handleSendTip} className="space-y-4">
                    
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Buscar y Seleccionar Trabajador</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Filtra por nombre o comercio..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-yellow-400 mb-2"
                        />
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      </div>

                      <select
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-yellow-400"
                        required
                      >
                        {filteredEmployees.map((e) => {
                          const biz = state.businesses.find((b) => b.id === e.businessId);
                          return (
                            <option key={e.id} value={e.id}>
                              {e.name} ({e.role}) • {biz ? biz.name : "Establecimiento"}
                            </option>
                          );
                        })}
                        {filteredEmployees.length === 0 && (
                          <option value="">No hay coincidencias en el personal...</option>
                        )}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Monto de Propinas (COP)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            placeholder="Monto"
                            value={customTipAmount}
                            onChange={(e) => setCustomTipAmount(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-yellow-400 font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Medio de Pago</label>
                        <select
                          value={tipSource}
                          onChange={(e) => setTipSource(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-yellow-400 font-semibold"
                        >
                          <option value="wallet">Billetera Bre-B</option>
                          {state.puntosColombia.linked && <option value="points">Puntos Colombia</option>}
                        </select>
                      </div>
                    </div>

                    {/* NUEVO FEATURE: Períodos programados para retracto (Solución de presión social) */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" /> Confirmación en Espera 
                        </label>
                        <span className="text-[10px] text-amber-600 font-bold">Evita Presión Social</span>
                      </div>
                      <select
                        value={holdHours}
                        onChange={(e) => setHoldHours(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-yellow-400"
                      >
                        <option value={2}>Cola de Retención: 2 Horas (Mediana)</option>
                        <option value={6}>Cola de Retención: 6 Horas</option>
                        <option value={12}>Cola de Retención: 12 Horas</option>
                        <option value={24}>Cola de Retención: 24 Horas (Máxima seguridad)</option>
                        <option value={0}>Instantáneo Sin Retractarse (No Recomendado)</option>
                      </select>
                      <p className="text-[10px] text-slate-400 leading-tight mt-1.5">
                        El dinero quedará custodiado en escrow temporal. Podrás reclamarlo en la pestaña de espera si no te satisfizo la post-atención de manera justa.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Calificar Servicio</label>
                        <div className="flex items-center gap-1.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              type="button"
                              key={s}
                              onClick={() => setRating(s)}
                              className="focus:outline-none hover:scale-110 transition"
                            >
                              <Star className={`h-4.5 w-4.5 ${rating >= s ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="text-right text-[10px] text-slate-500 flex flex-col justify-center">
                        <span>PAGO ENCRIPTADO CON</span>
                        <span className="font-mono text-slate-600 font-semibold">{state.userWallet.publicKey.slice(0, 16)}...</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Escribe tu feedback de motivación o crítica</label>
                      <textarea
                        rows={2}
                        placeholder="Mensaje de apoyo para el colaborador..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-yellow-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 justify-center hover:bg-slate-800 active:bg-slate-950 font-bold text-xs py-2.5 rounded-xl transition text-white flex items-center gap-2 shadow-sm"
                    >
                      <Shield className="h-4 w-4 text-yellow-400" /> Firmar & Enviar Propina Programada
                    </button>
                  </form>
                </div>
              </div>

              {/* COLUMNA 2: PROPINAS EN ESPERA Y RETRACTO (5/12 width) */}
              <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                
                {/* WIDGET PROPINAS EN ESPERA */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></span>
                      <h2 className="font-bold text-slate-800 text-sm font-display uppercase tracking-wide">
                        Propinas en Espera (Garantía)
                      </h2>
                    </div>
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Retracto Activo
                    </span>
                  </div>

                  <div className="flex-1 p-5 flex flex-col">
                    <p className="text-xs text-slate-500 leading-normal mb-4">
                      ¿Has sentido la presión social de dar propina ante el mesero? Las siguientes transacciones están retenidas en nuestra pasarela local de forma encriptada. Tienes control de retractarte o validar el monto final hasta que expire el plazo.
                    </p>

                    {state.tips.filter((t) => t.status === "pending").length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-100 rounded-2xl bg-slate-50/40">
                        <Clock className="h-10 w-10 text-slate-300 mb-2.5" />
                        <span className="text-xs font-bold text-slate-600 block">No tienes propinas retenidas</span>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">
                          Todas las transacciones anteriores han expirado positivamente y el personal ha recibido su dinero de forma automatizada.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {state.tips
                          .filter((t) => t.status === "pending")
                          .map((tip) => {
                            const createdAtTime = new Date(tip.createdAt).toLocaleTimeString();
                            const unlockAtTime = new Date(tip.unlockAt).toLocaleTimeString();
                            
                            return (
                              <div
                                key={tip.id}
                                className="p-4 border border-slate-200 rounded-xl relative overflow-hidden bg-white hover:shadow-sm transition"
                              >
                                <div className="absolute top-0 right-0 h-1 bg-amber-400 w-2/3" />
                                
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="text-xs font-extrabold text-slate-800 tracking-tight">{tip.businessName}</div>
                                    <div className="text-[11px] text-slate-500">Colaborador: {tip.employeeName}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs font-bold font-mono text-slate-900">{formatCOP(tip.amountCOP)}</div>
                                    <span className="px-1.5 py-0.5 bg-pink-500/10 text-pink-500 text-[9px] font-bold rounded uppercase block font-mono mt-1">
                                      {tip.source === "points" ? `${tip.pointsUsed} pts` : "Caja Virtual"}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-[10px] text-slate-400 flex justify-between items-center bg-slate-50 px-2 py-1 rounded-md mb-3 font-mono">
                                  <span>Hora Envío: {createdAtTime}</span>
                                  <span className="text-amber-600 font-bold">Desbloquea: {unlockAtTime}</span>
                                </div>

                                {tip.review && (
                                  <p className="text-[10px] italic text-slate-500 bg-slate-50/50 p-2 rounded border border-slate-100 mb-3">
                                    &ldquo;{tip.review}&rdquo;
                                  </p>
                                )}

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleConfirmTipEarly(tip.id)}
                                    className="flex-1 bg-slate-900 text-white text-[10px] font-semibold py-1.5 rounded-lg hover:bg-slate-800 transition"
                                  >
                                    Confirmar Ahora
                                  </button>
                                  <button
                                    onClick={() => handleRetractTip(tip.id)}
                                    className="flex-1 bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold py-1.5 rounded-lg hover:bg-red-100 transition"
                                  >
                                    Retractarse (Anular)
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-slate-100/80 bg-yellow-400/5 p-3 rounded-xl border border-yellow-250/20 text-[10px] text-slate-500 flex items-start gap-2">
                      <Shield className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700 block">¿Por qué usar retractación?</span>
                        Facilita un desahogo psicológico al dar propina. Si sientes desdén después o cambias de opinión, anula tu transacción. Tu privacidad y tus fondos quedan resguardados.
                      </div>
                    </div>
                  </div>
                </div>

                {/* VINCULACIÓN DE PLATAFORMAS EN DASHBOARD */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <h2 className="font-bold text-xs tracking-wider text-slate-500 uppercase mb-3.5">Plataformas Asociadas</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold font-display">
                          PC
                        </div>
                        <div>
                          <div className="text-xs font-bold text-blue-900">Puntos Colombia Sincronizados</div>
                          <p className="text-[10px] text-blue-700 leading-tight">Usa tus puntos acumulados de Éxito, Carulla u otros comercios.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("puntos")}
                        className="text-[10px] font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-2.5 py-1.5 rounded-lg transition"
                      >
                        Gestionar
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-yellow-50/80 border border-yellow-250/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#f8f80b] border border-yellow-300 rounded-lg flex items-center justify-center text-slate-950 text-xs font-extrabold">
                          B-B
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">Llaves Bre-B Interbancarias</div>
                          <p className="text-[10px] text-slate-600 leading-tight">Procesamiento inmediato utilizando tu banco favorito y tus alias autorizados.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("wallet")}
                        className="text-[10px] font-bold bg-yellow-400 hover:bg-yellow-500 text-slate-950 px-2.5 py-1.5 rounded-lg transition font-bold"
                      >
                        Ver Llaves
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA 3: METRICAS E IMPACTO MENSUAL Y TRABAJADORES (3/12 width) */}
              <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                
                {/* IMPACTO DEL MES (DISEÑO DEL CONTROLADOR) */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <h2 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-3.5">Impacto en Propinas</h2>
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-2xl font-black font-mono tracking-tight text-white">
                      {formatCOP(
                        state.tips
                          .filter((t) => t.status === "confirmed")
                          .reduce((sum, current) => sum + current.amountCOP, 0)
                      )}
                    </span>
                    <span className="text-[10px] text-yellow-400 bg-yellow-400/10 p-0.5 px-2 rounded-full font-bold">
                      Mes en Curso
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">En Espera Temporal (Escrow):</span>
                      <span className="font-bold text-amber-400 font-mono">{formatCOP(totalLockedTips)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-yellow-400 h-full rounded-full" style={{ width: "65%" }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">Calificación Clientes:</span>
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-500" /> 4.90 Promedio
                      </span>
                    </div>
                  </div>
                </div>

                {/* PERSONAL TOP TRABAJADORES REGISTRADOS */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">Servicio Destacado</h2>
                    <span className="text-[9px] font-bold text-amber-600 uppercase">Personal Activo</span>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {state.employees.map((emp) => {
                      const biz = state.businesses.find((b) => b.id === emp.businessId);
                      return (
                        <div key={emp.id} className="flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                          <img
                            src={emp.photo}
                            alt={emp.name}
                            className="w-10 h-10 object-cover rounded-full border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-800 block truncate">{emp.name}</span>
                            <span className="text-[10px] text-slate-500 block truncate">{emp.role} • {biz ? biz.name : "Comercio"}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-[10px] text-slate-600 font-bold">{emp.rating}</span>
                              <span className="text-[9px] text-slate-400">({emp.ratingsCount} votos)</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedEmployeeId(emp.id);
                              setActiveTab("dashboard");
                              const targetForm = document.getElementById("main-frame");
                              if (targetForm) {
                                targetForm.scrollIntoView({ behavior: "smooth" });
                              }
                            }}
                            className="text-[10px] font-semibold text-amber-700 bg-yellow-50 hover:bg-yellow-105 hover:text-amber-800 p-1 px-2.5 rounded-lg transition"
                          >
                            Dar...
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedEmployeeId(state.employees[0]?.id || "");
                        setActiveTab("businesses");
                      }}
                      className="flex-1 py-1.5 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Personal y Comercios
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* VISTA 2: BILLETERA DIGITAL (WIDGET COMPLETO) */}
          {activeTab === "wallet" && state && (
            <div className="p-6 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-base font-bold text-slate-800 mb-2 font-display">Administrar tu Billa Digital Encriptada</h2>
                <p className="text-xs text-slate-500 max-w-2xl mb-6">
                  Registra llaves del estándar financiero Bre-B bajo encriptación SHA-256 para recargar tu monedero instantáneamente de cualquier entidad bancaria de Colombia sin intermediarios tediosos.
                </p>

                <WalletWidget
                  wallet={state.userWallet}
                  puntosCol={state.puntosColombia}
                  onRefresh={refreshState}
                  onUpdateWallet={handleUpdateWallet}
                  onUpdatePuntos={handleUpdatePuntos}
                  onTopUp={handleTopup}
                />
              </div>

              {/* SIMULADOR DE COBRO POS BAJO ESTÁNDAR BRE-B */}
              <div className="bg-white text-slate-800 rounded-3xl p-6 border border-slate-200 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />
                <h3 className="text-sm font-bold font-display uppercase tracking-wider mb-2 text-amber-600">Simulación del Ecosistema de Pago Bre-B</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-3xl mb-4 font-medium">
                  El protocolo Bre-B unifica cuentas bancarias en Colombia a partir de llaves lógicas de acceso rápido (celulares, identificaciones, e-mails). Al vincular una llave e integrarte a Napilink, la plataforma puede enrutar tus premios de propina a colaboradores con su respectiva clave de firma privada simulada (Firma de Llave Pública: <span className="font-mono text-slate-700 text-[11.5px] font-bold bg-slate-100 px-1.5 py-0.5 rounded">{state.userWallet.publicKey}</span>).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-sm">
                    <Building className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                    <span className="text-xs font-bold block text-slate-700">1. Registra tu Alias</span>
                    <p className="text-[10px] text-slate-400 mt-1">Crea tu identificador rápida en segundos.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-sm">
                    <Key className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                    <span className="text-xs font-bold block text-slate-700">2. Generación RSA</span>
                    <p className="text-[10px] text-slate-400 mt-1">Se encripta tu conexión interbancaria.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-sm">
                    <Coins className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                    <span className="text-xs font-bold block text-slate-700">3. Carga Fondos</span>
                    <p className="text-[10px] text-slate-400 mt-1">Debita de tu banco tradicional de forma veloz.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-sm">
                    <Clock className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                    <span className="text-xs font-bold block text-slate-700">4. Custodia Hold</span>
                    <p className="text-[10px] text-slate-400 mt-1">Retienes el desembolso por la ventana elegida.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VITA 3: PUNTOS ALIANZAS */}
          {activeTab === "puntos" && state && (
            <div className="p-6 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-pink-50 text-pink-500 rounded-2xl">
                    <Coins className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800 font-display">Programa de Lealtad Integrado (Puntos Colombia)</h2>
                    <p className="text-xs text-slate-500">¿Tienes puntos acumulados en Éxito, Carulla, Surtimax o Bancolombia? ¡Conviértelos en propinas directas!</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div className="md:col-span-1 bg-pink-50 border border-pink-100 text-pink-950 rounded-2xl p-5 text-center flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-pink-700 block mb-1 font-semibold uppercase tracking-wider">Mi Cuenta Puntos Colombia</span>
                      {state.puntosColombia.linked ? (
                        <div className="space-y-3 py-4">
                          <span className="text-3.5xl font-extrabold font-display text-pink-600 block">{state.puntosColombia.balance.toLocaleString()}</span>
                          <span className="text-xs text-pink-800 block font-medium">puntos disponibles para canjear</span>
                          <div className="bg-white font-mono text-[11px] p-2 rounded-xl text-pink-600 border border-pink-200">
                            ID: {state.puntosColombia.accountNumber}
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 italic text-slate-400 text-xs text-center border border-dashed border-slate-200 rounded-xl bg-white p-4">
                          Sincroniza tus puntos en la pestaña inicial o mediante el botón de enlace.
                        </div>
                      )}
                    </div>

                    <div className="border-t border-pink-100 pt-3 mt-4 flex items-center justify-between text-[11px] text-pink-700">
                      <span>Conversión:</span>
                      <span className="font-bold text-pink-600">1 punto = $7 Pesos COP</span>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">¿Cómo funciona el canje para propinas de establecimientos?</h3>
                    <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                      <p>
                        <strong>1. Alianza Nacional Autorizada:</strong> Napilink se asocia nativamente con las APIs del sistema multibanco del país. Tus puntos se debitan al instante en que se vence el tiempo de confirmación de tu propina.
                      </p>
                      <p>
                        <strong>2. Transparente para el Empleado:</strong> Tu mesero o cocinero favorito siempre recibirá el dinero neto en Pesos Colombianos directos a su alias encriptado de Bre-B. La conversión es financiada por nuestra pasarela de liquidación.
                      </p>
                      <p>
                        <strong>3. Ventaja de Devolución Fina:</strong> Si aplicas el retracto a una propina enviada utilizando Puntos Colombia, los puntos son readicionados automáticamente de regreso a tu monedero de lealtad sin cobros ni penalizaciones.
                      </p>
                    </div>

                    <div className="pt-4 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce"></span>
                      <span className="text-xs font-bold text-slate-800">¡Muy pronto habilitaremos LifeMiles, RappiCréditos y Puntos Tu360!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VISTA 4: BUSINESSES & EMPLOYEES */}
          {activeTab === "businesses" && state && (
            <div className="p-6 space-y-6">
              
              {/* BOTONES ACCION DE REGISTRO */}
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Administración de Nóminas, Comercios y Colaboradores</h3>
                  <p className="text-xs text-slate-500">Registra empresas asociadas para gestionar de forma transparente e independiente las propinas colectadas e incentivos directos.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddBusiness(true)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Registrar Comercio
                  </button>
                  <button
                    onClick={() => {
                      if (state.businesses.length === 0) {
                        showNotification("Primero registra un comercio.", "warning");
                        return;
                      }
                      setNewEmpBizId(state.businesses[0].id);
                      setShowAddEmployee(true);
                    }}
                    className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 font-bold"
                  >
                    <Plus className="h-4 w-4" /> Registrar Colaborador
                  </button>
                </div>
              </div>

              {/* LISTA DE COMERCIOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.businesses.map((biz) => {
                  const bizEmployees = state.employees.filter((emp) => emp.businessId === biz.id);
                  
                  return (
                    <div key={biz.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-xl flex items-center justify-center">
                            {renderBusinessLogo(biz.logo)}
                          </div>
                          <div>
                            <span className="text-sm font-black text-slate-800 block truncate">{biz.name}</span>
                            <span className="text-[10.5px] text-slate-500 block truncate">{biz.category}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-bold uppercase rounded px-2 py-0.5">
                          ID: {biz.id}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500">
                        <div className="flex justify-between">
                          <span>Ubicación:</span>
                          <span className="font-semibold text-slate-700 text-right max-w-[150px] truncate">{biz.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trabajadores Registrados:</span>
                          <span className="font-bold text-slate-800">{bizEmployees.length} activos</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Plantilla de Personal:</span>
                        {bizEmployees.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">No hay trabajadores en nómina. ¡Presiona 'Registrar Colaborador' arriba!</p>
                        ) : (
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {bizEmployees.map((emp) => (
                              <div key={emp.id} className="flex justify-between items-center bg-slate-50 border border-slate-150 p-2 rounded-xl text-xs">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={emp.photo}
                                    alt={emp.name}
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                  <div>
                                    <span className="font-bold text-slate-800 block">{emp.name}</span>
                                    <span className="text-[9px] text-slate-500 block">{emp.role}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-amber-500 font-bold block">★ {emp.rating}</span>
                                  <button
                                    onClick={() => {
                                      setSelectedEmployeeId(emp.id);
                                      setHoldHours(2);
                                      setActiveTab("dashboard");
                                    }}
                                    className="text-[9px] font-bold text-amber-600 hover:underline"
                                  >
                                    Dar Propina
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISTA 5: HISTORY */}
          {activeTab === "history" && state && (
            <div className="p-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 font-display">Trazabilidad de Propinas Enviadas</h2>
                    <p className="text-xs text-slate-500">Listado íntegro de tus transacciones cifradas bajo el protocolo Bre-B y estado de liquidación de incentivos directos.</p>
                  </div>
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl">
                    Total Transacciones: {state.tips.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold">
                        <th className="py-3 px-4 uppercase tracking-widest text-[10px]">Establecimiento / Trabajador</th>
                        <th className="py-3 px-4 uppercase tracking-widest text-[10px]">Monto COP</th>
                        <th className="py-3 px-4 uppercase tracking-widest text-[10px]">Medio de Pago</th>
                        <th className="py-3 px-4 uppercase tracking-widest text-[10px]">Fecha Registro</th>
                        <th className="py-3 px-4 uppercase tracking-widest text-[10px] text-center">Firma Criptográfica / Bre-B</th>
                        <th className="py-3 px-4 uppercase tracking-widest text-[10px] text-center">Calificación</th>
                        <th className="py-3 px-4 uppercase tracking-widest text-[10px] text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {state.tips.map((tip) => (
                        <tr key={tip.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-extrabold text-slate-800 block">{tip.businessName}</span>
                              <span className="text-[11px] text-slate-500">Colaborador: {tip.employeeName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                            {formatCOP(tip.amountCOP)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tip.source === 'wallet' ? 'bg-yellow-101 bg-amber-100 text-amber-800' : 'bg-pink-100 text-pink-800'
                            }`}>
                              {tip.source === 'wallet' ? 'Billetera Bre-B' : 'Points (' + tip.pointsUsed + ' pts)'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(tip.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-[10.5px] text-slate-400">
                            <span title={tip.transactionKeySignature}>{tip.transactionKeySignature.slice(0, 14)}...</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {tip.ratingGiven ? (
                              <div className="flex items-center justify-center gap-0.5 text-amber-500 font-bold">
                                <span>{tip.ratingGiven}</span>
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              </div>
                            ) : (
                              <span className="text-slate-400 font-semibold">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {tip.status === "confirmed" && (
                              <span className="bg-yellow-100 text-amber-800 px-2 py-0.5 rounded font-extrabold text-[10px] uppercase">
                                Confirmado (Liberado)
                              </span>
                            )}
                            {tip.status === "pending" && (
                              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-extrabold text-[10px] uppercase animate-pulse">
                                Retenido (Espera)
                              </span>
                            )}
                            {tip.status === "retracted" && (
                              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-extrabold text-[10px] uppercase">
                                Retractado (Cancelado)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {state.tips.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                            No has enviado ninguna propina aún. Visita la sección de control para comenzar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* SECURE BLOCKCHAIN SYSTEM STATUS (FOOTER) - High Density Theme styled */}
        <footer className="h-10 bg-slate-900 border-t border-slate-800 px-8 flex items-center justify-between text-[10px] font-mono text-slate-400 select-none shrink-0 text-white">
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
              CONSORCIO CO-BOG-01 ACTIVO
            </span>
            <span>ENCRYPT: AES-GCM-256</span>
            <span>VERIFIED BY BRE-B CO</span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-500">PUBLIC: sha256:{state?.userWallet.publicKey.slice(12, 30)}</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-700 font-extrabold">NAPILINK STABLE v3.0</span>
          </div>
        </footer>
      </main>

      {/* MODAL REGISTRO DE NEGOCIO */}
      {showAddBusiness && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold font-display text-slate-800 mb-3 flex items-center gap-2">
              <Building className="h-5 w-5 text-amber-500" /> Registrar Establecimiento Comercial
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ingresa los datos del nuevo establecimiento para integrarlo a la pasarela Napilink.
            </p>
            <form onSubmit={handleAddBusiness} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Wok (Zona T)"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={newBizCategory}
                    onChange={(e) => setNewBizCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-yellow-400 font-semibold"
                  >
                    <option value="Restaurante">Restaurante</option>
                    <option value="Gourmet">Gourmet</option>
                    <option value="Bar">Bar</option>
                    <option value="Cafetería">Cafetería</option>
                    <option value="Almacén">Almacén / Retail</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Logo del Comercio</label>
                  <select
                    value={newBizLogo}
                    onChange={(e) => setNewBizLogo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-yellow-400 font-bold"
                  >
                    <option value="utensils">Cubiertos / Restaurante</option>
                    <option value="sparkles">Destellos / Alta Cocina</option>
                    <option value="flame">Fuego / Parrilla</option>
                    <option value="coffee">Taza de Café / Cafetería</option>
                    <option value="award">Insignia / Premium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Dirección / Sede</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cra 11 # 82-01, Bogotá"
                  value={newBizAddress}
                  onChange={(e) => setNewBizAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBusiness(false)}
                  className="flex-1 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 transition font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs bg-slate-900 hover:bg-slate-850 text-white font-bold transition"
                >
                  Registrar Comercio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRO DE COLABORADOR */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold font-display text-slate-800 mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" /> Registrar Colaborador en Nómina
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Agrega un colaborador a un establecimiento asociado para habilitarle la captación de incentivos y llaves rápidas Bre-B.
            </p>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre Completo del Trabajador</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Felipe Alarcón"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Puesto / Rol</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Barista Maestro"
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Establecimiento</label>
                  <select
                    value={newEmpBizId}
                    onChange={(e) => setNewEmpBizId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-yellow-400 font-semibold"
                    required
                  >
                    {state.businesses.map((biz) => (
                      <option key={biz.id} value={biz.id}>
                        {biz.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Llave / Alias Bre-B del Trabajador</label>
                <input
                  type="text"
                  placeholder="Ej: felipe.barista@breb"
                  value={newEmpAlias}
                  onChange={(e) => setNewEmpAlias(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-yellow-400 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Si lo dejas en blanco, generaremos un alias cifrado automático según su nombre.</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Pequeña biografía / Mensaje de bienvenida</label>
                <textarea
                  rows={2}
                  placeholder="Ej: Amante del buen trato e infusiones..."
                  value={newEmpBio}
                  onChange={(e) => setNewEmpBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmployee(false)}
                  className="flex-1 py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs bg-slate-900 hover:bg-slate-850 text-white font-bold transition"
                >
                  Confirmar Contratación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL COPIAR TEXTO RECIBO PARA ANALIZAR CON OCR */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-base font-bold font-display text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" /> Simulador OCR Manual (Copia Factura)
              </h3>
              <button onClick={() => setShowScannerModal(false)} className="text-slate-400 hover:text-slate-600 font-semibold text-lg">✕</button>
            </div>
            
            <p className="text-xs text-slate-500 mb-4 font-normal">
              Inserta contenido textual emulado de un recibo en Pesos Colombianos para activar el procesamiento con Inteligencia Artificial.
            </p>

            <form onSubmit={handleManualScanSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Contenido de la Factura (Texto)</label>
                <textarea
                  rows={6}
                  required
                  placeholder={`Ejemplo:\nCREPES & WAFFLES BOGOTA\nMesa 12, Santiago R.\n1 Crepe de Pollo: 24,000\n1 Waffle Nutella: 18,550\nSubtotal: 42,550\nTotal Factura COP: 64,500`}
                  value={customReceiptText}
                  onChange={(e) => setCustomReceiptText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-yellow-400 font-mono leading-relaxed"
                />
              </div>

              <div className="bg-yellow-50 rounded-2xl border border-yellow-250 p-3.5 text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
                <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Tip de Inteligencia Artificial:</strong> Gemini 3.5 analizará el total y la marca del restaurante en base al texto insertado, devolviendo el porcentaje recomendado para tu trabajador favorito.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScannerModal(false)}
                  className="flex-grow py-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={scanning}
                  className="flex-grow py-2 rounded-xl text-xs bg-slate-900 hover:bg-slate-850 text-white font-bold transition flex items-center justify-center gap-1.5"
                >
                  {scanning ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Analizar con IA
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Pequeño helper de consistencia para el formateo COP en el scope
function formatCO(val: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(val);
}
