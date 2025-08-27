import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  LoginRequest,
  SignupRequest,
  JwtResponse,
  MessageResponse,
  EmailRequest,
  ResetPasswordRequest,
  AuthUser
} from '../models/auth.models';
import { Users } from '../models/user';
import { MyFile } from '../models/product.models';

//const AUTH_API = 'http://localhost:8070/api/auth/';
const AUTH_API = 'https://artisan-des-saveurs-production.up.railway.app/api/auth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private jwtHelper = new JwtHelperService();
  private currentUserSubject: BehaviorSubject<AuthUser | null>;
  public currentUser: Observable<AuthUser | null>;
  user = signal<Users | undefined| null>(undefined);
  isDashboard = signal(false);

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<AuthUser | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<JwtResponse> {
    this.isDashboard.set(true);
    return this.http.post<JwtResponse>(AUTH_API + 'signin', credentials, httpOptions)
      .pipe(map(response => {
        // Stocker les détails de l'utilisateur et le token JWT dans le localStorage
        const user: AuthUser = {
          id: response.id,
          username: response.username,
          email: response.email,
          roles: response.roles,
          token: response.accessToken,
          refreshToken: response.refreshToken // <-- Ajout du refresh token
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('refreshToken', response.refreshToken); // <-- Stocker le refresh token séparément
        // Mettre à jour le BehaviorSubject avec l'utilisateur connecté
        this.currentUserSubject.next(user);
        //console.log('[AuthService] currentUser :: ', this.currentUserValue);
        return response;
      }));
  }

  register(user: SignupRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(AUTH_API + 'signup', user, httpOptions);
  }

  logout(): void {
    // Supprimer l'utilisateur du localStorage et mettre à jour le currentUser
    localStorage.removeItem('currentUser');
    localStorage.removeItem('refreshToken'); // <-- Supprimer le refresh token
    this.currentUserSubject.next(null);
  }

  activateAccount(token: string): Observable<MessageResponse> {
    return this.http.get<MessageResponse>(`${AUTH_API}activate?token=${token}`);
  }

  resendActivation(emailRequest: EmailRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(AUTH_API + 'resend-activation', emailRequest, httpOptions);
  }

  forgotPassword(emailRequest: EmailRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(AUTH_API + 'forgot-password', emailRequest, httpOptions);
  }

  resetPassword(resetRequest: ResetPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(AUTH_API + 'reset-password', resetRequest, httpOptions);
  }

  getAvatars(id: number): Observable<MyFile> {
    return this.http.get<MyFile>(AUTH_API + `avatar/${id}`);
  }

  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.includes(role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  getToken(): string | null {
    const user = this.currentUserValue;
    return user ? user.token : null;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    // console.log('[AuthService] isAuthenticated check, token :: ', token);
    // console.log('[AuthService] isAuthenticated check, currentUserValue :: ', this.currentUserValue);
    // console.log('[AuthService] isAuthenticated check, isTokenExpired :: ', token ? this.jwtHelper.isTokenExpired(token) : true);
    if (!token) {
      return false;
    }

    // Vérifie si le token est expiré
    return !this.jwtHelper.isTokenExpired(token);
  }

  // Méthode pour rafraîchir le token; Utilisé dans l'[interceptor] et le [guard]
  refreshToken(): Observable<any> {
    console.log('[AuthService] Tentative de rafraîchissement du token');
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      console.log('[AuthService] Refresh token trouvé, appel API pour rafraîchir le token');
      return this.http.post<any>(AUTH_API + 'refresh-token', { refreshToken }).pipe(
        tap(response => {
          console.log('[AuthService] Nouveau token reçu du serveur après rafraîchissement');
          // Mettre à jour le token et le refresh token dans le localStorage
          const user: AuthUser = {
            id: response.id,
            username: response.username,
            email: response.email,
            roles: response.roles,
            token: response.accessToken,
            refreshToken: response.refreshToken
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('refreshToken', response.refreshToken);
          this.currentUserSubject.next(user);
          console.log('[AuthService] currentUser mis à jour après rafraîchissement :: ', this.currentUserValue);
        }),
        map(() => true),//
        catchError(error => {
          console.error('[AuthService] Échec du rafraîchissement du token:', error);
          // En cas d'erreur (ex: refresh token invalide), déconnecter l'utilisateur
          this.logout();
          return throwError(() => error);
        })
      );
    } else {
      console.warn('[AuthService] Aucun refresh token disponible, impossible de rafraîchir le token');
      // Pas de refresh token, déconnecter l'utilisateur
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }
  }

  // Méthode helper pour extraire les infos utilisateur du TOKEN
  extractUserFromToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    //console.log('[AuthService] payload '+  JSON.stringify(payload));
      const newLocal = {
        id:payload.id,
        firstName: payload.firstname,
        lastName: payload.lastname,
        phone: payload.phone,
        email: payload.email,
        actif: true,
        role: payload.role,
        avatar: payload.avatar,
      };
      this.user.set(newLocal);
      //console.log('[AuthService] this.userGoogle '+  JSON.stringify(this.user()));
      } catch (e) {
        console.error('Erreur de décodage du token', e);
      }
  }

  getUser() {
    return this.user();
  }
}