import { Component, computed, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface GradeOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-gpa-calculator',
  imports: [ReactiveFormsModule],
  templateUrl: './gpa-calculator.component.html',
  styleUrl: './gpa-calculator.component.css',
  host: {
    class: 'pt-24 pb-12 px-4 md:px-8 w-full max-w-6xl mx-auto h-full block',
  },
})
export class GpaCalculatorComponent {
  // full grade scale, matches original grade_template
  protected readonly gradeOptions: GradeOption[] = [
    { label: 'A+', value: 4 },
    { label: 'A', value: 3.75 },
    { label: 'A-', value: 3.5 },
    { label: 'B+', value: 3.25 },
    { label: 'B', value: 3 },
    { label: 'B-', value: 2.75 },
    { label: 'C+', value: 2.5 },
    { label: 'C', value: 2.25 },
    { label: 'C-', value: 2 },
    { label: 'D+', value: 1.75 },
    { label: 'D', value: 1.5 },
    { label: 'F', value: 0 },
  ];

  // previous-grade scale for repeats, matches original p_grade_template
  // (only grades a repeat could plausibly replace: C+ down to F)
  protected readonly prevGradeOptions: GradeOption[] = [
    { label: 'C+', value: 2.5 },
    { label: 'C', value: 2.25 },
    { label: 'C-', value: 2 },
    { label: 'D+', value: 1.75 },
    { label: 'D', value: 1.5 },
    { label: 'F', value: 0 },
  ];

  protected readonly priorGpaControl = new FormControl<number>(0, { nonNullable: true });
  protected readonly priorHoursControl = new FormControl<number>(0, { nonNullable: true });
  protected readonly courses = new FormArray<FormGroup>([]);

  private readonly _formTick = signal(0);

  constructor() {
    this.addCourse();

    this.courses.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this._formTick.update((v) => v + 1));

    this.priorGpaControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this._formTick.update((v) => v + 1));

    this.priorHoursControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this._formTick.update((v) => v + 1));
  }

  private createCourseGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl<string>('', { nonNullable: true }),
      hours: new FormControl<number>(3, { nonNullable: true }),
      grade: new FormControl<number>(4, { nonNullable: true }),
      isRepeat: new FormControl<boolean>(false, { nonNullable: true }),
      // 'none' sentinel mirrors the original p_grade default option
      prevGrade: new FormControl<number | 'none'>('none', { nonNullable: true }),
    });
  }

  addCourse() {
    this.courses.push(this.createCourseGroup());
  }

  removeCourse(index: number) {
    // original delete_row() blocked deleting the last remaining row
    if (this.courses.length <= 1) return;
    this.courses.removeAt(index);
  }

  clearAll() {
    if (!confirm('هل أنت متأكد من مسح جميع البيانات؟')) return;

    while (this.courses.length) this.courses.removeAt(0);
    this.priorGpaControl.setValue(0);
    this.priorHoursControl.setValue(0);
    this.addCourse();
  }

  private priorHours = computed(() => {
    this._formTick();
    return Number(this.priorHoursControl.value) || 0;
  });

  private priorGpa = computed(() => {
    this._formTick();
    return Number(this.priorGpaControl.value) || 0;
  });

  // sum of all hours entered this semester
  protected semesterHours = computed(() => {
    this._formTick();
    return this.courses.controls.reduce((sum, g) => sum + (Number(g.value.hours) || 0), 0);
  });

  // repeat rows only count if the person has a prior record (p_hours != 0),
  // exactly mirroring the original guard: p_grades[i] != 'none' && p_hours != 0
  private repeatDiff = computed(() => {
    this._formTick();
    if (this.priorHours() === 0) return { points: 0, hours: 0 };

    let points = 0;
    let hours = 0;
    for (const g of this.courses.controls) {
      const prev = g.value.prevGrade;
      if (prev !== 'none' && prev != null) {
        const h = Number(g.value.hours) || 0;
        points += h * Number(prev);
        hours += h;
      }
    }
    return { points, hours };
  });

  // semester GPA: for a valid repeat row, use whichever grade is HIGHER
  // between the old and new attempt — matches the original's `temp` logic
  protected semesterGpa = computed(() => {
    this._formTick();
    const hoursSum = this.semesterHours();
    if (hoursSum === 0) return 0;

    const priorHoursSet = this.priorHours() !== 0;
    let weightedSum = 0;

    for (const g of this.courses.controls) {
      const hours = Number(g.value.hours) || 0;
      const grade = Number(g.value.grade) || 0;
      const prev = g.value.prevGrade;

      let effectiveGrade = grade;
      if (priorHoursSet && prev !== 'none' && prev != null && Number(prev) > grade) {
        effectiveGrade = Number(prev);
      }

      weightedSum += hours * effectiveGrade;
    }

    return weightedSum / hoursSum;
  });

  protected totalHours = computed(() => {
    const { hours: diffHours } = this.repeatDiff();
    return this.semesterHours() + this.priorHours() - diffHours;
  });

  protected cumulativeGpa = computed(() => {
    const total = this.totalHours();
    if (total === 0) return this.semesterGpa();

    const { points: diffPoints } = this.repeatDiff();
    const priorPoints = this.priorGpa() * this.priorHours() - diffPoints;
    const currentPoints = this.semesterGpa() * this.semesterHours();

    return (priorPoints + currentPoints) / total;
  });

  // status label + color tier, ported from setGaugeValue's if/else chain
  gaugeStatus(value: number): { label: string; tier: 'none' | 'weak' | 'fair' | 'good' | 'vgood' | 'excellent' } {
    const v = Number(value.toFixed(2));
    if (v <= 0) return { label: '', tier: 'none' };
    if (v < 2) return { label: 'ضعيف', tier: 'weak' };
    if (v < 2.5) return { label: 'مقبول', tier: 'fair' };
    if (v < 3) return { label: 'جيد', tier: 'good' };
    if (v < 3.5) return { label: 'جيد جدا', tier: 'vgood' };
    return { label: 'ممتاز', tier: 'excellent' };
  }
}