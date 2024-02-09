import { NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { CurrencyMaskDirective } from './directives/currency-mask.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CurrencyMaskDirective, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  initialValue = '1000,000.00';
  isDarkTheme = signal(false);

  ngOnInit(): void {
    this.evaluateMatchMedia();
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
}
