import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from '../services/i18n.service';

@Pipe({
  name: 'translate',
  pure: false, // Pour que le pipe se mette à jour quand la langue change
  standalone: true
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription?: Subscription;
  private lastKey?: string;
  private lastParams?: any;
  private lastTranslation?: string;

  constructor(private i18nService: I18nService) {
    // S'abonner aux changements de langue
    this.subscription = this.i18nService.currentLanguage$.subscribe(() => {
      // Réinitialiser le cache quand la langue change
      this.lastKey = undefined;
      this.lastParams = undefined;
      this.lastTranslation = undefined;
    });
  }

  transform(key: string, params?: { [key: string]: any }): string {
    // Optimisation : éviter de recalculer si les paramètres n'ont pas changé
    if (this.lastKey === key && this.deepEqual(this.lastParams, params) && this.lastTranslation) {
      return this.lastTranslation;
    }

    this.lastKey = key;
    this.lastParams = params;
    this.lastTranslation = this.i18nService.translate(key, params);
    
    return this.lastTranslation;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) {
      return true;
    }

    if (obj1 == null || obj2 == null) {
      return obj1 === obj2;
    }

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!keys2.includes(key) || !this.deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }
}