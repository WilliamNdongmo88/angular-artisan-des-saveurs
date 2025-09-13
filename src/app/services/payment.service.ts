import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  PaymentDto, 
  PaymentResponse, 
  PaymentSuccessParams, 
  PaymentExecutionResponse,
  PaymentStatus 
} from '../models/payment';

// Interface pour la réponse de création de paiement du serveur
interface PaymentCreationResponse {
  success: boolean;
  approvalUrl?: string;
  paymentId?: string;
  error?: string;
}

// Interface pour la réponse d'exécution de paiement du serveur
interface PaymentExecutionServerResponse {
  success: boolean;
  message: string;
  paymentId?: string;
  payerId?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly baseUrl = 'http://localhost:8070/api/payment';

  constructor(private http: HttpClient) {}

  /**
   * Crée un nouveau paiement PayPal
   * @param paymentDto Les données du paiement
   * @returns Observable avec la réponse de création de paiement
   */
  createPayment(paymentDto: PaymentDto): Observable<PaymentResponse> {
    return this.http.post<PaymentCreationResponse>(`${this.baseUrl}/create`, paymentDto).pipe(
      map(response => {
        if (response.success && response.approvalUrl) {
          return {
            success: true,
            redirectUrl: response.approvalUrl,
            paymentId: response.paymentId
          } as PaymentResponse;
        } else {
          return {
            success: false,
            error: response.error || 'Erreur lors de la création du paiement'
          } as PaymentResponse;
        }
      }),
      catchError(error => {
        console.error('Erreur lors de la création du paiement:', error);
        let errorMessage = 'Erreur lors de la création du paiement';
        
        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => ({
          success: false,
          error: errorMessage
        } as PaymentResponse));
      })
    );
  }

  /**
   * Exécute le paiement après approbation PayPal
   * @param params Paramètres de succès du paiement
   * @returns Observable avec la réponse d'exécution
   */
  executePayment(params: PaymentSuccessParams): Observable<PaymentExecutionResponse> {
    const httpParams = new HttpParams()
      .set('paymentId', params.paymentId)
      .set('PayerID', params.PayerID);

    return this.http.get<PaymentExecutionServerResponse>(`${this.baseUrl}/success`, { 
      params: httpParams
    }).pipe(
      map(response => {
        return {
          success: response.success,
          message: response.message,
          paymentId: response.paymentId,
          payerId: response.payerId,
          status: response.status
        } as PaymentExecutionResponse;
      }),
      catchError(error => {
        console.error('Erreur lors de l\'exécution du paiement:', error);
        let errorMessage = 'Erreur lors de l\'exécution du paiement';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => ({
          success: false,
          message: errorMessage
        } as PaymentExecutionResponse));
      })
    );
  }

  /**
   * Gère l'annulation du paiement
   * @returns Observable avec le statut d'annulation
   */
  cancelPayment(): Observable<PaymentStatus> {
    return this.http.get<any>(`${this.baseUrl}/cancel`).pipe(
      map(response => ({
        status: 'cancelled' as const,
        message: response.message || 'Paiement annulé'
      } as PaymentStatus)),
      catchError(error => {
        console.error('Erreur lors de l\'annulation du paiement:', error);
        return throwError(() => ({
          status: 'failed' as const,
          message: 'Erreur lors de l\'annulation du paiement'
        } as PaymentStatus));
      })
    );
  }

  /**
   * Gère les erreurs de paiement
   * @returns Observable avec le statut d'erreur
   */
  handlePaymentError(): Observable<PaymentStatus> {
    return this.http.get<any>(`${this.baseUrl}/error`).pipe(
      map(response => ({
        status: 'failed' as const,
        message: response.message || 'Une erreur est survenue lors du traitement du paiement'
      } as PaymentStatus)),
      catchError(error => {
        console.error('Erreur lors de la gestion d\'erreur de paiement:', error);
        return throwError(() => ({
          status: 'failed' as const,
          message: 'Une erreur est survenue lors du traitement du paiement'
        } as PaymentStatus));
      })
    );
  }

  /**
   * Redirige vers l'URL d'approbation PayPal
   * @param approvalUrl URL d'approbation PayPal
   */
  redirectToPayPal(approvalUrl: string): void {
    // Utiliser window.open ou window.location.href selon vos besoins
    // window.open(approvalUrl, '_blank'); // Ouvre dans un nouvel onglet
    window.location.href = approvalUrl; // Redirige dans la même fenêtre
  }

  /**
   * Valide les données de paiement avant envoi
   * @param paymentDto Les données à valider
   * @returns true si valide, false sinon
   */
  validatePaymentData(paymentDto: PaymentDto): boolean {
    if (!paymentDto.method || !paymentDto.amount || !paymentDto.currency) {
      return false;
    }
    
    if (paymentDto.amount <= 0) {
      return false;
    }
    
    if (!paymentDto.description || paymentDto.description.trim().length === 0) {
      return false;
    }
    
    return true;
  }

  /**
   * Extrait les paramètres de l'URL de retour PayPal
   * @param url URL de retour
   * @returns Paramètres extraits
   */
  extractPaymentParamsFromUrl(url: string): PaymentSuccessParams | null {
    try {
      const urlObj = new URL(url);
      const paymentId = urlObj.searchParams.get('paymentId');
      const payerId = urlObj.searchParams.get('PayerID');
      
      if (paymentId && payerId) {
        return { paymentId, PayerID: payerId };
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction des paramètres:', error);
    }
    
    return null;
  }
}
