import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-owner-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './owner-layout.component.html',
  styleUrl: './owner-layout.component.css',
  standalone: true,
})
export class OwnerLayoutComponent {}
