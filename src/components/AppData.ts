import { Model } from './base/Model';
import { IEvents } from './base/EventEmitter';
import { IProduct, IAppState, IBasketState, ICustomerData, IOrderData, ProductCategory } from '../types/index';

export type CatalogChangeEvent = {
  catalog: Product[]
};

export type CardPreview = {
  category: string;
  title: string;
  image: string;
  price: number;
  about: string;
};


// класс для модели состояния приложения
export class AppState extends Model<IAppState> {
  catalog: Product[] = [];
  basket: IBasketState = {
    items: [],
    total: 0,
  };
  order: IOrderData & ICustomerData | null = null;

  // Метод для установки каталога товаров
  setCatalog(items: IProduct[]) {
    // Преобразуем массив товаров в экземпляры класса Product и сохраняем их в каталоге
    this.catalog = items.map(item => new Product(item, this.events));
    // Генерируем событие об изменении каталога
    this.emitChanges('catalog:changed', { catalog: this.catalog });
  }

  // Метод для добавления товара в корзину
  addToBasket(product: IProduct) {
    // Добавляем товар в корзину
    this.basket.items.push(product);
    // Увеличиваем общую стоимость товаров в корзине
    this.basket.total += product.price;
    // Генерируем событие об изменении корзины
    this.emitChanges('basket:changed', { basket: this.basket });
  }

  // Метод для очистки корзины
  clearBasket() {
    // Очищаем список товаров в корзине
    this.basket.items = [];
    // Устанавливаем общую стоимость корзины в 0
    this.basket.total = 0;
    // Генерируем событие об изменении корзины
    this.emitChanges('basket:changed', { basket: this.basket });
  }

  // Метод для оформления заказа
  placeOrder(orderData: IOrderData, customerData: ICustomerData) {
    // Сохраняем данные о заказе и покупателе
    this.order = { ...orderData, ...customerData };
    // Генерируем событие о размещении заказа
    this.emitChanges('order:placed', { order: this.order });
  }
}

// Определяем класс для модели продукта
export class Product extends Model<IProduct> {
  // Свойства продукта
  id: string;
  category: ProductCategory;
  title: string;
  image: string;
  price: number;
  about: string;

  constructor(data: Partial<IProduct>, events: IEvents) {
    super(data, events);
    // Присваиваем значения свойствам продукта из переданных данных
    this.id = data.id || '';
    this.category = data.category || 'другое';
    this.title = data.title || '';
    this.image = data.image || '';
    this.price = data.price || 0;
    this.about = data.about || '';
  }
}
