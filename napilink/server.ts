import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

// Configurar parser de JSON grande para soportar base64 de imágenes de recibos
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Archivo local de persistencia de datos para un demo robusto
const DB_FILE = path.join(process.cwd(), "data-store.json");

// Inicialización de la base de datos simulada pero persistida en archivo
function getInitialData() {
  return {
    userWallet: {
      balanceCOP: 185000,
      pinSet: true,
      publicKey: "pub_bre_b_9a2f4c8e7d81a9",
      linkedKeys: [
        { id: "k1", type: "Celular", alias: "3103456789", provider: "Bre-B", active: true },
        { id: "k2", type: "Cédula", alias: "1020304050", provider: "Bre-B", active: true }
      ]
    },
    puntosColombia: {
      linked: true,
      accountNumber: "9876-1234-5678",
      balance: 14500, // 1 punto = $7 COP en canje de propinas
      conversionRate: 7 // COP por cada punto
    },
    businesses: [
      {
        id: "b1",
        name: "Crepes & Waffles (Usaquén)",
        category: "Restaurante",
        address: "Cra 6 # 119-24, Bogotá",
        logo: "utensils"
      },
      {
        id: "b2",
        name: "Restaurante El Cielo",
        category: "Alta Cocina",
        address: "Cl. 70 # 4-47, Bogotá",
        logo: "sparkles"
      },
      {
        id: "b3",
        name: "Andrés Carne de Res",
        category: "Restaurante & Bar",
        address: "Calle 82 # 12-21, Bogotá / Chía",
        logo: "flame"
      },
      {
        id: "b4",
        name: "Café San Alberto",
        category: "Cafetería Especial",
        address: "Cra. 6 # 11-12, Bogotá",
        logo: "coffee"
      }
    ],
    employees: [
      {
        id: "e1",
        name: "Santiago Restrepo",
        role: "Mesero Líder",
        businessId: "b1",
        rating: 4.9,
        ratingsCount: 142,
        aliasKey: "santy.crepes@breb",
        bio: "Especialista en atención al detalle y crepes dulces. ¡Siempre con buena energía!",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
      },
      {
        id: "e2",
        name: "Mariana Delgado",
        role: "Chef de Repostería",
        businessId: "b1",
        rating: 4.8,
        ratingsCount: 89,
        aliasKey: "mari.delgado@breb",
        bio: "Apasionada por la creación de sabores únicos. Mi meta es tu momento dulce.",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
      },
      {
        id: "e3",
        name: "Carlos Mario Gaviria",
        role: "Sommelier / Mesero",
        businessId: "b2",
        rating: 4.95,
        ratingsCount: 215,
        aliasKey: "carlos.elcielo@breb",
        bio: "Amante del maridaje y la cocina de experiencia sensorial colombiana.",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
      },
      {
        id: "e4",
        name: "Valentina Gómez",
        role: "Mesera Ejecutiva",
        businessId: "b3",
        rating: 4.75,
        ratingsCount: 310,
        aliasKey: "vale.andres@breb",
        bio: "Haciendo de tu visita a Andrés una fiesta inolvidable de sabor nacional.",
        photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80"
      },
      {
        id: "e5",
        name: "Juan Camilo Paz",
        role: "Barista Premium",
        businessId: "b4",
        rating: 4.92,
        ratingsCount: 164,
        aliasKey: "juan.barista@breb",
        bio: "Campeón regional de barismo. Preparo tu café con alma de montaña.",
        photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
      }
    ],
    tips: [
      {
        id: "tip_mock_1",
        businessId: "b1",
        employeeId: "e1",
        employeeName: "Santiago Restrepo",
        businessName: "Crepes & Waffles (Usaquén)",
        amountCOP: 15000,
        source: "wallet",
        status: "confirmed",
        holdHours: 2,
        ratingGiven: 5,
        review: "Excelente y muy amable atención nocturna.",
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        unlockAt: new Date(Date.now() - 46 * 3600 * 1000).toISOString(),
        transactionKeySignature: "sig_e12888ba771ca9dbe5e11"
      },
      {
        id: "tip_mock_2",
        businessId: "b4",
        employeeId: "e5",
        employeeName: "Juan Camilo Paz",
        businessName: "Café San Alberto",
        amountCOP: 8000,
        source: "points",
        pointsUsed: 1143,
        pointsPartner: "Puntos Colombia",
        status: "pending",
        holdHours: 24,
        ratingGiven: 5,
        review: "El v60 estuvo espectacular.",
        createdAt: new Date().toISOString(),
        unlockAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        transactionKeySignature: "sig_f99a38ee818abefda7710"
      }
    ]
  };
}

