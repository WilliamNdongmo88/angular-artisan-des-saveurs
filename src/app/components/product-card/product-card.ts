import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  @Input() featured: boolean = false;
  showActions: boolean = false; // Pour afficher le bouton "Plus d'infos" en fonction du statut de l'utilisateur

  constructor(
    private router: Router,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    //console.log("product :::: ", this.product)
    this.showActions = this.authService.currentUserValue !== null;
    // Vérifier si l'utilisateur est connecté pour afficher les actions
    if (this.authService.currentUserValue) {
      this.showActions = true;
    }
  }

  onImageError(event: any) {
    // Fallback image en cas d'erreur de chargement
    // event.target.src = 'img/placeholder-product.jpg';
  }

  navigateToDetails() {
    console.log("Navigate ...")
    // this.router.navigateByUrl('/').then(() => {
    //   this.router.navigate(['/product', this.product.id]);
    // });

    this.router.navigate(['/produit', this.product.id]);
    //this.router.navigate(['/products/view/', this.product.id]);
  }

  addToCart() {
    // Logique pour ajouter le produit au panier
    this.cartService.addToCart(this.product);

    // Afficher un toast avec les informations du produit ajouté
    this.toastr.success(
      `${this.product.name} a été ajouté au panier pour ${this.product.price}Rs`,
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

