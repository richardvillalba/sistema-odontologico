/**
 * Vercel Cron Job: GET /api/whatsapp/cron
 * Se ejecuta cada hora. Busca citas próximas y envía recordatorios automáticos.
 * Configurar en vercel.json: "0 * * * *"
 */

const ORDS_BASE = process.env.ORDS_BASE_URL || 'https://g04d6b70b49b5da-escanor.adb.sa-vinhedo-1.oraclecloudapps.com/ords/admin';
const APP_URL   = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

export default async function handler(req, res) {
    // Verificar que es llamado por Vercel Cron o con clave secreta
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const resultados = [];

    try {
        // 1. Obtener todas las empresas con WhatsApp habilitado
        const empresasRes = await fetch(`${ORDS_BASE}/api/v1/whatsapp/empresas-activas`);
        const empresasData = await empresasRes.json();
        const empresas = empresasData.items || [];

        for (const empresa of empresas) {
            const { empresa_id, horas_anticipacion, plantilla_recordatorio } = empresa;

            // 2. Obtener citas pendientes de recordatorio
            const citasRes = await fetch(
                `${ORDS_BASE}/api/v1/whatsapp/citas-pendientes?empresa_id=${empresa_id}&horas=${horas_anticipacion || 24}`
            );
            const citasData = await citasRes.json();
            const citas = citasData.items || [];

            for (const cita of citas) {
                if (!cita.paciente_telefono) continue;

                // 3. Interpolar plantilla
                const mensaje = (plantilla_recordatorio || 'Hola {nombre}, recordatorio de cita el {fecha} a las {hora}.')
                    .replace('{nombre}', cita.paciente_nombre || 'paciente')
                    .replace('{fecha}', cita.fecha_cita || '')
                    .replace('{hora}', cita.hora_cita || '')
                    .replace('{doctor}', cita.doctor_nombre || 'el doctor');

                // 4. Enviar via serverless send
                try {
                    const sendRes = await fetch(`${APP_URL}/api/whatsapp/send`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            phone: cita.paciente_telefono,
                            message: mensaje,
                            empresa_id,
                            paciente_id: cita.paciente_id,
                            cita_id: cita.cita_id,
                        }),
                    });
                    const sendData = await sendRes.json();
                    resultados.push({ cita_id: cita.cita_id, ...sendData });
                } catch (err) {
                    resultados.push({ cita_id: cita.cita_id, success: false, error: err.message });
                }
            }
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message, resultados });
    }

    return res.status(200).json({
        success: true,
        enviados: resultados.filter(r => r.success).length,
        errores: resultados.filter(r => !r.success).length,
        detalle: resultados,
    });
}
