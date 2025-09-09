import { Component, OnInit, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product';
import { ScrollToTopComponent } from '../../components/scroll-to-top-button/scroll-to-top.component';
import { TranslatePipe } from "../../services/translate.pipe";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, ScrollToTopComponent, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  trackByProductId!: TrackByFunction<Product>;
 

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
      this.featuredProducts = products.filter(product => product.featured);
      console.log("[HomeComponent] featuredProducts :: ", this.featuredProducts);
      },
      error: () => {
        console.error('Erreur lors du chargement des produits', 'Erreur');
      }
    });
  }
}
