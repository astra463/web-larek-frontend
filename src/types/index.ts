export type ProductCategory = 'софт-скилл' | 'другое' | 'дополнительное' | 'кнопка' | 'хард-скилл';
export type PaymentMethod = 'online' | 'upon-receipt';

export enum Events {
  CATALOG_CHANGED = 'catalog:changed',
  CARD_SELECTED = 'card:selected',
  MODAL_CLOSED = 'modal:close',
  MODAL_OPENED ='modal:open',
  BASKET_CHANGED = 'basket:changed',
  BASKET_OPENED = 'basket:opened',
  ORDER_PLACED = 'order:placed',
  CONTACT_INFO_ENTERED = 'order:contact-info-entered',
  ORDER_SUCCESSFUL = 'order:successful',
}

// Интерфейс для товара
export interface IProduct {
  id: string;
  category: ProductCategory;
  title: string;
  image: string;
  price: number;
  about: string;
}

// Интерфейс для формы ввода данных покупателя
export interface ICustomerData {
  phoneNumber: string;
  email: string;
}

// Интерфейс для формы ввода данных заказа
export interface IOrderData {
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
}

// Интерфейс для корзины
export interface IBasketState {
  items: IProduct[];
  total: number;
}

// Состояние приложения
export interface IAppState {
  catalog: IProduct[];
  basket: IBasketState;
  order: IOrderData & ICustomerData | null;
}

export interface IForm<T> {
  data: T;
  submit(): void;
}