import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import {
  User,
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  BackendAuthResponse,
  BackendLoginRequest,
  UserRole,
  PermissionAction,
  UserProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  isKnownRole,
  KEYCLOAK_SYSTEM_ROLES,
} from '../interfaces/auth.interfaces';
import { environment } from 'src/environments/environment';
import { TokenService } from './token.service';

interface JWTPayload {
  sub: string;
  preferred_username: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  email_verified: boolean;
  realm_access: {
    roles: string[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);

  // Signals para el estado
  private readonly _user = signal<User | null>(null);
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _isLoading = signal<boolean>(false);

  // Computed signals (readonly)
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Computed para información derivada
  readonly userRoles = computed(() => this._user()?.roles ?? []);
  readonly isAdmin = computed(() => this.userRoles().includes('admin'));

  private readonly API_URL = `${environment.URL}/v1/auth`;

  constructor() {
    this.initializeAuth();
  }

  /**
   * Inicializar autenticación desde tokens guardados
   */
  private initializeAuth(): void {
    const token = this.tokenService.getAccessToken();
    if (token) {
      try {
        const user = this.decodeToken(token);
        this._user.set(user);
        this._isAuthenticated.set(true);

        // Cargar perfil en background (EPSAs y permisos)
        // Se ejecuta de forma asíncrona sin bloquear la UI
        this.loadUserProfile().subscribe({
          next: () => console.log(' Perfil cargado en inicialización'),
          error: (err) => console.error(' Error cargando perfil en inicialización:', err),
        });
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Login del usuario
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this._isLoading.set(true);

    // Guardar preferencia de rememberMe
    if (credentials.rememberMe !== undefined) {
      this.tokenService.setRememberMe(credentials.rememberMe);
    }

    // Transformar el payload del frontend al formato que espera el backend
    const backendPayload: BackendLoginRequest = {
      username: credentials.emailOrUsername,
      password: credentials.password,
    };

    return this.http.post<BackendAuthResponse>(`${this.API_URL}/login`, backendPayload).pipe(
      map((backendResponse) => this.transformBackendResponse(backendResponse)),
      tap((response) => {
        this.setAuthData(response);
        // Cargar perfil en background después del login (EPSAs y permisos)
        this.loadUserProfile().subscribe({
          next: () => console.log(' Perfil cargado después de login'),
          error: (err) => console.error(' Error cargando perfil después de login:', err),
        });
      }),
      tap(() => this._isLoading.set(false)),
      catchError((error) => {
        this._isLoading.set(false);
        return throwError(() => error);
      }),
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    this._isLoading.set(true);

    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData).pipe(
      tap((response) => {
        this.setAuthData(response);
        this._isLoading.set(false);
      }),
      catchError((error) => {
        this._isLoading.set(false);
        return throwError(() => error);
      }),
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/forgot-password`, { email });
  }

  logout(): void {
    this.tokenService.clearAllTokens();
    this._user.set(null);
    this._isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
      tap((response) => this.setAuthData(response)),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('Token refresh failed'));
      }),
    );
  }

  private setAuthData(response: AuthResponse): void {
    this.tokenService.setAccessToken(response.accessToken);
    this.tokenService.setRefreshToken(response.refreshToken);
    this._user.set(response.user);
    this._isAuthenticated.set(true);
  }

  /**
   * Cargar perfil completo del usuario (incluye EPSAs y permisos)
   * Se ejecuta automáticamente en initializeAuth() y después de login()
   */
  loadUserProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.API_URL}/keycloak/profile`).pipe(
      tap((response) => {
        if (response.success) {
          const currentUser = this._user();
          if (currentUser) {
            // Actualizar usuario con EPSAs, permisos y datos del perfil
            const fullName = `${response.data.firstName} ${response.data.lastName}`.trim();

            this._user.set({
              ...currentUser,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              name: fullName,
              email: response.data.email,
              epsas: response.data.epsas,
              permissions: response.data.permissions,
            });
          }
        }
      }),
      catchError((error) => {
        console.error('Error al cargar perfil:', error);
        return throwError(() => error);
      }),
    );
  }

  private clearAuthData(): void {
    this.tokenService.clearAllTokens();
    this._user.set(null);
    this._isAuthenticated.set(false);
  }

  /**
   * Decodificar JWT y extraer información del usuario
   */
  private decodeToken(token: string): User {
    const decoded = jwtDecode<JWTPayload>(token);

    // Extraer roles del realm_access
    const realmRoles = decoded.realm_access?.roles ?? [];

    //  FILTRAR roles técnicos de Keycloak (solo queremos roles de negocio)
    // Filtrar roles del sistema y convertir a minúsculas para consistencia
    const businessRoles = realmRoles
      .filter((role) => !(KEYCLOAK_SYSTEM_ROLES as readonly string[]).includes(role))
      .map((role) => role.toLowerCase()) as UserRole[];

    //  Advertir en consola sobre roles nuevos/desconocidos (solo roles de negocio)
    const unknownRoles = businessRoles.filter((role) => !isKnownRole(role));
    if (unknownRoles.length > 0) {
      console.warn(' Roles desconocidos detectados:', unknownRoles);
      console.warn(
        ' Estos roles funcionarán automáticamente, pero considera:',
        '\n  - Agregar configuración de permisos en roles.config.ts',
        '\n  - Actualizar KNOWN_ROLES si son roles permanentes',
      );
    }

    return {
      id: decoded.sub,
      username: decoded.preferred_username,
      email: decoded.email,
      firstName: decoded.given_name || '',
      lastName: decoded.family_name || '',
      name: decoded.name || `${decoded.given_name} ${decoded.family_name}`,
      roles: businessRoles, //  Solo roles de negocio (sin roles técnicos de Keycloak)
      emailVerified: decoded.email_verified,
      epsas: [], // Se llenará con loadUserProfile()
      permissions: {}, // Se llenará con loadUserProfile()
    };
  }

  /**
   * Transforma la respuesta del backend (snake_case) a nuestra estructura interna (camelCase)
   */
  private transformBackendResponse(backendResponse: BackendAuthResponse): AuthResponse {
    const { data } = backendResponse;

    // Decodificar el access_token para obtener información del usuario
    const user = this.decodeToken(data.access_token);

    // Retornar en formato camelCase
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      user,
    };
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    return this.userRoles().includes(role);
  }

  /**
   * Verificar si el usuario tiene alguno de los roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  /**
   * Verificar si el usuario tiene todos los roles
   */
  hasAllRoles(roles: UserRole[]): boolean {
    return roles.every((role) => this.hasRole(role));
  }

  /**
   * Verificar si el usuario tiene un permiso específico en una EPSA
   */
  hasPermission(epsaId: string, permission: PermissionAction): boolean {
    const userPermissions = this._user()?.permissions?.[epsaId] ?? [];
    return userPermissions.includes(permission);
  }

  /**
   * Verificar si el usuario tiene alguno de los permisos en una EPSA
   */
  hasAnyPermission(epsaId: string, permissions: PermissionAction[]): boolean {
    return permissions.some((perm) => this.hasPermission(epsaId, perm));
  }

  /**
   * Actualizar perfil del usuario (nombre)
   */
  updateProfile(data: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.http.patch<UpdateProfileResponse>(`${this.API_URL}/profile`, data).pipe(
      tap((response) => {
        // El backend retorna success dentro de data
        const isSuccess = response.data?.success;
        const updatedUser = response.data?.user;

        if (isSuccess && updatedUser) {
          const currentUser = this._user();

          if (currentUser) {
            // Actualizar el signal con los datos del backend
            const fullName = `${updatedUser.firstName} ${updatedUser.lastName}`.trim();

            this._user.set({
              ...currentUser,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              name: fullName,
              email: updatedUser.email,
              emailVerified: updatedUser.emailVerified,
              // Actualizar roles si vienen en la respuesta
              ...(updatedUser.roles && { roles: updatedUser.roles as UserRole[] }),
            });
          }
        }
      }),
      catchError((error) => {
        console.error('Error al actualizar perfil:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Cambiar contraseña del usuario
   */
  changePassword(data: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    return this.http.post<ChangePasswordResponse>(`${this.API_URL}/change-password`, data).pipe(
      catchError((error) => {
        console.error('Error al cambiar contraseña:', error);
        return throwError(() => error);
      }),
    );
  }
}
