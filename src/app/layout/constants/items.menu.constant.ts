import { PrimeIcons } from 'primeng/api';
import { USER_ROLES, rolesArray } from '@core/auth/config/roles.config';

/**
 * Estructura del menú con roles permitidos
 * - Si no tiene 'roles', es público (visible para todos)
 * - Si tiene 'roles', solo visible para esos roles
 */
export const ITEMS_MENU = [
  {
    label: 'Inicio',
    items: [
      {
        label: 'Dashboard',
        icon: PrimeIcons.HOME,
        routerLink: ['/dashboard'],
        // Visible para todos los autenticados (sin restricción de rol)
      },
      {
        label: 'Mi Perfil',
        icon: PrimeIcons.USER,
        routerLink: ['/profile'],
        // Visible para todos los autenticados
      },
    ],
  },
  {
    label: 'Administración',
    roles: rolesArray(USER_ROLES.ADMIN, USER_ROLES.JEFE),
    items: [
      {
        label: 'Usuarios',
        icon: PrimeIcons.USERS,
        routerLink: ['/admin/users'],
        roles: rolesArray(USER_ROLES.ADMIN),
      },
      {
        label: 'EPSAs',
        icon: PrimeIcons.BUILDING,
        routerLink: ['/admin/epsas'],
        roles: rolesArray(USER_ROLES.ADMIN),
      },
      {
        label: 'Configuración',
        icon: PrimeIcons.COG,
        routerLink: ['/admin/config'],
        roles: rolesArray(USER_ROLES.ADMIN),
      },
    ],
  },
  {
    label: 'Mi EPSA',
    roles: rolesArray(USER_ROLES.EPSA, USER_ROLES.TECNICO),
    items: [
      {
        label: 'Mis Datos',
        icon: PrimeIcons.DATABASE,
        routerLink: ['/mi-epsa/datos'],
        roles: rolesArray(USER_ROLES.EPSA, USER_ROLES.TECNICO),
      },
      {
        label: 'Reportes',
        icon: PrimeIcons.FILE_PDF,
        routerLink: ['/mi-epsa/reportes'],
        roles: rolesArray(USER_ROLES.EPSA, USER_ROLES.TECNICO),
      },
    ],
  },
  {
    label: 'Reportes',
    roles: rolesArray(USER_ROLES.ADMIN, USER_ROLES.JEFE),
    items: [
      {
        label: 'Consolidados',
        icon: PrimeIcons.CHART_BAR,
        routerLink: ['/reportes/consolidados'],
        roles: rolesArray(USER_ROLES.ADMIN, USER_ROLES.JEFE),
      },
      {
        label: 'Aprobaciones',
        icon: PrimeIcons.CHECK_CIRCLE,
        routerLink: ['/reportes/aprobaciones'],
        roles: rolesArray(USER_ROLES.ADMIN, USER_ROLES.JEFE),
      },
    ],
  },
];
