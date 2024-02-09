import {
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { DecimalWatcherService } from '../services/decimal-watcher.service';

@Directive({
  selector: '[appCurrencyMask]',
  standalone: true,
})
export class CurrencyMaskDirective implements OnInit {
  private _decimalsWatcher = inject(DecimalWatcherService);
  private _destroyRef = inject(DestroyRef);

  defaultValue = '000';
  isTouched?: boolean;
  public el = inject(ElementRef);
  public renderer = inject(Renderer2);
  @Input() decimals = 2;

  constructor() {}

  ngOnInit(): void {
    this.decimalsWatcher();
    this.validateDecimals();
    this.currencyFormat(this.el.nativeElement.value);
  }

  @HostListener('focus', ['$event.target.value']) touched(e: string) {
    this.isTouched = true;
    this.currencyFormat(e);
  }
  @HostListener('blur', ['$event.target.value']) clear(e: string) {
    if (e === '0.00') {
      this.isTouched = false;
      this.renderer.setProperty(this.el.nativeElement, 'value', '');
    }
  }

  @HostListener('input', ['$event.target.value']) onInput(e: string) {
    this.currencyFormat(e);
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    event.preventDefault();
    this.currencyFormat(event.clipboardData!.getData('text/plain'));
  }

  private currencyFormat(value: string) {
    value = !value.length && this.isTouched ? this.defaultValue : value;
    value = this.removeZero([...value]);
    value = this.addZero([...value]);
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d)(\d{2})$/, '$1.$2');
    value = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: this.decimals,
      minimumFractionDigits: this.decimals,
    }).format(Number(value));
    this.renderer.setProperty(this.el.nativeElement, 'value', value);
  }

  private removeZero = (value: string[]) =>
    (value.filter((e) => e !== '.' && e !== ',').length > 3 && value[0] === '0'
      ? value.slice(1)
      : value
    ).join('');

  private addZero = (value: string[]) =>
    (value.filter((e) => e !== '.' && e !== ',').length < 3 && this.isTouched
      ? ['0', ...value]
      : value
    ).join('');

  private validateDecimals() {
    if (this.decimals > 2) {
      this.defaultValue = Array.from({ length: this.decimals + 1 })
        .fill('0')
        .join('');
    }
  }

  private decimalsWatcher() {
    this._decimalsWatcher.decimals$
      .pipe(
        tap((value) => {
          if (!value || value === this.decimals) return;
          const isHigh = value > this.decimals;
          const diff = value - this.decimals;
          let [int, dec] = this.el.nativeElement.value.split('.');

          if (isHigh) {
            const toAdd = Array.from({ length: diff }).fill('0').join('');
            dec = `${dec}${toAdd}`;
          }

          if (!isHigh) {
            dec = dec.slice(0, diff);
          }

          this.decimals = value;
          this.renderer.setProperty(
            this.el.nativeElement,
            'value',
            `${int}.${dec}`
          );
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }
}
