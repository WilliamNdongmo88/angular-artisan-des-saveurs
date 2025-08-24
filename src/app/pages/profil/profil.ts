import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserService, Address } from '../../services/user.service';
import { AuthUser } from '../../models/auth.models';
import { AddressModalComponent } from '../../components/address-modal/address.component';
import { OrdersResponse } from '../../models/product.models';

// Interfaces pour les données
interface Order {
  id: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
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
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AddressModalComponent],
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

  // Modes d'édition
  editMode = {
    personal: false
  };

  // Données
  orders: OrdersResponse[] = [];
  addresses: Address[] = [];

  // Modal d'adresse
  isAddressModalVisible = false;
  selectedAddress: Address | null = null;

  private authSubscription?: Subscription;
  private authService = inject(AuthService);
  private userService = inject(UserService);
  public userData: any = {}; // Pour stocker les données utilisateur

  constructor(private formBuilder: FormBuilder) {
    this.initializeForms();
  }

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
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
      this.authService.extractUserFromToken(this.currentUser.token); // Restaure le user en mémoire
      const userData = this.authService.getUser();
      // Charger l'avatar utilisateur
      if (userData) {
        this.userAvatar = userData.avatar || null;
      }
      
      // Charger les préférences utilisateur
      this.loadUserPreferences();
    }
  }

  private loadUserPreferences() {
    // Simuler le chargement des préférences depuis l'API
    // En réalité, cela viendrait du service utilisateur
    console.log("[ProfileComponent] Simuler le chargement des préférences depuis l'API");
    this.preferencesForm.patchValue({
      emailPromotions: true,
      emailOrderUpdates: true,
      emailNewProducts: false,
      language: 'fr',
      currency: 'Rs'
    });
  }

  private loadOrders() {
    // Simuler le chargement des commandes
    // En réalité, cela viendrait d'un service de commandes
    if (this.currentUser){
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
      this.userService.getAddresses().subscribe({
        next: (addresses) => {
          this.addresses = addresses;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des adresses:: ', error);
          // Données de fallback pour la démo
          this.addresses = [
            {
              id: '1',
              label: 'Domicile',
              street: '123 Rue de la Paix',
              city: 'Paris',
              postalCode: '75001',
              country: 'France',
              isDefault: true
            },
            {
              id: '2',
              label: 'Bureau',
              street: '456 Avenue des Champs-Élysées',
              city: 'Paris',
              postalCode: '75008',
              country: 'France',
              isDefault: false
            }
          ];
        }
      });
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
            phone: formData.phone
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
      } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        this.showNotification('error', 'Erreur lors du changement de mot de passe');
      } finally {
        this.isLoading = false;
      }
    }
  }

  // Mise à jour des préférences
  async updatePreferences() {
    if (this.preferencesForm.valid && !this.isLoading) {
      this.isLoading = true;

      try {
        const formData = this.preferencesForm.value;
        
        // Appel au service pour mettre à jour les préférences
        await this.userService.updatePreferences(formData);
        
        this.showNotification('success', 'Préférences mises à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de la mise à jour des préférences:', error);
        this.showNotification('error', 'Erreur lors de la mise à jour des préférences');
      } finally {
        this.isLoading = false;
      }
    }
  }

  // Gestion de l'avatar
  changeAvatar() {
    // Créer un input file temporaire
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadAvatar(file);
      }
    };
    input.click();
  }

  private async uploadAvatar(file: File) {
    this.isLoading = true;

    try {
      // Appel au service pour uploader l'avatar
      const avatarUrl = await this.userService.uploadAvatar(file);
      this.userAvatar = avatarUrl;
      
      this.showNotification('success', 'Avatar mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error);
      this.showNotification('error', 'Erreur lors de la mise à jour de l\'avatar');
    } finally {
      this.isLoading = false;
    }
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
      await this.userService.deleteAccount();
      this.authService.logout();
      this.showNotification('success', 'Compte supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      this.showNotification('error', 'Erreur lors de la suppression du compte');
    } finally {
      this.isLoading = false;
    }
  }

  // Utilitaires
  getOrderStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'En attente',
      processing: 'En cours de traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return statusMap[status] || status;
  }

  // Gestion des notifications
  private showNotification(type: 'success' | 'error', message: string) {
    this.notification = { type, message };
    
    // Auto-fermeture après 5 secondes
    setTimeout(() => {
      this.closeNotification();
    }, 5000);
  }

  closeNotification() {
    this.notification = null;
  }
}
