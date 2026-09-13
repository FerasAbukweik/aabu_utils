import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'make-schedual',
    loadComponent: () =>
      import('../Features/make-schedual/make-schedual.component').then(
        (x) => x.MakeSchedualComponent,
      ),
  },
  {
    path: 'gpa-calculator',
    loadComponent: () =>
      import('../Features/gpa-calculator/gpa-calculator.component').then(
        (x) => x.GpaCalculatorComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'make-schedual',
  },
];
