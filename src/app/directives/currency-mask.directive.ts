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

  private defaultValue = '000';
  public el = inject(ElementRef);
  public renderer = inject(Renderer2);
  @Input() decimals = 2;
  private allowedKeys = ['Backspace', 'Enter', 'Escape', 'Tab'];
  private numericPattern = /[0-9]/;

  constructor() {}

  ngOnInit(): void {
    this.decimalsWatcher();
    this.validateDecimals();
    this.currencyFormat(this.el.nativeElement.value);
  }

  @HostListener('focus', ['$event.target']) touched(t: EventTarget) {
    if (!(t instanceof HTMLInputElement)) return;
    this.setSelectionRange();
  }

  @HostListener('click', ['$event.target']) blur(t: EventTarget) {
    if (!(t instanceof HTMLInputElement)) return;
    this.setSelectionRange();
  }

  @HostListener('keydown', ['$event']) keydown(e: KeyboardEvent) {
    if (!(e.target instanceof HTMLInputElement)) return;
    if (!this.numericPattern.test(e.key) && !this.allowedKeys.includes(e.key)) {
      e.preventDefault();
      return;
    }
  }

  @HostListener('input', ['$event.target']) onInput(t: EventTarget) {
    if (!(t instanceof HTMLInputElement)) return;
    this.currencyFormat(t.value);
  }

  @HostListener('paste', ['$event']) onPaste(e: ClipboardEvent) {
    e.preventDefault();
    if (!(e.target instanceof HTMLInputElement) || !e.clipboardData) return;
    this.currencyFormat(e.clipboardData.getData('text/plain'));
  }

  private currencyFormat(value: string) {
    value = !value.length ? this.defaultValue : value;
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
    (value.filter((e) => e !== '.' && e !== ',').length < 3
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

  private setSelectionRange() {
    const lastIndex = this.el.nativeElement.value.length;
    this.el.nativeElement.setSelectionRange(lastIndex, lastIndex);
  }
}
