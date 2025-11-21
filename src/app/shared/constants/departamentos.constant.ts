/**
 * Constantes de los 9 departamentos de Bolivia
 * Incluye nombres, códigos, banderas y datos geográficos
 */

export interface Departamento {
  /** Código único del departamento (uppercase) */
  codigo: string;
  /** Nombre completo del departamento */
  nombre: string;
  /** Nombre corto o abreviatura común */
  nombreCorto: string;
  /** Ruta al icono/bandera SVG del departamento */
  bandera: string;
  /** Capital del departamento */
  capital: string;
  /** Código ISO 3166-2 (opcional) */
  codigoISO?: string;
}

/**
 * Mapeo de los 9 departamentos de Bolivia
 * Ordenados alfabéticamente por nombre
 */
export const DEPARTAMENTOS: Record<string, Departamento> = {
  BENI: {
    codigo: 'BENI',
    nombre: 'Beni',
    nombreCorto: 'Beni',
    bandera: 'assets/icons/banderas/beni.svg',
    capital: 'Trinidad',
    codigoISO: 'BO-B',
  },
  CHUQUISACA: {
    codigo: 'CHUQUISACA',
    nombre: 'Chuquisaca',
    nombreCorto: 'Chuquisaca',
    bandera: 'assets/icons/banderas/chuquisaca.svg',
    capital: 'Sucre',
    codigoISO: 'BO-H',
  },
  COCHABAMBA: {
    codigo: 'COCHABAMBA',
    nombre: 'Cochabamba',
    nombreCorto: 'Cochabamba',
    bandera: 'assets/icons/banderas/cochabamba.svg',
    capital: 'Cochabamba',
    codigoISO: 'BO-C',
  },
  LA_PAZ: {
    codigo: 'LA_PAZ',
    nombre: 'La Paz',
    nombreCorto: 'La Paz',
    bandera: 'assets/icons/banderas/la_paz.svg',
    capital: 'La Paz',
    codigoISO: 'BO-L',
  },
  ORURO: {
    codigo: 'ORURO',
    nombre: 'Oruro',
    nombreCorto: 'Oruro',
    bandera: 'assets/icons/banderas/oruro.svg',
    capital: 'Oruro',
    codigoISO: 'BO-O',
  },
  PANDO: {
    codigo: 'PANDO',
    nombre: 'Pando',
    nombreCorto: 'Pando',
    bandera: 'assets/icons/banderas/pando.svg',
    capital: 'Cobija',
    codigoISO: 'BO-N',
  },
  POTOSI: {
    codigo: 'POTOSI',
    nombre: 'Potosí',
    nombreCorto: 'Potosí',
    bandera: 'assets/icons/banderas/potosi.svg',
    capital: 'Potosí',
    codigoISO: 'BO-P',
  },
  SANTA_CRUZ: {
    codigo: 'SANTA_CRUZ',
    nombre: 'Santa Cruz',
    nombreCorto: 'Santa Cruz',
    bandera: 'assets/icons/banderas/santa_cruz.svg',
    capital: 'Santa Cruz de la Sierra',
    codigoISO: 'BO-S',
  },
  TARIJA: {
    codigo: 'TARIJA',
    nombre: 'Tarija',
    nombreCorto: 'Tarija',
    bandera: 'assets/icons/banderas/tarija.svg',
    capital: 'Tarija',
    codigoISO: 'BO-T',
  },
};

/**
 * Bandera de Bolivia (país completo)
 */
export const BOLIVIA: Departamento = {
  codigo: 'BO',
  nombre: 'Bolivia',
  nombreCorto: 'Bolivia',
  bandera: 'assets/icons/banderas/bo.svg',
  capital: 'Sucre',
  codigoISO: 'BO',
};

/**
 * Array de departamentos ordenados alfabéticamente
 */
export const DEPARTAMENTOS_ARRAY: Departamento[] = Object.values(DEPARTAMENTOS).sort((a, b) =>
  a.nombre.localeCompare(b.nombre),
);

/**
 * Obtener departamento por código (case-insensitive)
 * @param codigo Código del departamento (ej: "LA_PAZ", "la paz", "La Paz")
 * @returns Departamento encontrado o undefined
 */
export function getDepartamentoByCodigo(codigo: string): Departamento | undefined {
  const codigoNormalizado = codigo.toUpperCase().replace(/\s+/g, '_');
  return DEPARTAMENTOS[codigoNormalizado];
}

