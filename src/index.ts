import { ensureElement, cloneTemplate } from './utils/utils';
import { EventEmitter } from './components/base/EventEmitter';
import { StoreAPI } from './components/StoreAPI';
import { API_URL, CDN_URL } from './utils/constants';
import {
	Events,
	ICustomerData,
	IProduct,
	ProductCategory,
	PlaceOrderResponse,
	IBasketView,
	CardPreview,
	IFormData,
} from './types';
import { AppState, CatalogChangeEvent } from './components/AppData';
import { Page } from './components/Page';
import { Card } from './components/Card';
import './scss/styles.scss';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { CustomerDataForm, OrderDetailsForm } from './components/Form';
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
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

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
	if (appData.isItemInBasket(item)) {
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
	modal.close();
});

// Удалили товар из корзины
events.on(Events.BASKET_REDUCED, (productToRemove: IProduct) => {
	appData.removeFromBasket(productToRemove);
	if (appData.basket.items.length === 0) {
		basket.setEmpty();
	}
});

// Реагируем на изменения корзины
events.on(Events.BASKET_CHANGED, () => {
	basket.updateBasket();
	basket.total = appData.getTotalBasketPrice();
	page.counter = appData.getTotalItemsInBasket();
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
			total: appData.getTotalBasketPrice(),
		}),
	});
});

// Приступили к оформлению заказа
events.on(Events.ORDER_DETAILS_INFO_ENTERED, () => {
	modal.close();
	modal.render({
		content: orderForm.render({
			valid: appData.validateAddress(),
			errors: [],
		}),
	});
});

// Начали вводить контактные данные
events.on(Events.ORDER_CONTACT_INFO_ENTERED, () => {
	modal.close();

	modal.render({
		content: customerDataForm.render({
			valid: appData.validateCustomerData(),
			errors: [],
		}),
	});
});

events.on('formErrors:change', (errors: Partial<IFormData>) => {
	// Проверяем наличие ошибок в адресе доставки
	if (errors.deliveryAddress) {
		orderForm.valid = false;
		orderForm.errors = errors.deliveryAddress;
	} else {
		orderForm.valid = true;
		orderForm.errors = '';
	}

	// Проверяем наличие ошибок в email и телефоне
	if (errors.email || errors.phone) {
		customerDataForm.valid = false;
		customerDataForm.errors = Object.values({
			phone: errors.phone,
			email: errors.email,
		})
			.filter((i) => !!i)
			.join('; ');
	} else {
		customerDataForm.valid = true;
		customerDataForm.errors = '';
	}
});

// Изменилось одно из полей
events.on(
	/^(contacts\.(phone|email)|order\.address):change/,
	(data: { field: keyof ICustomerData; value: string }) => {
		if (!['email', 'phone'].includes(data.field)) {
			// Поле, которое изменилось, не является email или phone, значит это адрес
			appData.setOrderData({
				orderDetails: {
					...appData.orderData.orderDetails, 
					deliveryAddress: data.value, 
				},
			});
		} else {
			const newData: Partial<ICustomerData> = {
				[data.field]: data.value,
			};
			appData.setOrderData({
				customerData: {
					...appData.orderData.customerData, 
					...newData, 
				},
			});
		}
	}
);

events.on(Events.ORDER_ADDRESS_CHANGED, () => {
	appData.validateAddress();
});

events.on(Events.ORDER_PHONE_NUMBER_CHANGED, () => {
	appData.validateCustomerData();
});

events.on(Events.ORDER_EMAIL_CHANGED, () => {
	appData.validateCustomerData();
});

events.on(Events.BASKET_CLEARED, () => {
	basket.setEmpty();
});

events.on(Events.MODAL_CLOSED, () => {
	page.locked = false;
});

events.on(Events.ORDER_PLACED, () => {
	appData.setOrderData({
		customerData: {
			email: appData.orderData.customerData.email,
			phone: appData.orderData.customerData.phone,
		},
	});

	api
		.sendOrder({
			payment: appData.orderData.orderDetails.paymentMethod,
			email: appData.orderData.customerData.email,
			phone: appData.orderData.customerData.phone,
			address: appData.orderData.orderDetails.deliveryAddress,
			total: appData.getTotalBasketPrice(),
			items: appData.basket.items.map((item) => item.id),
		})
		.then((res: PlaceOrderResponse) => {
			succesModal.total = res.total;
      events.emit(Events.ORDER_COMPLETE);
		});

	modal.close();
	modal.render({
		content: succesModal.render(),
	});
});

// после отправки заказа очищаем модель и все формы
events.on(Events.ORDER_COMPLETE, () => {
	appData.clearOrderData();
	basket.setEmpty();
	orderForm.clearInputs();
	customerDataForm.clearInputs();
});

events.on(Events.FOR_NEW_PURCHASES, () => {
	modal.close();
})

