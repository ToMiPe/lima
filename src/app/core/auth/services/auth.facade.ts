import { Injectable, inject, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthState } from './auth.state';
import { TokenService } from './token.service';
import {
  LoginRequest,
  AuthResponse,
  UserRole,
  PermissionAction,
  UserProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '../interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  private readonly authState = inject(AuthState);
  private readonly tokenService = inject(TokenService);

  // Exponer signals del AuthState
  readonly user = this.authState.user;
  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly isLoading = this.authState.isLoading;
  readonly userRoles = this.authState.userRoles;
  readonly isAdmin = this.authState.isAdmin;

  // Computed: nombre completo del usuario
  readonly userName = computed(() => {
    const user = this.user();
    return user?.name ?? '';
  });

  // Computed: EPSAs asignadas
  readonly userEpsas = computed(() => {
    const user = this.user();
    return user?.epsas ?? [];
  });

  // Métodos de autenticación
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.authState.login(credentials);
  }

  logout(): void {
    this.authState.logout();
  }

  refreshToken(): Observable<AuthResponse> {
    return this.authState.refreshToken();
  }

  /**
   * Cargar perfil completo del usuario (EPSAs y permisos)
   * Llamar después de que la app haya inicializado para evitar dependencias circulares
   */
  loadUserProfile(): Observable<UserProfileResponse> {
    return this.authState.loadUserProfile();
  }

  // Métodos de roles
  hasRole(role: UserRole): boolean {
    return this.authState.hasRole(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return this.authState.hasAnyRole(roles);
  }

  hasAllRoles(roles: UserRole[]): boolean {
    return this.authState.hasAllRoles(roles);
  }

  // Métodos de permisos por EPSA
  hasPermission(epsaId: string, permission: PermissionAction): boolean {
    return this.authState.hasPermission(epsaId, permission);
  }

  hasAnyPermission(epsaId: string, permissions: PermissionAction[]): boolean {
    return this.authState.hasAnyPermission(epsaId, permissions);
  }

  // Métodos de utilidad
  getUserEpsas(): string[] {
    return this.user()?.epsas ?? [];
  }

  getEpsaPermissions(epsaId: string): PermissionAction[] {
    return this.user()?.permissions?.[epsaId] ?? [];
  }

  canCreateRole(targetRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, UserRole[]> = {
      admin: ['admin', 'jefe', 'tecnico', 'epsa'],
      jefe: ['tecnico', 'epsa'],
      tecnico: ['epsa'],
      epsa: [],
    };

    const currentRoles = this.userRoles();

    // Si es admin, puede crear cualquier rol
    if (currentRoles.includes('admin')) {
      return roleHierarchy['admin'].includes(targetRole);
    }

    // Buscar el rol más alto que tenga el usuario
    const userHighestRole = currentRoles.find((role) => roleHierarchy[role]);

    if (!userHighestRole) {
      return false;
    }

    return roleHierarchy[userHighestRole].includes(targetRole);
  }

  debugAuth(): void {
    this.tokenService.debugTokenInfo();
    console.log('User:', this.user());
    console.log('Roles:', this.userRoles());
    console.log('EPSAs:', this.userEpsas());
  }

  /**
   * Actualizar perfil del usuario
   */
  updateProfile(data: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.authState.updateProfile(data);
  }

  /**
   * Cambiar contraseña del usuario
   */
  changePassword(data: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    return this.authState.changePassword(data);
  }
}
