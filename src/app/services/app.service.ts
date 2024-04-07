import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class AppService {
  private readonly http = inject(HttpClient);

  /**
   * Получить отношение двух валют
   * @param firstCurrency первая валюта
   * @param secondCurrency вторая валюта
   */
  getConversionRate(
    firstCurrency: string,
    secondCurrency: string
  ): Observable<number | null> {
    return this.http
      .get<{ conversion_rate: number }>(
        `https://v6.exchangerate-api.com/v6/${environment.apiKey}/pair/${firstCurrency}/${secondCurrency}`
      )
      .pipe(
        map(
          ({ conversion_rate }: { conversion_rate: number }) => conversion_rate
        ),
        catchError((err) => {
          console.error('Ошибка при запросе ставок', err);
          return of(null);
        })
      );
  }
}
