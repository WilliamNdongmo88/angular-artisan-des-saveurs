import { ProductCategory } from "./product";

export interface MyFile {
  id: number;
  fileName: string;
  filePath: string; // URL publique Nginx
  content: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  stockQuantity: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDto {
  id: number;
  name: string;
  price: number;
  description: string;
  preparation?: string;
  category?: string;
  available: boolean;
  origin?: string;
  unit?: string;
  stockQuantity?: number;
  featured?: boolean;
  imageUrl: string;
  mainImage?: MyFile;
}

export interface ProductItemDTO {
  id: number;
  quantity: number;
  product: ProductDto;
}

export interface OrdersResponse {
  id: number | null;
  subtotal: number;
  discount: number;
  total: number;
  freeShipping: boolean;
  createdAt: Date;
  delivered: string;
  userid: number;
  productItem: ProductItemDTO;
}


