import { ensureElement, cloneTemplate } from './utils/utils';
import { EventEmitter } from './components/base/EventEmitter';
import { StoreAPI } from './components/StoreAPI';
import { API_URL, CDN_URL } from './utils/constants';
import {
	Events,
	ICustomerData,
	IProduct,
	PaymentMethod,
	ProductCategory,
	PlaceOrderResponse,
  IBasketView,
} from './types';
import { AppState, CatalogChangeEvent } from './components/AppData';
import { Page } from './components/Page';
import { Card, CardPreview } from './components/Card';
import './scss/styles.scss';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { CustomerDataForm, Form, OrderDetailsForm } from './components/Form';
import { SuccessModal } from './components/common/Success';

const events = new EventEmitter();
const api = new StoreAPI(CDN_URL, API_URL);
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Шаблоны
const successModalTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewModalTemplate =
	ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderDetailsFormTemplate = ensureElement<HTMLTemplateElement>('#order');
const customerDataFormTemplate =
	ensureElement<HTMLTemplateElement>('#contacts');

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const orderForm = new OrderDetailsForm(
	cloneTemplate(orderDetailsFormTemplate),
	events
);
const customerDataForm = new CustomerDataForm(
	cloneTemplate(customerDataFormTemplate),
	events
);
const succesModal = new SuccessModal(
	cloneTemplate(successModalTemplate),
	events
);

// Чтобы мониторить все события, для отладки
// events.onAll(({ eventName, data }) => {
// 	console.log(eventName, data);
// });

// Получаем товары с сервера
api
	.getProductList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});

// Изменились элементы каталога
events.on<CatalogChangeEvent>(Events.CATALOG_CHANGED, () => {
	page.gallery = appData.catalog.map((item) => {
		const card = new Card<ProductCategory>(
			'card',
			cloneTemplate(cardTemplate),
			{
				onClick: () => events.emit(Events.CARD_SELECTED, item),
			}
		);
		return card.render({
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
		});
	});
});

// Открыли карточку
events.on<CardPreview>(Events.CARD_SELECTED, (item) => {
	const isItemInBasket = appData.basket.items.some(
		(basketItem) => basketItem.id === item.id
	);
	const card = new Card<CardPreview>(
		'card',
		cloneTemplate(cardPreviewModalTemplate),
		{
			onClick: () => {
				events.emit(Events.BASKET_APPENDED, item);
				card.disableButton();
			},
		}
	);
	if (isItemInBasket) {
		card.disableButton();
	}
	modal.render({
		content: card.render({
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
			about: item.description,
		}),
	});
	page.locked = true;
});

// Добавили товар в корзину
events.on(Events.BASKET_APPENDED, (item: IProduct) => {
	// Передали товар в модель данных корзины
	appData.addToBasket(item);
	page.counter = appData.basket.items.length;
	modal.close();
});

// Удалили товар из корзины
events.on(Events.BASKET_REDUCED, (productToRemove: IProduct) => {
	appData.removeFromBasket(productToRemove);
	if (appData.basket.items.length === 0) {
		basket.setEmpty();
	}
	page.counter = appData.basket.items.length;
});

// Реагируем на изменения корзины
events.on(Events.BASKET_CHANGED, () => {
	basket.updateBasket();
	basket.total = appData.basket.total;
});

// Открыли корзину
events.on(Events.BASKET_OPENED, () => {
	modal.render({
		content: basket.render({
			items: appData.basket.items.map((item) => {
				// Создаем экземпляр класса Card для каждого элемента корзины
				const cardItem = new Card<IBasketView>(
					'card',
					cloneTemplate(cardBasketTemplate),
					{
						onClick: () => {
							cardItem.remove();
							events.emit(Events.BASKET_REDUCED, item);
						},
					}
				);
				return cardItem.render({
					title: item.title,
					price: item.price,
				});
			}),
			total: appData.basket.total,
		}),
	});
	// Чтобы при первом открытии корзина установилась пустой
	basket.updateBasket();
});

// Приступили к оформлению заказа
events.on(Events.ORDER_DETAILS_INFO_ENTERED, () => {
	modal.close();
	modal.render({
		content: orderForm.render({
			valid: false,
			errors: [],
		}),
	});
});

// Начали вводить контактные данные
events.on(
	Events.ORDER_CONTACT_INFO_ENTERED,
	(data: { paymentMethod: PaymentMethod; address: string }) => {
		appData.orderData.orderDetails.paymentMethod = data.paymentMethod;
		appData.orderData.orderDetails.deliveryAddress = data.address;
		modal.close();

		modal.render({
			content: customerDataForm.render({
				valid: false,
				errors: [],
			}),
		});
	}
);

// Валидация адреса
events.on(Events.ORDER_ADDRESS_CHANGED, (event: object) => {
	appData.validateAddress(event, orderForm);
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<ICustomerData>) => {
	const { email, phone } = errors;
	customerDataForm.valid = !email && !phone;
	customerDataForm.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

// Изменилось одно из полей
events.on(
	/^contacts\..*:change/,
	(data: { field: keyof ICustomerData; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

events.on(Events.BASKET_CLEARED, () => {
	basket.setEmpty();
	page.counter = appData.basket.items.length;
});

events.on(Events.MODAL_CLOSED, () => {
	page.locked = false;
});

events.on(Events.ORDER_PLACED, (data: ICustomerData) => {
	appData.orderData.customerData.email = data.email;
	appData.orderData.customerData.phone = data.phone;

	api
		.placeOrder({
			payment: appData.orderData.orderDetails.paymentMethod,
			email: appData.orderData.customerData.email,
			phone: appData.orderData.customerData.phone,
			address: appData.orderData.orderDetails.deliveryAddress,
			total: appData.basket.total,
			items: appData.basket.items.map((item) => item.id),
		})
		.then((res: PlaceOrderResponse) => {
			succesModal.total = res.total;
		});

	appData.clearOrderData();
	modal.close();
	modal.render({
		content: succesModal.render(),
	});
});

events.on(Events.ORDER_COMPLETE, () => {
	modal.close();
});
