import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChooseSubjectService } from './choose-subject.service';
import { SubjectDataService } from '../../../../Core/Services/client-services/subject-data-service';
import { IsVisableDirective } from '../../../../shared/directives/is-visable.directive';
import { ISubjectData } from '../../../../Core/DTO/data-dto';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { facultySections } from '../../../../Core/Constants/facility-sections';
import { SelectedSubjectService } from '../../../../Core/Services/client-services/selected-subjects-service';

@Component({
  selector: 'dialog[app-choose-subject-component]',
  imports: [IsVisableDirective, ReactiveFormsModule],
  templateUrl: './choose-subject.component.html',
  host: {
    class:
      'w-[calc(100%-2rem)] m-auto max-w-[1000px] max-h-[calc(100vh-10rem)] p-0 bg-surface border-none rounded-xl shadow-xl backdrop:bg-black/30 backdrop:backdrop-blur-[5px] open:animate-in open:fade-in open:zoom-in open:duration-200',
    '(scroll)': 'onScroll($event)',
  },
})
export class ChooseSubjectComponent implements OnInit {
  // DI
  private readonly elementRef = inject(ElementRef);
  protected readonly chooseSubjectService = inject(ChooseSubjectService);
  private readonly _subjectDataService = inject(SubjectDataService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _selectedSubjectsService = inject(SelectedSubjectService);

  // Forms
  protected filterForm = new FormGroup({
    searchQuery: new FormControl(''),
    teacher: new FormControl(''),
    startTime: new FormControl(''),
    days: new FormControl(''),
    hours: new FormControl(''),
    Faculty: new FormControl('0'),
    Section: new FormControl('0'),
  });

  // computed
  private filteredList = computed<ISubjectData[]>(() => {
    const filters = this._selectedFilters();
    const allSubjects = this._subjectDataService.subjects();

    return allSubjects.filter((subject) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (
          !subject.name.toLowerCase().includes(query) &&
          !subject.code.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (filters.teacher && !subject.teacher.toLowerCase().includes(filters.teacher.toLowerCase()))
        return false;
      if (filters.days && subject.days !== filters.days) return false;
      if (filters.hours && subject.hours !== Number(filters.hours)) return false;
      if (
        filters.startTime &&
        !subject.from.toLowerCase().includes(filters.startTime.toLowerCase())
      )
        return false;

      return true;
    });
  });

  // Signals
  protected isAdvancedSearchOpen = signal<boolean>(false);
  protected subjects = signal<ISubjectData[]>([]);
  protected isShowScrollTop = signal<boolean>(false);
  protected selectedFacultySections = signal<{ name: string; value: number }[]>(facultySections[0]);
  private _selectedFilters = signal(this.filterForm.getRawValue());

  // Private
  private _taken: number = 0;
  private _sectionSize: number = 10;
  private old_Sec_Fac = '';

  constructor() {
    effect(() => {
      this.filteredList();
      this.subjects.set([]);
      this.resetPagination();
      this.loadMoreSubjects();
    });

    effect(() => {
      const selectedStartTime = this.chooseSubjectService.startTime();

      if (selectedStartTime) {
        this.filterForm.controls.startTime.disable();
      } else {
        this.filterForm.controls.startTime.enable();
      }

      this.resetFilters();
      this.applyFilters();
    });
  }

  ngOnInit() {
    this.chooseSubjectService.setComponent(this.elementRef);

    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.applyFilters();
      });

    this.filterForm.controls.Faculty.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((newVal) => {
        this.filterForm.controls.Section.setValue('0');
        this.selectedFacultySections.set(facultySections[Number(newVal)]);
      });

    this.applyFilters();
  }

  applyFilters() {
    const filters = this.filterForm.getRawValue();

    const new_Sec_Fac = filters.Section + '_' + filters.Faculty;
    if (this.old_Sec_Fac !== new_Sec_Fac)
      this._subjectDataService.updateSubjects(Number(filters.Faculty), Number(filters.Section));
    this.old_Sec_Fac = new_Sec_Fac;

    // triggers the filteredList computed
    this._selectedFilters.set(filters);
  }

  resetFilters() {
    this.filterForm.reset({
      searchQuery: '',
      teacher: '',
      days: '',
      hours: '',
      startTime: this.chooseSubjectService.startTime() || '',
      Faculty: '0',
      Section: '0',
    });
  }

  private resetPagination() {
    this._taken = 0;
  }

  loadMoreSubjects() {
    const currentFiltered = this.filteredList();

    if (this._taken >= currentFiltered.length) return;

    const nextSlice = currentFiltered.slice(this._taken, this._taken + this._sectionSize);

    this.subjects.update((curr) => [...curr, ...nextSlice]);
    this._taken += this._sectionSize;
  }

  selectSubject(subject: ISubjectData) {
    if (!this._selectedSubjectsService.selectSubject(subject)) return;
    this.close();
  }

  onScroll(event: Event) {
    const element = event.target as HTMLDivElement;
    this.isShowScrollTop.set(element.scrollTop > 300);
  }

  scrollToTop() {
    setTimeout(() => {
      this.elementRef?.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 0);
  }

  close() {
    this.scrollToTop();
    this.resetFilters();
    this.resetPagination();
    this.isAdvancedSearchOpen.set(false);
    this.chooseSubjectService.close();
  }
}
