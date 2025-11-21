/**
 * Paleta de colores oficial de ADRA
 * Basada en https://adra.org/
 */
export const ADRA_COLORS = {
  // Colores primarios
  green: {
    primary: '#00843D',
    light: '#4CAF50',
    dark: '#005A29',
    lightest: '#E8F5E9',
  },
  blue: {
    primary: '#005EB8',
    light: '#2196F3',
    dark: '#003D82',
  },
  yellow: {
    accent: '#FDB913',
    light: '#FDD835',
  },

  // Colores neutrales
  neutral: {
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },

  // Colores semanticos
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Mapa interactivo
  map: {
    default: '#E8F5E9',
    hover: '#4CAF50',
    selected: '#00843D',
    highCoverage: '#00843D',
    mediumCoverage: '#66BB6A',
    lowCoverage: '#C8E6C9',
    noData: '#F5F5F5',
  },
} as const;

/**
 * Gradientes ADRA
 */
export const ADRA_GRADIENTS = {
  header: 'linear-gradient(135deg, #00843D 0%, #4CAF50 70%, #005EB8 100%)',
  card: 'linear-gradient(to bottom right, #00843D, #4CAF50)',
  overlay: 'linear-gradient(to bottom, rgba(0, 132, 61, 0.1), rgba(0, 132, 61, 0.05))',
} as const;

/**
 * Helper para obtener color del mapa según intensidad de datos
 */
export function getMapColorByIntensity(value: number, max: number): string {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  if (percentage === 0) return ADRA_COLORS.map.noData;
  if (percentage < 33) return ADRA_COLORS.map.lowCoverage;
  if (percentage < 66) return ADRA_COLORS.map.mediumCoverage;
  return ADRA_COLORS.map.highCoverage;
}
