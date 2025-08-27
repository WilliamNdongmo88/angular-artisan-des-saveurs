export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: ProductCategory;
  image: string;
  imageUrl: string;
  featured: boolean;
  available: boolean;
  origin: string;
  preparation?: string;
  stockQuantity: number; // Quantité en stock (en unité de base)

  baseUnit: 'kg' | 'g' | 'piece'; // Unité de base du produit
  pricePerBaseUnit: number; // Prix par unité de base (ex: prix par kg)
  allowedUnits: ('kg' | 'g' | 'piece')[]; // Unités autorisées pour ce produit
}

export enum ProductCategory {
  COTES_TRAVERS = 'cotes-travers',
  ROTIS_FILETS = 'rotis-filets',
  SAUCISSES_CHARCUTERIE = 'saucisses-charcuterie',
  MORCEAUX_BRAISER = 'morceaux-braiser',
  PRODUITS_TRANSFORMES = 'produits-transformes'
}

export interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
}

export interface ContactRequest{
  subject: string;
  message: string;
}

export interface ContactForms {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  consent: boolean;
  contactRequests: ContactRequest[];
}

// Interface pour la gestion des quantités avec unités
export interface QuantityWithUnit {
  value: number; // Quantité saisie (peut être décimale)
  unit: 'kg' | 'g' | 'piece'; // Unité sélectionnée
}

// Interface pour les calculs de prix
export interface PriceCalculation {
  baseQuantity: number; // Quantité convertie dans l'unité de base
  unitPrice: number; // Prix unitaire dans l'unité sélectionnée
  totalPrice: number; // Prix total calculé
  originalPrice: number; // Prix original avant remise
  discountedPrice: number; // Prix après remise
  discount: number; // Montant de la remise
}

// Énumération des unités disponibles
export enum Unit {
  KILOGRAM = 'kg',
  GRAM = 'g',
  PIECE = 'piece'
}

// Configuration des unités avec leurs facteurs de conversion
export const UNIT_CONFIG = {
  kg: {
    label: 'Kilogramme',
    shortLabel: 'kg',
    conversionToGrams: 1000,
    step: 0.1, // Pas pour l'input
    min: 0.1,
    max: 50
  },
  g: {
    label: 'Gramme',
    shortLabel: 'g',
    conversionToGrams: 1,
    step: 50, // Pas pour l'input
    min: 50,
    max: 5000
  },
  piece: {
    label: 'Pièce',
    shortLabel: 'pcs',
    conversionToGrams: 0, // Pas de conversion pour les pièces
    step: 1,
    min: 1,
    max: 100
  }
};

// Exemple de produits avec les nouvelles propriétés
export const SAMPLE_PRODUCTS: Partial<Product>[] = [
  {
    id: 1,
    name: "Fromage de chèvre artisanal",
    baseUnit: 'kg',
    pricePerBaseUnit: 25.90, // 25.90€ par kg
    allowedUnits: ['kg', 'g'],
    stockQuantity: 10 // 10 kg en stock
  },
  {
    id: 2,
    name: "Pain de campagne",
    baseUnit: 'piece',
    pricePerBaseUnit: 3.50, // 3.50€ par pièce
    allowedUnits: ['piece'],
    stockQuantity: 20 // 20 pièces en stock
  },
  {
    id: 3,
    name: "Miel de lavande",
    baseUnit: 'kg',
    pricePerBaseUnit: 18.00, // 18€ par kg
    allowedUnits: ['kg', 'g'],
    stockQuantity: 5 // 5 kg en stock
  }
];