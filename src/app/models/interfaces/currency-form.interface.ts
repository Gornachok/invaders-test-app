import { FormControl } from '@angular/forms';

/* Интерфейс опции селекта */
export interface ICurrencyForm {
  firstAmount: FormControl<number | null>;
  secondAmount: FormControl<number | null>;
  firstCurrency: FormControl<string>;
  secondCurrency: FormControl<string>;
}
