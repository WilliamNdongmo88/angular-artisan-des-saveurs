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
  origin: string;
  preparation?: string;
}

export enum ProductCategory {
  COTES_TRAVERS = 'cotes-travers',
  ROTIS_FILETS = 'rotis-filets',
  SAUCISSES_CHARCUTERIE = 'saucisses-charcuterie',
  MORCEAUX_BRAISER = 'morceaux-braiser',
  PRODUITS_TRANSFORMES = 'produits-transformes'
}
      /*[ProductCategory.COTES_TRAVERS]: 'Côtes et Travers',
      [ProductCategory.ROTIS_FILETS]: 'Rôtis et Filets',
      [ProductCategory.SAUCISSES_CHARCUTERIE]: 'Saucisses et Charcuterie',
      [ProductCategory.MORCEAUX_BRAISER]: 'Morceaux à Braiser',
      [ProductCategory.PRODUITS_TRANSFORMES]: 'Produits Transformés'*/

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


