/**
 * Interfaz genérica para todas las respuestas del backend
 * Estandariza el formato de respuesta de la API
 */
export interface ApiResponse<T = unknown> {
  statusCode: number; // Código de estado HTTP (200 para éxito)
  message: string; // Mensaje descriptivo contextual de la operación
  data: T; // Los datos reales de la respuesta (genérico)
  details?: unknown; // Detalles del error (solo en errores)
  metadata?: {
    // Metadatos adicionales (opcional)
    pagination?: {
      // Información de paginación (opcional)
      total: number; // Total de elementos disponibles
      page: number; // Página actual (comienza en 1)
      limit: number; // Elementos por página
      totalPages: number; // Total de páginas disponibles
      hasNext: boolean; // Indica si hay página siguiente
      hasPrev: boolean; // Indica si hay página anterior
    };
    filters?: Record<string, unknown>; // Filtros aplicados en la consulta (opcional)
  };
  apiVersion: string; // Versión de la API (v1, v2, etc.) - dinámico según la ruta
  timestamp: string; // Marca de tiempo ISO de cuando se generó la respuesta
  path: string; // Ruta del endpoint que generó la respuesta
}

/**
 * Helper type para extraer solo los datos paginados
 */
export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}
