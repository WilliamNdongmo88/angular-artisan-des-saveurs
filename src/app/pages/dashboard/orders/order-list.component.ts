import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../header/header";

// Modèle pour une commande (à adapter selon votre structure de données)
export interface Order {
  id: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  status: 'En attente' | 'En cours' | 'Expédiée' | 'Livrée' | 'Annulée';
  items: number;
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  
  // Filtres et pagination
  searchTerm: string = '';
  statusFilter: string = 'Tous';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor() { }

  ngOnInit(): void {
    // Simuler la récupération de données depuis un service
    this.orders = this.getMockOrders();
    this.applyFilters();
  }

  applyFilters(): void {
    let tempOrders = this.orders;

    // 1. Filtrer par statut
    if (this.statusFilter !== 'Tous') {
      tempOrders = tempOrders.filter(order => order.status === this.statusFilter);
    }

    // 2. Filtrer par recherche (nom ou ID)
    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase();
      tempOrders = tempOrders.filter(order =>
        order.customerName.toLowerCase().includes(lowerSearchTerm) ||
        order.id.toLowerCase().includes(lowerSearchTerm)
      );
    }

    this.filteredOrders = tempOrders;
    this.currentPage = 1; // Revenir à la première page après un filtre
  }

  get paginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Simule une source de données
  private getMockOrders(): Order[] {
    return [
      { id: 'CMD-001', customerName: 'Jean Dupont', orderDate: '2025-08-28', totalAmount: 150.50, status: 'Livrée', items: 3 },
      { id: 'CMD-002', customerName: 'Marie Curie', orderDate: '2025-08-27', totalAmount: 75.00, status: 'En cours', items: 2 },
      { id: 'CMD-003', customerName: 'Pierre Martin', orderDate: '2025-08-26', totalAmount: 320.00, status: 'Expédiée', items: 5 },
      { id: 'CMD-004', customerName: 'Sophie Dubois', orderDate: '2025-08-25', totalAmount: 45.99, status: 'Annulée', items: 1 },
      { id: 'CMD-005', customerName: 'Lucas Bernard', orderDate: '2025-08-28', totalAmount: 210.20, status: 'En attente', items: 4 },
      { id: 'CMD-006', customerName: 'Camille Petit', orderDate: '2025-08-27', totalAmount: 88.00, status: 'Livrée', items: 2 },
    ];
  }
}
