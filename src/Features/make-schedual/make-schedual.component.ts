import { Component, computed, inject, signal } from '@angular/core';
import { ChooseSubjectComponent } from './components/choose-subject/choose-subject.component';
import { ChooseSubjectService } from './components/choose-subject/choose-subject.service';
import { SelectedSubjectService } from '../../Core/Services/client-services/selected-subjects-service';
import { ISubjectData } from '../../Core/DTO/data-dto';

@Component({
  selector: 'app-make-schedual',
  imports: [ChooseSubjectComponent],
  providers: [ChooseSubjectService],
  templateUrl: './make-schedual.component.html',
  styleUrl: './make-schedual.component.css',
  host: {
    class: 'pt-24 pb-12 px-4 md:px-8 w-full mx-auto h-full block max-w-[1400px]',
  },
})
export class MakeSchedualComponent {
  protected readonly chooseSubjectService = inject(ChooseSubjectService);
  protected readonly selectedSubjectsService = inject(SelectedSubjectService);

  protected totalHours = computed(() => {
    const subjects = this.selectedSubjectsService.selectedSubjects();

    return subjects.reduce((sum, s) => sum + (s.hours > 0 ? s.hours : 0), 0);
  });

  protected appendDaysCount = computed(() => {
    const subjects = this.selectedSubjectsService.selectedSubjects();

    const days = subjects
      .filter((s) => s.room !== 'Online')
      .map((s) => s.days.split(/[\s]+/))
      .flat(Infinity);

    return new Set(days).size;
  });

  removeSubject(subject: ISubjectData) {
    this.selectedSubjectsService.removeSubject(subject.code);
  }
}
