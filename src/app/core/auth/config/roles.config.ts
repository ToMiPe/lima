/**
 * Configuración de Roles y Permisos para MIRAR
 * Define la jerarquía y permisos de cada tipo de usuario
 */

import { UserRole } from '../interfaces/auth.interfaces';

/**
 * Constantes de roles para fácil acceso
 */
export const USER_ROLES = {
  ADMIN: 'admin' as UserRole,
  JEFE: 'jefe' as UserRole,
  TECNICO: 'tecnico' as UserRole,
  EPSA: 'epsa' as UserRole,
} as const;

/**
 * Helper para crear arrays de roles con type safety
 * Evita el uso de 'as UserRole[]' en cada definición
 *
 * @example
 * roles: rolesArray(USER_ROLES.ADMIN, USER_ROLES.JEFE)
 */
export const rolesArray = <T extends UserRole[]>(...roles: T): T => roles;

export interface RolePermissions {
  role: UserRole;
  description: string;
  permissions: {
    // Recursos del sistema
    dashboard: ('view' | 'export')[];
    epsas: ('view' | 'create' | 'update' | 'delete' | 'assign')[];
    tecnicos: ('view' | 'create' | 'update' | 'delete' | 'assign')[];
    reportes: ('view' | 'create' | 'export' | 'approve')[];
    usuarios: ('view' | 'create' | 'update' | 'delete')[];
    configuracion: ('view' | 'update')[];
    seguimientos: ('view' | 'create' | 'update' | 'delete')[];
    datos_epsa: ('view' | 'create' | 'update' | 'delete')[];
  };
}

/**
 * ⚠️ PERMISOS POR DEFECTO PARA ROLES DESCONOCIDOS
 * Cuando el backend envía un rol nuevo que no está configurado,
 * se aplican estos permisos restrictivos por seguridad.
 *
 * 💡 Cuando un rol nuevo se vuelva permanente, configúralo en ROLE_PERMISSIONS
 */
const DEFAULT_PERMISSIONS: RolePermissions = {
  role: 'unknown',
  description: 'Rol desconocido - Permisos mínimos por seguridad',
  permissions: {
    dashboard: ['view'], // Solo ver dashboard básico
    epsas: [],
    tecnicos: [],
    reportes: ['view'], // Solo lectura de reportes
    usuarios: [],
    configuracion: [],
    seguimientos: [],
    datos_epsa: [],
  },
};

/**
 * Matriz de permisos por rol
 *
 * ✅ DINÁMICO: Roles nuevos del backend funcionarán con DEFAULT_PERMISSIONS
 * 💡 Agrega configuración aquí cuando un rol nuevo se vuelva permanente
 */
export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  // ========================================
  // ADMIN - Acceso total al sistema
  // ========================================
  admin: {
    role: USER_ROLES.ADMIN,
    description: 'Administrador del sistema - Acceso total',
    permissions: {
      dashboard: ['view', 'export'],
      epsas: ['view', 'create', 'update', 'delete', 'assign'],
      tecnicos: ['view', 'create', 'update', 'delete', 'assign'],
      reportes: ['view', 'create', 'export', 'approve'],
      usuarios: ['view', 'create', 'update', 'delete'],
      configuracion: ['view', 'update'],
      seguimientos: ['view', 'create', 'update', 'delete'],
      datos_epsa: ['view', 'create', 'update', 'delete'],
    },
  },

  // ========================================
  // JEFE DE ÁREA - Vista general y reportes
  // ========================================
  jefe: {
    role: USER_ROLES.JEFE,
    description: 'Jefe de Área AAPS - Vista general y reportes del sistema',
    permissions: {
      dashboard: ['view', 'export'], // Ve dashboard completo
      epsas: ['view'], // Solo lectura de EPSAs
      tecnicos: ['view'], // Solo lectura de técnicos
      reportes: ['view', 'export', 'approve'], // Puede aprobar reportes
      usuarios: ['view'], // Solo lectura de usuarios
      configuracion: ['view'], // Solo lectura de configuración
      seguimientos: ['view'], // Ve todos los seguimientos
      datos_epsa: ['view'], // Ve datos de todas las EPSAs
    },
  },

  // ========================================
  // TÉCNICO - Seguimiento de EPSAs asignadas
  // ========================================
  tecnico: {
    role: USER_ROLES.TECNICO,
    description: 'Técnico AAPS - Seguimiento de EPSAs asignadas',
    permissions: {
      dashboard: ['view'], // Dashboard básico
      epsas: ['view'], // Ve solo EPSAs asignadas (se valida con 'own')
      tecnicos: [], // No puede ver otros técnicos
      reportes: ['view', 'create'], // Crea reportes de sus EPSAs
      usuarios: [], // No puede gestionar usuarios
      configuracion: [], // No puede ver configuración
      seguimientos: ['view', 'create', 'update'], // CRUD en sus EPSAs asignadas
      datos_epsa: ['view', 'update'], // Ve y edita datos de EPSAs asignadas
    },
  },

  // ========================================
  // EPSA - Gestión de datos propios
  // ========================================
  epsa: {
    role: USER_ROLES.EPSA,
    description: 'Usuario EPSA - Gestión de datos de su propia EPSA',
    permissions: {
      dashboard: ['view'], // Dashboard básico con sus datos
      epsas: [], // No ve otras EPSAs
      tecnicos: [], // No ve técnicos
      reportes: ['view', 'create'], // Crea reportes de su EPSA
      usuarios: [], // No gestiona usuarios
      configuracion: [], // No ve configuración
      seguimientos: ['view'], // Ve seguimientos de su EPSA
      datos_epsa: ['view', 'create', 'update'], // CRUD completo de SUS datos
    },
  },
};

/**
 * Obtiene los permisos de un rol
 * ✅ Si el rol no existe, devuelve permisos por defecto
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role] ?? DEFAULT_PERMISSIONS;
}

/**
 * Verifica si un rol tiene un permiso específico
 * ✅ Roles desconocidos usan permisos por defecto
 */
export function hasRolePermission(
  role: UserRole,
  resource: keyof RolePermissions['permissions'],
  action: string,
): boolean {
  const rolePermissions = getRolePermissions(role);
  const resourcePermissions = rolePermissions.permissions[resource] as string[];
  return resourcePermissions?.includes(action) ?? false;
}

/**
 * Helper para obtener todos los permisos de un rol en formato ABAC
 */
export function getRolePermissionsAsABAC(role: UserRole): string[] {
  const rolePermissions = getRolePermissions(role); // ✅ Usa la función con fallback
  const abacPermissions: string[] = [];

  // Para cada recurso, generar permisos ABAC
  Object.entries(rolePermissions.permissions).forEach(([resource, actions]) => {
    (actions as string[]).forEach((action) => {
      // Determinar la condición (own vs all) según el rol
      const condition = role === USER_ROLES.TECNICO || role === USER_ROLES.EPSA ? 'own' : 'all';
      abacPermissions.push(`${resource}:${action}:${condition}`);
    });
  });

  return abacPermissions;
}
