import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from "../loading-spinner/loading-spinner.component";
import { OrderPayload, Product } from '../../models/order';
import { CartItem, CartService } from '../../services/cart.service';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';

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
  
export interface ProductItem {
  productId: Product['id'];
  quantity: number;
}

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './order-modal.component.html',
  styleUrl: './order-modal.component.scss'
})
export class OrderModalComponent implements OnInit {
  @Input() orderData!: OrderData;
  @Input() isResponse: boolean = false;
  @Input() cartItems: CartItem[] = [];
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() clearCartEvent = new EventEmitter<void>();
  @Output() submitOrderEvent = new EventEmitter<OrderFormData>();
  private productIdItems: ProductItem[] = [];
  orderForm!: FormGroup;
  isSubmitting = false;
  isLoading = false;
  isUserConnected = false; // Pour cacher le formulaire si l'utilisateur est connecté
  isDisabled = false;
  user = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  };

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cartService: CartService,
    private authService: AuthService,
    
  ) {}

  ngOnInit() {
    this.initializeForm();
    //const data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const currentUser = this.authService.currentUserValue;
    //this.authService.isAuthenticated(); // Vérifie si le token est encore valide
    console.log('[OrderModalComponent] currentUser :: ', currentUser);
    if(currentUser)
    if (currentUser && currentUser.token) {
      this.isUserConnected = true;
      this.isDisabled = true; // Activer le mode désactivé si l'utilisateur est connecté
      console.log('[OrderModalComponent] isDisabled :: ', this.isDisabled);
      this.authService.extractUserFromToken(currentUser.token); // Restaure le user en mémoire
      console.log('[OrderModalComponent] currentUser :: ', this.authService.getUser());
      const userData = this.authService.getUser();
      if (userData) {
        this.user = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
        };
      }
    }
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

      const userData : User = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        consent: false,
        contactRequests: []
      };
      this.productIdItems = this.cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity
      }));
      const order: OrderPayload = {
        user: userData,
        items: this.cartItems,
        total: this.orderData.total,
        subtotal: this.orderData.subtotal,
        discount: this.orderData.discount,
        freeShipping: this.orderData.freeShipping
      };
      console.log('[OrderModalComponent] Commande soumise: ', order);
      //this.submitOrderEvent.emit(formData);

      // Envoi de la commande à l'API
      this.cartService.submitOrder(order).subscribe({
        next: (response) => {
          this.isResponse = true;
          const message = response.message;
          this.toastr.success(
            `Merci ${formData.firstName} ! Votre commande de ${this.orderData.total.toFixed(2)}€ a été envoyée avec succès.`,
            'Commande confirmée !',
            {
              timeOut: 5000,
              progressBar: true,
              closeButton: true
            }
          );
          window.scrollTo({ top: 0, behavior: 'smooth' });

          // Vider le panier après la commande
          this.clearCartEvent.emit();
          this.isSubmitting = false;
          this.closeModal();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.closeModal();
          this.toastr.error(
            `Une erreur est survenue. Veuillez rafréchir la page et réessayer svp.`,
            'Erreur',
            { timeOut: 4000 }
          );
          console.error('Erreur lors de la soumission de la commande:', error.error.message);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
    else if(this.isUserConnected){
      this.isSubmitting = true;
      const formData: OrderFormData = this.user;

      const userData : User = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        consent: false,
        contactRequests: []
      };
      console.log('[OrderModalComponent] userData :: ', userData);
      this.productIdItems = this.cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity
      }));
      const order: OrderPayload = {
        user: userData,
        items: this.cartItems,
        total: this.orderData.total,
        subtotal: this.orderData.subtotal,
        discount: this.orderData.discount,
        freeShipping: this.orderData.freeShipping
      };
      console.log('[OrderModalComponent] Commande soumise: ', order);

      // Envoi de la commande à l'API
      this.cartService.submitOrder(order).subscribe({
        next: (response) => {
          this.isResponse = true;
          const message = response.message;
          this.toastr.success(
            `Merci ${formData.firstName} ! Votre commande de ${this.orderData.total.toFixed(2)}€ a été envoyée avec succès.`,
            'Commande confirmée !',
            {
              timeOut: 5000,
              progressBar: true,
              closeButton: true
            }
          );
          window.scrollTo({ top: 0, behavior: 'smooth' });

          // Vider le panier après la commande
          this.clearCartEvent.emit();
          this.isSubmitting = false;
          this.closeModal();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.closeModal();
          this.toastr.error(
            `Une erreur est survenue. Veuillez rafréchir la page et réessayer svp.`,
            'Erreur',
            { timeOut: 4000 }
          );
          console.error('Erreur lors de la soumission de la commande:', error.error.message);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

}

