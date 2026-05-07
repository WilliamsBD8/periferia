/**
 * Interfaz para respuestas exitosas en formato JSON.
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Indica si la operación fue exitosa (false).
 * @property {string} message - Mensaje descriptivo de la respuesta.
 * @property {Object} [data] - Información adicional opcional de la respuesta.
 * @property {number} status - Código de estado HTTP de la respuesta.
 */

export const errorResponse = (message, data, status) => ({
    success: false,
    message: message || "Error en la operación.",
    data: data || null,
    status: status || 500,
    timestamp: new Date().toISOString(),
});