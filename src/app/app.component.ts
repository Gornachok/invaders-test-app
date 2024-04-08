import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CURRENCY_OPTIONS, ICurrencyForm, ISelectItem } from './models';
import { AppService } from './services';
import { HttpClientModule } from '@angular/common/http';
import { combineLatest, filter, startWith, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
  ],
  providers: [AppService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly appService = inject(AppService);
  private readonly destroyRef = inject(DestroyRef);

  /* Текущий множитель валют */
  private conversionRate?: number;

  /* Форма конвертера валют */
  public readonly form: FormGroup<ICurrencyForm> = new FormGroup<ICurrencyForm>(
    {
      firstAmount: new FormControl(1),
      secondAmount: new FormControl(null),
      firstCurrency: new FormControl('RUB', { nonNullable: true }),
      secondCurrency: new FormControl('USD', { nonNullable: true }),
    }
  );

  /* Достуные для селекта валюты */
  public readonly currencyList: ISelectItem[] = CURRENCY_OPTIONS;

  ngOnInit(): void {
    const controls = this.form.controls;

    // Подписка на изменение селектов валют
    combineLatest([
      controls.firstCurrency.valueChanges.pipe(
        startWith(controls.firstCurrency.value)
      ),
      controls.secondCurrency.valueChanges.pipe(
        startWith(controls.secondCurrency.value)
      ),
    ])
      .pipe(
        // Запрос множителя
        switchMap(([firstCurrency, secondCurrency]: [string, string]) =>
          this.appService.getConversionRate(firstCurrency, secondCurrency)
        ),
        filter(Boolean),
        tap((value) => (this.conversionRate = value)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        const firstAmount = controls.firstAmount.value;
        controls.secondAmount.patchValue(this.calculate(firstAmount), {
          emitEvent: false,
        });
      });

    // Подписка на изменение инпута первой суммы
    controls.firstAmount.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val: number | null) =>
        controls.secondAmount.patchValue(this.calculate(val), {
          emitEvent: false,
        })
      );

    // Подписка на изменение инпута второй суммы
    controls.secondAmount.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val: number | null) =>
        controls.firstAmount.patchValue(this.calculate(val, true), {
          emitEvent: false,
        })
      );
  }

  /* Поменять выбранные валюты местами */
  swapCurrencies(): void {
    const formValue = this.form.value;
    this.form.patchValue({
      firstCurrency: formValue.secondCurrency,
      secondCurrency: formValue.firstCurrency,
    });
  }

  /**
   * Рассчитать валюту исходя из conversionRate
   * @param value расчитываемое значение
   * @param reverseCalculate провести обратный расчет относительно conversionRate (1 / conversionRate)
   */
  calculate(value: number | null, reverseCalculate?: boolean): number | null {
    if (!this.conversionRate || value === null) return null;
    return +(
      reverseCalculate
        ? value / this.conversionRate
        : this.conversionRate * value
    ).toFixed(5);
  }
}
