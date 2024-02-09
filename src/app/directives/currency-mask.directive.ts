import {
  Directive,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appCurrencyMask]',
  standalone: true,
})
export class CurrencyMaskDirective implements OnInit {
  defaultValue = '000';
  isTouched?: boolean;
  public el = inject(ElementRef);
  public renderer = inject(Renderer2);

  constructor() {}

  ngOnInit(): void {
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
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
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
}
