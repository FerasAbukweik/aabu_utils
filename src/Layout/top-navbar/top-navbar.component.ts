import { Component, signal } from '@angular/core';
import { ProjectConstants } from '../../Core/Constants/project';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'header[app-top-navbar]',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './top-navbar.component.html',
  host: {
    class:
      'sticky top-0 w-full z-50 flex relative justify-between items-center h-16 bg-surface border-b border-outline-variant shadow-sm',
  },
})
export class TopNavbarComponent {
  // protected
  protected projectName = ProjectConstants.name;
  protected paths: { title: string; link: string }[] = [
    {
      title: 'الجدول الدراسي',
      link: '/make-schedual',
    },
    {
      title: 'حساب المعدل',
      link: '/gpa-calculator',
    },
  ];

  // signals
  protected isShowMenu = signal(false);

  toggleMenu() {
    this.isShowMenu.update((curr) => !curr);
  }

  closeMenu() {
    this.isShowMenu.set(false);
  }
}
