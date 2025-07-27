import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favorites: Product[] = [];
  private favoritesSubject = new BehaviorSubject<Product[]>([]);

  constructor() {
    this.loadFavoritesFromStorage();
  }

  getFavorites() {
    return this.favoritesSubject.asObservable();
  }

  getFavoritesList(): Product[] {
    return this.favorites;
  }

  addToFavorites(product: Product) {
    if (!this.isFavorite(product.id)) {
      this.favorites.push(product);
      this.saveFavoritesToStorage();
      this.favoritesSubject.next([...this.favorites]);
    }
  }

  removeFromFavorites(productId: string) {
    this.favorites = this.favorites.filter(product => product.id !== productId);
    this.saveFavoritesToStorage();
    this.favoritesSubject.next([...this.favorites]);
  }

  toggleFavorite(product: Product) {
    if (this.isFavorite(product.id)) {
      this.removeFromFavorites(product.id);
    } else {
      this.addToFavorites(product);
    }
  }

  isFavorite(productId: string): boolean {
    return this.favorites.some(product => product.id === productId);
  }

  getFavoritesCount(): number {
    return this.favorites.length;
  }

  clearFavorites() {
    this.favorites = [];
    this.saveFavoritesToStorage();
    this.favoritesSubject.next([]);
  }

  private loadFavoritesFromStorage() {
    try {
      const savedFavorites = localStorage.getItem('artisan-favorites');
      if (savedFavorites) {
        this.favorites = JSON.parse(savedFavorites);
        this.favoritesSubject.next([...this.favorites]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      this.favorites = [];
    }
  }

  private saveFavoritesToStorage() {
    try {
      localStorage.setItem('artisan-favorites', JSON.stringify(this.favorites));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des favoris:', error);
    }
  }
}

