import { Component, signal } from '@angular/core';
import { MainLayoutComponent } from '../Layout/main-layout/main-layout.component';
import { ProjectConstants } from '../Core/Constants/project';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [MainLayoutComponent],
})
export class App {
  protected readonly title = signal(ProjectConstants.name);
}
