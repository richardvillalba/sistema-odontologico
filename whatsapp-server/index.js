import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import cron from 'node-cron';
import pino from 'pino';

const PORT      = process.env.PORT || 3001;
const ORDS_BASE = process.env.ORDS_BASE_URL || 'https://g04d6b70b49b5da-escanor.adb.sa-vinhedo-1.oraclecloudapps.com/ords/admin';
const CFG_FILE  = './server-config.json';
const AUTH_DIR  = './auth_sessions';

const logger = pino({ level: 'silent' });

// ─── Config por empresa ───────────────────────────────────────────────────────
function loadAllConfigs() {
    if (existsSync(CFG_FILE)) {
        try { return JSON.parse(readFileSync(CFG_FILE, 'utf8')); } catch (_) {}
    }
    return {};
}

function getEmpresaConfig(empresaId) {
    const all = loadAllConfigs();
    return all[empresaId] || { hora_envio: 8, minuto_envio: 0 };
}

function saveEmpresaConfig(empresaId, cfg) {
    const all = loadAllConfigs();
    all[empresaId] = cfg;
    writeFileSync(CFG_FILE, JSON.stringify(all, null, 2));
}

// ─── Estado de conexiones (una por empresa) ──────────────────────────────────
// connections[empresaId] = { sock, state, qrString, cronTask }
const connections = {};

function getConn(empresaId) {
    if (!connections[empresaId]) {
        connections[empresaId] = { sock: null, state: 'disconnected', qrString: null, cronTask: null };
    }
    return connections[empresaId];
}

// ─── Conexión WhatsApp por empresa ───────────────────────────────────────────
async function connectEmpresa(empresaId, force = false) {
    const conn = getConn(empresaId);

    if (!force && (conn.state === 'connecting' || conn.state === 'connected')) return;

    // Cerrar socket existente si se fuerza reconexión
    if (conn.sock) {
        try { conn.sock.end(undefined); } catch (_) {}
        conn.sock = null;
    }

    conn.state = 'connecting';
    console.log(`🔄 [Empresa ${empresaId}] Iniciando conexión WhatsApp...`);

    const authDir = `${AUTH_DIR}/${empresaId}`;
    mkdirSync(authDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version }          = await fetchLatestBaileysVersion();

    conn.sock = makeWASocket({
        version,
        logger,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: true,
    });

    conn.sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            conn.qrString = qr;
            conn.state    = 'qr';
            console.log(`📱 [Empresa ${empresaId}] QR generado`);
        }

        if (connection === 'close') {
            conn.qrString = null;
            conn.state    = 'disconnected';
            const err  = lastDisconnect?.error;
            const code = (err instanceof Boom) ? err.output?.statusCode : null;
            const shouldReconnect = code !== DisconnectReason.loggedOut;
            console.log(`❌ [Empresa ${empresaId}] Conexión cerrada (${code}). Reconectar: ${shouldReconnect}`);
            if (shouldReconnect) {
                setTimeout(() => connectEmpresa(empresaId), 5000);
            }
        }

        if (connection === 'open') {
            conn.qrString = null;
            conn.state    = 'connected';
            console.log(`✅ [Empresa ${empresaId}] WhatsApp conectado`);
        }
    });

    conn.sock.ev.on('creds.update', saveCreds);
}

// ─── Express ──────────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// GET /status?empresa_id=X
app.get('/status', async (req, res) => {
    const { empresa_id } = req.query;
    if (!empresa_id) return res.status(400).json({ error: 'empresa_id requerido' });

    const conn = getConn(empresa_id);
    let qrImage = null;
    if (conn.qrString) {
        try { qrImage = await QRCode.toDataURL(conn.qrString); } catch (_) {}
    }
    res.json({ connected: conn.state === 'connected', state: conn.state, qr: qrImage });
});

// POST /connect  →  iniciar (o forzar) conexión para una empresa
app.post('/connect', async (req, res) => {
    const { empresa_id } = req.body;
    if (!empresa_id) return res.status(400).json({ error: 'empresa_id requerido' });
    await connectEmpresa(empresa_id, true); // siempre forzar para que el botón funcione
    res.json({ success: true, state: getConn(empresa_id).state });
});

