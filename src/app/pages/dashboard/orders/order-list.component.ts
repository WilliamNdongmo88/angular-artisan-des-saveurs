// src/app/features/orders/order-list/order-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Importer RouterModule
import { OrderService } from '../../../services/order.service';
import { OrderPayload } from '../../../models/order';
import { HeaderComponent } from "../header/header";

@Component({
  selector: 'app-order-list',
  standalone: true,
  // Mettre à jour les imports
  imports: [CommonModule, FormsModule, RouterModule, CurrencyPipe, DatePipe, HeaderComponent],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  orders: OrderPayload[] = [];
  filteredOrders: OrderPayload[] = [];
  
  searchTerm: string = '';
  statusFilter: string = 'Tous';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  isLoading: boolean = true; // Pour afficher un indicateur de chargement

  constructor(private orderService: OrderService, private router: Router) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getOrders().subscribe(data => {
      this.orders = data;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  applyFilters(): void {
    let tempOrders = this.orders;

    if (this.statusFilter !== 'Tous') {
      tempOrders = tempOrders.filter(order => order.status.toLowerCase() === this.statusFilter.toLowerCase());
    }

    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase();
      tempOrders = tempOrders.filter(order =>
        order.user.fullName.toLowerCase().includes(lowerSearchTerm) ||
        order.id.toString().includes(lowerSearchTerm)
      );
    }

    this.filteredOrders = tempOrders;
    this.currentPage = 1;
  }
  
  // La navigation se fera via routerLink dans le template
  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/dashboard/orders', orderId]);
  }

  // Les getters pour la pagination restent les mêmes
  get paginatedOrders(): OrderPayload[] {
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
}
