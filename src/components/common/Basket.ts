import { Component } from '../base/Component';
import { formatNumber, createElement, ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/EventEmitter';
import { Events, IBasketView } from '../../types';

export class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLElement;
	protected _itemIndex: HTMLElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.button');
		this._itemIndex = this.container.querySelector('.basket__item-index');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit(Events.ORDER_DETAILS_INFO_ENTERED);
			});
		}
		this.items = [];
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			// Проходим по всем элементам и устанавливаем им уникальные индексы
			items.forEach((item, index) => {
				const itemIndex = item.querySelector('.basket__item-index');
				if (itemIndex) {
					itemIndex.textContent = String(index + 1);
				}
			});
			this._list.replaceChildren(...items);
		}
	}

	set total(total: number) {
		this.setText(this._total, `${formatNumber(total)} синапсов`);
	}

	get list() {
		return this._list;
	}

	// Метод для обновления индексов элементов корзины
	updateBasket() {
		const items = Array.from(this._list.children) as HTMLElement[];
		if (items.length > 0) {
			items.forEach((item, index) => {
				const itemIndex = item.querySelector('.basket__item-index');
				if (itemIndex) {
					itemIndex.textContent = String(index + 1);
				}
			});
			this._button.removeAttribute('disabled');
		} else {
			this.setEmpty();
		}
	}

	setEmpty() {
		this._list.replaceChildren(
			createElement<HTMLParagraphElement>('p', {
				textContent: 'Корзина пуста',
			})
		);
		this._button.setAttribute('disabled', 'true');
	}
}
