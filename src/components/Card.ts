import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}


export interface ICard<T> {
	category: string;
	title: string;
	image?: string;
	price: number;
	about?: string;
}

export class Card<T> extends Component<ICard<T>> {
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _button?: HTMLButtonElement;
	protected _about?: HTMLElement;
	protected _price: HTMLSpanElement;
	protected _category: HTMLSpanElement;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		super(container);

		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._price = ensureElement<HTMLSpanElement>(`.card__price`, container);
		const imageSelector = `.${blockName}__image`;
		if (container.querySelector(imageSelector)) {
			this._image = ensureElement<HTMLImageElement>(imageSelector, container);
		}

		const aboutSelector = `.${blockName}__text`;
		if (container.querySelector(aboutSelector)) {
			this._about = container.querySelector(aboutSelector);
		}

		const buttonSelector = `.${blockName}__button`;
		if (container.querySelector(buttonSelector)) {
			this._button = container.querySelector(buttonSelector);
		}

		const categorySelector = `.${blockName}__category`;
		if (container.querySelector(categorySelector)) {
			this._category = ensureElement<HTMLElement>(categorySelector, container);
		}

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set price(value: number) {
		if(value === 0) {
			this._price.textContent = 'Недоступно. Товар забыт...';
			this._price.classList.add('card__price_out-of-stock');

			if(this._button) {
				this.disableButton();
			}
		}
		else {
			this.setText(this._price, `${value} синапсов`);
		}
	}

	set about(value: string | string[]) {
		if (Array.isArray(value)) {
			this._about.replaceWith(
				...value.map((str) => {
					const descTemplate = this._about.cloneNode() as HTMLElement;
					this.setText(descTemplate, str);
					return descTemplate;
				})
			);
		} else {
			this.setText(this._about, value);
		}
	}

	disableButton(): void {
		this._button.disabled = true;
		this._button.textContent = 'Товар недоступен';
	}

	enableButton(): void {
		this._button.disabled = false;
		this._button.textContent = 'В корзину';
	}


	set category(value: string) {
		this.setText(this._category, value);
		this._category.classList.remove(`${this.blockName}__category_soft`);

		switch (value) {
			case 'кнопка':
				this._category.classList.add(`${this.blockName}__category_button`);
				break;
			case 'дополнительное':
				this._category.classList.add(`${this.blockName}__category_additional`);
				break;
			case 'софт-скил':
				this._category.classList.add(`${this.blockName}__category_soft`);
				break;
			case 'хард-скил':
				this._category.classList.add(`${this.blockName}__category_hard`);
				break;
			case 'другое':
				this._category.classList.add(`${this.blockName}__category_other`);
				break;
		}
	}

	remove(): void {
		if (this.container.parentNode) {
			this.container.parentNode.removeChild(this.container);
		}
		this._title = null;
		this._image = null;
		this._button = null;
		this._about = null;
		this._price = null;
		this._category = null;
	}
}
