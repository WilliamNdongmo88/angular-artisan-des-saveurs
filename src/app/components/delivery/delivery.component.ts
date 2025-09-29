import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface DeliveryMethod {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface DeliveryOption {
  method: string;
  address?: string;
  estimatedDate?: Date;
  cost?: number;
}

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css']
})
export class DeliveryComponent {
  
  // Propriété pour la méthode de livraison sélectionnée
  @Input() selectedMethod: string = 'recuperer';
  
  // Événement émis quand la méthode de livraison change
  @Output() deliveryMethodChange = new EventEmitter<string>();
  
  // Événement émis avec les détails complets de la sélection
  @Output() deliveryOptionChange = new EventEmitter<DeliveryOption>();
  
  // Liste des méthodes de livraison disponibles
  deliveryMethods: DeliveryMethod[] = [
    {
      id: 'expedier',
      label: 'Expédier',
      description: 'Livraison à domicile ou à l\'adresse de votre choix',
      icon: 'truck'
    },
    {
      id: 'recuperer',
      label: 'Récupérer',
      description: 'Retrait en magasin ou point de collecte',
      icon: 'home'
    }
  ];

  constructor() {}

  /**
   * Sélectionne une méthode de livraison
   * @param method - L'identifiant de la méthode de livraison
   */
  selectDeliveryMethod(method: string): void {
    if (this.selectedMethod !== method) {
      this.selectedMethod = method;
      this.deliveryMethodChange.emit(method);
      
      // Émettre les détails complets de la sélection
      const deliveryOption: DeliveryOption = {
        method: method,
        estimatedDate: this.getEstimatedDeliveryDate(method),
        cost: this.getDeliveryCost(method)
      };
      
      this.deliveryOptionChange.emit(deliveryOption);
    }
  }

  /**
   * Vérifie si une méthode de livraison est sélectionnée
   * @param method - L'identifiant de la méthode de livraison
   * @returns true si la méthode est sélectionnée
   */
  isSelected(method: string): boolean {
    return this.selectedMethod === method;
  }

  /**
   * Obtient les détails d'une méthode de livraison
   * @param methodId - L'identifiant de la méthode
   * @returns L'objet DeliveryMethod correspondant
   */
  getDeliveryMethod(methodId: string): DeliveryMethod | undefined {
    return this.deliveryMethods.find(method => method.id === methodId);
  }

  /**
   * Calcule la date estimée de livraison selon la méthode
   * @param method - La méthode de livraison
   * @returns Date estimée de livraison
   */
  private getEstimatedDeliveryDate(method: string): Date {
    const today = new Date();
    const estimatedDate = new Date(today);
    
    switch (method) {
      case 'expedier':
        // Livraison sous 3-5 jours ouvrables
        estimatedDate.setDate(today.getDate() + 5);
        break;
      case 'recuperer':
        // Disponible dès le lendemain
        estimatedDate.setDate(today.getDate() + 1);
        break;
      default:
        estimatedDate.setDate(today.getDate() + 3);
    }
    
    return estimatedDate;
  }

  /**
   * Calcule le coût de livraison selon la méthode
   * @param method - La méthode de livraison
   * @returns Coût de la livraison
   */
  private getDeliveryCost(method: string): number {
    switch (method) {
      case 'expedier':
        return 5.99; // Frais de livraison standard
      case 'recuperer':
        return 0; // Retrait gratuit
      default:
        return 0;
    }
  }

  /**
   * Obtient le libellé formaté de la méthode sélectionnée
   * @returns Le libellé de la méthode sélectionnée
   */
  getSelectedMethodLabel(): string {
    const method = this.getDeliveryMethod(this.selectedMethod);
    return method ? method.label : this.selectedMethod;
  }

  /**
   * Obtient la description de la méthode sélectionnée
   * @returns La description de la méthode sélectionnée
   */
  getSelectedMethodDescription(): string {
    const method = this.getDeliveryMethod(this.selectedMethod);
    return method?.description || '';
  }

  /**
   * Vérifie si la livraison est gratuite
   * @returns true si la livraison est gratuite
   */
  isFreeDelivery(): boolean {
    return this.getDeliveryCost(this.selectedMethod) === 0;
  }

  /**
   * Obtient le coût formaté de la livraison
   * @returns Le coût formaté (ex: "5,99 €" ou "Gratuit")
   */
  getFormattedDeliveryCost(): string {
    const cost = this.getDeliveryCost(this.selectedMethod);
    return cost === 0 ? 'Gratuit' : `${cost.toFixed(2).replace('.', ',')} €`;
  }

  /**
   * Obtient la date de livraison formatée
   * @returns La date formatée (ex: "Demain" ou "Vendredi 29 septembre")
   */
  getFormattedDeliveryDate(): string {
    const estimatedDate = this.getEstimatedDeliveryDate(this.selectedMethod);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (estimatedDate.toDateString() === tomorrow.toDateString()) {
      return 'Demain';
    }
    
    return estimatedDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  /**
   * Gère le changement via l'input radio
   * @param event - L'événement de changement
   */
  onRadioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.selectDeliveryMethod(target.value);
    }
  }
}

