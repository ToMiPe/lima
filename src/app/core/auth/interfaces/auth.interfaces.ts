// ============================================
// SISTEMA DE ROLES DINÁMICOS
// ============================================

/**
 * Roles conocidos del sistema (para type safety y autocompletado)
 * Estos son los roles que actualmente conocemos, pero el sistema
 * acepta cualquier rol que venga del backend.
 */
export type KnownRole = 'admin' | 'jefe' | 'tecnico' | 'epsa';

/**
 * UserRole acepta cualquier string del backend
 * Esto permite que roles nuevos funcionen automáticamente
 */
export type UserRole = string;

/**
 * Lista de roles conocidos (NO es una lista restrictiva)
 * Solo se usa para:
 * - Autocompletado en el IDE
 * - Logs de advertencia cuando llegan roles nuevos
 * - Configuración de permisos por defecto
 */
export const KNOWN_ROLES: readonly KnownRole[] = ['admin', 'jefe', 'tecnico', 'epsa'] as const;

/**
 * Roles técnicos de Keycloak que deben ser excluidos
 * Estos roles son internos de Keycloak y no son roles de negocio
 */
export const KEYCLOAK_SYSTEM_ROLES = [
  'offline_access',
  'uma_authorization',
  'default-roles-aaps',
  'default-roles-mirar',
] as const;

/**
 * Verifica si un rol es conocido por el sistema
 * @param role - El rol a verificar
 * @returns true si el rol está en KNOWN_ROLES
 */
export function isKnownRole(role: string): role is KnownRole {
  return KNOWN_ROLES.includes(role as KnownRole);
}

// Permisos granulares (ABAC)
export enum PermissionAction {
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  APPROVE = 'approve',
}

// Respuesta del usuario desde el backend (formato actualizado)
export interface BackendUser {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  name: string; // Nombre completo (firstName + lastName)
  roles: string[];
}

// Usuario transformado para uso interno
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  name: string; // Nombre completo calculado (firstName + lastName)
  roles: UserRole[];
  emailVerified: boolean;
  epsas?: string[]; // EPSAs asignadas
  permissions?: Record<string, PermissionAction[]>; // Permisos por EPSA
  isActive?: boolean;
  avatar?: string;
  lastLogin?: Date;
}

// Lo que enviamos al backend (solo username y password)
export interface BackendLoginRequest {
  username: string;
  password: string;
}

// Lo que maneja el frontend internamente (incluye rememberMe)
export interface LoginRequest {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

// Estructura de datos devuelta por el backend
export interface BackendAuthData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  user: BackendUser;
}

// Respuesta completa del backend
export interface BackendAuthResponse {
  statusCode: number;
  message: string;
  data: BackendAuthData;
  timestamp: string;
  path: string;
}

// Respuesta transformada para uso interno
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface TokenPayload {
  sub: string; // user id
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

// Respuesta del perfil del usuario
export interface UserProfileResponse {
  success: boolean;
  data: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
    epsas: string[];
    permissions: Record<string, PermissionAction[]>; // Permisos por EPSA
  };
}

// Actualizar perfil del usuario
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface UpdateProfileResponse {
  statusCode: number;
  message: string;
  data?: {
    success: boolean;
    message: string;
    updatedFields: string[];
    user?: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      emailVerified: boolean;
      roles?: string[];
    };
  };
  timestamp: string;
  path: string;
}

// Cambiar contraseña
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