// POST /disconnect  →  desconectar empresa
app.post('/disconnect', async (req, res) => {
    const { empresa_id } = req.body;
    if (!empresa_id) return res.status(400).json({ error: 'empresa_id requerido' });
    const conn = getConn(empresa_id);
    if (conn.sock) {
        try { await conn.sock.logout(); } catch (_) {}
        conn.sock  = null;
        conn.state = 'disconnected';
    }
    res.json({ success: true });
});

// POST /reset  →  borrar sesión guardada y forzar nuevo QR
app.post('/reset', async (req, res) => {
    const { empresa_id } = req.body;
    if (!empresa_id) return res.status(400).json({ error: 'empresa_id requerido' });

    const conn = getConn(empresa_id);
    if (conn.sock) {
        try { conn.sock.end(undefined); } catch (_) {}
        conn.sock  = null;
        conn.state = 'disconnected';
    }

    const authDir = `${AUTH_DIR}/${empresa_id}`;
    if (existsSync(authDir)) {
        const { rmSync } = await import('fs');
        rmSync(authDir, { recursive: true, force: true });
        console.log(`🗑️  [Empresa ${empresa_id}] Sesión eliminada`);
    }

    delete connections[empresa_id];
    await connectEmpresa(empresa_id, true);
    res.json({ success: true, state: getConn(empresa_id).state });
});

// GET /server-config?empresa_id=X
app.get('/server-config', (req, res) => {
    const { empresa_id } = req.query;
    if (!empresa_id) return res.status(400).json({ error: 'empresa_id requerido' });
    res.json(getEmpresaConfig(empresa_id));
});

// POST /server-config  →  { empresa_id, hora_envio, minuto_envio }
app.post('/server-config', (req, res) => {
    const { empresa_id, hora_envio, minuto_envio } = req.body;
    if (!empresa_id) return res.status(400).json({ error: 'empresa_id requerido' });

    const hora   = Math.min(23, Math.max(0, parseInt(hora_envio)   || 8));
    const minuto = Math.min(59, Math.max(0, parseInt(minuto_envio) || 0));
    const cfg    = { hora_envio: hora, minuto_envio: minuto };
    saveEmpresaConfig(empresa_id, cfg);
    programarCronEmpresa(empresa_id, hora, minuto);
    console.log(`⏰ [Empresa ${empresa_id}] Cron → ${String(hora).padStart(2,'0')}:${String(minuto).padStart(2,'0')}`);
    res.json({ success: true, ...cfg });
});

// POST /send  →  enviar mensaje
app.post('/send', async (req, res) => {
    const { phone, message, empresa_id, paciente_id, cita_id } = req.body;
    if (!phone || !message || !empresa_id) {
        return res.status(400).json({ success: false, error: 'phone, message y empresa_id son requeridos' });
    }

    let estado = 'ENVIADO', errorDetalle = null, phoneClean;
    try {
        phoneClean = await enviarMensaje(empresa_id, phone, message);
    } catch (err) {
        estado       = 'ERROR';
        errorDetalle = err.message;
        phoneClean   = normalizarTelefono(phone);
    }

    await logMensaje({ empresa_id, paciente_id, cita_id, telefono: phoneClean, mensaje: message, estado, error_detalle: errorDetalle });
    res.json({ success: estado === 'ENVIADO', estado, error: errorDetalle });
});

