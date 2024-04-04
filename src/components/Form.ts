import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/EventEmitter';
import { Events, ICustomerData, IOrderDetails, PaymentMethod } from '../types';

interface IFormState {
	valid: boolean;
	errors: string[];
}

export class Form<T> extends Component<IFormState> {
	protected _errors: HTMLElement;
	protected _submit: HTMLButtonElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		});

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
	}

	protected onInputChange(field: keyof T, value: string) {
		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	set errors(value: string) {
		this.setText(this._errors, value);
	}

	set valid(value: boolean) {
		this._submit.disabled = !value;
	}

	render(state: Partial<T> & IFormState) {
		const { valid, errors, ...inputs } = state;
		super.render({ valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}
}

export class OrderDetailsForm extends Form<IOrderDetails> {
	protected _onlineButton?: HTMLButtonElement;
	protected _uponReceiptButton?: HTMLButtonElement;
	protected _paymentMethod: PaymentMethod = 'online';
	protected _deliveryAddress: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		this._onlineButton = ensureElement<HTMLButtonElement>(
			'.order__buttons button[name="card"]',
			container
		);
		this._uponReceiptButton = ensureElement<HTMLButtonElement>(
			'.order__buttons button[name="cash"]',
			container
		);
		this._deliveryAddress = ensureElement<HTMLInputElement>(
			'.form__input',
			container
		);

		// кнопка "Онлайн" активна по дефолту
		if (this._onlineButton) {
			this.setActive(this._onlineButton);
		}

		// обработчики событий для кнопок способа оплаты
		if (this._onlineButton) {
			this._onlineButton.addEventListener('click', () => {
				this._paymentMethod = 'online';
				this.onPaymentMethodChange();
				this.setActive(this._onlineButton);
			});
		}

		if (this._uponReceiptButton) {
			this._uponReceiptButton.addEventListener('click', () => {
				this._paymentMethod = 'upon-receipt';
				this.onPaymentMethodChange();
				this.setActive(this._uponReceiptButton);
			});
		}

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit(Events.ORDER_CONTACT_INFO_ENTERED, {
				paymentMethod: this._paymentMethod,
				address: this._deliveryAddress.value,
			});
		});
	}

	// Метод для обработки изменения способа оплаты
	protected onPaymentMethodChange() {
		this.events.emit(`${this.container.name}.paymentMethod:change`, {
			paymentMethod: this._paymentMethod,
		});
	}

	// Метод для установки активной кнопки способа оплаты
	protected setActive(button: HTMLButtonElement) {
		if (button === this._onlineButton) {
			this._onlineButton.classList.add(`button_alt-active`);
			this._uponReceiptButton.classList.remove(`button_alt-active`);
		} else {
			this._onlineButton.classList.remove(`button_alt-active`);
			this._uponReceiptButton.classList.add(`button_alt-active`);
		}
	}
}

export class CustomerDataForm extends Form<ICustomerData> {
	protected _emailInput: HTMLInputElement;
	protected _phoneNumberInput: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._emailInput = ensureElement<HTMLInputElement>(
			'.form__input[name="email"]',
			container
		);

		this._phoneNumberInput = ensureElement<HTMLInputElement>(
			'.form__input[name="phone"]',
			container
		);

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit(Events.ORDER_PLACED, {
				email: this._emailInput.value,
				phone: this._phoneNumberInput.value,
			});
		});
	}

	set valid(value: boolean) {
		this._submit.disabled = !value;
	}
}
