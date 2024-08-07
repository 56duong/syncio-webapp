import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class UserSettingService {

  private apiURL = environment.apiUrl + 'api/v1/usersettings';


  constructor(
    private http: HttpClient
  ) { }


  updateImageSearch(formData: FormData): Observable<void> {
    const url = this.apiURL + '/update-image-search';
    return this.http.post<void>(url, formData);
  }

  searchByImage(formData: FormData): Observable<any> {
    const url = this.apiURL + '/search-by-image';
    return this.http.post<any>(url, formData);
  }


  deleteImageSearch(): Observable<boolean> {
    const url = this.apiURL + '/delete-image-search';
    return this.http.delete<boolean>(url);
  }

}
