import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DecimalWatcherService {
  private decimals = new BehaviorSubject(2);
  decimals$ = this.decimals.asObservable();

  setDecimals(value: number) {
    this.decimals.next(value);
  }
}
