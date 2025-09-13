import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserService, Address, messageResponse } from '../../services/user.service';
import { AuthUser } from '../../models/auth.models';
import { AddressModalComponent } from '../../components/address-modal/address.component';
import { OrdersResponse } from '../../models/product.models';
import { TranslatePipe } from '../../services/translate.pipe';
import { CurrencyFormatPipe } from '../../services/currency-format.pipe';
import { I18nService } from '../../services/i18n.service';
import { CurrencyService } from '../../services/currency.service';
import { Users } from '../../models/user';
import { SharedService } from '../../services/sharedService';

// Interfaces pour les données
interface Order {
  id: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
}

interface FileDTO {
  fileName: string;
  temp: string;
  filePath: string; // URL publique Nginx
}

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, 
            ReactiveFormsModule, 
            AddressModalComponent, 
            TranslatePipe, 
            CurrencyFormatPipe
          ],
  templateUrl: './profil.html',
  styleUrl: './profil.scss'
})
export class ProfilComponent implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  activeTab: string = 'personal';
  isLoading = false;
  userAvatar: string | null = null;
  notification: Notification | null = null;

  // Formulaires
  personalInfoForm!: FormGroup;
  passwordForm!: FormGroup;
  preferencesForm!: FormGroup;
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Modes d'édition
  editMode = {
    personal: false
  };

  // Données
  orders: OrdersResponse[] = [];
  addresses: Address[] = [];
  avatar = '';
  userId: number | null = null;

  // Modal d'adresse
  isAddressModalVisible = false;
  selectedAddress: Address | null = null;

  private authSubscription?: Subscription;
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private i18nService = inject(I18nService);
  private currencyService = inject(CurrencyService);
  public userData: any = {}; // Pour stocker les données utilisateur

  constructor(private formBuilder: FormBuilder, private sharedService: SharedService) {
    this.initializeForms();
  }

  ngOnInit() {

    const data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    console.log('[ProfilComponent] data :: ', data);
    if (data && data.token) {
      this.userId = data.id;
      this.authService.extractUserFromToken(data.token); // Restaure le user en mémoire
      console.log('[ProfilComponent] currentUser :: ', this.authService.getUser());
      const userData = this.authService.getUser();
      if (userData) {
        this.userData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          actif: userData.actif,
        };
      }
    }
    console.log("[ProfileComponent] ngOnInit - userData :: ", this.userData);

    this.currentUser = this.authService.currentUserValue;
    console.log("[ProfileComponent] ngOnInit - currentUser :: ", this.currentUser);
    if (this.currentUser) {
        this.loadUserData();
        this.populatePersonalInfoForm();
    }

    // Charger les données utilisateur
    this.loadOrders();
    this.loadAddresses();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private initializeForms() {
    // Formulaire des informations personnelles
    this.personalInfoForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[+]?[0-9\s\-\(\)]{10,}$/)]]
    });

    // Formulaire de changement de mot de passe
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Formulaire des préférences
    this.preferencesForm = this.formBuilder.group({
      emailPromotions: [true],
      emailOrderUpdates: [true],
      emailNewProducts: [false],
      language: ['fr'],
      currency: ['EUR']
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  private populatePersonalInfoForm() {
    if (this.currentUser && this.currentUser.token) {
      this.authService.extractUserFromToken(this.currentUser.token); // Restaure le user en mémoire
      const userData = this.authService.getUser();
      if (userData) {
        this.personalInfoForm.patchValue({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || ''
        });
      }
    }
  }

  private loadUserData() {
    if (this.currentUser) {
      // Reconstruire le user depuis le token
      this.authService.extractUserFromToken(this.currentUser.token);

      // Charger l'avatar depuis l'API
      this.authService.getAvatars(this.currentUser.id).subscribe({
        next: (res) => {
          this.avatar = res.filePath;
          console.log('[ProfileComponent] Avatars :: ', this.avatar);

          const userData = this.authService.getUser();
          if (userData) {
            if (this.avatar !== userData.avatar) {
              this.userAvatar = this.avatar || null;
              console.log("this.avatar :: ", this.userAvatar);
            } else {
              this.userAvatar = userData.avatar || null;
              console.log("userAvatar :: ", this.userAvatar);
            }
          }

          // Charger les préférences utilisateur **après** avoir tout reconstruit
          this.loadUserPreferences();
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des avatars', error);

          // Fallback si l'API avatar échoue
          const userData = this.authService.getUser();
          this.userAvatar = userData?.avatar || null;
          this.loadUserPreferences();
        }
      });
    }
  }

  private loadUserPreferences() {

    if (this.currentUser && this.currentUser.token) {
      console.log("[ProfileComponent] loadUserPreferences - userId :: ", this.currentUser.id);
      this.userService.getUserById(this.currentUser.id).subscribe({
        next: (userData: Users) => {
          // userData contient les préférences utilisateur
          if (userData) {
            this.preferencesForm.patchValue({
              emailPromotions: userData.emailPromotions,
              emailOrderUpdates: userData.emailOrderUpdates,
              emailNewProducts: userData.emailNewProducts,
              language: userData.language,
              currency: userData.currency,
            });
          }
        },
        error: (error: any) => {
          console.error('Erreur lors de la récupération des préférences utilisateur:', error);
        }
      });
    }
  }

  private loadOrders() {
    if (this.currentUser){
      console.log("[ProfileComponent] User Id :: ", this.currentUser.id);
        this.userService.getOrderHistory(this.currentUser.id).subscribe({
            next: (orders) => {
              this.orders = orders;
            },
            error: (error) => {
            console.error('Erreur lors du chargement des commandes:: ', error);
            // Données de fallback pour la démo
            this.orders = [];
            }
        });
    }
  }

  private async loadAddresses() {
    try {
      // En réalité, cela viendrait du service utilisateur
      // this.userService.getAddresses().subscribe({
      //   next: (addresses) => {
      //     this.addresses = addresses;
      //   },
      //   error: (error) => {
      //     console.error('Erreur lors du chargement des adresses:: ', error);
      //     // Données de fallback pour la démo
      //     this.addresses = [
      //       {
      //         id: '1',
      //         label: 'Domicile',
      //         street: '123 Rue de la Paix',
      //         city: 'Paris',
      //         postalCode: '75001',
      //         country: 'France',
      //         isDefault: true
      //       },
      //       {
      //         id: '2',
      //         label: 'Bureau',
      //         street: '456 Avenue des Champs-Élysées',
      //         city: 'Paris',
      //         postalCode: '75008',
      //         country: 'France',
      //         isDefault: false
      //       }
      //     ];
      //   }
      // });
    } catch (error) {
      console.error('Erreur lors du chargement des adresses:', error);
    }
  }

  // Gestion des onglets
  setActiveTab(tab: string) {
    this.activeTab = tab;
    // Réinitialiser les modes d'édition lors du changement d'onglet
    this.editMode.personal = false;
  }

  // Gestion des modes d'édition
  toggleEditMode(section: keyof typeof this.editMode) {
    this.editMode[section] = !this.editMode[section];
    
    if (!this.editMode[section]) {
      // Si on annule l'édition, restaurer les valeurs originales
      this.populatePersonalInfoForm();
    }
  }

  cancelEdit(section: keyof typeof this.editMode) {
    this.editMode[section] = false;
    this.populatePersonalInfoForm();
  }

  // Mise à jour des informations personnelles
  async updatePersonalInfo() {
    if (this.personalInfoForm.valid && !this.isLoading) {
      this.isLoading = true;

      try {
        const formData = this.personalInfoForm.value;
        
        // Appel au service pour mettre à jour les informations
        await this.userService.updatePersonalInfo(formData);
        
        // Mettre à jour l'utilisateur actuel
        if (this.currentUser && this.currentUser.token) {
          this.authService.extractUserFromToken(this.currentUser.token); // Restaure le user en mémoire
          //console.log('[OrderModalComponent] currentUser :: ', this.authService.getUser());
          const userData = this.authService.getUser();
          this.userData = {
            ...this.userData,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          };
        }

        this.editMode.personal = false;
        this.showNotification('success', 'Informations personnelles mises à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        this.showNotification('error', 'Erreur lors de la mise à jour des informations');
      } finally {
        this.isLoading = false;
      }
    }
  }

  // Mise à jour du mot de passe
  async updatePassword() {
    if (this.passwordForm.valid && !this.isLoading) {
      this.isLoading = true;

      try {
        const formData = this.passwordForm.value;
        
        // Appel au service pour changer le mot de passe
        await this.userService.updatePassword(formData.currentPassword, formData.newPassword);
        
        this.passwordForm.reset();
        this.showNotification('success', 'Mot de passe mis à jour avec succès');
      } catch (error: any) {
        console.error('Erreur lors du changement de mot de passe:', error);
        let rawMessage = error.error?.message || error.message || "Erreur inconnue";
        let userMessage = rawMessage.replace("Erreur de traitement : java.lang.RuntimeException: ", "").trim();
        this.showNotification('error', userMessage);
      } finally {
        this.isLoading = false;
      }
    }
  }

  // Mise à jour des préférences utilisateur via API
  updatePreferences() {
    if (this.preferencesForm.valid && !this.isLoading) {
      this.isLoading = true;

      const formData = this.preferencesForm.value;
      console.log("[ProfileComponent] updatePreferences - formData :: ", formData);

      // Appel API pour mettre à jour les préférences utilisateur
      this.userService.updatePreferences(formData).subscribe({
        next: () => {
          // Mettre à jour la langue et la devise dans les services locaux
          if (formData.language) {
            this.i18nService.setLanguage(formData.language);
          }
          if (formData.currency) {
            this.currencyService.setCurrency(formData.currency);
          }
          this.showNotification('success', this.i18nService.translate('success.preferencesUpdated'));
        },
        
        error: (error) => {
          console.error('Erreur lors de la mise à jour des préférences:', error);
          this.showNotification('error', this.i18nService.translate('error.updatePreferences'));
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onLanguageChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedLanguage = selectElement.value;
    console.log('Langue sélectionnée :', selectedLanguage);
    // this.i18nService.setLanguage(selectedLanguage);
  }

  // Gestion de l'avatar
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.userService.uploadAvatar(file).subscribe({
      next: (res: FileDTO) => {
        console.log("Fichier uploadé :", res);
        this.userAvatar = res.filePath;
        this.sharedService.sendAvatar(this.userAvatar);
        console.log("Réponse backend :", res);
        console.log("Chemin image :", res.filePath);
        this.showNotification('success', 'Photo mis à jour avec succès');
      },
      error: (err: { error: { message: string; }; }) => {
        console.error("Erreur upload :", err);
        this.showNotification('error', err?.error?.message || 'Erreur lors de l\'upload de l\'avatar');}
    });
  }

  onAvatarError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'img/hero/avatar.webp';
  }


  // Gestion des adresses
  addNewAddress() {
    this.selectedAddress = null;
    this.isAddressModalVisible = true;
  }

  editAddress(address: Address) {
    this.selectedAddress = address;
    this.isAddressModalVisible = true;
  }

  onAddressModalClose() {
    this.isAddressModalVisible = false;
    this.selectedAddress = null;
  }

  onAddressSaved(address: Address) {
    if (this.selectedAddress) {
      // Modifier l'adresse existante
      const index = this.addresses.findIndex(addr => addr.id === this.selectedAddress!.id);
      if (index !== -1) {
        this.addresses[index] = address;
      }
      this.showNotification('success', 'Adresse modifiée avec succès');
    } else {
      // Ajouter la nouvelle adresse
      this.addresses.push(address);
      this.showNotification('success', 'Adresse ajoutée avec succès');
    }

    // Si cette adresse est définie comme par défaut, retirer le statut des autres
    if (address.isDefault) {
      this.addresses.forEach(addr => {
        if (addr.id !== address.id) {
          addr.isDefault = false;
        }
      });
    }
  }

  async deleteAddress(addressId: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      try {
        await this.userService.deleteAddress(addressId);
        this.addresses = this.addresses.filter(addr => addr.id !== addressId);
        this.showNotification('success', 'Adresse supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'adresse:', error);
        this.showNotification('error', 'Erreur lors de la suppression de l\'adresse');
      }
    }
  }

  // Suppression du compte
  confirmDeleteAccount() {
    const confirmation = confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
    );
    
    if (confirmation) {
      const doubleConfirmation = confirm(
        'Cette action supprimera définitivement toutes vos données. Confirmez-vous ?'
      );
      
      if (doubleConfirmation) {
        this.deleteAccount();
      }
    }
  }

  private async deleteAccount() {
    this.isLoading = true;

    try {
      if (!this.userId) {
        throw new Error("ID utilisateur non disponible");
      }
      this.userService.deleteAccount(this.userId).subscribe({
        next: (res: messageResponse) => {
          console.log("Compte supprimé :", res);
          this.showNotification('success', res.message || 'Compte supprimé avec succès');
          this.authService.logout();
        },
        error: (err: { error: { message: string; }; }) => {
          console.error("Erreur suppression du compte :", err);
          this.showNotification('error', err?.error?.message || 'Erreur lors de la suppression du compte');
        }
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      this.showNotification('error', 'Erreur lors de la suppression du compte');
    }
  
  }

  // Utilitaires
  getOrderStatusText(delivered: boolean | string): string {
    const isDelivered = typeof delivered === 'boolean' ? delivered : delivered === 'true';
    return isDelivered 
      ? this.i18nService.translate('orders.status.delivered')
      : this.i18nService.translate('orders.status.processing');
  }

  // Méthodes utilitaires pour les traductions
  translate(key: string, params?: any): string {
    return this.i18nService.translate(key, params);
  }

  formatPrice(price: number): string {
    return this.currencyService.formatPrice(price);
  }

  private showNotification(type: 'success' | 'error', message: string) {
    this.notification = { type, message };
    setTimeout(() => {
      this.notification = null;
    }, 5000);
  }
}