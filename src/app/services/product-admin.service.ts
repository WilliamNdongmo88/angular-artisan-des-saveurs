import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, Observable, shareReplay, tap } from 'rxjs';
import { Product, ProductDto, ProductResponse } from '../models/product.models';
import { MessageResponse } from '../models/auth.models';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';

//const PRODUCTS_API = 'http://localhost:8070/api/products/';
//const PRODUCTS_API = 'https://artisan-des-saveurs-production.up.railway.app/api/products/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ProductAdminService {
  private products : Product[] = [];
  private productsSubject = new BehaviorSubject<ProductResponse[]>([]);
  products$ = this.productsSubject.asObservable();

  private PRODUCTS_API: string | undefined;
  private isProd = environment.production;

  constructor(private http: HttpClient) { 
    // Définir l'URL de l'API selon l'environnement
    if (this.isProd) {
      this.PRODUCTS_API = environment.apiUrlProd + '/products/';
    } else {
      this.PRODUCTS_API = environment.apiUrlDev + '/products/';
    }
  }

  /** Ajout d'un produit */
  createProduct(product: ProductDto, file: File): Observable<ProductResponse> {
    const formData = new FormData();

    // fichier
    formData.append('file', file);

    // JSON -> Blob avec type application/json
    formData.append(
      'product',
      new Blob([JSON.stringify(product)], { type: 'application/json' })
    );

    return this.http.post<ProductResponse>(
      this.PRODUCTS_API + 'create',
      formData,
      {
        headers: {
          // A ne pas mettre "Content-Type": multipart/form-data ici,
          // HttpClient le gère automatiquement
        }
      }
    ).pipe(
      tap((newProduct) => {
        this.productsSubject.next([...this.productsSubject.value, newProduct]);
      })
    );
  }

  getAllProducts() {
    return this.http.get<ProductResponse[]>(this.PRODUCTS_API + 'all-products');
  }


  /** Mise à jour d'un produit */
  updateProduct(id: number, product: ProductDto, file: File): Observable<ProductResponse> {
    const formData = new FormData();

    // fichier
    if (file) {
      formData.append('file', file);
    }

    // JSON -> Blob avec type application/json
    formData.append(
      'product',
      new Blob([JSON.stringify(product)], { type: 'application/json' })
    );

    return this.http.put<ProductResponse>(
      `${this.PRODUCTS_API}${id}`,  // 👈 Corrigé
      formData
    ).pipe(
      tap((updated) => {
        const currentProducts = this.productsSubject.value;
        const newList = currentProducts.map(p =>
          p.id === updated.id ? { ...p, ...updated } : p
        );
        this.productsSubject.next(newList);
      })
    );
  }

  /** Suppression d'un produit */
  deleteProduct(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.PRODUCTS_API}${id}`)
      .pipe(
        tap(() => {
          const newList = this.productsSubject.value.filter(p => p.id !== id);
          this.productsSubject.next(newList);
        })
      );
  }

  getProductById(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.PRODUCTS_API}${id}`);
  }

  getProductsByCategory(category: string): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.PRODUCTS_API}category/${category}`);
  }

  searchProducts(name: string): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.PRODUCTS_API}search?name=${name}`);
  }

  getAllCategories(): Observable<string[]> {
    return this.http.get<string[]>(this.PRODUCTS_API + 'categories');
  }

  toggleProductAvailability(id: number): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(`${this.PRODUCTS_API}${id}/toggle-availability`, {});
  }
}

