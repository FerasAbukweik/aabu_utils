import { inject, Injectable, signal } from '@angular/core';
import { SubjectDataApiService } from '../api-services/subject-data-api-service';
import { ISubjectData as ISubjectData } from '../../DTO/data-dto';

@Injectable({ providedIn: 'root' })
export class SubjectDataService {
  // DI
  private readonly apiService = inject(SubjectDataApiService);

  // private

  // siganls
  private _subjects = signal<ISubjectData[]>([]);

  // getters

  get subjects() {
    return this._subjects.asReadonly();
  }

  // methods

  updateSubjects(fac: number, sec: number) {
    this.apiService.fetchHtmlString(fac, sec).subscribe({
      next: (data: string) => {
        const parsedData = this.parseHTML(data) as ISubjectData[];
        this._subjects.set(parsedData);
      },
      error: () => {},
    });
  }

  parseHTML(htmlString: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const rows = doc.querySelectorAll('table tbody tr');
    const scheduleData: ISubjectData[] = [];

    rows.forEach((row) => {
      const course: ISubjectData = {} as ISubjectData;

      course.code = row.querySelector('th')?.innerText.trim() || 'لا يوجد';
      const isNoCode: number = course.code === 'لا يوجد' ? 1 : 0;

      const cols = row.querySelectorAll('td');

      course.name = cols[0 + isNoCode].innerText.trim() || 'missing';
      course.section = Number(cols[1 + isNoCode].innerText.trim());
      course.hours = Number(cols[2 + isNoCode].innerText.trim());
      course.from = cols[3 + isNoCode].innerText.trim() || 'missing';
      course.to = cols[4 + isNoCode].innerText.trim() || 'missing';
      course.days = cols[5 + isNoCode].innerText.trim() || 'missing';
      course.teacher = cols[6 + isNoCode].innerText.trim() || 'missing';
      course.room = cols[7 + isNoCode].innerText.trim() || 'missing';
      course.note = cols[8 + isNoCode].innerText.trim() || 'missing';

      if (
        isNoCode &&
        scheduleData.length &&
        scheduleData[scheduleData.length - 1].name === course.name
      ) {
        course.code = scheduleData[scheduleData.length - 1].code;
      }

      scheduleData.push(course);
    });

    return scheduleData;
  }
}
