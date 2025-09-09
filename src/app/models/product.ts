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
}

export enum ProductCategory {
  DECOUPE_PORC_CLASSIQUE = 'decoupes-porc-classiques',
  CHARCUTERIES_TERRINES = 'charcuteries-terrines',
  SAUCISSES_VIANDE = 'saucisses-variantes',
  PRODUITS_CUISINES = 'produits-cuisines',
  BOUDINS = 'boudins',
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
