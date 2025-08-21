import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { last, map } from 'rxjs/operators';
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

//const AUTH_API = 'http://localhost:8070/api/auth/';
const AUTH_API = 'https://artisan-des-saveurs-production.up.railway.app/auth/';

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
          token: response.accessToken
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Mettre à jour le BehaviorSubject avec l'utilisateur connecté
        this.currentUserSubject.next(user);
        console.log('[AuthService] currentUser :: ', this.currentUserValue);
        return response;
      }));
  }

  register(user: SignupRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(AUTH_API + 'signup', user, httpOptions);
  }

  logout(): void {
    // Supprimer l'utilisateur du localStorage et mettre à jour le currentUser
    localStorage.removeItem('currentUser');
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

  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    // Vérifie si le token est expiré
    return !this.jwtHelper.isTokenExpired(token);
  }

  // Méthode helper pour extraire les infos utilisateur du TOKEN
  extractUserFromToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('[AuthService] payload '+  JSON.stringify(payload));
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
      console.log('[AuthService] this.userGoogle '+  JSON.stringify(this.user()));
      } catch (e) {
        console.error('Erreur de décodage du token', e);
      }
  }

  getUser() {
    return this.user();
  }
}


