import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CurrencyService } from '../services/currency.service';

@Pipe({
  name: 'currencyFormat',
  pure: false, // Pour que le pipe se mette à jour quand la devise change
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform, OnDestroy {
  private subscription?: Subscription;
  private lastPrice?: number;
  private lastCurrency?: string;
  private lastFormattedPrice?: string;

  constructor(private currencyService: CurrencyService) {
    // S'abonner aux changements de devise
    this.subscription = this.currencyService.currentCurrency$.subscribe(() => {
      // Réinitialiser le cache quand la devise change
      this.lastPrice = undefined;
      this.lastCurrency = undefined;
      this.lastFormattedPrice = undefined;
    });
  }

  transform(price: number, currencyCode?: string): string {
    const targetCurrency = currencyCode || this.currencyService.getCurrentCurrency();
    
    // Optimisation : éviter de recalculer si les paramètres n'ont pas changé
    if (this.lastPrice === price && this.lastCurrency === targetCurrency && this.lastFormattedPrice) {
      return this.lastFormattedPrice;
    }

    this.lastPrice = price;
    this.lastCurrency = targetCurrency;
    this.lastFormattedPrice = this.currencyService.formatPrice(price, targetCurrency);
    
    return this.lastFormattedPrice;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
