import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() featured: boolean = false;

  constructor(
    private router: Router, 
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private toastr: ToastrService
  ) {}

  onImageError(event: any) {
    // Fallback image en cas d'erreur de chargement
    // event.target.src = 'img/placeholder-product.jpg';
  }

  navigateToDetails() {
    this.router.navigate(['/produit', this.product.id]);
  }

  addToCart() {
    // Logique pour ajouter le produit au panier
    this.cartService.addToCart(this.product);
    
    // Afficher un toast avec les informations du produit ajouté
    this.toastr.success(
      `${this.product.name} a été ajouté au panier pour ${this.product.price}€`,
      'Produit ajouté !',
      {
        timeOut: 3000,
        progressBar: true,
        closeButton: true
      }
    );
  }

  toggleFavorite() {
    this.favoritesService.toggleFavorite(this.product);
    
    if (this.isFavorite()) {
      this.toastr.info(
        `${this.product.name} ajouté aux favoris`,
        'Favori ajouté !',
        {
          timeOut: 2000,
          progressBar: true
        }
      );
    } else {
      this.toastr.info(
        `${this.product.name} retiré des favoris`,
        'Favori retiré',
        {
          timeOut: 2000,
          progressBar: true
        }
      );
    }
  }

  isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.product.id);
  }
}

