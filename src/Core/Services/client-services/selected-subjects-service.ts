import { Injectable, signal } from '@angular/core';
import { ISubjectData } from '../../DTO/data-dto';

@Injectable({ providedIn: 'root' })
export class SelectedSubjectService {
  // signals
  private _selectedSubjects = signal<ISubjectData[]>([]);

  // getters

  get selectedSubjects() {
    return this._selectedSubjects.asReadonly();
  }

  constructor() {
    this._selectedSubjects.set(this.fetchFromLocal());
  }

  // methods
  selectSubject(subject: ISubjectData): boolean {
    const selected = this.findByCode(subject.code);
    if (selected) {
      if (
        window.confirm(
          `المادة مسجلة مسبقا في الوقت \n ${selected.to + ' - ' + selected.from + ' - ' + selected.days}\nهل تريد استبدالها ؟`,
        )
      )
        this.removeSubject(selected.code);
      else {
        return false;
      }
    }

    const conflicted = this.findConflictingSubject(subject);
    if (conflicted) {
      if (
        window.confirm(
          `هناك شعبة متعارضة بنفس الوقت هل تريد استبدالها ؟؟\n\nاسم المادة السابقة ${conflicted.name}`,
        )
      )
        this.removeSubject(conflicted.code);
      else {
        return false;
      }
    }

    this._selectedSubjects.update((curr) => [...curr, subject]);

    this.saveToLocal();

    return true;
  }

  removeSubject(subjectCode: string) {
    this._selectedSubjects.update((curr) => curr.filter((s) => s.code !== subjectCode));

    this.saveToLocal();
  }

  findByCode(subjectCode: string) {
    return this._selectedSubjects().find((s) => s.code === subjectCode);
  }

  private findConflictingSubject(subject: ISubjectData): ISubjectData | null {
    const timeToMinutes = (timeStr: string): number => {
      const [hours, minutes, extra] = timeStr
        .split(/[.\s]+/)
        .map((x, idx) => (idx === 2 ? (x.toLowerCase() === 'pm' ? 12 : 0) : Number(x)));
      return extra * 60 + (hours || 0) * 60 + (minutes || 0);
    };

    const getDaysArray = (daysStr: string): string[] => {
      return daysStr.split(/[,،\s]+/).filter(Boolean);
    };

    const incomingStart = timeToMinutes(subject.from);
    const incomingEnd = timeToMinutes(subject.to);
    const incomingDays = getDaysArray(subject.days);

    const conflict = Object.values(this._selectedSubjects()).find((s) => {
      const sStart = timeToMinutes(s.from);
      const sEnd = timeToMinutes(s.to);

      const isTimeOverlapping = sStart < incomingEnd && incomingStart < sEnd;

      if (!isTimeOverlapping) return false;

      const sDays = getDaysArray(s.days);
      return sDays.some((day) => incomingDays.includes(day));
    });

    return conflict ?? null;
  }

  private saveToLocal() {
    localStorage.setItem('selected_subjects', JSON.stringify(this._selectedSubjects()));
  }

  private fetchFromLocal() {
    const localString = localStorage.getItem('selected_subjects');

    if (!localString) return [];

    return JSON.parse(localString);
  }
}