/**
 * Obtener departamento por nombre (búsqueda flexible)
 * @param nombre Nombre del departamento (ej: "La Paz", "cochabamba")
 * @returns Departamento encontrado o undefined
 */
export function getDepartamentoByNombre(nombre: string): Departamento | undefined {
  const nombreNormalizado = nombre.toLowerCase().trim();
  return DEPARTAMENTOS_ARRAY.find(
    (dept) =>
      dept.nombre.toLowerCase() === nombreNormalizado ||
      dept.nombreCorto.toLowerCase() === nombreNormalizado,
  );
}

/**
 * Obtener ruta de bandera por código o nombre de departamento
 * @param departamento Código o nombre del departamento
 * @returns Ruta al archivo SVG de la bandera o bandera de Bolivia por defecto
 */
export function getBanderaDepartamento(departamento: string): string {
  if (!departamento) return BOLIVIA.bandera;

  // Si comienza con dos dígitos, interpretarlo como código numérico de departamento (01..09)
  const numericMatch = String(departamento).match(/^(\d{2})/);
  if (numericMatch) {
    const dept = getDepartamentoPorCodigoNumerico(numericMatch[1]);
    if (dept) return dept.bandera;
  }

  const dept = getDepartamentoByCodigo(departamento) || getDepartamentoByNombre(departamento);

  return dept?.bandera || BOLIVIA.bandera;
}

/**
 * Mapeo de nombres de departamento con variaciones comunes
 * Útil para normalizar datos del backend
 */
export const DEPARTAMENTO_ALIASES: Record<string, string> = {
  'la paz': 'LA_PAZ',
  lapaz: 'LA_PAZ',
  'santa cruz': 'SANTA_CRUZ',
  santacruz: 'SANTA_CRUZ',
  cochabamba: 'COCHABAMBA',
  cbba: 'COCHABAMBA',
  potosi: 'POTOSI',
  potosí: 'POTOSI',
  chuquisaca: 'CHUQUISACA',
  chq: 'CHUQUISACA',
  oruro: 'ORURO',
  oru: 'ORURO',
  beni: 'BENI',
  tarija: 'TARIJA',
  trj: 'TARIJA',
  pando: 'PANDO',
  pnd: 'PANDO',
};

/**
 * Normalizar nombre de departamento del backend
 * @param departamento Nombre que viene del backend
 * @returns Código normalizado del departamento
 */
export function normalizarDepartamento(departamento: string): string {
  if (!departamento) return 'BO';

  const normalizado = departamento.toLowerCase().trim();
  return DEPARTAMENTO_ALIASES[normalizado] || departamento.toUpperCase().replace(/\s+/g, '_');
}

/**
 * Códigos numéricos de departamentos (dos dígitos):
 * 01: Chuquisaca, 02: La Paz, 03: Cochabamba, 04: Oruro, 05: Potosí,
 * 06: Tarija, 07: Santa Cruz, 08: Beni, 09: Pando
 */
export const DEPARTAMENTO_CODIGO: Record<string, string> = {
  CHUQUISACA: '01',
  LA_PAZ: '02',
  COCHABAMBA: '03',
  ORURO: '04',
  POTOSI: '05',
  TARIJA: '06',
  SANTA_CRUZ: '07',
  BENI: '08',
  PANDO: '09',
};

/**
 * Obtener código de departamento en formato de dos dígitos (01..09)
 */
export function getCodigoDepartamento(departamento: string): string {
  const code = DEPARTAMENTO_CODIGO[normalizarDepartamento(departamento)];
  return code || '';
}

/**
 * Mapa invertido: de '01'..'09' a la clave del departamento (e.g., 'LA_PAZ')
 */
const CODIGO_A_DEPARTAMENTO: Record<string, string> = Object.entries(DEPARTAMENTO_CODIGO).reduce(
  (acc, [key, val]) => {
    acc[val] = key;
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * Obtener Departamento a partir de un código numérico (toma los primeros 2 dígitos)
 */
export function getDepartamentoPorCodigoNumerico(codigo?: string | null): Departamento | undefined {
  if (!codigo) return undefined;
  const two = String(codigo).slice(0, 2);
  const key = CODIGO_A_DEPARTAMENTO[two];
  return key ? DEPARTAMENTOS[key] : undefined;
}
