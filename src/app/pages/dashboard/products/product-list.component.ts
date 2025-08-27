import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductAdminService } from '../../../services/product-admin.service';
import { ProductResponse } from '../../../models/product.models';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../header/header";

// Interface pour les statuts de commande
export interface OrderStatus {
  value: string;
  label: string;
  color: string;
}

// Énumération des statuts disponibles
export const ORDER_STATUSES: OrderStatus[] = [
  { value: 'pending', label: 'En attente', color: '#856404' },
  { value: 'processing', label: 'En traitement', color: '#004085' },
  { value: 'shipped', label: 'Expédié', color: '#383d41' },
  { value: 'delivered', label: 'Livré', color: '#155724' },
  { value: 'cancelled', label: 'Annulé', color: '#721c24' }
];


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

    // Charge les produits disponibles
    this.productService.getAvailableProducts().subscribe({
      next: (products) => {
        console.log("[productService] : ", products);
        console.log("[productService] Chemin image :", products[0].mainImage.filePath);
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

  
  //Met à jour le statut de la commande pour un produit
  updateOrderStatus(product: any, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    
    // Mettre à jour le statut localement
    product.orderStatus = newStatus;
    
    // Appeler votre service pour sauvegarder en base de données
    // this.productService.updateProductOrderStatus(product.id, newStatus).subscribe({
    //   next: (response) => {
    //     console.log('Statut de commande mis à jour avec succès:', response);
    //     // Optionnel : afficher une notification de succès
    //     this.showSuccessMessage(`Statut mis à jour vers "${this.getStatusLabel(newStatus)}"`);
    //   },
    //   error: (error) => {
    //     console.error('Erreur lors de la mise à jour du statut:', error);
    //     // Revenir à l'ancien statut en cas d'erreur
    //     target.value = product.orderStatus || 'pending';
    //     // Optionnel : afficher une notification d'erreur
    //     this.showErrorMessage('Erreur lors de la mise à jour du statut');
    //   }
    // });
  }

  /**
   * Obtient le libellé d'un statut
   * @param status Le statut
   * @returns Le libellé correspondant
   */
  getStatusLabel(status: string): string {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  /**
   * Obtient la couleur d'un statut
   * @param status Le statut
   * @returns La couleur correspondante
   */
  getStatusColor(status: string): string {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.color : '#6c757d';
  }

  /**
   * Affiche un message de succès (à adapter selon votre système de notifications)
   * @param message Le message à afficher
   */
  private showSuccessMessage(message: string): void {
    // Implémentez selon votre système de notifications
    // Exemple avec Angular Material Snackbar :
    // this.snackBar.open(message, 'Fermer', { duration: 3000, panelClass: 'success-snackbar' });
    
    // Ou simplement avec console.log pour le moment :
    console.log('Succès:', message);
  }

  /**
   * Affiche un message d'erreur (à adapter selon votre système de notifications)
   * @param message Le message à afficher
   */
  private showErrorMessage(message: string): void {
    // Implémentez selon votre système de notifications
    // Exemple avec Angular Material Snackbar :
    // this.snackBar.open(message, 'Fermer', { duration: 5000, panelClass: 'error-snackbar' });
    
    // Ou simplement avec console.error pour le moment :
    console.error('Erreur:', message);
  }

  // Méthode optionnelle pour filtrer par statut de commande
  filterByOrderStatus(status: string | null): void {
    if (status === null) {
      this.filteredProducts = [...this.products];
    } else {
      // this.filteredProducts = this.products.filter(product => 
      //   (product.orderStatus || 'pending') === status
      // );
    }
  }

  // Méthode pour obtenir le nombre de produits par statut
  getStatusCounts(): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    
    // ORDER_STATUSES.forEach(status => {
    //   counts[status.value] = this.products.filter(product => 
    //     (product.orderStatus || 'pending') === status.value
    //   ).length;
    // });
    
    return counts;
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

