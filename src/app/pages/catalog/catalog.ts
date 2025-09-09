import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { ProductService } from '../../services/product';
import { Product, ProductCategory } from '../../models/product';
import { RouterModule } from '@angular/router';
import { ScrollToTopComponent } from "../../components/scroll-to-top-button/scroll-to-top.component";
import { ProductAdminService } from '../../services/product-admin.service';
import { TranslatePipe } from "../../services/translate.pipe";

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, RouterModule, ScrollToTopComponent, TranslatePipe],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss'
})
export class CatalogComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  categories: ProductCategory[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';

  constructor(private productService: ProductService, private productAdminService: ProductAdminService) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
      this.allProducts = products;
      this.filteredProducts = products;
        console.log("[CatalogComponent] res :: ", this.allProducts);
      },
      error: () => {
        console.error('Erreur lors du chargement des produits', 'Erreur');
      }
    });
  }

  loadCategories() {
    this.categories = this.productService.getAllCategories();
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.filterProducts();
  }

  onSearchChange() {
    this.filterProducts();
  }

  filterProducts() {
    let filtered = this.allProducts;

    // Filtrer par catégorie
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === this.selectedCategory
      );
    }

    // Filtrer par recherche
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    this.filteredProducts = filtered;
  }

  getCategoryDisplayName(category: ProductCategory): string {
    return this.productService.getCategoryDisplayName(category);
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  getProductsByCategory(category: ProductCategory): Product[] {
    return this.filteredProducts.filter(product => product.category === category);
  }
}
