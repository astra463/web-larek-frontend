import { Model } from './base/Model';
import { IEvents } from './base/EventEmitter';
import {
	IProduct,
	IAppState,
	IBasketState,
	ProductCategory,
	Events,
	IOrder,
	FormErrors,
	ICustomerData,
} from '../types/index';
import { CustomerDataForm, OrderDetailsForm } from './Form';

export type CatalogChangeEvent = {
	catalog: Product[];
};

// класс для модели состояния приложения
export class AppState extends Model<IAppState> {
	catalog: Product[] = [];
	basket: IBasketState = {
		items: [],
		total: 0,
	};
	orderData: IOrder = {
		orderDetails: {
			paymentMethod: 'online',
			deliveryAddress: '',
		},
		customerData: {
			email: '',
			phone: '',
		},
	};
	formErrors: FormErrors = {};

	// Метод для установки каталога товаров
	setCatalog(items: IProduct[]) {
		// Преобразуем массив товаров в экземпляры класса Product и сохраняем их в каталоге
		this.catalog = items.map((item) => new Product(item, this.events));
		// Генерируем событие об изменении каталога
		this.emitChanges(Events.CATALOG_CHANGED, { catalog: this.catalog });
	}

	// Метод для добавления товара в корзину
	addToBasket(product: IProduct) {
		// Добавляем товар в корзину
		this.basket.items.push(product);
		// Увеличиваем общую стоимость товаров в корзине
		this.basket.total += product.price;
		// Генерируем событие об изменении корзины
		this.emitChanges(Events.BASKET_CHANGED, { basket: this.basket });
	}

	removeFromBasket(product: IProduct) {
		this.basket.items = this.basket.items.filter((item) => {
			return item.id !== product.id;
		});
		this.basket.total -= product.price;
		this.emitChanges(Events.BASKET_CHANGED, { basket: this.basket });
	}

	// Метод для очистки корзины
	clearBasket() {
		// Очищаем список товаров в корзине
		this.basket.items = [];
		// Устанавливаем общую стоимость корзины в 0
		this.basket.total = 0;
		// Генерируем событие об изменении корзины
		this.emitChanges(Events.BASKET_CLEARED, { basket: this.basket });
	}

	setOrderField(field: keyof ICustomerData, value: string) {
		this.orderData.customerData[field] = value;

		if (this.validateOrder()) {
			this.events.emit('order:ready', this.orderData.customerData);
		}
	}

	clearOrderData() {
		// Сбрасываем данные заказа
		this.orderData = {
			orderDetails: {
				paymentMethod: 'online',
				deliveryAddress: '',
			},
			customerData: {
				email: '',
				phone: '',
			},
		};
		this.clearBasket();
	}

	validateOrder() {
		const errors: typeof this.formErrors = {};

		// Проверка наличия email
		if (!this.orderData.customerData.email) {
			errors.email = 'Необходимо указать email';
		} else {
			// Проверка валидности email по регулярному выражению
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(this.orderData.customerData.email)) {
				errors.email = 'Неверный формат email';
			}
		}

		// Проверка наличия номера телефона
		if (!this.orderData.customerData.phone) {
			errors.phone = 'Необходимо указать телефон';
		} else {
			// Проверка валидности номера телефона по регулярному выражению
			const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
			if (!phoneRegex.test(this.orderData.customerData.phone)) {
				errors.phone =
					'Неверный формат номера телефона, ожидается: +7 (XXX) XXX-XX-XX';
			}
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateAddress(event: object, form: CustomerDataForm | OrderDetailsForm) {
		const regex = /^[а-яА-ЯёЁ0-9][а-яА-ЯёЁ0-9\s.,-]{8,}[а-яА-ЯёЁ0-9]$/;
		const errorMessage = 'Неверный формат адреса';
		{
			if ('value' in event) {
				const isValid = regex.test(event.value as string);
				form.valid = isValid;

				if (!isValid) {
					form.errors = errorMessage;
				} else {
					form.errors = '';
				}
			}
		}
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
