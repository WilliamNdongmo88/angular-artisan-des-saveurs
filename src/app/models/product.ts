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
  VIANDE_A_LA_COUPE = 'viande-a-la-coupe',
  CHARCUTERIES_TERRINES = 'charcuteries-et-terrines',
  SAUCISSES_VIANDE = 'saucisses-et-variantes',
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
