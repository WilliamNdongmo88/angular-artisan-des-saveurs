// src/app/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { OrderPayload } from '../models/order';

@Injectable({
  providedIn: 'root'
} )
export class OrderService {
  private apiUrl = 'https://artisan-des-saveurs-production.up.railway.app/api/orders';

  constructor(private http: HttpClient ) { }

  // Récupère toutes les commandes
  getOrders(): Observable<OrderPayload[]> {
    return this.http.get<OrderPayload[]>(`${this.apiUrl}/all-orders` ).pipe(
      map(orders => {
        orders = orders.map(order => ({
          ...order, 
            slug: order.status.toLowerCase().replace(/\s+/g, '-')
        }));
        console.log('Commandes récupérées:', orders );
        return orders;
      }),
      catchError(this.handleError<OrderPayload[]>('getOrders', []))
    );
  }

  // Récupère une seule commande par son ID
  getOrderById(id: number): Observable<OrderPayload | undefined> {
    // Pour cet exemple, on filtre les résultats de getOrders().
    // Idéalement, votre API devrait avoir un endpoint comme /api/orders/{id}
    return this.getOrders().pipe(
      map(orders => orders.find(order => order.id === id))
    );
  }

  // Gestionnaire d'erreurs simple
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Retourne un résultat vide pour que l'application continue de fonctionner
      return of(result as T);
    };
  }
}
