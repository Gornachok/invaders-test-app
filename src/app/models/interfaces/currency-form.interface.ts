import { FormControl } from '@angular/forms';

/* Интерфейс формы конвертера валют */
export interface ICurrencyForm {
  firstAmount: FormControl<number | null>;
  secondAmount: FormControl<number | null>;
  firstCurrency: FormControl<string>;
  secondCurrency: FormControl<string>;
}
