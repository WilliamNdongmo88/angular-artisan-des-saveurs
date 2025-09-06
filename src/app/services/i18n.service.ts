import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Translation {
  [key: string]: string | Translation;
}

export interface Locale {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguageSubject = new BehaviorSubject<string>('fr');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: { [key: string]: Translation } = {};

  public availableLocales: Locale[] = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  constructor() {
    this.loadTranslations();
    // Charger la langue depuis le localStorage ou utiliser 'fr' par défaut
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'fr';
    this.setLanguage(savedLanguage);
  }

  private loadTranslations() {
    // Traductions françaises
    this.translations['fr'] = {
      // Navigation et interface générale
      'nav.home': 'Accueil',
      'nav.catalog': 'Catalogue',
      'nav.cart': 'Panier',
      'nav.profile': 'Profil',
      'nav.login': 'Connexion',
      'nav.logout': 'Déconnexion',

      // Profil utilisateur
      'profile.title': 'Mon Profil',
      'profile.personalInfo': 'Informations personnelles',
      'profile.orderHistory': 'Historique des commandes',
      'profile.addresses': 'Adresses',
      'profile.preferences': 'Préférences',
      'profile.security': 'Sécurité',
      'profile.activeAccount': 'Compte actif',
      'profile.inactiveAccount': 'Compte inactif',
      'profile.changeAvatar': 'Changer l\'avatar', 
      
      // Formulaires
      'form.firstName': 'Prénom',
      'form.lastName': 'Nom',
      'form.email': 'Adresse e-mail',
      'form.phone': 'Téléphone',
      'form.edit': 'Modifier',
      'form.cancel': 'Annuler',
      'form.save': 'Enregistrer',
      'form.saving': 'Enregistrement...',
      
      // Erreurs de validation
      'validation.required': 'Ce champ est requis',
      'validation.email': 'L\'adresse e-mail n\'est pas valide',
      'validation.phone': 'Le numéro de téléphone n\'est pas valide',
      'validation.minLength': 'Ce champ doit contenir au moins {min} caractères',
      
      // Commandes
      'orders.title': 'Historique des commandes',
      'orders.orderNumber': 'Commande #',
      'orders.date': 'Date',
      'orders.status.delivered': 'Livrée',
      'orders.status.processing': 'En cours',
      'orders.quantity': 'Quantité',
      'orders.subtotal': 'Sous-total',
      'orders.discount': 'Réduction',
      'orders.freeShipping': 'Livraison gratuite',
      'orders.total': 'Total',
      'orders.empty': 'Aucune commande',
      'orders.emptyDescription': 'Vous n\'avez pas encore passé de commande.',
      'orders.discoverProducts': 'Découvrir nos produits',
      
      // Adresses
      'addresses.title': 'Mes adresses',
      'addresses.add': 'Ajouter une adresse',
      'addresses.default': 'Adresse par défaut',
      'addresses.empty': 'Aucune adresse enregistrée',
      'addresses.emptyDescription': 'Ajoutez une adresse pour faciliter vos commandes.',
      
      // Préférences
      'preferences.title': 'Préférences',
      'preferences.emailNotifications': 'Notifications par e-mail',
      'preferences.promotions': 'Recevoir les offres promotionnelles',
      'preferences.orderUpdates': 'Recevoir les mises à jour de commande',
      'preferences.newProducts': 'Être informé des nouveaux produits',
      'preferences.displaySettings': 'Préférences d\'affichage',
      'preferences.language': 'Langue',
      'preferences.currency': 'Devise',
      'preferences.savePreferences': 'Enregistrer les préférences',
      
      // Sécurité
      'security.title': 'Sécurité du compte',
      'security.changePassword': 'Changer le mot de passe',
      'security.currentPassword': 'Mot de passe actuel',
      'security.newPassword': 'Nouveau mot de passe',
      'security.confirmPassword': 'Confirmer le mot de passe',
      
      // Messages de succès/erreur
      'success.personalInfoUpdated': 'Informations personnelles mises à jour avec succès',
      'success.passwordUpdated': 'Mot de passe mis à jour avec succès',
      'success.preferencesUpdated': 'Préférences mises à jour avec succès',
      'success.avatarUpdated': 'Photo mise à jour avec succès',
      'error.updatePersonalInfo': 'Erreur lors de la mise à jour des informations',
      'error.updatePassword': 'Erreur lors du changement de mot de passe',
      'error.updatePreferences': 'Erreur lors de la mise à jour des préférences',
      'error.uploadAvatar': 'Erreur lors de l\'upload de l\'avatar'
    };

    // Traductions anglaises
    this.translations['en'] = {
      // Navigation et interface générale
      'nav.home': 'Home',
      'nav.catalog': 'Catalog',
      'nav.cart': 'Cart',
      'nav.profile': 'Profile',
      'nav.login': 'Login',
      'nav.logout': 'Logout',
      
      // Profil utilisateur
      'profile.title': 'My Profile',
      'profile.personalInfo': 'Personal Information',
      'profile.orderHistory': 'Order History',
      'profile.addresses': 'Addresses',
      'profile.preferences': 'Preferences',
      'profile.security': 'Security',
      'profile.activeAccount': 'Active Account',
      'profile.inactiveAccount': 'Inactive Account',
      'profile.changeAvatar': 'Change avatar',
      
      // Formulaires
      'form.firstName': 'First Name',
      'form.lastName': 'Last Name',
      'form.email': 'Email Address',
      'form.phone': 'Phone',
      'form.edit': 'Edit',
      'form.cancel': 'Cancel',
      'form.save': 'Save',
      'form.saving': 'Saving...',
      
      // Erreurs de validation
      'validation.required': 'This field is required',
      'validation.email': 'The email address is not valid',
      'validation.phone': 'The phone number is not valid',
      'validation.minLength': 'This field must contain at least {min} characters',
      
      // Commandes
      'orders.title': 'Order History',
      'orders.orderNumber': 'Order #',
      'orders.date': 'Date',
      'orders.status.delivered': 'Delivered',
      'orders.status.processing': 'Processing',
      'orders.quantity': 'Quantity',
      'orders.subtotal': 'Subtotal',
      'orders.discount': 'Discount',
      'orders.freeShipping': 'Free Shipping',
      'orders.total': 'Total',
      'orders.empty': 'No Orders',
      'orders.emptyDescription': 'You haven\'t placed any orders yet.',
      'orders.discoverProducts': 'Discover Our Products',
      
      // Adresses
      'addresses.title': 'My Addresses',
      'addresses.add': 'Add Address',
      'addresses.default': 'Default Address',
      'addresses.empty': 'No Saved Addresses',
      'addresses.emptyDescription': 'Add an address to make ordering easier.',
      
      // Préférences
      'preferences.title': 'Preferences',
      'preferences.emailNotifications': 'Email Notifications',
      'preferences.promotions': 'Receive promotional offers',
      'preferences.orderUpdates': 'Receive order updates',
      'preferences.newProducts': 'Be notified of new products',
      'preferences.displaySettings': 'Display Settings',
      'preferences.language': 'Language',
      'preferences.currency': 'Currency',
      'preferences.savePreferences': 'Save Preferences',
      
      // Sécurité
      'security.title': 'Account Security',
      'security.changePassword': 'Change Password',
      'security.currentPassword': 'Current Password',
      'security.newPassword': 'New Password',
      'security.confirmPassword': 'Confirm Password',
      
      // Messages de succès/erreur
      'success.personalInfoUpdated': 'Personal information updated successfully',
      'success.passwordUpdated': 'Password updated successfully',
      'success.preferencesUpdated': 'Preferences updated successfully',
      'success.avatarUpdated': 'Photo updated successfully',
      'error.updatePersonalInfo': 'Error updating information',
      'error.updatePassword': 'Error changing password',
      'error.updatePreferences': 'Error updating preferences',
      'error.uploadAvatar': 'Error uploading avatar'
    };

    // Traductions espagnoles
    this.translations['es'] = {
      // Navigation et interface générale
      'nav.home': 'Inicio',
      'nav.catalog': 'Catálogo',
      'nav.cart': 'Carrito',
      'nav.profile': 'Perfil',
      'nav.login': 'Iniciar Sesión',
      'nav.logout': 'Cerrar Sesión',
      
      // Profil utilisateur
      'profile.title': 'Mi Perfil',
      'profile.personalInfo': 'Información Personal',
      'profile.orderHistory': 'Historial de Pedidos',
      'profile.addresses': 'Direcciones',
      'profile.preferences': 'Preferencias',
      'profile.security': 'Seguridad',
      'profile.activeAccount': 'Cuenta Activa',
      'profile.inactiveAccount': 'Cuenta Inactiva',
      'profile.changeAvatar': 'Cambiar Avatar',

      // Formulaires
      'form.firstName': 'Nombre',
      'form.lastName': 'Apellido',
      'form.email': 'Dirección de Correo',
      'form.phone': 'Teléfono',
      'form.edit': 'Editar',
      'form.cancel': 'Cancelar',
      'form.save': 'Guardar',
      'form.saving': 'Guardando...',
      
      // Erreurs de validation
      'validation.required': 'Este campo es obligatorio',
      'validation.email': 'La dirección de correo no es válida',
      'validation.phone': 'El número de teléfono no es válido',
      'validation.minLength': 'Este campo debe contener al menos {min} caracteres',
      
      // Commandes
      'orders.title': 'Historial de Pedidos',
      'orders.orderNumber': 'Pedido #',
      'orders.date': 'Fecha',
      'orders.status.delivered': 'Entregado',
      'orders.status.processing': 'En Proceso',
      'orders.quantity': 'Cantidad',
      'orders.subtotal': 'Subtotal',
      'orders.discount': 'Descuento',
      'orders.freeShipping': 'Envío Gratis',
      'orders.total': 'Total',
      'orders.empty': 'Sin Pedidos',
      'orders.emptyDescription': 'Aún no has realizado ningún pedido.',
      'orders.discoverProducts': 'Descubrir Nuestros Productos',
      
      // Adresses
      'addresses.title': 'Mis Direcciones',
      'addresses.add': 'Agregar Dirección',
      'addresses.default': 'Dirección Predeterminada',
      'addresses.empty': 'Sin Direcciones Guardadas',
      'addresses.emptyDescription': 'Agrega una dirección para facilitar tus pedidos.',
      
      // Préférences
      'preferences.title': 'Preferencias',
      'preferences.emailNotifications': 'Notificaciones por Correo',
      'preferences.promotions': 'Recibir ofertas promocionales',
      'preferences.orderUpdates': 'Recibir actualizaciones de pedidos',
      'preferences.newProducts': 'Ser notificado de nuevos productos',
      'preferences.displaySettings': 'Configuración de Pantalla',
      'preferences.language': 'Idioma',
      'preferences.currency': 'Moneda',
      'preferences.savePreferences': 'Guardar Preferencias',
      
      // Sécurité
      'security.title': 'Seguridad de la Cuenta',
      'security.changePassword': 'Cambiar Contraseña',
      'security.currentPassword': 'Contraseña Actual',
      'security.newPassword': 'Nueva Contraseña',
      'security.confirmPassword': 'Confirmar Contraseña',
      
      // Messages de succès/erreur
      'success.personalInfoUpdated': 'Información personal actualizada exitosamente',
      'success.passwordUpdated': 'Contraseña actualizada exitosamente',
      'success.preferencesUpdated': 'Preferencias actualizadas exitosamente',
      'success.avatarUpdated': 'Foto actualizada exitosamente',
      'error.updatePersonalInfo': 'Error al actualizar la información',
      'error.updatePassword': 'Error al cambiar la contraseña',
      'error.updatePreferences': 'Error al actualizar las preferencias',
      'error.uploadAvatar': 'Error al subir el avatar'
    };
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: string): void {
    if (this.translations[language]) {
      this.currentLanguageSubject.next(language);
      localStorage.setItem('selectedLanguage', language);
    }
  }

