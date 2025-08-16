// models/order.model.ts

import { ProductCategory } from "./product";
import { User } from "./user";

// export interface Product {
//   id: string;
//   name: string;
//   category: string;
//   description: string;
//   imageUrl: string;
//   origin: string;
//   price: number;
//   unit: string;
//   featured: boolean;
// }
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: ProductCategory;
  imageUrl: string;
  featured: boolean;
  origin: string;
  preparation?: string;
}
export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface OrderPayload {
  user: User;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  freeShipping: boolean;
}