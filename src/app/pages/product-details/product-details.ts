import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetailsComponent implements OnInit {
  // Propriétés existantes
  product?: Product;
  loading = true;
  error = false;
  discountPercentage = 10;
  originalPrice = 0;
  discountedPrice = 0;
  
  // Nouvelles propriétés pour la gestion des quantités avec unités
  quantity: number = 0.1; // Quantité décimale
  selectedUnit: 'kg' | 'g' = 'kg'; // Unité sélectionnée par défaut

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      this.loadProduct(productId);
    });
  }

  loadProduct(id: number) {
    this.loading = true;
    this.error = false;
    
    this.productService.getProductById(id).subscribe({
      next: (product: Product | undefined) => {
        if (product) {
          console.log("[ProductDetails] Product loaded: ", product);
          this.product = product;
          this.originalPrice = product.price;
          this.discountedPrice = this.originalPrice * (1 - this.discountPercentage / 100);
          
          // Initialiser la quantité minimale selon l'unité
          this.quantity = this.getMinQuantity();
          
          this.loading = false;
        } else {
          this.error = true;
          this.loading = false;
        }
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  /**
   * Augmente la quantité selon le pas défini pour l'unité
   */
  increaseQuantity(): void {
    const step = this.getQuantityStep();
    this.quantity = Math.round((this.quantity + step) * 100) / 100; // Arrondir à 2 décimales
  }

  /**
   * Diminue la quantité selon le pas défini pour l'unité
   */
  decreaseQuantity(): void {
    const step = this.getQuantityStep();
    const newQuantity = Math.round((this.quantity - step) * 100) / 100; // Arrondir à 2 décimales
    
    if (newQuantity >= this.getMinQuantity()) {
      this.quantity = newQuantity;
    }
  }

  /**
   * Gestionnaire de changement de quantité (input direct)
   */
  onQuantityChange(): void {
    // Valider que la quantité respecte les limites
    if (this.quantity < this.getMinQuantity()) {
      this.quantity = this.getMinQuantity();
    }
    
    // Arrondir à 2 décimales
    this.quantity = Math.round(this.quantity * 100) / 100;
  }

  /**
   * Gestionnaire de changement d'unité
   */
  onUnitChange(): void {
    // Convertir la quantité actuelle vers la nouvelle unité
    if (this.selectedUnit === 'g' && this.quantity < 1) {
      // Si on passe en grammes et qu'on a moins de 1 kg, convertir
      this.quantity = this.quantity * 1000;
    } else if (this.selectedUnit === 'kg' && this.quantity >= 1000) {
      // Si on passe en kg et qu'on a plus de 1000g, convertir
      this.quantity = this.quantity / 1000;
    } else {
      // Sinon, réinitialiser à la quantité minimale pour la nouvelle unité
      this.quantity = this.getMinQuantity();
    }
    
    // Arrondir à 2 décimales
    this.quantity = Math.round(this.quantity * 100) / 100;
  }

  /**
   * Obtient le pas de quantité selon l'unité sélectionnée
   */
  getQuantityStep(): number {
    switch (this.selectedUnit) {
      case 'kg':
        return 0.1; // Pas de 100g
      case 'g':
        return 50; // Pas de 50g
      default:
        return 0.1;
    }
  }

  /**
   * Obtient la quantité minimale selon l'unité sélectionnée
   */
  getMinQuantity(): number {
    switch (this.selectedUnit) {
      case 'kg':
        return 1; // Minimum 1kg
      case 'g':
        return 50; // Minimum 50g
      default:
        return 0.1;
    }
  }

  /**
   * Calcule le prix par unité selon l'unité sélectionnée
   * Suppose que le prix du produit est donné par kg
   */
  getPricePerUnit(): number {
    if (!this.product) return 0;
    
    // Supposons que le prix du produit est par kg
    const pricePerKg = this.discountPercentage > 0 ? this.discountedPrice : this.originalPrice;
    
    switch (this.selectedUnit) {
      case 'kg':
        return pricePerKg;
      case 'g':
        return pricePerKg / 1000; // Prix par gramme
      default:
        return pricePerKg;
    }
  }

  /**
   * Calcule le prix total selon la quantité et l'unité sélectionnées
   */
  getTotalPrice(): number {
    if (!this.product || this.quantity <= 0) return 0;
    
    const pricePerUnit = this.getPricePerUnit();
    return Math.round(this.quantity * pricePerUnit * 100) / 100; // Arrondir à 2 décimales
  }

  /**
   * Convertit la quantité en kilogrammes pour le panier (unité de base)
   */
  getQuantityInKg(): number {
    switch (this.selectedUnit) {
      case 'kg':
        return this.quantity;
      case 'g':
        return this.quantity / 1000;
      default:
        return this.quantity;
    }
  }

  /**
   * Ajoute le produit au panier avec la quantité convertie en kg
   */
  addToCart(): void {
    if (this.product) {
      const quantityInKg = this.getQuantityInKg();
      this.cartService.addToCart(this.product, quantityInKg);
      
      // Message de confirmation avec l'unité choisie par l'utilisateur
      console.log(`${this.quantity} ${this.selectedUnit} de ${this.product.name} ajouté(s) au panier !`);
    }
  }

  // Vos méthodes existantes restent inchangées
  goBack(): void {
    console.log('Retour au catalogue');
    this.router.navigate(['/catalog']);
  }

  onImageError(event: any): void {
    // Fallback image en cas d'erreur de chargement
    // event.target.src = 'img/placeholder-product.jpg';
  }
}

