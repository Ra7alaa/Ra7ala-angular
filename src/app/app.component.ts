import { Component } from '@angular/core';import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';

import { RouterOutlet } from '@angular/router';
import { LayoutModule } from './layout/layout.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GridModule, PagerModule, RouterOutlet, LayoutModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Ra7ala';
}
