import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { Currency, PaymentDto, PaymentMethod, PaymentSuccessParams } from '../../../models/payment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Énumérations pour les templates
  paymentMethods = Object.values(PaymentMethod);
  currencies = Object.values(Currency);

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.paymentForm = this.createPaymentForm();
  }

  ngOnInit(): void {
    // Vérifier si nous revenons d'une redirection PayPal
    this.route.queryParams.subscribe(params => {
      if (params['paymentId'] && params['PayerID']) {
        this.handlePaymentSuccess({
          paymentId: params['paymentId'],
          PayerID: params['PayerID']
        });
      } else if (params['cancelled']) {
        this.handlePaymentCancellation();
      } else if (params['error']) {
        this.handlePaymentError();
      }
    });
  }

  private createPaymentForm(): FormGroup {
    return this.fb.group({
      method: [PaymentMethod.PAYPAL, [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      currency: [Currency.EUR, [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  /**
   * Soumet le formulaire de paiement
   */
  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const paymentData: PaymentDto = this.paymentForm.value;

      // Validation côté client
      if (!this.paymentService.validatePaymentData(paymentData)) {
        this.errorMessage = 'Données de paiement invalides';
        this.isLoading = false;
        return;
      }

      this.paymentService.createPayment(paymentData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success && response.redirectUrl) {
            // Rediriger vers PayPal
            this.paymentService.redirectToPayPal(response.redirectUrl);
          } else {
            this.errorMessage = response.error || 'Erreur lors de la création du paiement';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error || 'Erreur lors de la création du paiement';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Gère le retour de succès de PayPal
   */
  private handlePaymentSuccess(params: PaymentSuccessParams): void {
    this.isLoading = true;
    this.paymentService.executePayment(params).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = response.message;
          this.resetForm();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Erreur lors de l\'exécution du paiement';
      }
    });
  }

  /**
   * Gère l'annulation du paiement
   */
  private handlePaymentCancellation(): void {
    this.paymentService.cancelPayment().subscribe({
      next: (status) => {
        this.errorMessage = status.message;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erreur lors de l\'annulation';
      }
    });
  }

  /**
   * Gère les erreurs de paiement
   */
  private handlePaymentError(): void {
    this.paymentService.handlePaymentError().subscribe({
      next: (status) => {
        this.errorMessage = status.message;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Une erreur est survenue';
      }
    });
  }

  /**
   * Marque tous les champs du formulaire comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.paymentForm.controls).forEach(key => {
      const control = this.paymentForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Remet à zéro le formulaire
   */
  private resetForm(): void {
    this.paymentForm.reset({
      method: PaymentMethod.PAYPAL,
      currency: Currency.EUR
    });
  }

  /**
   * Vérifie si un champ a une erreur et a été touché
   */
  hasError(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtient le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.paymentForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} est requis`;
      }
      if (field.errors['min']) {
        return `${fieldName} doit être supérieur à 0`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName} est trop long`;
      }
    }
    return '';
  }
}
