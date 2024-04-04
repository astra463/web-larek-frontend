import { Events, ISuccessData } from '../../types';
import { Component } from '../base/Component';
import { EventEmitter } from '../base/EventEmitter';
import { formatNumber } from '../../utils/utils';

export class SuccessModal extends Component<ISuccessData> {
	protected _total: HTMLElement;
	protected _button: HTMLElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._total = this.container.querySelector('.order-success__description');
		this._button = this.container.querySelector('.order-success__close');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit(Events.ORDER_COMPLETE);
			});
		}
	}

  set total(total: number) {
    this._total.textContent = `Списано ${formatNumber(total)} синапсов`;
  }
}
