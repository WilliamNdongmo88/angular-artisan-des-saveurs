// models/order.model.ts

import { ProductCategory } from "./product";
import { User } from "./user";

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
    displayQuantity: number;
    selectedUnit: string;
}

export interface OrderPayload {
    id: number;
    user: User;
    subtotal: number;
    discount: number;
    total: number;
    freeShipping: boolean;
    status: string;
    slug?: string;
    deliveryMethod: string;
    paymentMethod: string;
    createdAt: Date;
    items: OrderItem[];
}