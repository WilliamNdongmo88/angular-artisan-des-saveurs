import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderPayload } from '../../models/order';
import { OrderModalComponent, OrderData, OrderFormData } from '../../components/order-modal/order-modal.component';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';

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
    private toastr: ToastrService,
    private authService: AuthService,
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

  updateQuantity(productId: number, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeItem(productId);
    } else {
      this.cartService.updateQuantity(productId, newQuantity);
    }
  }

  removeItem(productId: number) {
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
  }

  onImageError(event: any) {
    // Fallback image en cas d'erreur de chargement
    // event.target.src = 'img/placeholder-product.jpg';
  }
}