// POST /cron  →  disparar recordatorios manualmente (todas las empresas o una)
app.post('/cron', async (req, res) => {
    const { empresa_id } = req.body;
    const resultado = await ejecutarRecordatorios(empresa_id || null);
    res.json(resultado);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizarTelefono(phone) {
    let p = String(phone).replace(/[\s\-\+\(\)]/g, '');
    // 09XXXXXXXX → 5959XXXXXXXX
    if (/^09\d{8}$/.test(p)) p = '5959' + p.slice(1);
    return p;
}

async function enviarMensaje(empresaId, phone, message) {
    const conn = getConn(empresaId);
    if (!conn.sock || conn.state !== 'connected') throw new Error('WhatsApp no conectado para esta empresa');
    const phoneClean = normalizarTelefono(phone);
    await conn.sock.sendMessage(`${phoneClean}@s.whatsapp.net`, { text: message });
    return phoneClean;
}

async function logMensaje({ empresa_id, paciente_id, cita_id, telefono, mensaje, estado, error_detalle }) {
    try {
        await fetch(`${ORDS_BASE}/api/v1/whatsapp/mensajes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                empresa_id,
                paciente_id:   paciente_id   || null,
                cita_id:       cita_id       || null,
                telefono,
                mensaje,
                estado,
                error_detalle: error_detalle || null,
                wa_message_id: null,
            }),
        });
    } catch (err) {
        console.warn(`⚠️  Log ORDS falló: ${err.message}`);
    }
}

// ─── Recordatorios ───────────────────────────────────────────────────────────
async function ejecutarRecordatoriosEmpresa(empresa) {
    const { empresa_id, horas_anticipacion, plantilla_recordatorio } = empresa;
    const conn = getConn(empresa_id);
    if (conn.state !== 'connected') {
        console.warn(`⚠️  [Empresa ${empresa_id}] No conectada, se omite`);
        return [];
    }

    const citasRes  = await fetch(`${ORDS_BASE}/api/v1/whatsapp/citas-pendientes?empresa_id=${empresa_id}&horas=${horas_anticipacion || 24}`);
    const citasData = await citasRes.json();
    const citas     = citasData.items || [];
    const resultados = [];

    for (const cita of citas) {
        if (!cita.paciente_telefono) continue;
        const mensaje = (plantilla_recordatorio || 'Hola {nombre}, recordatorio de cita el {fecha} a las {hora}.')
            .replace('{nombre}', cita.paciente_nombre  || 'paciente')
            .replace('{fecha}',  cita.fecha_cita       || '')
            .replace('{hora}',   cita.hora_cita        || '')
            .replace('{doctor}', cita.doctor_nombre    || 'el doctor');

        let estado = 'ENVIADO', errorDetalle = null, phoneClean;
        try {
            phoneClean = await enviarMensaje(empresa_id, cita.paciente_telefono, mensaje);
        } catch (err) {
            estado       = 'ERROR';
            errorDetalle = err.message;
            phoneClean   = String(cita.paciente_telefono).replace(/[\s\-\+\(\)]/g, '');
        }

        await logMensaje({ empresa_id, paciente_id: cita.paciente_id, cita_id: cita.cita_id, telefono: phoneClean, mensaje, estado, error_detalle: errorDetalle });
        resultados.push({ cita_id: cita.cita_id, estado, error: errorDetalle });
    }
    return resultados;
}

async function ejecutarRecordatorios(filtroEmpresaId = null) {
    const resultados = [];
    try {
        const empresasRes  = await fetch(`${ORDS_BASE}/api/v1/whatsapp/empresas-activas`);
        const empresasData = await empresasRes.json();
        let empresas       = empresasData.items || [];
        if (filtroEmpresaId) empresas = empresas.filter(e => String(e.empresa_id) === String(filtroEmpresaId));

        for (const empresa of empresas) {
            const res = await ejecutarRecordatoriosEmpresa(empresa);
            resultados.push(...res);
        }
    } catch (err) {
        return { success: false, error: err.message, enviados: 0, errores: 0, detalle: resultados };
    }
    return {
        success:  true,
        enviados: resultados.filter(r => r.estado === 'ENVIADO').length,
        errores:  resultados.filter(r => r.estado === 'ERROR').length,
        detalle:  resultados,
    };
}

// ─── Cron por empresa ─────────────────────────────────────────────────────────
function programarCronEmpresa(empresaId, hora, minuto) {
    const conn = getConn(empresaId);
    if (conn.cronTask) conn.cronTask.stop();
    conn.cronTask = cron.schedule(`${minuto} ${hora} * * *`, async () => {
        console.log(`⏰ [Empresa ${empresaId}] Ejecutando recordatorios...`);
        const r = await ejecutarRecordatorios(empresaId);
        console.log(`✅ [Empresa ${empresaId}] ${r.enviados} enviados, ${r.errores} errores`);
    });
}

// ─── Arranque ─────────────────────────────────────────────────────────────────
// Auto-reconectar empresas que ya tienen sesión guardada
if (existsSync(AUTH_DIR)) {
    for (const dir of readdirSync(AUTH_DIR)) {
        const empresaId = dir;
        console.log(`🔁 Auto-reconectando empresa ${empresaId}...`);
        connectEmpresa(empresaId);
        const cfg = getEmpresaConfig(empresaId);
        programarCronEmpresa(empresaId, cfg.hora_envio, cfg.minuto_envio);
    }
}

app.listen(PORT, () => console.log(`🟢 WhatsApp server en http://localhost:${PORT}`));
