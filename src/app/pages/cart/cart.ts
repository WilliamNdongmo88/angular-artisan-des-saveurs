import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderPayload } from '../../models/order';
import { OrderModalComponent, OrderData, OrderFormData } from '../../components/order-modal/order-modal.component';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from "../../services/translate.pipe";

// Interface étendue pour les articles du panier avec unités
interface ExtendedCartItem extends CartItem {
  selectedUnit: 'kg' | 'g';
  displayQuantity: number; // Quantité affichée dans l'unité sélectionnée
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, OrderModalComponent, FormsModule, TranslatePipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  submitMessage = '';
  submitSuccess = false;
  isResponse: boolean = false;
  cartItems: ExtendedCartItem[] = [];
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
    freeShipping: false,
    status: '',
    createdAt: new Date(),
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
    const originalItems = this.cartService.getCartItems();
    
    // Convertir les articles du panier en articles étendus avec unités
    this.cartItems = originalItems.map(item => this.convertToExtendedCartItem(item));
    
    this.calculateTotals();
  }

  /**
   * Convertit un CartItem standard en ExtendedCartItem avec gestion des unités
   */
  private convertToExtendedCartItem(item: CartItem): ExtendedCartItem {
    // Déterminer l'unité d'affichage par défaut selon la quantité
    const selectedUnit: 'kg' | 'g' = item.quantity >= 1 ? 'kg' : 'g';
    
    // Calculer la quantité d'affichage selon l'unité
    const displayQuantity = selectedUnit === 'kg' ? item.quantity : item.quantity * 1000;
    
    return {
      ...item,
      selectedUnit,
      displayQuantity: Math.round(displayQuantity * 100) / 100 // Arrondir à 2 décimales
    };
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((total, item) => {
      return total + this.getItemTotalPrice(item);
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
      freeShipping: this.isEligibleForFreeShipping,
      status: 'En attente',
      createdAt: new Date(),
    };
  }

  /**
   * Calcule le prix total d'un article selon sa quantité et son unité
   */
  getItemTotalPrice(item: ExtendedCartItem): number {
    // Le prix du produit est supposé être par kg
    const quantityInKg = this.convertToKg(item.displayQuantity, item.selectedUnit);
    return Math.round(item.product.price * quantityInKg * 100) / 100;
  }

  /**
   * Convertit une quantité vers les kilogrammes
   */
  private convertToKg(quantity: number, unit: 'kg' | 'g'): number {
    return unit === 'kg' ? quantity : quantity / 1000;
  }

  /**
   * Obtient le pas de quantité selon l'unité
   */
  getStepForUnit(unit: 'kg' | 'g'): number {
    return unit === 'kg' ? 0.1 : 50;
  }

  /**
   * Obtient la quantité minimale selon l'unité
   */
  getMinQuantityForUnit(unit: 'kg' | 'g'): number {
    return unit === 'kg' ? 0.1 : 50;
  }

  /**
   * Gestionnaire de changement d'unité pour un article
   */
  onItemUnitChange(item: ExtendedCartItem): void {
    // Convertir la quantité vers la nouvelle unité
    if (item.selectedUnit === 'g' && item.displayQuantity < 1) {
      // Convertir de kg vers g
      item.displayQuantity = item.displayQuantity * 1000;
    } else if (item.selectedUnit === 'kg' && item.displayQuantity >= 1000) {
      // Convertir de g vers kg
      item.displayQuantity = item.displayQuantity / 1000;
    } else {
      // Réinitialiser à la quantité minimale pour la nouvelle unité
      item.displayQuantity = this.getMinQuantityForUnit(item.selectedUnit);
    }
    
    // Arrondir à 2 décimales
    item.displayQuantity = Math.round(item.displayQuantity * 100) / 100;
    
    // Mettre à jour le panier
    this.updateCartItemQuantity(item);
  }

  /**
   * Gestionnaire de changement de quantité pour un article
   */
  onItemQuantityChange(item: ExtendedCartItem): void {
    // Valider la quantité
    if (item.displayQuantity < this.getMinQuantityForUnit(item.selectedUnit)) {
      item.displayQuantity = this.getMinQuantityForUnit(item.selectedUnit);
    }
    
    // Arrondir à 2 décimales
    item.displayQuantity = Math.round(item.displayQuantity * 100) / 100;
    
    // Mettre à jour le panier
    this.updateCartItemQuantity(item);
  }

  /**
   * Augmente la quantité d'un article
   */
  increaseItemQuantity(item: ExtendedCartItem): void {
    const step = this.getStepForUnit(item.selectedUnit);
    item.displayQuantity = Math.round((item.displayQuantity + step) * 100) / 100;
    this.updateCartItemQuantity(item);
  }

  /**
   * Diminue la quantité d'un article
   */
  decreaseItemQuantity(item: ExtendedCartItem): void {
    const step = this.getStepForUnit(item.selectedUnit);
    const newQuantity = Math.round((item.displayQuantity - step) * 100) / 100;
    
    if (newQuantity >= this.getMinQuantityForUnit(item.selectedUnit)) {
      item.displayQuantity = newQuantity;
      this.updateCartItemQuantity(item);
    } else {
      // Si la quantité devient trop faible, supprimer l'article
      this.removeItem(item.product.id);
    }
  }

  /**
   * Met à jour la quantité d'un article dans le service de panier
   */
  private updateCartItemQuantity(item: ExtendedCartItem): void {
    // Convertir la quantité d'affichage en kg pour le service
    const quantityInKg = this.convertToKg(item.displayQuantity, item.selectedUnit);
    
    // Mettre à jour via le service
    this.cartService.updateQuantity(item.product.id, quantityInKg);
    
    // Recalculer les totaux
    this.calculateTotals();
  }

  /**
   * Méthode de compatibilité avec l'ancienne interface
   */
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
    this.router.navigate(['/catalog']);
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
    console.log('### Valider la commande ####');
    console.log('Articles du panier avec unités:', this.cartItems.map(item => ({
      product: item.product.name,
      quantity: item.displayQuantity,
      unit: item.selectedUnit,
      quantityInKg: this.convertToKg(item.displayQuantity, item.selectedUnit),
      totalPrice: this.getItemTotalPrice(item)
    })));
  }

  onImageError(event: any) {
    // Fallback image en cas d'erreur de chargement
    // event.target.src = 'img/placeholder-product.jpg';
  }
}