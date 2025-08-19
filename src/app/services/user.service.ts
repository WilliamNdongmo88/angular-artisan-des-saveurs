import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Orders } from '../models/order';

// Interfaces pour les données utilisateur
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface UserPreferences {
  emailPromotions: boolean;
  emailOrderUpdates: boolean;
  emailNewProducts: boolean;
  language: string;
  currency: string;
}

export interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
}

export interface Address {
  id?: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  //private apiUrl = 'http://localhost:8070/api/users';
  private apiUrl = 'https://artisan-des-saveurs-production.up.railway.app/api/';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Subject pour les mises à jour en temps réel
  private userDataSubject = new BehaviorSubject<any>(null);
  public userData$ = this.userDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Récupérer les informations utilisateur complètes
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, this.httpOptions);
  }

  // Mettre à jour les informations personnelles
  updatePersonalInfo(personalInfo: PersonalInfo): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(`${this.apiUrl+'users'}/personal-info`, personalInfo, this.httpOptions)
        .subscribe({
          next: (response) => {
            this.userDataSubject.next(response);
            resolve(response);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour des informations personnelles:', error);
            reject(error);
          }
        });
    });
  }

  // Changer le mot de passe
  updatePassword(currentPassword: string, newPassword: string): Promise<any> {
    const passwordData: PasswordUpdate = {
      currentPassword,
      newPassword
    };

    return new Promise((resolve, reject) => {
      this.http.put(`${this.apiUrl}/password`, passwordData, this.httpOptions)
        .subscribe({
          next: (response) => {
            resolve(response);
          },
          error: (error) => {
            console.error('Erreur lors du changement de mot de passe:', error);
            reject(error);
          }
        });
    });
  }

  // Mettre à jour les préférences utilisateur
  updatePreferences(preferences: UserPreferences): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(`${this.apiUrl}/preferences`, preferences, this.httpOptions)
        .subscribe({
          next: (response) => {
            this.userDataSubject.next(response);
            resolve(response);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour des préférences:', error);
            reject(error);
          }
        });
    });
  }

  // Upload de l'avatar
  uploadAvatar(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('avatar', file);

      // Headers spéciaux pour l'upload de fichier
      const uploadOptions = {
        headers: new HttpHeaders({
          // Ne pas définir Content-Type pour les FormData, le navigateur le fait automatiquement
        })
      };

      this.http.post(`${this.apiUrl}/avatar`, formData, uploadOptions)
        .subscribe({
          next: (response: any) => {
            const avatarUrl = response.avatarUrl || response.url;
            this.userDataSubject.next({ ...this.userDataSubject.value, avatar: avatarUrl });
            resolve(avatarUrl);
          },
          error: (error) => {
            console.error('Erreur lors de l\'upload de l\'avatar:', error);
            reject(error);
          }
        });
    });
  }

  // Gestion des adresses
  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}addresses`, this.httpOptions);
  }

  addAddress(address: Address): Promise<Address> {
    return new Promise((resolve, reject) => {
      this.http.post<Address>(`${this.apiUrl}addresses`, address, this.httpOptions)
        .subscribe({
          next: (response) => {
            resolve(response);
          },
          error: (error) => {
            console.error('Erreur lors de l\'ajout de l\'adresse:', error);
            reject(error);
          }
        });
    });
  }

  updateAddress(addressId: string, address: Address): Promise<Address> {
    return new Promise((resolve, reject) => {
      this.http.put<Address>(`${this.apiUrl}/addresses/${addressId}`, address, this.httpOptions)
        .subscribe({
          next: (response) => {
            resolve(response);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour de l\'adresse:', error);
            reject(error);
          }
        });
    });
  }

  deleteAddress(addressId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.apiUrl}/addresses/${addressId}`, this.httpOptions)
        .subscribe({
          next: () => {
            resolve();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression de l\'adresse:', error);
            reject(error);
          }
        });
    });
  }

  // Récupérer l'historique des commandes
  getOrderHistory(id: number): Observable<Orders[]> {
    return this.http.get<Orders[]>(`${this.apiUrl+'orders'}/${id}`, this.httpOptions);
  }

  // Supprimer le compte utilisateur
  deleteAccount(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.apiUrl}/account`, this.httpOptions)
        .subscribe({
          next: () => {
            this.userDataSubject.next(null);
            resolve();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression du compte:', error);
            reject(error);
          }
        });
    });
  }

  // Méthodes utilitaires
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Validation côté client
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Formatage des données
  formatPhoneNumber(phone: string): string {
    // Supprimer tous les caractères non numériques sauf le +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Formater selon le format français si c'est un numéro français
    if (cleaned.startsWith('+33') || (cleaned.startsWith('0') && cleaned.length === 10)) {
      const number = cleaned.startsWith('+33') ? cleaned.slice(3) : cleaned.slice(1);
      return `+33 ${number.slice(0, 1)} ${number.slice(1, 3)} ${number.slice(3, 5)} ${number.slice(5, 7)} ${number.slice(7, 9)}`;
    }
    
    return phone;
  }

  // Gestion du cache local
  cacheUserData(userData: any): void {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  getCachedUserData(): any {
    const cached = localStorage.getItem('userData');
    return cached ? JSON.parse(cached) : null;
  }

  clearUserCache(): void {
    localStorage.removeItem('userData');
  }
}