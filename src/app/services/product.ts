import { Injectable, OnInit } from '@angular/core';
import { map, Observable, of, shareReplay } from 'rxjs';
import { Product, ProductCategory } from '../models/product';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProductResponse } from '../models/product.models';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

//const PRODUCTS_API = 'http://localhost:8070/api/products/';
//const PRODUCTS_API = 'https://artisan-des-saveurs-production.up.railway.app/api/products/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products : Product[] = [];
  private productsCache$: Observable<any[]> | null = null;
  private productCacheMap = new Map<number, Observable<Product>>();

  private PRODUCTS_API: string | undefined;
  private isProd = environment.production;

  constructor(private http: HttpClient) {
    if (this.isProd) {
      this.PRODUCTS_API = environment.apiUrlProd + '/products/';
    } else {
      this.PRODUCTS_API = environment.apiUrlDev + '/products/';
    }
  }

  getAllProducts(): Observable<any[]> {
    if (!this.productsCache$) {
      this.productsCache$ = this.http.get<ProductResponse[]>(this.PRODUCTS_API + 'available').pipe(
        map((datas: ProductResponse[]) =>
          datas.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            unit: product.unit,
            category: product.category,
            image: product.mainImage.filePath,
            origin: product.origin,
            preparation: product.preparation,
            featured: product.featured,
            imageUrl: product.imageUrl,
            available: product.available,
            stockQuantity: product.stockQuantity,
          }))
        ),
        tap(products => {
          this.products = products;
        }),
        shareReplay(1)  // <-- Important : permet de partager la même valeur à tous les abonnés et de la mettre en cache
      );
    }
    return this.productsCache$;
  }

  getProducts(): Observable<Product[]> {
    console.log("products ::: ", this.products);
      return of(this.products);
  }

  getProductsByCategory(category: ProductCategory): Observable<Product[]> {
    const filteredProducts = this.products.filter(product => product.category === category);
    return of(filteredProducts);
  }

  getFeaturedProducts(): Observable<Product[]> {
    this.getAllProducts();
    console.log("products ::: ", this.products);
    const featuredProducts = this.products.filter(product => product.featured);
    return of(featuredProducts);
  }


  getProductById(id: number): Observable<Product> {
    // Si déjà en cache, on renvoie la version existante
    if (this.productCacheMap.has(id)) {
      return this.productCacheMap.get(id)!;
    }

    // Sinon, on fait l'appel API et on met en cache
    const product$ = this.http.get<ProductResponse>(`${this.PRODUCTS_API}${id}`).pipe(
      map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        unit: product.unit,
        category: product.category,
        image: product.mainImage.content,
        origin: product.origin,
        preparation: product.preparation,
        featured: product.featured,
        imageUrl: product.imageUrl,
        available: product.available,
        stockQuantity: product.stockQuantity,
      })),
      tap(product => {
        // Optionnel : on peut aussi mettre à jour le tableau global si on veut
        const index = this.products.findIndex(p => p.id === id);
        if (index >= 0) {
          this.products[index] = product;
          console.log("this.products[index] ", this.products[index])
        } else {
          this.products.push(product);
        }
      }),
      shareReplay(1)
    );

    this.productCacheMap.set(id, product$);
    return product$;
  }


  getCategoryDisplayName(category: ProductCategory): string {
    const categoryNames = {
      [ProductCategory.COTES_TRAVERS]: 'Côtes et Travers',
      [ProductCategory.ROTIS_FILETS]: 'Rôtis et Filets',
      [ProductCategory.SAUCISSES_CHARCUTERIE]: 'Saucisses et Charcuterie',
      [ProductCategory.MORCEAUX_BRAISER]: 'Morceaux à Braiser',
      [ProductCategory.PRODUITS_TRANSFORMES]: 'Produits Transformés'
    };
    return categoryNames[category];
  }

  getAllCategories(): ProductCategory[] {
    return Object.values(ProductCategory);
  }

  private slugify(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}


