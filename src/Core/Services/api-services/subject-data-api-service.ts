import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { URLs } from '../../Constants/URLs';

@Injectable({ providedIn: 'root' })
export class SubjectDataApiService {
  // DI
  private readonly http = inject(HttpClient);

  // private

  fetchHtmlString(fac: number, sec: number) {
    const formData = new URLSearchParams();
    formData.append('excel_flg', '1');
    formData.append('fac_no_list', fac.toString());
    formData.append('sec_no_list', sec.toString());

    let url = URLs.main;

    if (fac === 0) {
      if (sec === 600000) {
        url += '/mat_program_hash_mat.jsp';
      } else {
        url += '/mat_program_hash_all.jsp';
      }
    } else {
      if (sec === 0) {
        url += '/mat_program_hash_fac_no.jsp';
      } else {
        url += '/mat_program_hash.jsp';
      }
    }

    return this.http.post<string>(url, formData);
  }
}
