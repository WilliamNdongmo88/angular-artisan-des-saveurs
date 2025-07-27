import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderPayload } from '../../models/order';
import { OrderModalComponent, OrderData, OrderFormData } from '../../components/order-modal/order-modal.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, OrderModalComponent],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  submitMessage = '';
  submitSuccess = false;
  isResponse: boolean = false;
  cartItems: CartItem[] = [];
  subtotal = 0;
  discountPercentage = 10;
  discountAmount = 0;
  total = 0;
  freeShippingThreshold = 3000;
  isEligibleForFreeShipping = false;
  amountNeededForFreeShipping = 0;
  private cartSubscription?: Subscription;
  
  // Modal state
  showOrderModal = false;
  orderData: OrderData = {
    subtotal: 0,
    discount: 0,
    total: 0,
    freeShipping: false
  };

  constructor(
    private cartService: CartService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadCartItems();
    this.cartSubscription = this.cartService.getCartItemCount().subscribe(() => {
      this.loadCartItems();
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  loadCartItems() {
    this.cartItems = this.cartService.getCartItems();
    this.calculateTotals();
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    this.discountAmount = this.subtotal * (this.discountPercentage / 100);
    this.total = this.subtotal - this.discountAmount;

    // Vérifier l'éligibilité à la livraison gratuite
    this.isEligibleForFreeShipping = this.total >= this.freeShippingThreshold;
    this.amountNeededForFreeShipping = this.isEligibleForFreeShipping ? 
      0 : this.freeShippingThreshold - this.total;
    
    // Mettre à jour les données pour le modal
    this.orderData = {
      subtotal: this.subtotal,
      discount: this.discountAmount,
      total: this.total,
      freeShipping: this.isEligibleForFreeShipping
    };
  }

  updateQuantity(productId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeItem(productId);
    } else {
      this.cartService.updateQuantity(productId, newQuantity);
    }
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  continueShopping() {
    this.router.navigate(['/catalogue']);
  }

  submitOrder() {
    if (this.cartItems.length === 0) {
      this.toastr.error('Votre panier est vide !', 'Erreur');
      return;
    }

    // Ouvrir le modal de commande
    this.showOrderModal = true;
  }

  closeOrderModal() {
    this.showOrderModal = false;
  }

  onOrderSubmit(formData: OrderFormData) {
    console.log('### Valider la commane ####');
    // Créer l'objet de commande avec les données du formulaire
    const order: OrderPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      items: this.cartItems,
      subtotal: this.subtotal,
      discount: this.discountAmount,
      total: this.total,
      freeShipping: this.isEligibleForFreeShipping
    };

    console.log('Commande soumise:', order);

    // Envoi de la commande à l'API
    // this.cartService.submitOrder(order).subscribe({
    //   next: (response) => {
    //     this.submitSuccess = true;
    //     this.isResponse = true;
    //     const message = response.message;
    //     this.submitMessage = `Commande soumise avec succès !\n\nTotal: Rs ${this.total.toFixed(2)}\n` +
    //       `${this.isEligibleForFreeShipping ? 'Livraison gratuite incluse !' : 'Frais de livraison à ajouter'}`;
    //     window.scrollTo({ top: 0, behavior: 'smooth' });
        
    //     // Masquer le message après 5 secondes
    //     setTimeout(() => {
    //       this.submitMessage = '';
    //       this.submitSuccess = false;
    //     }, 4000);

    //     // Vider le panier après la commande
    //     this.clearCart();
    //   },
    //   error: (error) => {
    //     this.submitSuccess = false;
    //     this.submitMessage = 'Une erreur est survenue. Veuillez réessayer.';
    //     window.scrollTo({ top: 0, behavior: 'smooth' });
        
    //     // Masquer le message après 5 secondes
    //     setTimeout(() => {
    //       this.submitMessage = '';
    //     }, 5000);
    //   }
    // });
  }

  onImageError(event: any) {
    // Fallback image en cas d'erreur de chargement
    // event.target.src = 'img/placeholder-product.jpg';
  }
}

