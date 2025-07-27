import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

export interface OrderData {
  subtotal: number;
  discount: number;
  total: number;
  freeShipping: boolean;
}

export interface OrderFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-modal.component.html',
  styleUrl: './order-modal.component.scss'
})
export class OrderModalComponent implements OnInit {
  @Input() orderData!: OrderData;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() submitOrderEvent = new EventEmitter<OrderFormData>();

  orderForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.orderForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  onSubmit() {
    if (this.orderForm.valid) {
      this.isSubmitting = true;
      
      const formData: OrderFormData = this.orderForm.value;
      
      // Simuler un délai de traitement
      setTimeout(() => {
        this.submitOrderEvent.emit(formData);
        this.isSubmitting = false;
        
        // Afficher un toast de confirmation
        this.toastr.success(
          `Merci ${formData.firstName} ! Votre commande de ${this.orderData.total.toFixed(2)}€ a été envoyée avec succès.`,
          'Commande confirmée !',
          {
            timeOut: 5000,
            progressBar: true,
            closeButton: true
          }
        );
        
        this.closeModal();
      }, 1500);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.orderForm.controls).forEach(key => {
        this.orderForm.get(key)?.markAsTouched();
      });
      
      this.toastr.error(
        'Veuillez corriger les erreurs dans le formulaire',
        'Formulaire invalide',
        {
          timeOut: 3000
        }
      );
    }
  }
}

