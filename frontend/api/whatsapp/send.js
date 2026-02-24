/**
 * Vercel Serverless Function: POST /api/whatsapp/send
 * Proxy seguro para enviar mensajes WhatsApp via Meta Cloud API.
 * El access_token nunca se expone al frontend.
 */

const ORDS_BASE = process.env.ORDS_BASE_URL || 'https://g04d6b70b49b5da-escanor.adb.sa-vinhedo-1.oraclecloudapps.com/ords/admin';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { phone, message, empresa_id, paciente_id, cita_id } = req.body;

    if ((!phone && !paciente_id) || !empresa_id) {
        return res.status(400).json({ success: false, message: 'empresa_id y phone o paciente_id son requeridos' });
    }

    // Si no viene phone, buscarlo por paciente_id
    let resolvedPhone = phone;
    if (!resolvedPhone && paciente_id) {
        try {
            const pacRes = await fetch(`${ORDS_BASE}/api/v1/pacientes/${paciente_id}`);
            const pacData = await pacRes.json();
            const paciente = pacData.items?.[0] || pacData;
            resolvedPhone = paciente.telefono || paciente.TELEFONO;
            if (!resolvedPhone) {
                return res.status(400).json({ success: false, message: 'El paciente no tiene teléfono registrado' });
            }
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Error al obtener teléfono del paciente: ' + err.message });
        }
    }

    // Si no viene message, usar plantilla del config
    let resolvedMessage = message;

    // 1. Obtener config (con token) desde ORDS
    let config;
    try {
        const configRes = await fetch(`${ORDS_BASE}/api/v1/whatsapp/config/token?empresa_id=${empresa_id}`);
        const configData = await configRes.json();
        if (!configData.access_token || !configData.phone_number_id) {
            return res.status(400).json({ success: false, message: 'WhatsApp no configurado para esta empresa' });
        }
        config = configData;
        // Si no hay mensaje, usar plantilla
        if (!resolvedMessage) {
            resolvedMessage = config.plantilla_recordatorio || 'Tiene una cita programada. Recuerde asistir a su consulta.';
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error al obtener configuración: ' + err.message });
    }

    if (!resolvedMessage) {
        return res.status(400).json({ success: false, message: 'No se pudo determinar el mensaje a enviar' });
    }

    // Normalizar teléfono (quitar +, espacios, guiones)
    const phoneClean = String(resolvedPhone).replace(/[\s\-\+\(\)]/g, '');

    // 2. Enviar mensaje via Meta WhatsApp Cloud API
    let waMessageId = null;
    let estado = 'ENVIADO';
    let errorDetalle = null;

    try {
        const waRes = await fetch(
            `https://graph.facebook.com/v18.0/${config.phone_number_id}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: phoneClean,
                    type: 'text',
                    text: { body: resolvedMessage },
                }),
            }
        );

        const waData = await waRes.json();

        if (waData.messages && waData.messages[0]) {
            waMessageId = waData.messages[0].id;
        } else if (waData.error) {
            estado = 'ERROR';
            errorDetalle = waData.error.message || JSON.stringify(waData.error);
        }
    } catch (err) {
        estado = 'ERROR';
        errorDetalle = err.message;
    }

    // 3. Registrar en log via ORDS
    try {
        await fetch(`${ORDS_BASE}/api/v1/whatsapp/mensajes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                empresa_id,
                paciente_id: paciente_id || null,
                cita_id: cita_id || null,
                telefono: phoneClean,
                mensaje: resolvedMessage,
                estado,
                error_detalle: errorDetalle,
                wa_message_id: waMessageId,
            }),
        });
    } catch (_) {
        // No bloquear la respuesta si falla el log
    }

    return res.status(200).json({
        success: estado === 'ENVIADO',
        wa_message_id: waMessageId,
        estado,
        error: errorDetalle,
    });
}