let databaseState = getInitialData();

// Cargar de disco si existe
if (fs.existsSync(DB_FILE)) {
  try {
    databaseState = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    console.log("💿 Base de datos cargada exitosamente del disco.");
  } catch (err) {
    console.error("⚠️ Error cargando la base de datos. Se usarán datos por defecto.");
  }
} else {
  saveToDisk();
}

function saveToDisk() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(databaseState, null, 2), "utf-8");
  } catch (err) {
    console.error("⚠️ Error guardando base de datos a disco:", err);
  }
}

// Inicialización diferida y segura de Gemini API
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.log("No GEMINI_API_KEY available in env. Fallback mode will be active.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ================= API ENDPOINTS =================

// Estado general de la app
app.get("/api/state", (req, res) => {
  res.json(databaseState);
});

// Guardar billetera
app.post("/api/wallet/update", (req, res) => {
  const { balanceCOP, linkedKeys } = req.body;
  if (typeof balanceCOP === "number") {
    databaseState.userWallet.balanceCOP = balanceCOP;
  }
  if (Array.isArray(linkedKeys)) {
    databaseState.userWallet.linkedKeys = linkedKeys;
  }
  saveToDisk();
  res.json({ success: true, userWallet: databaseState.userWallet });
});

// Enlazar/Desenlazar Puntos Colombia
app.post("/api/puntos/link", (req, res) => {
  const { linked, accountNumber, pointsBalance } = req.body;
  databaseState.puntosColombia.linked = !!linked;
  if (accountNumber) databaseState.puntosColombia.accountNumber = accountNumber;
  if (typeof pointsBalance === "number") databaseState.puntosColombia.balance = pointsBalance;
  saveToDisk();
  res.json({ success: true, puntosColombia: databaseState.puntosColombia });
});

// Registrar nuevo establecimiento (Empresa)
app.post("/api/businesses/register", (req, res) => {
  const { name, category, address, logo } = req.body;
  if (!name) return res.status(400).json({ error: "El nombre es obligatorio" });

  const newBiz = {
    id: "b_" + Math.random().toString(36).substr(2, 9),
    name,
    category: category || "Restaurante",
    address: address || "Bogotá, Colombia",
    logo: logo || "🏢"
  };

  databaseState.businesses.push(newBiz);
  saveToDisk();
  res.json({ success: true, business: newBiz });
});

// Registrar nuevo mesero/colaborador
app.post("/api/employees/register", (req, res) => {
  const { name, role, businessId, bio, aliasKey } = req.body;
  if (!name || !businessId) {
    return res.status(400).json({ error: "Nombre y establecimiento son requeridos." });
  }

  const cleanAlias = aliasKey || `${name.toLowerCase().replace(/\s+/g, ".")}@breb`;
  const newEmp = {
    id: "e_" + Math.random().toString(36).substr(2, 9),
    name,
    role: role || "Colaborador",
    businessId,
    rating: 5.0,
    ratingsCount: 1,
    aliasKey: cleanAlias,
    bio: bio || "Feliz de servirte",
    photo: `https://images.unsplash.com/photo-${[
      "1534528741775-53994a69daeb",
      "1539571696357-5a69c17a67c6",
      "1507003211169-0a1dd7228f2d",
      "1494790108377-be9c29b29330"
    ][Math.floor(Math.random() * 4)]}?w=150&auto=format&fit=crop&q=80`
  };

  databaseState.employees.push(newEmp);
  saveToDisk();
  res.json({ success: true, employee: newEmp });
});

// Enviar propina (Crear en estado PENDING para retractación)
app.post("/api/tips/create", (req, res) => {
  const { employeeId, amountCOP, source, rating, review, holdHours, pointsUsed } = req.body;

  if (!employeeId || !amountCOP) {
    return res.status(400).json({ error: "Colaborador y monto son necesarios." });
  }

  const employee = databaseState.employees.find((e) => e.id === employeeId);
  if (!employee) return res.status(404).json({ error: "Colaborador no encontrado." });

  const business = databaseState.businesses.find((b) => b.id === employee.businessId);
  const businessName = business ? business.name : "Establecimiento Asociado";

  // Descontar saldo/puntos según el origen
  if (source === "wallet") {
    if (databaseState.userWallet.balanceCOP < amountCOP) {
      return res.status(400).json({ error: "Saldo insuficiente en tu billetera digital." });
    }
    databaseState.userWallet.balanceCOP -= amountCOP;
  } else if (source === "points") {
    const pts = pointsUsed || Math.ceil(amountCOP / databaseState.puntosColombia.conversionRate);
    if (!databaseState.puntosColombia.linked || databaseState.puntosColombia.balance < pts) {
      return res.status(400).json({ error: "Puntos insuficientes en Puntos Colombia." });
    }
    databaseState.puntosColombia.balance -= pts;
  }

  // Firmar criptográficamente (Simulado de de llave Bre-B con encriptación) Encriptada bajo llave simétrica
  const mockSignature = "sig_" + Math.random().toString(16).substr(2, 20);
  const hours = typeof holdHours === "number" ? holdHours : 24;

  const newTip = {
    id: "tip_" + Math.random().toString(36).substr(2, 9),
    businessId: employee.businessId,
    employeeId: employee.id,
    employeeName: employee.name,
    businessName: businessName,
    amountCOP: amountCOP,
    source: source,
    pointsUsed: source === "points" ? (pointsUsed || Math.ceil(amountCOP / 7)) : undefined,
    pointsPartner: source === "points" ? "Puntos Colombia" : undefined,
    status: hours > 0 ? "pending" : "confirmed", // 0 horas significa procesado al momento
    holdHours: hours,
    ratingGiven: rating,
    review: review || "",
    createdAt: new Date().toISOString(),
    unlockAt: new Date(Date.now() + hours * 3600 * 1000).toISOString(),
    transactionKeySignature: mockSignature
  };

  databaseState.tips.push(newTip);

  // Actualizar la calificación media del empleado inmediatamente
  if (rating) {
    const oldRating = employee.rating || 5.0;
    const count = employee.ratingsCount || 0;
    const newRating = ((oldRating * count) + rating) / (count + 1);
    employee.rating = parseFloat(newRating.toFixed(2));
    employee.ratingsCount = count + 1;
  }

  saveToDisk();
  res.json({ success: true, tip: newTip, wallet: databaseState.userWallet, puntos: databaseState.puntosColombia });
});

// Retractar/Reclamar propina que está en estado PENDING
app.post("/api/tips/retract", (req, res) => {
  const { tipId } = req.body;
  const tip = databaseState.tips.find((t) => t.id === tipId);

  if (!tip) return res.status(404).json({ error: "Transacción de propina no encontrada." });
  if (tip.status !== "pending") {
    return res.status(400).json({ error: "Esta propina ya ha sido liberada o cancelada anteriormente." });
  }

  // Devolver el dinero al cliente
  if (tip.source === "wallet") {
    databaseState.userWallet.balanceCOP += tip.amountCOP;
  } else if (tip.source === "points" && tip.pointsUsed) {
    databaseState.puntosColombia.balance += tip.pointsUsed;
  }

  tip.status = "retracted";
  
  // Revertir calificación si aplica
  if (tip.ratingGiven) {
    const employee = databaseState.employees.find((e) => e.id === tip.employeeId);
    if (employee && employee.ratingsCount > 1) {
      const oldSum = (employee.rating * employee.ratingsCount) - tip.ratingGiven;
      employee.ratingsCount -= 1;
      employee.rating = parseFloat((oldSum / employee.ratingsCount).toFixed(2));
    }
  }

  saveToDisk();
  res.json({ success: true, tip, wallet: databaseState.userWallet, puntos: databaseState.puntosColombia });
});

// Liberar propina manualmente antes de tiempo
app.post("/api/tips/confirm-early", (req, res) => {
  const { tipId } = req.body;
  const tip = databaseState.tips.find((t) => t.id === tipId);

  if (!tip) return res.status(404).json({ error: "Propina no encontrada." });
  if (tip.status !== "pending") {
    return res.status(400).json({ error: "La propina no está en espera." });
  }

  tip.status = "confirmed";
  saveToDisk();
  res.json({ success: true, tip });
});

// Recargar billetera digital
app.post("/api/wallet/topup", (req, res) => {
  const { amountCOP, paymentAlias } = req.body; // Alias como celular Bre-B
  if (!amountCOP || amountCOP <= 0) {
    return res.status(400).json({ error: "Monto inválido para recargar." });
  }

  databaseState.userWallet.balanceCOP += amountCOP;
  
  // Registrar una transacción simulada o historial si se requiere
  saveToDisk();
  res.json({ success: true, balanceCOP: databaseState.userWallet.balanceCOP });
});

// Gemini OCR Escáner de recibos inteligente
app.post("/api/scan-receipt", async (req, res) => {
  const { imageBase64, sampleText } = req.body;

  try {
    const ai = getGeminiClient();

    if (!ai) {
      // MOCK FALLBACK INTELIGENTE (Si no hay llave de API o falla la inicialización)
      console.log("Using intelligent mock parser for receipt scanning");
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await delay(1500);

      const isSample1 = sampleText && sampleText.includes("Crepes");
      const isSample2 = sampleText && sampleText.includes("Andres");

      let businessName = "Restaurante Local Plaza";
      let totalAmount = 94500;
      let date = new Date().toLocaleDateString("es-CO");

      if (isSample1) {
        businessName = "Crepes & Waffles (Usaquén)";
        totalAmount = 64500;
      } else if (isSample2) {
        businessName = "Andrés Carne de Res";
        totalAmount = 145000;
      } else if (sampleText) {
        // Tratar de sacar algo
        businessName = "Establecimiento Escaneado";
        const nums = sampleText.match(/\d+[\d.,]*/g);
        if (nums && nums.length > 0) {
          totalAmount = parseFloat(nums[nums.length - 1].replace(/[.,]/g, "")) || 45000;
        }
      }

      const suggestedTips = {
        "8": Math.round(totalAmount * 0.08),
        "10": Math.round(totalAmount * 0.105), // Incluye algún incentivo indirecto
        "15": Math.round(totalAmount * 0.15)
      };

      return res.json({
        success: true,
        isMock: true,
        extractedData: {
          businessName,
          totalAmount,
          currency: "COP",
          date,
          suggestedTips
        }
      });
    }

    // Si hay cliente AI, ejecutamos la llamada real a Gemini 3.5 Flash
    let filePart;
    if (imageBase64) {
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Formato de imagen base64 inválido para el procesamiento." });
      }
      filePart = {
        inlineData: {
          mimeType: matches[1],
          data: matches[2]
        }
      };
    } else {
      return res.status(400).json({ error: "Se requiere un archivo o una imagen base64." });
    }

    const promptString = `Analiza detalladamente esta imagen de recibo o factura de restaurante/comercio. Extrae la información requerida en un formato estructurado JSON.
    Debes mapear con la máxima precisión lo siguiente:
    1. Nombre del negocio o establecimiento (businessName).
    2. Valor total a pagar en pesos colombianos (totalAmount).
    3. Moneda (currency) - típicamente "COP".
    4. Fecha de emisión o compra en formato texto (date).
    5. Estimar los montos sugeridos de propina de 8% (mínimo), 10% (estándar), y 15% (excelente servicio) en base al total de consumo, aproximándolos a números enteros de Pesos Colombianos.
    
    Devuelve solo el JSON válido con estos campos, nada más. Sin bloques de código markdown, solo el objeto JSON plano.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [filePart, promptString],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            businessName: { type: Type.STRING, description: "Nombre de la empresa o local" },
            totalAmount: { type: Type.NUMBER, description: "Monto total del recibo facturado" },
            currency: { type: Type.STRING, description: "Código de moneda del recibo, ej: COP o USD" },
            date: { type: Type.STRING, description: "Fecha del recibo" },
            suggestedTips: {
              type: Type.OBJECT,
              properties: {
                "8": { type: Type.NUMBER, description: "Monto sugerido con el 8% del consumo sin servicio en COP" },
                "10": { type: Type.NUMBER, description: "Monto sugerido con el 10% del consumo sin servicio en COP" },
                "15": { type: Type.NUMBER, description: "Monto sugerido con el 15% para servicio excelente en COP" }
              },
              required: ["8", "10", "15"]
            }
          },
          required: ["businessName", "totalAmount", "currency", "date", "suggestedTips"]
        }
      }
    });

    const textOutput = response.text ? response.text.trim() : "{}";
    const extractedData = JSON.parse(textOutput);

    res.json({
      success: true,
      isMock: false,
      extractedData
    });

  } catch (error: any) {
    console.error("Gemini Scan Error:", error);
    res.status(500).json({ error: "Error procesando el recibo con Inteligencia Artificial. Detalle: " + error.message });
  }
});

// Integración de servicio de Vite y arranque
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Plataforma de Propinas corriendo en puerto ${PORT}`);
  });
}

startServer();
