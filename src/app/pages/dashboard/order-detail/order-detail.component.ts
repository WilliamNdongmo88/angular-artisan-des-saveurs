import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { Observable } from 'rxjs';
import { OrderPayload } from '../../../models/order';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order$: Observable<OrderPayload | undefined> | undefined;
  orderId: number = 0;
  newStatus: string = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.orderId = orderId;
    console.log("order Id ::: " , orderId);
    if (orderId) {
      this.order$ = this.orderService.getOrderById(orderId);
    }
  }
  onStatusChange($event: Event){
    const newStatus = ($event.target as HTMLSelectElement).value;
    this.newStatus = newStatus;
    console.log("new status ::: ", this.newStatus);
  }

  updateStatusOrder(){
    this.orderService.updateOrderStatus(this.orderId, this.newStatus).subscribe({
      next: (response) => {
      console.log('Statut de la commande mis à jour : ', response);
      this.order$ = this.orderService.getOrderById(this.orderId);
      },
      error: (err) => {
      console.error('Erreur lors de la mise à jour du statut', err);
      }
    });
  }
}