  translate(key: string, params?: { [key: string]: any }): string {
    const currentLang = this.getCurrentLanguage();
    const translation = this.getNestedTranslation(this.translations[currentLang], key);
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${currentLang}`);
      return key;
    }

    // Remplacer les paramètres dans la traduction
    if (params) {
      return this.interpolateParams(translation, params);
    }

    return translation;
  }

//   private getNestedTranslation(obj: Translation, key: string): string {
//     const keys = key.split('.');
//     let result: any = obj;

//     for (const k of keys) {
//       if (result && typeof result === 'object' && k in result) {
//         result = result[k];
//       } else {
//         return '';
//       }
//     }

//     return typeof result === 'string' ? result : '';
//   }

    private getNestedTranslation(obj: any, key: string): string | null {
        if (!obj || !key) return null;

        // Cas simple : on stocke les traductions avec des clés plates
        if (key in obj) {
            return obj[key];
        }

        // Si un jour tu passes en structure imbriquée, garder ce fallback
        const parts = key.split('.');
        let current = obj;
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
            current = current[part];
            } else {
            return null;
            }
        }

        return typeof current === 'string' ? current : null;
    }



  private interpolateParams(text: string, params: { [key: string]: any }): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key].toString() : match;
    });
  }

  // Méthode utilitaire pour obtenir toutes les traductions d'une langue
  getTranslations(language?: string): Translation {
    const lang = language || this.getCurrentLanguage();
    return this.translations[lang] || this.translations['fr'];
  }
}
