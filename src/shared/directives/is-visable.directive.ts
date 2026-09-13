import { Directive, ElementRef, inject, OnDestroy, output } from '@angular/core';

@Directive({
  selector: '[appIsVisable]',
})
export class IsVisableDirective implements OnDestroy {
  // DI
  private readonly host = inject(ElementRef);

  // private
  private observer!: IntersectionObserver;

  // output
  appIsVisable = output<void>();

  ngOnInit() {
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) this.appIsVisable.emit();
    });

    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }
}
