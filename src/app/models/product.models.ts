import { ProductCategory } from "./product";

export interface MyFile {
  id: number;
  name: string;
  content: string;
  temp: string;
}

export interface ProductToSend{
  productImage: MyFile,
  productRequest: ProductRequest
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

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  origin: string;
  category: string;
  imageUrl: string;
  available: boolean;
  stockQuantity: number;
  unit: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  mainImage: MyFile;
  available: boolean;
  featured: boolean;
  stockQuantity: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
  origin: string;
  preparation: string;
}

