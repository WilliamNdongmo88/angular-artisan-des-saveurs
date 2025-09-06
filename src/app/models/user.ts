import { ContactForms, ContactRequest } from "./product";

export class User implements ContactForms {
	firstName!: string;
	lastName!: string;
	fullName: string = '';
	email!: string;
	phone!: string;
	consent!: boolean;
	contactRequests!: ContactRequest[];

}

export class Users {
	id!:number;
	firstName!: string;
	lastName!: string;
	fullName: string = '';
	email!: string;
	emailPromotions!: boolean;
	emailOrderUpdates!: boolean;
	emailNewProducts!: boolean;
	currency!: string;
	language!: string;
	phone!: string;
 	actif: boolean = false;
	role: string = '';
	avatar: string = '';
}