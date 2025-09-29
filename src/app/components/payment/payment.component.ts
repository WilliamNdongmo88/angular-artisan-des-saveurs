import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../services/user.service';

export interface PaymentMethod {
  id: string;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit{
  
  // Propriété pour la méthode de paiement sélectionnée
  @Input() selectedMethod: string = ''; // Valeur par défaut
  @Input() currentDeliveryMethod: string = ''; // Méthode de livraison actuelle
  
  // Événement émis quand la méthode de paiement change
  @Output() paymentMethodChange = new EventEmitter<string>();

  // Détails bancaires pour le paiement par virement
  email = "";
  accountNumber = "";
  beneficiaryName = "Artisan des Saveurs";
  whatsapp = "";
  
  // Liste des méthodes de paiement disponibles
  paymentMethods: PaymentMethod[] = [
    {
      id: 'mips',
      label: 'MIPS',
      description: 'Paiement sécurisé via MIPS avec redirection'
    },
    {
      id: 'bank',
      label: 'Dépôt en banque',
      description: 'Virement bancaire traditionnel'
    },
    {
      id: 'delivery',
      label: 'Paiement à la livraison',
      description: 'Paiement en espèces à la réception'
    },
    {
      id: 'card-delivery',
      label: 'Card on Delivery',
      description: 'Paiement par carte à la livraison'
    }
  ];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAccountNumber().subscribe({
      next: (response: any) => {
        console.log("response :: ", response);
        this.accountNumber = response.accountNumber;
        this.whatsapp = response.whatsappNumber;
        this.email = response.email;
      },
      error: (err) => {
        console.error("Erreur lors de la récupération du compte :", err);
        this.accountNumber = "Erreur de chargement";
        this.whatsapp = "Erreur de chargement";
        this.email = "Erreur de chargement";
      }
    });
  }

    /**
   * Copie une valeur dans le presse-papiers
   * @param value - La valeur à copier
   */
  copyToClipboard(value: string) {
    navigator.clipboard.writeText(value).then(() => {
        alert("Copié : " + value);
    }).catch(err => {
        console.error("Erreur lors de la copie :", err);
    });
    }

  /**
   * Sélectionne une méthode de paiement
   * @param method - L'identifiant de la méthode de paiement
   */
  selectPaymentMethod(method: string): void {
    if (this.selectedMethod !== method) {
      this.selectedMethod = method;
      this.paymentMethodChange.emit(method);
    }
  }

  /**
   * Vérifie si une méthode de paiement est sélectionnée
   * @param method - L'identifiant de la méthode de paiement
   * @returns true si la méthode est sélectionnée
   */
  isSelected(method: string): boolean {
    return this.selectedMethod === method;
  }

  /**
   * Obtient les détails d'une méthode de paiement
   * @param methodId - L'identifiant de la méthode
   * @returns L'objet PaymentMethod correspondant
   */
  getPaymentMethod(methodId: string): PaymentMethod | undefined {
    return this.paymentMethods.find(method => method.id === methodId);
  }

  /**
   * Gère le clic sur le bouton "Payer maintenant"
   * Émet un événement avec la méthode sélectionnée
   */
  onPayNow(): void {
    if (this.selectedMethod === 'mips') {
      // Logique spécifique pour MIPS - redirection
      this.redirectToMips();
    } else {
      // Logique pour les autres méthodes de paiement
      this.processPayment(this.selectedMethod);
    }
  }

  /**
   * Redirige vers la plateforme MIPS pour le paiement
   */
  private redirectToMips(): void {
    // Ici vous pouvez ajouter la logique de redirection vers MIPS
    console.log('Redirection vers MIPS pour finaliser le paiement...');
    // Exemple : window.location.href = 'https://mips-payment-url.com';
  }

  /**
   * Traite le paiement pour les méthodes autres que MIPS
   * @param method - La méthode de paiement sélectionnée
   */
  private processPayment(method: string): void {
    console.log(`Traitement du paiement avec la méthode: ${method}`);
    // Ici vous pouvez ajouter la logique spécifique à chaque méthode
    switch (method) {
      case 'bank':
        this.processBankTransfer();
        break;
      case 'delivery':
        this.processCashOnDelivery();
        break;
      case 'card-delivery':
        this.processCardOnDelivery();
        break;
      default:
        console.warn('Méthode de paiement non reconnue:', method);
    }
  }

  /**
   * Traite le virement bancaire
   */
  private processBankTransfer(): void {
    console.log('Traitement du virement bancaire...');
    // Logique pour afficher les détails bancaires
  }

  /**
   * Traite le paiement à la livraison
   */
  private processCashOnDelivery(): void {
    console.log('Paiement à la livraison sélectionné...');
    // Logique pour confirmer la commande avec paiement à la livraison
  }

  /**
   * Traite le paiement par carte à la livraison
   */
  private processCardOnDelivery(): void {
    console.log('Paiement par carte à la livraison sélectionné...');
    // Logique pour préparer le terminal de paiement mobile
  }
}
