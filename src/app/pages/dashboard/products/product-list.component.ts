import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductAdminService } from '../../../services/product-admin.service';
import { ProductResponse } from '../../../models/product.models';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../header/header";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {

  products: ProductResponse[] = [];
  filteredProducts: ProductResponse[] = [];
  categories: string[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = '';

  constructor(
    private productService: ProductAdminService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.loading = true;

    // Abonnement au flux des produits
    /*this.productService.products$.subscribe({
      next: (products) => {
        this.products = products;
        console.log("[productService] ", this.products);
        this.filteredProducts = products;
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Erreur lors du chargement des produits', 'Erreur');
        this.loading = false;
      }
    });*/

    // Charge les produits disponibles
    this.productService.getAvailableProducts().subscribe({
      next: (products) => {
        console.log("[productService] : ", products);
        //console.log("[productService] Chemin image :", products[0].mainImage.filePath);
        this.products = products;
        this.filteredProducts = products;
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Erreur lors du chargement des produits', 'Erreur');
        this.loading = false;
      }
    });
    //this.productService.getAvailableProducts();
  }

  loadCategories() {
    this.productService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories', error);
      }
    });
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  onSearchChange() {
    this.filterProducts();
  }

  onCategoryChange() {
    this.filterProducts();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.filteredProducts = this.products;
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://via.placeholder.com/150';
  }

  createProduct() {
    this.router.navigate(['/dashboard/products/create']);
  }

  editProduct(id: number) {
    this.router.navigate(['/dashboard/products/edit', id]);
  }

  viewProduct(id: number) {
    this.router.navigate(['/dashboard/products/view', id]);
  }

  toggleAvailability(product: ProductResponse) {
    this.productService.toggleProductAvailability(product.id).subscribe({
      next: (updatedProduct) => {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
          this.filterProducts();
        }
        this.toastr.success(
          `Produit ${updatedProduct.available ? 'activé' : 'désactivé'}`,
          'Succès'
        );
      },
      error: (error) => {
        this.toastr.error('Erreur lors de la modification', 'Erreur');
      }
    });
  }

  deleteProduct(product: ProductResponse) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: (response) => {
          this.products = this.products.filter(p => p.id !== product.id);
          this.filterProducts();
          this.toastr.success(response.message, 'Succès');
        },
        error: (error) => {
          this.toastr.error('Erreur lors de la suppression', 'Erreur');
        }
      });
    }
  }
}

