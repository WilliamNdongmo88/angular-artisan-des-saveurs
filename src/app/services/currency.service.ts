import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Taux de change par rapport à la devise de base (Rs)
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currentCurrencySubject = new BehaviorSubject<string>('RS');
  public currentCurrency$ = this.currentCurrencySubject.asObservable();

  // Devise de base : Roupie (Rs)
  private baseCurrency = 'RS';

  public availableCurrencies: Currency[] = [
    { code: 'RS', name: 'Roupie', symbol: 'Rs', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.021 }, // 1 Rs = 0.021 EUR (approximatif)
    { code: 'USD', name: 'Dollar US', symbol: '$', rate: 0.023 } // 1 Rs = 0.023 USD (approximatif)
  ];

  constructor() {
    // Charger la devise depuis le localStorage ou utiliser 'RS' par défaut
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'RS';
    this.setCurrency(savedCurrency);
  }

  getCurrentCurrency(): string {
    return this.currentCurrencySubject.value;
  }

  getCurrentCurrencyInfo(): Currency | undefined {
    return this.availableCurrencies.find(c => c.code === this.getCurrentCurrency());
  }

  setCurrency(currencyCode: string): void {
    const currency = this.availableCurrencies.find(c => c.code === currencyCode);
    if (currency) {
      this.currentCurrencySubject.next(currencyCode);
      localStorage.setItem('selectedCurrency', currencyCode);
    }
  }

  convertPrice(price: number, fromCurrency?: string, toCurrency?: string): number {
    const from = fromCurrency || this.baseCurrency;
    const to = toCurrency || this.getCurrentCurrency();

    if (from === to) {
      return price;
    }

    const fromCurrencyInfo = this.availableCurrencies.find(c => c.code === from);
    const toCurrencyInfo = this.availableCurrencies.find(c => c.code === to);

    if (!fromCurrencyInfo || !toCurrencyInfo) {
      console.warn(`Currency conversion failed: ${from} to ${to}`);
      return price;
    }

    // Convertir d'abord vers la devise de base (Rs), puis vers la devise cible
    const priceInBase = price / fromCurrencyInfo.rate;
    return priceInBase * toCurrencyInfo.rate;
  }

  formatPrice(price: number, currencyCode?: string): string {
    const currency = currencyCode 
      ? this.availableCurrencies.find(c => c.code === currencyCode)
      : this.getCurrentCurrencyInfo();

    if (!currency) {
      return price.toString();
    }

    const convertedPrice = this.convertPrice(price, this.baseCurrency, currency.code);
    
    // Formatage selon la devise
    switch (currency.code) {
      case 'EUR':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(convertedPrice);
      
      case 'USD':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(convertedPrice);
      
      case 'RS':
      default:
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          currencyDisplay: 'symbol',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(convertedPrice).replace('₹', 'Rs ');
    }
  }

  // Méthode pour mettre à jour les taux de change (à appeler périodiquement)
  updateExchangeRates(): Observable<boolean> {
    // Dans une vraie application, ceci ferait appel à une API de taux de change
    // Pour la démo, on simule une mise à jour
    return new Observable(observer => {
      setTimeout(() => {
        // Simulation de nouveaux taux (avec une petite variation aléatoire)
        this.availableCurrencies.forEach(currency => {
          if (currency.code !== this.baseCurrency) {
            const variation = (Math.random() - 0.5) * 0.02; // ±1% de variation
            currency.rate = currency.rate * (1 + variation);
          }
        });
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  // Obtenir le symbole de la devise actuelle
  getCurrentSymbol(): string {
    const currency = this.getCurrentCurrencyInfo();
    return currency ? currency.symbol : 'Rs';
  }

  // Obtenir le nom de la devise actuelle
  getCurrentName(): string {
    const currency = this.getCurrentCurrencyInfo();
    return currency ? currency.name : 'Roupie';
  }
}
