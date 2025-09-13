// Interface correspondant à la classe PaymentDto Java
export interface PaymentDto {
  method: string;
  amount: number;
  currency: string;
  description: string;
}

// Interface pour la réponse de création de paiement
export interface PaymentResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

// Interface pour les paramètres de succès de paiement
export interface PaymentSuccessParams {
  paymentId: string;
  PayerID: string;
}

// Interface pour la réponse de succès de paiement
export interface PaymentExecutionResponse {
  success: boolean;
  message: string;
}

// Énumération pour les méthodes de paiement
export enum PaymentMethod {
  PAYPAL = 'paypal',
  CREDIT_CARD = 'credit_card'
}

// Énumération pour les devises
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// Interface pour l'état du paiement
export interface PaymentStatus {
  status: 'pending' | 'approved' | 'cancelled' | 'failed';
  message: string;
}