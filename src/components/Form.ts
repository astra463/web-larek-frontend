import { IForm } from "../types";

export class Form<T> implements IForm<T> {
  constructor(public data: T) {}

  submit(): void {
    // Реализация отправки данных формы
    console.log('Submitting form data:', this.data);
  }
}