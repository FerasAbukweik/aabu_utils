import { Component } from '@angular/core';
import { TopNavbarComponent } from '../top-navbar/top-navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [TopNavbarComponent, RouterOutlet],
  templateUrl: './main-layout.component.html',
  host: {
    class: 'w-full h-full',
  },
})
export class MainLayoutComponent {}
