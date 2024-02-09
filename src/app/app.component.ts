import { NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { CurrencyMaskDirective } from './directives/currency-mask.directive';
import { DecimalWatcherService } from './services/decimal-watcher.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CurrencyMaskDirective, NgIf, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private readonly _fb = inject(NonNullableFormBuilder);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _decimalWatcher = inject(DecimalWatcherService);
  initialValue = '100000000';
  isDarkTheme = signal(false);
  decimals = toSignal(this._decimalWatcher.decimals$);

  form = this._fb.group({
    decimals: [this.decimals()],
  });

  ngOnInit(): void {
    this.evaluateMatchMedia();
    this.decimalsWatcher();
  }

  private evaluateMatchMedia() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      this.isDarkTheme.set(true);
    }
  }

  toggleAppTheme() {
    document.documentElement.classList.toggle('dark');
    this.isDarkTheme.update((value) => !value);
  }

  private decimalsWatcher() {
    this.form.controls.decimals.valueChanges
      .pipe(
        tap((value) => {
          if (value) this._decimalWatcher.setDecimals(value);
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }
}
