import { ElementRef, Injectable, signal } from '@angular/core';

@Injectable()
export class ChooseSubjectService {
  // private
  private _componet!: ElementRef<HTMLDialogElement>;

  // signals
  private _startTime = signal<string>('');
  private _isOpen = signal<boolean>(false);

  // getters

  get startTime() {
    return this._startTime.asReadonly();
  }

  get isOpen() {
    return this._isOpen.asReadonly();
  }

  setComponent(componet: ElementRef<HTMLDialogElement>) {
    this._componet = componet;
  }

  open(startTime: string) {
    if (!this._componet) return;

    this._startTime.set(startTime);
    this._componet.nativeElement.showModal();

    this._isOpen.set(true);
  }

  close() {
    if (!this._componet) return;

    this._startTime.set('');
    this._componet.nativeElement.close();

    this._isOpen.set(false);
  }
}
