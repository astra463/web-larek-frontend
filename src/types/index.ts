export type ProductCategory =
	| 'софт-скилл'
	| 'другое'
	| 'дополнительное'
	| 'кнопка'
	| 'хард-скилл';
export type PaymentMethod = 'online' | 'upon-receipt';
export interface IFormData extends ICustomerData, IOrderDetails {}
export type FormErrors = Partial<Record<keyof IFormData, string>>;

export enum Events {
	CATALOG_CHANGED = 'catalog:changed',
	CARD_SELECTED = 'card:selected',
	MODAL_CLOSED = 'modal:close',
	MODAL_OPENED = 'modal:open',
	BASKET_APPENDED = 'basket:appended',
	BASKET_REDUCED = 'basket:reduced',
	BASKET_CLEARED = 'basket:cleared',
	BASKET_CHANGED = 'basket:changed',
	BASKET_OPENED = 'basket:opened',
	ORDER_DETAILS_INFO_ENTERED = 'order:details-info-entered',
	ORDER_ADDRESS_CHANGED = 'order.address:change',
	ORDER_CONTACT_INFO_ENTERED = 'order:contact-info-entered',
	ORDER_EMAIL_CHANGED = 'contacts.email:change',
	ORDER_PHONE_NUMBER_CHANGED = 'contacts.phone:change',
	ORDER_PLACED = 'order:placed',
	ORDER_COMPLETE = 'order:complete',
	FOR_NEW_PURCHASES = 'for-new-purchases',
}

// Интерфейс для товара
export interface IProduct {
	id: string;
	category: ProductCategory;
	title: string;
	image: string;
	price: number;
	about?: string;
}

export type CardPreview = {
	id: string;
	category: ProductCategory;
	title: string;
	image: string;
	price: number;
	description: string;
	about?: string;
};

// Интерфейс для формы ввода данных покупателя
export interface ICustomerData {
	phone: string;
	email: string;
}

// Интерфейс для формы ввода данных заказа
export interface IOrderDetails {
	paymentMethod: PaymentMethod;
	deliveryAddress: string;
}

// Интерфейс для заказа
export interface IOrder {
	orderDetails: IOrderDetails;
	customerData: ICustomerData;
}

// Интерфейс для корзины
export interface IBasketState {
	items: IProduct[];
	total: number;
}

export interface IBasketView {
	items: HTMLElement[];
	total: number;
}

export interface IModalData {
  content: HTMLElement;
}

// Состояние приложения
export interface IAppState {
	catalog: IProduct[];
	basket: IBasketState;
	orderData: (IOrderDetails & ICustomerData) | null;
}


export interface IForm<T> {
	data: T;
	submit(): void;
}

export interface ISuccessData {
	total: number;
}

export type PlaceOrderRequest = {
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
};

export type PlaceOrderResponse = {
	id: string[],
	total: number
}