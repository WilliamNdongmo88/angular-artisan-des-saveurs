import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from "../loading-spinner/loading-spinner.component";
import { OrderPayload, Product } from '../../models/order';
import { CartItem, CartService } from '../../services/cart.service';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from "../../services/translate.pipe";
import { PaymentComponent } from "../payment/payment.component";
import { DeliveryComponent, DeliveryOption } from "../delivery/delivery.component";

export interface OrderData {
  subtotal: number;
  discount: number;
  total: number;
  freeShipping: boolean;
  status: string;
  createdAt: Date;
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
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, TranslatePipe, PaymentComponent, DeliveryComponent],
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
  isDisabled = true;
  isLocation = true;
  isOrderCompleted = false;
  isPayment = false;
  user = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  };
  order : OrderPayload = {
    id: 0,
    user: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      fullName: '',
      consent: false,
      contactRequests: []
    },
    total: 0,
    subtotal: 0,
    discount: 0,
    freeShipping: false,
    status: '',
    createdAt: new Date(),
    items: [],
    deliveryMethod: '',
    paymentMethod: ''
  };
  userFirstName: string = '';
  currentDeliveryMethod: string = 'recuperer';
  currentPaymentMethod: string = 'bank';

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cartService: CartService,
    private authService: AuthService,
    
  ) {}

  currentStep: number = 1;
  totalSteps: number = 3; // à adapter

  get isLastStep(): boolean {
    // console.log("currentStep", this.currentStep);
    // console.log("totalSteps", this.totalSteps);
    return this.currentStep === this.totalSteps;
  }

  showNextButton(): boolean {
    if (this.isLastStep) return false;

    if (this.isUserConnected) return true;

    return !this.isUserConnected && (this.isLocation || this.isOrderCompleted);
  }

  ngOnInit() {
    this.initializeForm();
    //const data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const currentUser = this.authService.currentUserValue;
    //this.authService.isAuthenticated(); // Vérifie si le token est encore valide
    console.log('[OrderModalComponent] currentUser :1: ', currentUser);
    if (currentUser && currentUser?.token) {
      this.isUserConnected = true;
      this.isDisabled = false; // Activer le mode désactivé si l'utilisateur est connecté
      console.log('[OrderModalComponent] isDisabled :: ', this.isDisabled);
      this.authService.extractUserFromToken(currentUser.token); // Restaure le user en mémoire
      console.log('[OrderModalComponent] currentUser :2: ', this.authService.getUser());
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
    if (this.currentDeliveryMethod || this.currentPaymentMethod) {
      console.log('[OrderModalComponent] currentDeliveryMethod :: ', this.currentDeliveryMethod);
      console.log('[OrderModalComponent] currentPaymentMethod :: ', this.currentPaymentMethod);
    }
  }

  initializeForm() {
    this.orderForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10)]]
    });
    console.log("this.orderForm.valid :: ", this.orderForm.valid);
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log('Nouvelle valeur du champ lastName :', input.value);
    console.log('this.orderForm.valid :', this.orderForm.valid);
    if (this.orderForm.valid) {
      this.isDisabled = false;
    }else{
      this.isDisabled = true;
    }
  }

  onDeliveryMethodChange(method: string): void {
    this.currentDeliveryMethod = method;
    console.log('Méthode de livraison sélectionnée:', method);
    if(this.currentDeliveryMethod){
      this.isDisabled = false;
    }
  }

  onDeliveryOptionChange(option: DeliveryOption): void {
    //console.log('Option de livraison complète:', option);
    // option contient: method, estimatedDate, cost, address (optionnel)
  }

  // Pas utilisée pour l'instant
  onPaymentMethodChange(method: string): void {
    console.log('Méthode de paiement reçue du composant enfant :', method);
    this.currentPaymentMethod = method;
    if(this.currentPaymentMethod === 'mips'){
      this.isDisabled = true;
    }else{
      this.isDisabled = false;
    }
    console.log('Méthode de paiement actuelle mise à jour :', this.currentPaymentMethod);
  }

  goToNextStep() {
    this.currentStep += 1
    if(this.isLocation){
      this.isLocation = false;
      this.isOrderCompleted = true;
    } else if (this.isOrderCompleted) {
      this.isOrderCompleted = false;
      this.onSubmit();
      this.isDisabled = true; // Désactiver le bouton après la soumission
      this.isPayment = true;
    }
    // console.log('isLocation:', this.isLocation);
    // console.log('isPayment:', this.isPayment); 
    // console.log('isOrderCompleted:', this.isOrderCompleted);
    // console.log('isDisabled:', this.isDisabled);
    // console.log('isUserConnected:', this.isUserConnected);
  }
  goToPreviousStep() {
    this.currentStep = Math.max(1, this.currentStep - 1);
    if(this.isPayment){
      if (this.isDisabled == true) {
        this.isDisabled = false;
      }
      this.isPayment = false;
      this.isSubmitting = false;
      this.isOrderCompleted = true;
    } else if (this.isOrderCompleted) {
      this.isOrderCompleted = false;
      this.isLocation = true;
    }
    // console.log('isLocation:', this.isLocation);
    // console.log('isPayment:', this.isPayment); 
    // console.log('isOrderCompleted:', this.isOrderCompleted);
    // console.log('isDisabled:', this.isDisabled);
    // console.log('isUserConnected:', this.isUserConnected);
  } 

  onSubmit() {

    if (this.orderForm.valid) {
      // this.isSubmitting = true;
      const formData: OrderFormData = this.orderForm.value;

      const userData : User = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        consent: false,
        contactRequests: [],
        fullName: ''
      };
      this.productIdItems = this.cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity
      }));
      const order: OrderPayload = {
        id: 0,
        user: userData,
        items: this.cartItems,
        total: this.orderData.total,
        subtotal: this.orderData.subtotal,
        discount: this.orderData.discount,
        freeShipping: this.orderData.freeShipping,
        status: this.orderData.status,
        createdAt: this.orderData.createdAt,
        deliveryMethod: '',
        paymentMethod: ''
      };
      console.log('[OrderModalComponent] Commande soumise: ', order);
      //this.submitOrderEvent.emit(formData);
      this.order = order;
      this.userFirstName = formData.firstName;

      // Cette logique était nécessaire pour les utilisateurs non connectés
      // mais maintenant que l'utilisateur doit être connecté pour passer une commande,
      // on gère tout dans validateOrder()
      // Envoi de la commande à l'API
      // this.cartService.submitOrder(order).subscribe({
      //   next: (response) => {
      //     this.isResponse = true;
      //     const message = response.message;
      //     this.toastr.success(
      //       `Merci ${formData.firstName} ! Votre commande de ${this.orderData.total.toFixed(2)}€ a été envoyée avec succès.`,
      //       'Commande confirmée !',
      //       {
      //         timeOut: 5000,
      //         progressBar: true,
      //         closeButton: true
      //       }
      //     );
      //     window.scrollTo({ top: 0, behavior: 'smooth' });

      //     // Vider le panier après la commande
      //     this.clearCartEvent.emit();
      //     this.isSubmitting = false;
      //     this.closeModal();
      //   },
      //   error: (error) => {
      //     this.isSubmitting = false;
      //     this.closeModal();
      //     this.toastr.error(
      //       `Une erreur est survenue. Veuillez rafréchir la page et réessayer svp.`,
      //       'Erreur',
      //       { timeOut: 4000 }
      //     );
      //     console.error('Erreur lors de la soumission de la commande:', error.error.message);
      //     window.scrollTo({ top: 0, behavior: 'smooth' });
      //   }
      // });
    }
    else if(this.isUserConnected){
      // this.isSubmitting = true;
      const formData: OrderFormData = this.user;

      const userData : User = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        consent: false,
        contactRequests: [],
        fullName: ''
      };
      console.log('[OrderModalComponent] userData :: ', userData);
      this.productIdItems = this.cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity
      }));
      const order: OrderPayload = {
        id: 0,
        user: userData,
        items: this.cartItems,
        total: this.orderData.total,
        subtotal: this.orderData.subtotal,
        discount: this.orderData.discount,
        freeShipping: this.orderData.freeShipping,
        status: this.orderData.status,
        createdAt: this.orderData.createdAt,
        deliveryMethod: '',
        paymentMethod: ''
      };
      console.log('[OrderModalComponent] Commande soumise: ', order);
      this.order = order;
      this.userFirstName = formData.firstName;
    }
  }

  validateOrder() {
    this.order.deliveryMethod = this.currentDeliveryMethod;
    this.order.paymentMethod = this.currentPaymentMethod;
    console.log(" this.order ::: ", this.order);
    console.log(" this.userFirstName ::: ", this.userFirstName);
      // Envoi de la commande à l'API
      this.isSubmitting = true;
      this.cartService.submitOrder(this.order).subscribe({
        next: (response) => {
          this.isResponse = true;
          const message = response.message;
          this.toastr.success(
            `Merci ${this.userFirstName} ! Votre commande de ${this.orderData.total.toFixed(2)}€ a été envoyée avec succès.`,
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

