import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product, QuantityWithUnit, PriceCalculation, UNIT_CONFIG } from '../../models/product';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetailsComponent implements OnInit {
  product?: Product;
  loading = true;
  error = false;
  discountPercentage = 10;

  // Nouvelle gestion des quantités avec unités
  selectedQuantity: QuantityWithUnit = {
    value: 0,
    unit: 'kg' // Valeur par défaut, sera mise à jour selon le produit
  };

  // Calculs de prix en temps réel
  priceCalculation: PriceCalculation = {
    baseQuantity: 0,
    unitPrice: 0,
    totalPrice: 0,
    originalPrice: 0,
    discountedPrice: 0,
    discount: 0
  };

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
          this.initializeQuantityAndUnit();
          this.calculatePrices();
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
   * Initialise la quantité et l'unité par défaut selon le produit
   */
  private initializeQuantityAndUnit(): void {
    if (!this.product) return;

    // Définir l'unité par défaut
    if (this.product.allowedUnits && this.product.allowedUnits.length > 0) {
      this.selectedQuantity.unit = this.product.allowedUnits[0];
    } else {
      this.selectedQuantity.unit = this.product.baseUnit;
    }

    // Définir la quantité minimale par défaut
    this.selectedQuantity.value = this.getMinQuantity();
  }

  /**
   * Calcule tous les prix en fonction de la quantité et de l'unité sélectionnées
   */
  calculatePrices(): void {
    if (!this.product || this.selectedQuantity.value <= 0) {
      this.resetPriceCalculation();
      return;
    }

    // Convertir la quantité dans l'unité de base du produit
    const baseQuantity = this.convertToBaseUnit(
      this.selectedQuantity.value, 
      this.selectedQuantity.unit, 
      this.product.baseUnit
    );

    // Calculer le prix unitaire dans l'unité sélectionnée
    const unitPrice = this.calculateUnitPrice(
      this.product.pricePerBaseUnit,
      this.product.baseUnit,
      this.selectedQuantity.unit
    );

    // Calculer le prix total
    const totalPrice = this.selectedQuantity.value * unitPrice;

    // Calculer les prix avec remise
    const originalPrice = totalPrice;
    const discount = (originalPrice * this.discountPercentage) / 100;
    const discountedPrice = originalPrice - discount;

    this.priceCalculation = {
      baseQuantity,
      unitPrice,
      totalPrice: this.discountPercentage > 0 ? discountedPrice : totalPrice,
      originalPrice,
      discountedPrice,
      discount
    };
  }

  /**
   * Convertit une quantité d'une unité vers l'unité de base
   */
  private convertToBaseUnit(quantity: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return quantity;

    // Conversion entre kg et g
    if (fromUnit === 'kg' && toUnit === 'g') {
      return quantity * 1000;
    }
    if (fromUnit === 'g' && toUnit === 'kg') {
      return quantity / 1000;
    }

    // Pour les pièces, pas de conversion
    if (fromUnit === 'piece' || toUnit === 'piece') {
      return quantity;
    }

    return quantity;
  }

  /**
   * Calcule le prix unitaire dans l'unité sélectionnée
   */
  private calculateUnitPrice(basePricePerUnit: number, baseUnit: string, targetUnit: string): number {
    if (baseUnit === targetUnit) return basePricePerUnit;

    // Conversion du prix entre kg et g
    if (baseUnit === 'kg' && targetUnit === 'g') {
      return basePricePerUnit / 1000; // Prix par gramme
    }
    if (baseUnit === 'g' && targetUnit === 'kg') {
      return basePricePerUnit * 1000; // Prix par kilogramme
    }

    return basePricePerUnit;
  }

  /**
   * Remet à zéro les calculs de prix
   */
  private resetPriceCalculation(): void {
    this.priceCalculation = {
      baseQuantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      originalPrice: 0,
      discountedPrice: 0,
      discount: 0
    };
  }

  /**
   * Gestionnaire de changement de quantité
   */
  onQuantityChange(): void {
    // Valider la quantité
    if (this.selectedQuantity.value < this.getMinQuantity()) {
      this.selectedQuantity.value = this.getMinQuantity();
    }
    if (this.selectedQuantity.value > this.getMaxQuantity()) {
      this.selectedQuantity.value = this.getMaxQuantity();
    }

    this.calculatePrices();
  }

  /**
   * Gestionnaire de changement d'unité
   */
  onUnitChange(): void {
    // Ajuster la quantité selon la nouvelle unité
    const oldQuantity = this.selectedQuantity.value;
    const oldUnit = this.selectedQuantity.unit;

    // Convertir la quantité vers la nouvelle unité si possible
    if (oldUnit === 'kg' && this.selectedQuantity.unit === 'g') {
      this.selectedQuantity.value = oldQuantity * 1000;
    } else if (oldUnit === 'g' && this.selectedQuantity.unit === 'kg') {
      this.selectedQuantity.value = oldQuantity / 1000;
    } else {
      // Réinitialiser à la quantité minimale pour la nouvelle unité
      this.selectedQuantity.value = this.getMinQuantity();
    }

    this.calculatePrices();
  }

  /**
   * Augmente la quantité
   */
  increaseQuantity(): void {
    const step = this.getQuantityStep();
    const newValue = this.selectedQuantity.value + step;
    
    if (newValue <= this.getMaxQuantity()) {
      this.selectedQuantity.value = Math.round(newValue * 100) / 100; // Arrondir à 2 décimales
      this.calculatePrices();
    }
  }

  /**
   * Diminue la quantité
   */
  decreaseQuantity(): void {
    const step = this.getQuantityStep();
    const newValue = this.selectedQuantity.value - step;
    
    if (newValue >= this.getMinQuantity()) {
      this.selectedQuantity.value = Math.round(newValue * 100) / 100; // Arrondir à 2 décimales
      this.calculatePrices();
    }
  }

  /**
   * Obtient le pas de quantité selon l'unité
   */
  getQuantityStep(): number {
    const config = UNIT_CONFIG[this.selectedQuantity.unit as keyof typeof UNIT_CONFIG];
    return config ? config.step : 1;
  }

  /**
   * Obtient la quantité minimale selon l'unité
   */
  getMinQuantity(): number {
    const config = UNIT_CONFIG[this.selectedQuantity.unit as keyof typeof UNIT_CONFIG];
    return config ? config.min : 1;
  }

  /**
   * Obtient la quantité maximale selon l'unité et le stock
   */
  getMaxQuantity(): number {
    if (!this.product) return 1;

    const config = UNIT_CONFIG[this.selectedQuantity.unit as keyof typeof UNIT_CONFIG];
    const configMax = config ? config.max : 100;

    // Convertir le stock dans l'unité sélectionnée
    const stockInSelectedUnit = this.convertToBaseUnit(
      this.product.stockQuantity,
      this.product.baseUnit,
      this.selectedQuantity.unit
    );

    return Math.min(configMax, stockInSelectedUnit);
  }

  /**
   * Obtient le placeholder pour l'input de quantité
   */
  getQuantityPlaceholder(): string {
    return `Ex: ${this.getMinQuantity()}`;
  }

  /**
   * Obtient le texte d'aide pour la quantité
   */
  getQuantityHint(): string {
    const min = this.getMinQuantity();
    const max = this.getMaxQuantity();
    const unit = this.getUnitLabel(this.selectedQuantity.unit);
    return `Entre ${min} et ${max} ${unit}`;
  }

  /**
   * Obtient le libellé d'une unité
   */
  getUnitLabel(unit: string): string {
    const config = UNIT_CONFIG[unit as keyof typeof UNIT_CONFIG];
    return config ? config.shortLabel : unit;
  }

  /**
   * Vérifie si le stock est faible
   */
  isLowStock(): boolean {
    if (!this.product) return false;
    return this.product.stockQuantity <= 5;
  }

  /**
   * Vérifie si on peut ajouter au panier
   */
  canAddToCart(): boolean {
    return !!(
      this.product && 
      this.product.available && 
      this.selectedQuantity.value > 0 && 
      this.selectedQuantity.value >= this.getMinQuantity() &&
      this.selectedQuantity.value <= this.getMaxQuantity()
    );
  }

  /**
   * Ajoute le produit au panier
   */
  addToCart(): void {
    if (this.product && this.canAddToCart()) {
      // Convertir la quantité dans l'unité de base pour le panier
      const baseQuantity = this.convertToBaseUnit(
        this.selectedQuantity.value,
        this.selectedQuantity.unit,
        this.product.baseUnit
      );

      // Créer un objet avec les informations de commande
      const cartItem = {
        product: this.product,
        quantity: baseQuantity,
        selectedUnit: this.selectedQuantity.unit,
        selectedQuantity: this.selectedQuantity.value,
        unitPrice: this.priceCalculation.unitPrice,
        totalPrice: this.priceCalculation.totalPrice
      };

      this.cartService.addToCart(cartItem.product, cartItem.quantity);
      
      // Message de confirmation
      console.log(`${this.selectedQuantity.value} ${this.getUnitLabel(this.selectedQuantity.unit)} de ${this.product.name} ajouté(s) au panier !`);
    }
  }

  /**
   * Retour au catalogue
   */
  goBack(): void {
    console.log('Retour au catalogue');
    this.router.navigate(['/catalog']);
  }

  /**
   * Gestionnaire d'erreur d'image
   */
  onImageError(event: any): void {
    // Fallback image en cas d'erreur de chargement
    // event.target.src = 'assets/images/placeholder-product.jpg';
    console.warn('Erreur de chargement de l\'image du produit');
  }
}
