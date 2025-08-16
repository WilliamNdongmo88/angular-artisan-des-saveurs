import { Injectable, OnInit } from '@angular/core';
import { map, Observable, of, shareReplay } from 'rxjs';
import { Product, ProductCategory } from '../models/product';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProductResponse } from '../models/product.models';
import { tap } from 'rxjs/operators';

const PRODUCTS_API = 'http://localhost:8070/api/products/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ProductService implements OnInit {
  private products : Product[] = [];
  private productsCache$: Observable<any[]> | null = null;
  private productCacheMap = new Map<number, Observable<Product>>();
  // private products: Product[] = [
  //   {
  //     id: 1,
  //     name: 'Côtes de Porc Première',
  //     description: 'Côtes de porc fraîches, parfaites pour vos grillades et barbecues. Viande tendre et savoureuse, idéale pour les repas en famille ou entre amis.',
  //     price: 583,
  //     unit: 'kg',
  //     category: ProductCategory.COTES_TRAVERS,
  //     image: 'img/produits/cote-de-porc.jpg',
  //     featured: true,
  //     origin: 'Île Maurice',
  //     preparation: 'Idéales grillées au barbecue ou à la plancha. Cuisson recommandée : 6-8 minutes de chaque côté à feu moyen.'
  //   },
  //   {
  //     id: 2,
  //     name: 'Rouelle de Porc',
  //     description: 'Morceau généreux découpé dans la cuisse du porc, avec os et gras, idéal pour les cuissons longues. Sa chair moelleuse et savoureuse en fait un plat familial traditionnel apprécié.',
  //     price: 583,
  //     unit: 'kg',
  //     category: ProductCategory.COTES_TRAVERS,
  //     image: 'img/produits/rouelle-de-porc.webp',
  //     featured: false,
  //     origin: 'Île Maurice',
  //     preparation: 'Cuisson lente au four à 180°C pendant 2h à 2h30, arrosée régulièrement de son jus. Peut aussi être mijotée en cocotte avec des légumes et des aromates.'
  //   },
  //   // {
  //   //   id: 2'
  //   //   name: 'Travers de Porc',
  //   //   description: 'Travers de porc marinés selon notre recette maison. Parfaits pour une cuisson lente au four ou au barbecue.',
  //   //   price: 583,
  //   //   unit: 'kg',
  //   //   category: ProductCategory.COTES_TRAVERS,
  //   //   image: 'img/produits/cotes-de-porc.webp',
  //   //   featured: false,
  //   //   origin: 'Île Maurice',
  //   //   preparation: 'Cuisson lente au four à 160°C pendant 2h30 ou au barbecue à feu doux. Badigeonner régulièrement de marinade.'
  //   // },
  //   {
  //     id: 3,
  //     name: 'Rôti de Porc dans l\'Échine',
  //     description: 'Rôti de porc tendre et juteux, parfait pour vos repas dominicaux. Préparé avec soin par nos bouchers expérimentés.',
  //     price: 550,
  //     unit: 'kg',
  //     category: ProductCategory.ROTIS_FILETS,
  //     image: 'img/produits/roti-de-porc.jpg',
  //     featured: true,
  //     origin: 'Île Maurice',
  //     preparation: 'Cuisson au four à 180°C, compter 25 minutes par 500g. Laisser reposer 10 minutes avant de découper.'
  //   },
  //   {
  //     id: 4,
  //     name: 'Filet de Porc',
  //     description: 'Morceau noble et tendre, le filet de porc se cuisine rapidement et offre une chair délicate et savoureuse.',
  //     price: 290,
  //     unit: 'kg',
  //     category: ProductCategory.ROTIS_FILETS,
  //     image: 'img/produits/roti-de-porc.jpg',
  //     featured: false,
  //     origin: 'Île Maurice',
  //     preparation: 'Cuisson rapide à la poêle ou au four. 15-20 minutes à 200°C. Ne pas trop cuire pour garder la tendreté.'
  //   },
  //   {
  //     id: 5,
  //     name: 'Rôti de Porc Farci',
  //     description: 'Rôti de porc farci aux herbes de Provence et aux champignons. Une spécialité de notre boucherie pour les grandes occasions.',
  //     price: 390,
  //     unit: 'kg',
  //     category: ProductCategory.ROTIS_FILETS,
  //     image: 'img/produits/roti-de-porc.jpg',
  //     featured: false,
  //     origin: 'Île Maurice',
  //     preparation: 'Cuisson au four à 170°C pendant 45 minutes. Arroser régulièrement avec le jus de cuisson.'
  //   },
  //   {
  //     id: 6,
  //     name: 'Chipolata Normale',
  //     description: 'Saucisses artisanales préparées selon nos recettes traditionnelles. 100% viande de porc, sans colorants ni conservateurs.',
  //     price: 698,
  //     unit: 'kg',
  //     category: ProductCategory.SAUCISSES_CHARCUTERIE,
  //     image: 'img/produits/chipo-normal.jpg',
  //     featured: true,
  //     origin: 'Fabrication Maison',
  //     preparation: 'Cuisson à la poêle à feu moyen pendant 12-15 minutes en les retournant régulièrement.'
  //   },
  //   {
  //     id: 7,
  //     name: 'Chipolata aux Herbes',
  //     description: 'Saucisses parfumées aux herbes de Provence, idéales pour apporter une touche méditerranéenne à vos repas.',
  //     price: 731.50,
  //     unit: 'kg',
  //     category: ProductCategory.SAUCISSES_CHARCUTERIE,
  //     image: 'img/produits/chipo_aux_herbes.png',
  //     featured: false,
  //     origin: 'Fabrication Maison',
  //     preparation: 'Parfaites grillées au barbecue ou cuites à la poêle avec un peu d\'huile d\'olive.'
  //   },
  //   {
  //     id: 8,
  //     name: 'Jambon Cuit Torchon',
  //     description: 'Jambon blanc cuit à l\'ancienne, sans polyphosphates. Goût authentique et texture fondante garantis.',
  //     price: 885.50,
  //     unit: 'kg',
  //     category: ProductCategory.SAUCISSES_CHARCUTERIE,
  //     image: 'img/produits/jambon-de-porc.png',
  //     featured: false,
  //     origin: 'Fabrication Maison',
  //     preparation: 'Prêt à consommer. Parfait en sandwich, salade ou plat chaud. Se conserve 5 jours au réfrigérateur.'
  //   },
  //   {
  //     id: 9,
  //     name: 'Jarret de Porc',
  //     description: 'Jarret de porc parfait pour vos plats mijotés et potées. Viande gélatineuse qui apporte du moelleux à vos préparations.',
  //     price: 220,
  //     unit: 'kg',
  //     category: ProductCategory.MORCEAUX_BRAISER,
  //     image: 'img/produits/jarret-de-porc.jpg',
  //     featured: false,
  //     origin: 'Île Maurice',
  //     preparation: 'Idéal pour les plats mijotés. Cuisson lente 2-3h dans un bouillon avec légumes et aromates.'
  //   },
  //   {
  //     id: 10,
  //     name: 'Palette de Porc',
  //     description: 'Morceau savoureux idéal pour les cuissons lentes. Parfait pour les rôtis braisés et les plats en sauce.',
  //     price: 430,
  //     unit: 'kg',
  //     category: ProductCategory.MORCEAUX_BRAISER,
  //     image: 'img/produits/palette-de-porc.jpg',
  //     featured: false,
  //     origin: 'Île Maurice',
  //     preparation: 'Braiser au four à 160°C pendant 2h30 avec légumes et vin blanc. Viande fondante garantie.'
  //   },
  //   {
  //     id: 11,
  //     name: 'Poitrine de Porc',
  //     description: 'Poitrine de porc fraîche, parfaite pour les lardons maison ou les plats traditionnels comme le petit salé.',
  //     price: 506,
  //     unit: 'kg',
  //     category: ProductCategory.MORCEAUX_BRAISER,
  //     image: 'img/produits/poitrine-de-porc.jpg',
  //     featured: false,
  //     origin: 'Île Maurice',
  //     preparation: 'Pour petit salé : cuire 1h30 dans l\'eau bouillante avec légumes. Pour lardons : découper et faire revenir.'
  //   },
  //   {
  //     id: 12,
  //     name: 'Lardons Fumés',
  //     description: 'Lardons fumés au bois de hêtre, découpés à la demande. Parfaits pour vos quiches, salades et plats cuisinés.',
  //     price: 250,
  //     unit: 'kg',
  //     category: ProductCategory.PRODUITS_TRANSFORMES,
  //     image: 'img/produits/saucisses-fraiches.jpg',
  //     featured: false,
  //     origin: 'Fabrication Maison',
  //     preparation: 'Faire revenir à sec dans une poêle chaude jusqu\'à ce qu\'ils soient dorés et croustillants.'
  //   },
  //   {
  //     id: 13,
  //     name: 'Bacon Artisanal',
  //     description: 'Bacon préparé selon la méthode traditionnelle, fumé lentement pour développer tous ses arômes.',
  //     price: 590,
  //     unit: 'kg',
  //     category: ProductCategory.PRODUITS_TRANSFORMES,
  //     image: 'img/produits/saucisses-fraiches.jpg',
  //     featured: false,
  //     origin: 'Fabrication Maison',
  //     preparation: 'Cuire à la poêle 2-3 minutes de chaque côté jusqu\'à obtenir la croustillance désirée.'
  //   },
  //   {
  //     id: 14,
  //     name: 'Pâté de Campagne',
  //     description: 'Pâté de campagne traditionnel préparé avec du porc fermier. Recette familiale transmise de génération en génération.',
  //     price: 390,
  //     unit: 'kg',
  //     category: ProductCategory.PRODUITS_TRANSFORMES,
  //     image: 'img/produits/saucisses-fraiches.jpg',
  //     featured: false,
  //     origin: 'Fabrication Maison',
  //     preparation: 'Prêt à consommer. Servir à température ambiante avec du pain frais et des cornichons.'
  //   }
  // ];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getAllProducts();
  }

  getAllProducts(): Observable<any[]> {
    if (!this.productsCache$) {
      this.productsCache$ = this.http.get<ProductResponse[]>(PRODUCTS_API + 'available').pipe(
        map((datas: ProductResponse[]) =>
          datas.map(product => ({
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
    const product$ = this.http.get<ProductResponse>(`${PRODUCTS_API}${id}`).pipe(
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


