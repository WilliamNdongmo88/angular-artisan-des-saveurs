import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, Observable, shareReplay, tap } from 'rxjs';
import { Product, ProductDto, ProductResponse } from '../models/product.models';
import { MessageResponse } from '../models/auth.models';

//const PRODUCTS_API = 'http://localhost:8070/api/products/';
const PRODUCTS_API = 'https://artisan-des-saveurs-production.up.railway.app/api/products/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

interface FileDTO {
  name: string;
  temp: string;
  content: string; // URL publique Nginx
}

@Injectable({
  providedIn: 'root'
})
export class ProductAdminService {
  private products : Product[] = [];
  private productsSubject = new BehaviorSubject<ProductResponse[]>([]);
  products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) { }

  uploadFile(file: File): Observable<FileDTO> {
    const formData = new FormData();
    formData.append('file', file);  // doit matcher @RequestParam("file") côté backend

    return this.http.post<FileDTO>(`${PRODUCTS_API}/files-upload`, formData);
  }


  /** Ajout d'un produit */
  createProduct(product: ProductDto): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(PRODUCTS_API + 'create', product, httpOptions)
      .pipe(
        tap((newProduct) => {
          this.productsSubject.next([...this.productsSubject.value, newProduct]);
        })
      );
  }
  // createProduct(product: ProductToSend): Observable<ProductResponse> {
  //   return this.http.post<ProductResponse>(PRODUCTS_API + 'create', product, httpOptions);
  // }

  /** Récupère tous les produits disponibles et met à jour le BehaviorSubject */
  /*getAvailableProducts(): void {
    this.http.get<ProductResponse[]>(PRODUCTS_API + 'available')
      .subscribe((products) => {
        this.productsSubject.next(products);
      });
  }*/
  getAvailableProducts() {
    return this.http.get<ProductResponse[]>(PRODUCTS_API + 'available');
  }


  /** Mise à jour d'un produit */
  updateProduct(id: number, product: ProductDto): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${PRODUCTS_API}${id}`, product, httpOptions)
      .pipe(
        tap((updated) => {
          const currentProducts = this.productsSubject.value;
          const newList = currentProducts.map(p =>
            p.id === updated.id ? { ...p, ...updated } : p
          );
          this.productsSubject.next(newList);
        })
      );
  }
  // updateProduct(id: number, product: ProductToSend): Observable<ProductResponse> {
  //   return this.http.put<ProductResponse>(`${PRODUCTS_API}${id}`, product, httpOptions);
  // }

  /** Suppression d'un produit */
  deleteProduct(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${PRODUCTS_API}${id}`)
      .pipe(
        tap(() => {
          const newList = this.productsSubject.value.filter(p => p.id !== id);
          this.productsSubject.next(newList);
        })
      );
  }
  // deleteProduct(id: number): Observable<MessageResponse> {
  //   return this.http.delete<MessageResponse>(`${PRODUCTS_API}${id}`);
  // }


  getProductById(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${PRODUCTS_API}${id}`);
  }

  getProductsByCategory(category: string): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${PRODUCTS_API}category/${category}`);
  }

  searchProducts(name: string): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${PRODUCTS_API}search?name=${name}`);
  }

  getAllCategories(): Observable<string[]> {
    return this.http.get<string[]>(PRODUCTS_API + 'categories');
  }

  toggleProductAvailability(id: number): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(`${PRODUCTS_API}${id}/toggle-availability`, {});
  }
}

