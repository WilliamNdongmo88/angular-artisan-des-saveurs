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
      // Login page
      "AUTH": {
        "TITLE": "Connexion",
        "SUBTITLE": "Connectez-vous à votre compte",
        "USERNAME": "Nom d'utilisateur",
        "USERNAME_PLACEHOLDER": "Votre nom d'utilisateur",
        "USERNAME_REQUIRED": "Le nom d'utilisateur est requis",
        "PASSWORD": "Mot de passe",
        "PASSWORD_PLACEHOLDER": "Votre mot de passe",
        "PASSWORD_REQUIRED": "Le mot de passe est requis",
        "LOGIN": "Se connecter",
        "FORGOT_PASSWORD": "Mot de passe oublié ?",
        "CREATE_ACCOUNT": "Créer un compte"
      },

      //Registration page
      "REGISTER": {
        "TITLE": "Créer un compte",
        "SUBTITLE": "Rejoignez Artisan des Saveurs",
        "FIRSTNAME": "Prénom",
        "FIRSTNAME_PLACEHOLDER": "Votre prénom",
        "FIRSTNAME_REQUIRED": "Le prénom est requis",
        "FIRSTNAME_MAX": "Le prénom ne peut pas dépasser 50 caractères",

        "LASTNAME": "Nom",
        "LASTNAME_PLACEHOLDER": "Votre nom",
        "LASTNAME_REQUIRED": "Le nom est requis",
        "LASTNAME_MAX": "Le nom ne peut pas dépasser 50 caractères",

        "USERNAME": "Nom d'utilisateur",
        "USERNAME_PLACEHOLDER": "Choisissez un nom d'utilisateur",
        "USERNAME_REQUIRED": "Le nom d'utilisateur est requis",
        "USERNAME_MIN": "Le nom d'utilisateur doit contenir au moins 3 caractères",
        "USERNAME_MAX": "Le nom d'utilisateur ne peut pas dépasser 20 caractères",

        "EMAIL": "Email",
        "EMAIL_PLACEHOLDER": "votre@email.com",
        "EMAIL_REQUIRED": "L'email est requis",
        "EMAIL_INVALID": "L'email n'est pas valide",

        "PHONE": "Téléphone",
        "PHONE_PLACEHOLDER": "+230 123 456 789",
        "PHONE_MAX": "Le téléphone ne peut pas dépasser 20 caractères",
        "PHONE_REQUIRED":"Le numéro de téléphone est requis.",
        "PHONE_INDICATIF":"Le numéro de téléphone doit commencer par (+230) par exemple.",

        "PASSWORD": "Mot de passe",
        "PASSWORD_PLACEHOLDER": "Mot de passe",
        "PASSWORD_REQUIRED": "Le mot de passe est requis",
        "PASSWORD_MIN": "Le mot de passe doit contenir au moins 6 caractères",
        "PASSWORD_MAX": "Le mot de passe ne peut pas dépasser 40 caractères",

        "CONFIRM_PASSWORD": "Confirmer le mot de passe",
        "CONFIRM_PASSWORD_PLACEHOLDER": "Confirmer le mot de passe",
        "CONFIRM_PASSWORD_REQUIRED": "La confirmation du mot de passe est requise",
        "CONFIRM_PASSWORD_MATCH": "Les mots de passe ne correspondent pas",

        "SUBMIT": "Créer mon compte",
        "ALREADY_ACCOUNT": "Déjà un compte ?",
        "LOGIN": "Se connecter"
      },

      //Email page
      "RESET": {
        "TITLE": "Réinitialiser le mot de passe",
        "SUBTITLE": "Réinitialisez votre mot de passe",
        "EMAIL": "Email",
        "EMAIL_PLACEHOLDER": "Votre email",
        "EMAIL_REQUIRED": "L'email d'utilisateur est requis",
        "SEND": "Envoyer",
        "BACK": "Retour"
      },

      //Reset passw page
      "NEWPASS": {
        "TITLE": "Réinitialiser le mot de passe",
        "SUBTITLE": "Réinitialisez votre mot de passe",
        "PASSWORD": "Mot de passe",
        "PASSWORD_PLACEHOLDER": "Mot de passe",
        "PASSWORD_REQUIRED": "Le mot de passe est requis",
        "PASSWORD_MIN": "Le mot de passe doit contenir au moins 6 caractères",
        "PASSWORD_MAX": "Le mot de passe ne peut pas dépasser 40 caractères",
        "CONFIRM_PASSWORD": "Confirmer le mot de passe",
        "CONFIRM_PASSWORD_PLACEHOLDER": "Confirmer le mot de passe",
        "CONFIRM_PASSWORD_REQUIRED": "La confirmation du mot de passe est requise",
        "CONFIRM_PASSWORD_MATCH": "Les mots de passe ne correspondent pas",
        "SUBMIT": "Valider",
        "BACK_LOGIN": "Connexion"
      },

      //Activation page
      "confirmation": {
        "title": "Confirmez votre adresse email",
        "intro": "Avant d’effectuer votre démarche, nous avons besoin de vérifier votre adresse <strong>{email}</strong>.",
        "highlight": "Ouvrez votre boîte email, et cliquez sur le lien d’activation dans le message que vous avez reçu.",
        "resend": {
          "text": "Si vous n’avez pas reçu notre message (avez-vous vérifié les indésirables ?), nous pouvons vous le renvoyer.",
          "label": "Votre email",
          "required": "L'email d'utilisateur est requis",
          "button": "Renvoyer un email de confirmation"
        },
        "activated": {
          "title": "Votre compte a été activé",
          "message": "🎉 Bienvenue ! Vous pouvez maintenant vous connecter à votre espace personnel.",
          "button": "Se connecter"
        }
      },

      //New-Activation page
      "activation": {
        "title": "Activation",
        "subtitle": "Recevoir un nouveau lien d'activation",
        "form": {
          "label": "Email",
          "placeholder": "Votre email",
          "required": "L'email d'utilisateur est requis",
          "button": "Envoyer"
        },
        "links": {
          "returnText": "Retourner à la ?",
          "login": "Connexion"
        }
      },

      // Navigation et interface générale
      "brand": {
        "title": "Artisan des Saveurs"
      },
      "nav": {
        "home": "Accueil",
        "catalog": "Catalogue",
        "products": "Nos Produits",
        "about": "À Propos",
        "contact": "Contact",
        "cart": "Panier",
        "profile": "Profil",
        "login": "Connexion",
        "register": "Inscription",
        "logout": "Déconnexion",
        "dashboard": "Dashboard"
      },

      //Home
      "HERO": {
        "TITLE1": "L'Artisan des",
        "TITLE2":"Saveurs",
        "SUBTITLE": "Spécialiste du Porc de Qualité",
        "DESCRIPTION": "Découvrez notre sélection de viandes de porc fraîches et de qualité supérieure. Tradition, savoir-faire et passion au service de votre table.",
        "BUTTON_CATALOG": "Découvrir nos produits"
      },
      "FEATURED_PRODUCTS": {
        "TITLE": "Nos Produits Phares",
        "BUTTON_ALL": "Voir tous nos produits"
      },
      "ABOUT": {
        "TITLE": "Notre Savoir-Faire Artisanal",
        "DESCRIPTION": "Depuis 2022, notre boucherie familiale perpétue les traditions de la boucherie Mauricienne. Nous sélectionnons avec soin nos fournisseurs pour vous offrir des viandes d'exception, dans le respect du bien-être animal et de l'environnement.",
        "HIGHLIGHTS": {
          "BREEDING": {
            "TITLE": "Élevage Mauricien",
            "TEXT": "Partenaires éleveurs sélectionnés"
          },
          "KNOWHOW": {
            "TITLE": "Savoir-Faire",
            "TEXT": "Techniques traditionnelles maîtrisées"
          },
          "FRESHNESS": {
            "TITLE": "Fraîcheur",
            "TEXT": "Chaîne du froid respectée"
          }
        },
        "BUTTON_MORE": "En savoir plus sur nous"
      },
      "CONTACT": {
        "TITLE": "Une Question ? Une Commande Spéciale ?",
        "DESCRIPTION": "Notre équipe est à votre disposition pour vous conseiller et préparer vos commandes sur mesure",
        "PHONE": "📞 +230 5984 0270",
        "ADDRESS": "📍 123 Rue de la Boucherie, Grand Baie",
        "BUTTON_CONTACT": "Nous contacter"
      },

      //Catalog page
      "category": {
        "decoupes_porc_classiques": "Viande à la coupe",
        "charcuteries_terrines": "Charcuteries & terrines",
        "saucisses_variantes": "Saucisses & variantes",
        "produits_cuisines": "Produits cuisinés ou assaisonnés",
        "boudins": "Boudins",
        "produits_transformes": "Produits transformés"
      },
      "catalog": {
        "header": {
          "title": "Nos Produits",
          "subtitle": "Découvrez notre sélection complète de viande de porc de qualité supérieure"
        },
        "filters": {
          "searchPlaceholder": "Rechercher un produit...",
          "allProducts": "Tous les produits"
        },
        "results": {
          "found": "{count} produit(s) trouvé(s)",
          "foundWithSearch": "{count} produit(s) trouvé(s) pour \"{term}\""
        },
        "noResults": {
          "title": "Aucun produit trouvé",
          "message": "Essayez de modifier vos critères de recherche ou de sélectionner une autre catégorie.",
          "seeAll": "Voir tous les produits"
        },
        "cta": {
          "title": "Intéressé par nos produits ?",
          "message": "Contactez-nous pour passer une commande ou obtenir plus d’informations sur nos produits.",
          "button": "Nous contacter"
        }
      },

      //About page
      "aboutUs": {
        "pageTitle": "À Propos de Nous",
        "pageSubtitle": "Découvrez l'histoire et les valeurs de notre boucherie familiale",
        "ourStoryTitle": "Notre Histoire",
        "storyParagraph1": "Fondée en 2022 par Vitale, la Boucherie L'Artisan des Saveurs est une entreprise familiale qui perpétue depuis près de 3 ans les traditions de la boucherie mauricienne. Située pas loin de Grand Baie, notre établissement s'est forgé une réputation d'excellence grâce à la qualité exceptionnelle de ses produits et à son savoir-faire artisanal.",
        "storyParagraph2": "Spécialisés dans la viande de porc, nous avons développé au fil des années un réseau de partenaires éleveurs triés sur le volet, tous situés à L'île Maurice et partageant nos valeurs de respect du bien-être animal et de l'environnement. Cette approche nous permet de vous proposer des viandes d'une qualité supérieure, fraîches et savoureuses.",
        "philosophyTitle": "Notre Philosophie",
        "philosophyText": "Nous croyons fermement que la qualité d'un produit dépend de chaque étape de sa production. C'est pourquoi nous nous impliquons personnellement dans la sélection de nos fournisseurs, la préparation de nos produits et le conseil à nos clients. Chaque morceau de viande qui sort de notre boucherie porte en lui notre engagement pour l'excellence.",
        "commitmentsTitle": "Nos Engagements Qualité",
        "commitmentsSubtitle": "La qualité est au cœur de notre métier. Nous nous engageons à respecter des standards élevés à chaque étape de notre processus.",
        "teamTitle": "Notre Équipe",
        "teamSubtitle": "Rencontrez les artisans passionnés qui donnent vie à notre boucherie",
        "valuesTitle": "Nos Valeurs",
        "expertiseTitle": "Notre Expertise",
        "expertiseIntro": "Fort de notre expérience de près de 40 ans, nous avons développé une expertise reconnue dans plusieurs domaines :",
        "expertiseTraditionalCut": "Découpe traditionnelle : Maîtrise parfaite des techniques de découpe pour optimiser chaque morceau",
        "expertiseCharcuterie": "Charcuterie artisanale : Préparation de saucisses, pâtés et terrines selon nos recettes familiales",
        "expertisePersonalizedAdvice": "Conseil personnalisé : Accompagnement de nos clients dans le choix des morceaux et les techniques de cuisson",
        "expertiseSpecialOrders": "Commandes spéciales : Préparation sur mesure pour vos événements et réceptions",
        "recognitionTitle": "Reconnaissance Professionnelle",
        "recognitionText": "Notre engagement pour la qualité a été reconnu par nos pairs et nos clients. Nous sommes fiers d'avoir reçu plusieurs distinctions, et d'être référencés par plusieurs guides gastronomiques locaux.",
        "ctaTitle": "Venez nous rencontrer !",
        "ctaText": "Notre équipe sera ravie de vous accueillir dans notre boucherie et de vous faire découvrir nos produits d'exception. N'hésitez pas à nous rendre visite ou à nous contacter pour toute question.",
        "ctaButton": "Nous Contacter"
      },

      //Contact page
      "CONTACT_PAGE": {
        "HEADER_TITLE": "Nous Contacter",
        "HEADER_SUBTITLE": "N'hésitez pas à nous contacter pour toute question ou commande spéciale",

        "FORM": {
          "TITLE": "Envoyez-nous un message",
          "FIRSTNAME": "Prénom",
          "LASTNAME": "Nom",
          "EMAIL": "Email",
          "PHONE": "Téléphone",
          "SUBJECT": "Sujet",
          "MESSAGE": "Message",
          "CONSENT": "J'accepte que mes données personnelles soient utilisées pour traiter ma demande",

          "PLACEHOLDER": {
            "FIRSTNAME": "Votre prénom",
            "LASTNAME": "Votre nom",
            "EMAIL": "votre@email.com",
            "PHONE": "01 23 45 67 89",
            "SUBJECT": "Choisissez un sujet",
            "MESSAGE": "Décrivez votre demande en détail..."
          },

          "ERRORS": {
            "INVALID_PHONE": "Veuillez entrer un numéro au format international, ex. : +230612345678."
          },

          "BUTTON_SUBMIT": "Envoyer le message",
          "BUTTON_LOADING": "Envoi en cours..."
        },

        "INFO": {
          "CONTACT_TITLE": "Nos Coordonnées",
          "ADDRESS_TITLE": "Adresse",
          "ADDRESS": "123 Rue de la Boucherie, Grand Baie, île Maurice",
          "PHONE_TITLE": "Téléphone",
          "PHONE": "+230 5984 0270",
          "EMAIL_TITLE": "Email",
          "EMAIL": "contact@boucherie-artisanale.fr",
          "HOURS_TITLE": "Horaires d'ouverture",
          "HOURS": "Lundi - Vendredi : 8h00 - 13h00 | 14h00 - 17h00\nSamedi : 8h00 - 13h00\nDimanche : Fermé",

          "SPECIAL_ORDERS_TITLE": "Commandes Spéciales",
          "SPECIAL_ORDERS_TEXT": "Nous acceptons les commandes spéciales pour vos événements :",
          "SPECIAL_ORDERS": {
            "LI1": "Barbecues et grillades",
            "LI2": "Repas de famille",
            "LI3": "Événements d'entreprise",
            "LI4": "Fêtes et célébrations",
            "DELAY": "Délai de préparation : 24h minimum",
            "MIN_ORDER": "Commande minimum : Rs 1000"
          },

          "LOCATION_TITLE": "Comment nous trouver",

          "ACCESS": {
            "CAR": {
              "TITLE": "En voiture",
              "TEXT": "Parking gratuit disponible devant la bouchérie. Accès facile depuis le périphérique."
            },
            "PUBLIC": {
              "TITLE": "En transport en commun",
              "TEXT": "Bus : Arrêt Bus 21, 27, 38, 85\nRER : RER A et B - Nom de l'emplacement"
            },
            "WALK": {
              "TITLE": "À pied",
              "TEXT": "Situé au cœur du quartier Nom de l'emplacement, notre boucherie est facilement accessible à pied."
            },
            "DELIVERY": {
              "TITLE": "Livraison",
              "TEXT": "Livraison possible dans toute L'île. Frais de livraison : Rs 100 (gratuit à partir de Rs 3000 d'achat)",
              "DELAY":"Livraison entre 3 et 5 jours suivant vos disponibilités"
            }
          }
        }
      },

      //Product details page
      "product": {
        "loading": "Chargement du produit...",
        "notFoundTitle": "Produit non trouvé",
        "notFoundDescription": "Le produit que vous recherchez n'existe pas ou n'est plus disponible.",
        "backToCatalog": "Retour au catalogue",
        "breadcrumbHome": "Accueil",
        "breadcrumbCatalog": "Catalogue",
        "recommendedPreparation": "Préparation recommandée",
        "specialOffer": "Offre spéciale -{discount}%",
        "discountDescription": "Profitez de notre offre spéciale ! Commandez maintenant et économisez {discount}% sur ce produit de qualité artisanale.",
        "quantity": "Quantité :",
        "unitKg": "Kilogrammes (kg)",
        "unitG": "Grammes (g)",
        "priceTotal": "Prix total :",
        "addToCart": "Ajouter au panier",
        "freeShippingTitle": "Livraison gratuite",
        "freeShippingText": "Profitez de la livraison gratuite pour toute commande à pa Rs 3,000</strong>"
      },

      //Cart page
      "cart": {
        "title": "Mon Panier",
        "itemsCount": "{count} article(s) dans votre panier",
        "empty": {
          "title": "Votre panier est vide",
          "description": "Découvrez nos délicieux produits de porc artisanaux",
          "cta": "Découvrir nos produits"
        },
        "item": {
          "quantity": "Quantité",
          "unitKg": "kg",
          "unitG": "g",
          "removeTitle": "Supprimer cet article",
          "unitPriceSuffix": "/kg"
        },
        "summary": {
          "title": "Résumé de la commande",
          "subtotal": "Sous-total",
          "discount": "Réduction ({percent}%)",
          "total": "Total"
        },
        "shipping": {
          "freeIncluded": "Livraison gratuite incluse !",
          "addMore": "Ajoutez Rs {amount} pour la livraison gratuite"
        },
        "actions": {
          "continueShopping": "Continuer mes achats",
          "submitOrder": "Valider la commande",
          "clearCart": "Vider le panier"
        },
        "modal": {
          "orderSummary": "Détails de la commande"
        }
      },

      //Order Modal
      "orderModal": {
        "title": "Finaliser votre commande",
        "labels": {
          "firstName": "Prénom *",
          "lastName": "Nom *",
          "email": "Email *",
          "phone": "Téléphone *"
        },
        "placeholders": {
          "firstName": "Votre prénom",
          "lastName": "Votre nom",
          "email": "votre.email@exemple.com",
          "phone": "+230 59 45 67 89"
        },
        "errors": {
          "firstNameRequired": "Le prénom est requis",
          "lastNameRequired": "Le nom est requis",
          "emailRequired": "L'email est requis",
          "emailInvalid": "Format d'email invalide",
          "phoneInvalid": "Veuillez entrer un numéro au format international, ex. : +230612345678"
        },
        "summary": {
          "title": "Résumé de votre commande",
          "subtotal": "Sous-total:",
          "discount": "Remise:",
          "total": "Total:",
          "freeShipping": "✓ Livraison gratuite incluse"
        },
        "actions": {
          "cancel": "Annuler",
          "confirmOrder": "Confirmer la commande",
          "processing": "Traitement en cours..."
        },
        "userInfo": {
          "labelName": "👤",
          "labelEmail": "📧",
          "labelPhone": "📞"
        }
      },

      //Product cart
      "product-cart":{
        "addToCart": "Ajouter au panier",
        "origin": "Origine",
        "title": "Nom du produit",
        "description": "Description",
        "price": "À partir de Rs {price}/{unit}",
        "moreInfo": "Plus d'infos",
        "moreInfoAlt": "Plus d'infos...",
        "category": "Catégorie",
        "availability": "Disponibilité",
        "inStock": "En stock",
        "outOfStock": "Rupture de stock",
      },

      // Profil utilisateur
      "profile":{
        "title": 'Mon Profil',
        'personalInfo': 'Informations personnelles',
        'orderHistory': 'Historique des commandes',
        'addresses': 'Adresses',
        'preferences': 'Préférences',
        'security': 'Sécurité',
        'activeAccount': 'Compte actif',
        'inactiveAccount': 'Compte inactif',
        'changeAvatar': 'Changer l\'avatar', 
      },
      
      // Formulaires
      'form': {
        'firstName': 'Prénom',
        'lastName': 'Nom',
        'email': 'Adresse e-mail',
        'phone': 'Téléphone',
        'edit': 'Modifier',
        'cancel': 'Annuler',
        'save': 'Enregistrer',
        'saving': 'Enregistrement...',
      },
      
      // Erreurs de validation
      'validation': {
        'required':'Ce champ est requis',
        'email': 'L\'adresse e-mail n\'est pas valide',
        'phone': 'Le numéro de téléphone n\'est pas valide',
        'minLength': 'Ce champ doit contenir au moins {min} caractères'
      },
      
      // Commandes
      "orders":{
        'title': 'Historique des commandes',
        'orderNumber': 'Commande #',
        'date': 'Date',
        'status.delivered': 'Livrée',
        'status.processing': 'En cours',
        'quantity': 'Quantité',
        'subtotal': 'Sous-total',
        'discount': 'Réduction',
        'freeShipping': 'Livraison gratuite',
        'total': 'Total',
        'empty': 'Aucune commande',
        'emptyDescription': 'Vous n\'avez pas encore passé de commande.',
        'discoverProducts': 'Découvrir nos produits'
      },
      
      // Adresses
      "addresses":{
        'title': 'Mes adresses',
        'add': 'Ajouter une adresse',
        'default': 'Adresse par défaut',
        'empty': 'Aucune adresse enregistrée',
        'emptyDescription': 'Ajoutez une adresse pour faciliter vos commandes.'
      },
      
      // Préférences
      "preferences":{
        'title': 'Préférences',
        'emailNotifications': 'Notifications par e-mail',
        'promotions': 'Recevoir les offres promotionnelles',
        'orderUpdates': 'Recevoir les mises à jour de commande',
        'newProducts': 'Être informé des nouveaux produits',
        'displaySettings': 'Préférences d\'affichage',
        'language': 'Langue',
        'currency': 'Devise',
        'savePreferences': 'Enregistrer les préférences'
      },
      
      // Sécurité
      "security": {
        "title": "Sécurité du compte",
        "changePassword": "Changer le mot de passe",
        "currentPassword": "Mot de passe actuel",
        "newPassword": "Nouveau mot de passe",
        "confirmPassword": "Confirmer le mot de passe"
      },

      // Messages de succès/erreur
      "success": {
        "personalInfoUpdated": "Informations personnelles mises à jour avec succès",
        "passwordUpdated": "Mot de passe mis à jour avec succès",
        "preferencesUpdated": "Préférences mises à jour avec succès",
        "avatarUpdated": "Photo mise à jour avec succès"
      },
      "error": {
        "updatePersonalInfo": "Erreur lors de la mise à jour des informations",
        "updatePassword": "Erreur lors du changement de mot de passe",
        "updatePreferences": "Erreur lors de la mise à jour des préférences",
        "uploadAvatar": "Erreur lors de l'upload de l'avatar"
      },

      // Footer footer
      "footer": {
        "title": "Artisan des Saveurs",
        "description": "Votre spécialiste du porc de qualité depuis 2022",
        "address": "123 Rue de la Boucherie, Grand Baie",
        "phone": "+230 5984 0270",
        "email": "contact@artisan-des-saveurs.fr",
        "hours": "Horaires d’ouverture",
        "weekdays": "Lundi - Vendredi : 8h00 - 13h00 | 14h00 - 17h00",
        "saturday": "Samedi : 8h00 - 13h00",
        "sunday": "Dimanche : Fermé",
        "commitments": "Nos Engagements",
        "commitment1": "Élevage mauricien respectueux",
        "commitment2": "Savoir-faire artisanal",
        "commitment3": "Chaîne du froid respectée",
        "commitment4": "Pratiques durables",
        "copyright": "Artisan des Saveurs. Tous droits réservés."
      },
      "common": {
        "selectLanguage": "Choisir la langue"
      }
    };

    // Traductions anglaises
    this.translations['en'] = {
      //Login page
      "AUTH": {
        "TITLE": "Login",
        "SUBTITLE": "Sign in to your account",
        "USERNAME": "Username",
        "USERNAME_PLACEHOLDER": "Enter your username",
        "USERNAME_REQUIRED": "Username is required",
        "PASSWORD": "Password",
        "PASSWORD_PLACEHOLDER": "Enter your password",
        "PASSWORD_REQUIRED": "Password is required",
        "LOGIN": "Sign in",
        "FORGOT_PASSWORD": "Forgot password?",
        "CREATE_ACCOUNT": "Create an account"
      },

      //Registration page
      "REGISTER": {
        "TITLE": "Create an account",
        "SUBTITLE": "Join Artisan des Saveurs",
        "FIRSTNAME": "First name",
        "FIRSTNAME_PLACEHOLDER": "Your first name",
        "FIRSTNAME_REQUIRED": "First name is required",
        "FIRSTNAME_MAX": "First name cannot exceed 50 characters",

        "LASTNAME": "Last name",
        "LASTNAME_PLACEHOLDER": "Your last name",
        "LASTNAME_REQUIRED": "Last name is required",
        "LASTNAME_MAX": "Last name cannot exceed 50 characters",

        "USERNAME": "Username",
        "USERNAME_PLACEHOLDER": "Choose a username",
        "USERNAME_REQUIRED": "Username is required",
        "USERNAME_MIN": "Username must be at least 3 characters long",
        "USERNAME_MAX": "Username cannot exceed 20 characters",

        "EMAIL": "Email",
        "EMAIL_PLACEHOLDER": "your@email.com",
        "EMAIL_REQUIRED": "Email is required",
        "EMAIL_INVALID": "Email is not valid",

        "PHONE": "Phone (optional)",
        "PHONE_PLACEHOLDER": "+230 123 456 789",
        "PHONE_MAX": "Phone number cannot exceed 20 characters",
        "PHONE_REQUIRED":"Phone number is required.",
        "PHONE_INDICATIF":"The phone number must begin with (+230), for example.",

        "PASSWORD": "Password",
        "PASSWORD_PLACEHOLDER": "Password",
        "PASSWORD_REQUIRED": "Password is required",
        "PASSWORD_MIN": "Password must be at least 6 characters long",
        "PASSWORD_MAX": "Password cannot exceed 40 characters",

        "CONFIRM_PASSWORD": "Confirm password",
        "CONFIRM_PASSWORD_PLACEHOLDER": "Confirm your password",
        "CONFIRM_PASSWORD_REQUIRED": "Password confirmation is required",
        "CONFIRM_PASSWORD_MATCH": "Passwords do not match",

        "SUBMIT": "Create my account",
        "ALREADY_ACCOUNT": "Already have an account?",
        "LOGIN": "Login"
      },

      //Email page
      "RESET": {
        "TITLE": "Reset password",
        "SUBTITLE": "Reset your password",
        "EMAIL": "Email",
        "EMAIL_PLACEHOLDER": "Your email",
        "EMAIL_REQUIRED": "User email is required",
        "SEND": "Send",
        "BACK": "Back"
      },

      //Reset passw page
      "NEWPASS": {
        "TITLE": "Reset password",
        "SUBTITLE": "Reset your password",
        "PASSWORD": "Password",
        "PASSWORD_PLACEHOLDER": "Password",
        "PASSWORD_REQUIRED": "Password is required",
        "PASSWORD_MIN": "Password must be at least 6 characters",
        "PASSWORD_MAX": "Password cannot exceed 40 characters",
        "CONFIRM_PASSWORD": "Confirm password",
        "CONFIRM_PASSWORD_PLACEHOLDER": "Confirm your password",
        "CONFIRM_PASSWORD_REQUIRED": "Password confirmation is required",
        "CONFIRM_PASSWORD_MATCH": "Passwords do not match",
        "SUBMIT": "Submit",
        "BACK_LOGIN": "Login"
      },

      //Activation page
      "confirmation": {
        "title": "Confirm your email address",
        "intro": "Before proceeding, we need to verify your email <strong>{email}</strong>.",
        "highlight": "Open your mailbox and click on the activation link in the message you received.",
        "resend": {
          "text": "If you have not received our message (did you check your spam folder?), we can resend it to you.",
          "label": "Your email",
          "required": "The user email is required",
          "button": "Resend confirmation email"
        },
        "activated": {
          "title": "Your account has been activated",
          "message": "🎉 Welcome! You can now log in to your personal space.",
          "button": "Login"
        }
      },

      //New-Activation page
      "activation": {
        "title": "Activation",
        "subtitle": "Receive a new activation link",
        "form": {
          "label": "Email",
          "placeholder": "Your email",
          "required": "The user email is required",
          "button": "Send"
        },
        "links": {
          "returnText": "Return to ?",
          "login": "Login"
        }
      },

      // Navigation et interface générale
      "brand": {
        "title": "Artisan des Saveurs"
      },
      "nav": {
        "home": "Home",
        "catalog": "Catalog",
        "products": "Our Products",
        "about": "About",
        "contact": "Contact",
        "cart": "Cart",
        "profile": "Profile",
        "login": "Login",
        "register": "Register",
        "logout": "Logout",
        "dashboard": "Dashboard"
      },

      //HomePage
      "HERO": {
        "TITLE1": "Artisan des",
        "TITLE2":"Saveurs",
        "SUBTITLE": "Quality Pork Specialist",
        "DESCRIPTION": "Discover our selection of fresh, top-quality pork. Tradition, know-how, and passion at the service of your table.",
        "BUTTON_CATALOG": "Discover our products"
      },
      "FEATURED_PRODUCTS": {
        "TITLE": "Featured Products",
        "BUTTON_ALL": "See all our products"
      },
      "ABOUT": {
        "TITLE": "Our Artisan Know-How",
        "DESCRIPTION": "Since 2022, our family butcher shop has been preserving Mauritian butchery traditions. We carefully select our suppliers to offer you exceptional meats, respecting animal welfare and the environment.",
        "HIGHLIGHTS": {
          "BREEDING": {
            "TITLE": "Mauritian Breeding",
            "TEXT": "Selected partner breeders"
          },
          "KNOWHOW": {
            "TITLE": "Know-How",
            "TEXT": "Traditional techniques mastered"
          },
          "FRESHNESS": {
            "TITLE": "Freshness",
            "TEXT": "Cold chain respected"
          }
        },
        "BUTTON_MORE": "Learn more about us"
      },
      "CONTACT": {
        "TITLE": "Any Question? Special Order?",
        "DESCRIPTION": "Our team is available to advise you and prepare custom orders",
        "PHONE": "📞 +230 5984 0270",
        "ADDRESS": "📍 123 Rue de la Boucherie, Grand Baie",
        "BUTTON_CONTACT": "Contact us"
      },

      //Catalog page
      "category": {
        "decoupes_porc_classiques": "Cut meat",
        "charcuteries_terrines": "Charcuteries & terrines",
        "saucisses_variantes": "Sausages & variants",
        "produits_cuisines": "Cooked or seasoned products",
        "boudins":"Blood sausages",
        "produits_transformes": "Processed Products"
      },
      "catalog": {
        "header": {
          "title": "Our Products",
          "subtitle": "Discover our complete selection of premium quality pork meat"
        },
        "filters": {
          "searchPlaceholder": "Search for a product...",
          "allProducts": "All products"
        },
        "results": {
          "found": "{count} product(s) found",
          "foundWithSearch": "{count} product(s) found for \"{term}\""
        },
        "noResults": {
          "title": "No products found",
          "message": "Try changing your search criteria or selecting another category.",
          "seeAll": "See all products"
        },
        "cta": {
          "title": "Interested in our products?",
          "message": "Contact us to place an order or get more information about our products.",
          "button": "Contact Us"
        }
      },

      //About page
      "aboutUs": {
        "pageTitle": "About Us",
        "pageSubtitle": "Discover the history and values of our family butcher shop",
        "ourStoryTitle": "Our Story",
        "storyParagraph1": "Founded in 2022 by Vitale, Boucherie L'Artisan des Saveurs is a family business that has been perpetuating the traditions of Mauritian butchery for nearly 3 years. Located not far from Grand Baie, our establishment has built a reputation for excellence thanks to the exceptional quality of its products and its artisanal know-how.",
        "storyParagraph2": "Specializing in pork, over the years we have developed a network of carefully selected breeding partners, all located in Mauritius and sharing our values of respect for animal welfare and the environment. This approach allows us to offer you meats of superior quality, fresh and tasty.",
        "philosophyTitle": "Our Philosophy",
        "philosophyText": "We firmly believe that the quality of a product depends on every stage of its production. That's why we are personally involved in the selection of our suppliers, the preparation of our products and advice to our customers. Every piece of meat that leaves our butcher shop carries our commitment to excellence.",
        "commitmentsTitle": "Our Quality Commitments",
        "commitmentsSubtitle": "Quality is at the heart of our business. We are committed to respecting high standards at every stage of our process.",
        "teamTitle": "Our Team",
        "teamSubtitle": "Meet the passionate artisans who bring our butcher shop to life",
        "valuesTitle": "Our Values",
        "expertiseTitle": "Our Expertise",
        "expertiseIntro": "With nearly 40 years of experience, we have developed recognized expertise in several areas:",
        "expertiseTraditionalCut": "Traditional cutting: Perfect mastery of cutting techniques to optimize each piece",
        "expertiseCharcuterie": "Artisanal charcuterie: Preparation of sausages, pâtés and terrines according to our family recipes",
        "expertisePersonalizedAdvice": "Personalized advice: Support for our customers in choosing cuts and cooking techniques",
        "expertiseSpecialOrders": "Special orders: Custom preparation for your events and receptions",
        "recognitionTitle": "Professional Recognition",
        "recognitionText": "Our commitment to quality has been recognized by our peers and our customers. We are proud to have received several awards, and to be referenced by several local gastronomic guides.",
        "ctaTitle": "Come meet us!",
        "ctaText": "Our team will be delighted to welcome you to our butcher shop and introduce you to our exceptional products. Do not hesitate to visit us or contact us with any questions.",
        "ctaButton": "Contact Us"
      },

      //Contact page
      "CONTACT_PAGE": {
        "HEADER_TITLE": "Contact Us",
        "HEADER_SUBTITLE": "Feel free to contact us for any question or special order",

        "FORM": {
          "TITLE": "Send us a message",
          "FIRSTNAME": "First Name",
          "LASTNAME": "Last Name",
          "EMAIL": "Email",
          "PHONE": "Phone",
          "SUBJECT": "Subject",
          "MESSAGE": "Message",
          "CONSENT": "I agree that my personal data will be used to process my request",

          "PLACEHOLDER": {
            "FIRSTNAME": "Your first name",
            "LASTNAME": "Your last name",
            "EMAIL": "your@email.com",
            "PHONE": "+1 234 567 890",
            "SUBJECT": "Choose a subject",
            "MESSAGE": "Describe your request in detail..."
          },

          "ERRORS": {
            "INVALID_PHONE": "Please enter a phone number in international format, e.g.: +230612345678."
          },

          "BUTTON_SUBMIT": "Send message",
          "BUTTON_LOADING": "Sending..."
        },

        "INFO": {
          "CONTACT_TITLE": "Our Contact Details",
          "ADDRESS_TITLE": "Address",
          "ADDRESS": "123 Rue de la Boucherie, Grand Baie, Mauritius",
          "PHONE_TITLE": "Phone",
          "PHONE": "+230 5984 0270",
          "EMAIL_TITLE": "Email",
          "EMAIL": "contact@boucherie-artisanale.fr",
          "HOURS_TITLE": "Opening Hours",
          "HOURS": "Monday - Friday: 8am - 1pm | 2pm - 5pm\nSaturday: 8am - 1pm\nSunday: Closed",

          "SPECIAL_ORDERS_TITLE": "Special Orders",
          "SPECIAL_ORDERS_TEXT": "We accept special orders for your events:",
          "SPECIAL_ORDERS": {
            "LI1": "Barbecues and grills",
            "LI2": "Family meals",
            "LI3": "Corporate events",
            "LI4": "Parties and celebrations",
            "DELAY": "Preparation time: minimum 24h",
            "MIN_ORDER": "Minimum order: Rs 1000"
          },

          "LOCATION_TITLE": "How to find us",

          "ACCESS": {
            "CAR": {
              "TITLE": "By car",
              "TEXT": "Free parking available in front of the butcher shop. Easy access from the ring road."
            },
            "PUBLIC": {
              "TITLE": "By public transport",
              "TEXT": "Bus: Stops 21, 27, 38, 85\nRER: RER A and B - Location name"
            },
            "WALK": {
              "TITLE": "On foot",
              "TEXT": "Located in the heart of the neighborhood, our butcher shop is easily accessible on foot."
            },
            "DELIVERY": {
              "TITLE": "Delivery",
              "TEXT": "Delivery possible throughout the island. Delivery fee: Rs 100 (free for orders over Rs 3000)",
              "DELAY":"Delivery between 3 and 5 days depending on your availability"
            }
          }
        }
      },

      //Product details page
      "product": {
        "loading": "Loading product...",
        "notFoundTitle": "Product not found",
        "notFoundDescription": "The product you are looking for does not exist or is no longer available.",
        "backToCatalog": "Back to catalog",
        "breadcrumbHome": "Home",
        "breadcrumbCatalog": "Catalog",
        "recommendedPreparation": "Recommended preparation",
        "specialOffer": "Special offer -{discount}%",
        "discountDescription": "Take advantage of our special offer! Order now and save {discount}% on this artisanal quality product.",
        "quantity": "Quantity:",
        "unitKg": "Kilograms (kg)",
        "unitG": "Grams (g)",
        "priceTotal": "Total price:",
        "addToCart": "Add to cart",
        "freeShippingTitle": "Free delivery",
        "freeShippingText": "Enjoy free delivery for any order from <strong>Rs 3,000</strong>"
      },

      //Cart page
      "cart": {
        "title": "My Cart",
        "itemsCount": "{count} item(s) in your cart",
        "empty": {
          "title": "Your cart is empty",
          "description": "Discover our delicious artisanal pork products",
          "cta": "Discover our products"
        },
        "item": {
          "quantity": "Quantity",
          "unitKg": "kg",
          "unitG": "g",
          "removeTitle": "Remove this item",
          "unitPriceSuffix": "/kg"
        },
        "summary": {
          "title": "Order summary",
          "subtotal": "Subtotal",
          "discount": "Discount ({percent}%)",
          "total": "Total"
        },
        "shipping": {
          "freeIncluded": "Free delivery included!",
          "addMore": "Add Rs {amount} more for free delivery"
        },
        "actions": {
          "continueShopping": "Continue shopping",
          "submitOrder": "Place order",
          "clearCart": "Clear cart"
        },
        "modal": {
          "orderSummary": "Order details"
        }
      },

      //Order Modal
      "orderModal": {
        "title": "Finalize Your Order",
        "labels": {
          "firstName": "First Name *",
          "lastName": "Last Name *",
          "email": "Email *",
          "phone": "Phone *"
        },
        "placeholders": {
          "firstName": "Your first name",
          "lastName": "Your last name",
          "email": "your.email@example.com",
          "phone": "+230 59 45 67 89"
        },
        "errors": {
          "firstNameRequired": "First name is required",
          "lastNameRequired": "Last name is required",
          "emailRequired": "Email is required",
          "emailInvalid": "Invalid email format",
          "phoneInvalid": "Please enter a number in international format, e.g.: +230612345678"
        },
        "summary": {
          "title": "Order Summary",
          "subtotal": "Subtotal:",
          "discount": "Discount:",
          "total": "Total:",
          "freeShipping": "✓ Free shipping included"
        },
        "actions": {
          "cancel": "Cancel",
          "confirmOrder": "Confirm Order",
          "processing": "Processing..."
        },
        "userInfo": {
          "labelName": "👤",
          "labelEmail": "📧",
          "labelPhone": "📞"
        }
      },

      //Product cart
      "product-cart":{
        "addToCart": "Add to cart",
        "price": "From Rs {price}/{unit}",
        "description": "Description",
        "origin": "Origin",
        "title": "Product name",
        "moreInfo": "More info",
        "moreInfoAlt": "More info...",
        "category": "Category",
        "availability": "Availability",
        "inStock": "In stock",
        "outOfStock": "Out of stock",
      },
              
      // Profil utilisateur
      "profile": {
        "title": "My Profile",
        "personalInfo": "Personal Information",
        "orderHistory": "Order History",
        "addresses": "Addresses",
        "preferences": "Preferences",
        "security": "Security",
        "activeAccount": "Active Account",
        "inactiveAccount": "Inactive Account",
        "changeAvatar": "Change avatar"
      },

      // Formulaires
      "form": {
        "firstName": "First Name",
        "lastName": "Last Name",
        "email": "Email Address",
        "phone": "Phone",
        "edit": "Edit",
        "cancel": "Cancel",
        "save": "Save",
        "saving": "Saving..."
      },

      // Erreurs de validation
      "validation": {
        "required": "This field is required",
        "email": "The email address is not valid",
        "phone": "The phone number is not valid",
        "minLength": "This field must contain at least {min} characters"
      },

      // Commandes
      "orders": {
        "title": "Order History",
        "orderNumber": "Order #",
        "date": "Date",
        "status": {
          "delivered": "Delivered",
          "processing": "Processing"
        },
        "quantity": "Quantity",
        "subtotal": "Subtotal",
        "discount": "Discount",
        "freeShipping": "Free Shipping",
        "total": "Total",
        "empty": "No Orders",
        "emptyDescription": "You haven't placed any orders yet.",
        "discoverProducts": "Discover Our Products"
      },

      // Adresses
      "addresses": {
        "title": "My Addresses",
        "add": "Add Address",
        "default": "Default Address",
        "empty": "No Saved Addresses",
        "emptyDescription": "Add an address to make ordering easier."
      },

      // Préférences
      "preferences": {
        "title": "Preferences",
        "emailNotifications": "Email Notifications",
        "promotions": "Receive promotional offers",
        "orderUpdates": "Receive order updates",
        "newProducts": "Be notified of new products",
        "displaySettings": "Display Settings",
        "language": "Language",
        "currency": "Currency",
        "savePreferences": "Save Preferences"
      },

      // Sécurité
      "security": {
        "title": "Account Security",
        "changePassword": "Change Password",
        "currentPassword": "Current Password",
        "newPassword": "New Password",
        "confirmPassword": "Confirm Password"
      },

      // Messages de succès/erreur
      "success": {
        "personalInfoUpdated": "Personal information updated successfully",
        "passwordUpdated": "Password updated successfully",
        "preferencesUpdated": "Preferences updated successfully",
        "avatarUpdated": "Photo updated successfully"
      },
      "error": {
        "updatePersonalInfo": "Error updating information",
        "updatePassword": "Error changing password",
        "updatePreferences": "Error updating preferences",
        "uploadAvatar": "Error uploading avatar"
      },

      // Footer
      "footer": {
        "title": "Artisan des Saveurs",
        "description": "Your quality pork specialist since 2022",
        "address": "123 Butcher Street, Grand Baie",
        "phone": "+230 5984 0270",
        "email": "contact@artisan-des-saveurs.fr",
        "hours": "Opening Hours",
        "weekdays": "Monday - Friday: 8:00 AM - 1:00 PM | 2:00 PM - 5:00 PM",
        "saturday": "Saturday: 8:00 AM - 1:00 PM",
        "sunday": "Sunday: Closed",
        "commitments": "Our Commitments",
        "commitment1": "Respectful Mauritian farming",
        "commitment2": "Artisanal know-how",
        "commitment3": "Cold chain respected",
        "commitment4": "Sustainable practices",
        "copyright": "Artisan des Saveurs. All rights reserved."
      },
      
      "common": {
        "selectLanguage": "Select language"
      }
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
