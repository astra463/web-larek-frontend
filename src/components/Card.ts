import { Component } from "./base/Component";
import { IProduct, ProductCategory } from "../types";
import { bem, ensureElement } from "../utils/utils";
import clsx from "clsx";

interface ICardActions {
  onClick: (event: MouseEvent) => void;
}

export interface ICard<T> {
  category: string;
  title: string;
  image: string;
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

  constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
    this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
    this._button = container.querySelector(`.${blockName}__button`);
    this._about = container.querySelector(`.${blockName}__text`);
    this._price = ensureElement<HTMLSpanElement>(`.card__price`, container);
    this._category = ensureElement<HTMLElement>(`.${blockName}__category`, container); 

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
    this.setImage(this._image, value, this.title)
  }

  set price(value: string) {
    this.setText(this._price, `${value} синапсов`);
  }

  set about(value: string | string[]) {
    if (Array.isArray(value)) {
      this._about.replaceWith(...value.map(str => {
        const descTemplate = this._about.cloneNode() as HTMLElement;
        this.setText(descTemplate, str);
        return descTemplate;
      }));
    } else {
      this.setText(this._about, value);
    }
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

}

