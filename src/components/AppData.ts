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
} from '../types/index';

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

	isItemInBasket(item: IProduct) {
		return this.basket.items.some((basketItem) => basketItem.id === item.id);
	}

	getTotalItemsInBasket() {
		return this.basket.items.length;
	}

	getTotalBasketPrice() {
		return this.basket.total;
	}

	// Метод для очистки корзины
	clearBasket() {
		// Очищаем список товаров в корзине
		this.basket.items = [];
		// Устанавливаем общую стоимость корзины в 0
		this.basket.total = 0;
		// Генерируем событие об изменении корзины
		this.emitChanges(Events.BASKET_CLEARED, { basket: this.basket });
		this.emitChanges(Events.BASKET_CHANGED, { basket: this.basket });
	}

	setOrderData(data: Partial<IOrder>) {
		this.orderData = {
			...this.orderData,
			orderDetails: {
				...this.orderData.orderDetails,
				...data.orderDetails,
			},
			customerData: {
				...this.orderData.customerData,
				...data.customerData,
			},
		};
	}

	clearOrderData() {
		// Сбрасываем данные заказа
		this.setOrderData({
			orderDetails: {
				paymentMethod: 'online',
				deliveryAddress: '',
			},
			customerData: {
				email: '',
				phone: '',
			},
		});

		// Очищаем корзину
		this.clearBasket();
	}

	validateAddress(): boolean {
		const errors: typeof this.formErrors = {};
		const addressRegex = /^[а-яА-ЯёЁ0-9][а-яА-ЯёЁ0-9\s.,-]{8,}[а-яА-ЯёЁ0-9]$/;

		if (!this.orderData.orderDetails.deliveryAddress) {
			errors.deliveryAddress = 'Укажите ваш адрес';
		} else if (
			!addressRegex.test(this.orderData.orderDetails.deliveryAddress)
		) {
			errors.deliveryAddress = 'Слишком короткий адрес, такое возможно?';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);

		// Возвращаем true, если ошибок нет
		return Object.keys(errors).length === 0;
	}

	validateCustomerData(): boolean {
		const errors: typeof this.formErrors = {};
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

		// Проверка электронной почты
		if (!this.orderData.customerData.email) {
			errors.email = 'Укажите ваш e-mail';
		} else if (!emailRegex.test(this.orderData.customerData.email)) {
			errors.email = 'Введите e-mail в формате example@test.com';
		}

		// Проверка номера телефона
		if (!this.orderData.customerData.phone) {
			errors.phone = 'Необходимо указать телефон';
		} else if (!phoneRegex.test(this.orderData.customerData.phone)) {
			errors.phone = 'Неверный формат номера телефона';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);

		// Возвращаем true, если ошибок нет
		return Object.keys(errors).length === 0;
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
