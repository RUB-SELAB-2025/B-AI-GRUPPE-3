import { Component, signal, effect } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Renderer2, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-darkmode',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './darkmode.component.html',
})
export class DarkmodeComponent {
  darkMode = signal(false);
  renderer = inject(Renderer2);

  constructor() {
    // Reactively apply/remove the 'dark-theme' class
    effect(() => {
      if (this.darkMode()) {
        this.renderer.addClass(document.body, 'dark-theme');
      } else {
        this.renderer.removeClass(document.body, 'dark-theme');
      }
    });
  }

  toggleDarkMode() {
    this.darkMode.update(value => !value);
  }
}
