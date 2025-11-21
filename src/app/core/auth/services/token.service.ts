/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { TokenPayload } from '../interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly REMEMBER_ME_KEY = 'remember_me';

  // Obtener el storage correcto según rememberMe
  private getStorage(): Storage {
    const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
    return rememberMe ? localStorage : sessionStorage;
  }

  // Establecer preferencia de rememberMe
  setRememberMe(remember: boolean): void {
    if (remember) {
      localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(this.REMEMBER_ME_KEY);
    }
  }

  // Gestión de Access Token
  setAccessToken(token: string): void {
    const storage = this.getStorage();
    storage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    // Buscar primero en localStorage, luego en sessionStorage
    return (
      localStorage.getItem(this.ACCESS_TOKEN_KEY) || sessionStorage.getItem(this.ACCESS_TOKEN_KEY)
    );
  }

  removeAccessToken(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  // Gestión de Refresh Token
  setRefreshToken(token: string): void {
    const storage = this.getStorage();
    storage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    // Buscar primero en localStorage, luego en sessionStorage
    return (
      localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY)
    );
  }

  removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Métodos de utilidad para JWT
  decodeToken(token: string): TokenPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded) as TokenPayload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  isTokenExpiringSoon(token: string, thresholdMinutes = 5): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    const thresholdTime = currentTime + thresholdMinutes * 60;
    return payload.exp < thresholdTime;
  }

  getTokenExpirationDate(token: string): Date | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;

    return new Date(payload.exp * 1000);
  }

  // Limpieza completa
  clearAllTokens(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
    localStorage.removeItem(this.REMEMBER_ME_KEY);
  }

  // Verificar si hay tokens válidos
  hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    return (
      !!(accessToken && !this.isTokenExpired(accessToken)) ||
      !!(refreshToken && !this.isTokenExpired(refreshToken))
    );
  }

  // Obtener información del usuario desde el token
  getUserInfoFromToken(): Partial<TokenPayload> | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    return payload
      ? {
        sub: payload.sub,
        email: payload.email,
        roles: payload.roles,
        permissions: payload.permissions,
      }
      : null;
  }

  // Debug info
  debugTokenInfo(): void {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    console.group('🔑 Token Debug Info');
    console.log('Access Token:', accessToken ? 'Present' : 'Missing');
    console.log('Refresh Token:', refreshToken ? 'Present' : 'Missing');

    if (accessToken) {
      console.log('Access Token Expired:', this.isTokenExpired(accessToken));
      console.log('Token Expires:', this.getTokenExpirationDate(accessToken));
      console.log('Token Payload:', this.decodeToken(accessToken));
    }
    console.groupEnd();
  }
}
