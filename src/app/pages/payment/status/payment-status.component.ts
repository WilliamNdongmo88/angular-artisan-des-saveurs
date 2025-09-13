import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports:[CommonModule, FormsModule],
  templateUrl: './payment-status.component.html',
  styleUrls: ['./payment-status.component.scss']
})
export class PaymentStatusComponent implements OnInit {
  status: 'success' | 'cancelled' | 'error' | 'loading' = 'loading';
  message = '';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.route.url.subscribe(segments => {
      const path = segments[segments.length - 1]?.path;
      
      switch (path) {
        case 'success':
          this.handleSuccess();
          break;
        case 'cancel':
          this.handleCancel();
          break;
        case 'error':
          this.handleError();
          break;
        default:
          this.router.navigate(['/payment']);
      }
    });
  }

  private handleSuccess(): void {
    this.route.queryParams.subscribe(params => {
      if (params['paymentId'] && params['PayerID']) {
        this.paymentService.executePayment({
          paymentId: params['paymentId'],
          PayerID: params['PayerID']
        }).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.status = response.success ? 'success' : 'error';
            this.message = response.message;
          },
          error: (error) => {
            this.isLoading = false;
            this.status = 'error';
            this.message = error.message || 'Erreur lors de l\'exécution du paiement';
          }
        });
      } else {
        this.isLoading = false;
        this.status = 'error';
        this.message = 'Paramètres de paiement manquants';
      }
    });
  }

  private handleCancel(): void {
    this.paymentService.cancelPayment().subscribe({
      next: (status) => {
        this.isLoading = false;
        this.status = 'cancelled';
        this.message = status.message;
      },
      error: (error) => {
        this.isLoading = false;
        this.status = 'error';
        this.message = error.message || 'Erreur lors de l\'annulation';
      }
    });
  }

  private handleError(): void {
    this.paymentService.handlePaymentError().subscribe({
      next: (status) => {
        this.isLoading = false;
        this.status = 'error';
        this.message = status.message;
      },
      error: (error) => {
        this.isLoading = false;
        this.status = 'error';
        this.message = error.message || 'Une erreur est survenue';
      }
    });
  }

  goBackToPayment(): void {
    this.router.navigate(['/payment']);
  }

  getStatusIcon(): string {
    switch (this.status) {
      case 'success':
        return '✓';
      case 'cancelled':
        return '⚠';
      case 'error':
        return '✗';
      default:
        return '';
    }
  }

  getStatusClass(): string {
    return `status-${this.status}`;
  }
}
