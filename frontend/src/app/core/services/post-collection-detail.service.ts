import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Post } from '../interfaces/post';

@Injectable({
  providedIn: 'root'
})

export class PostCollectionDetailService {

  private apiURL = environment.apiUrl + 'api/v1/postcollectiondetails';


  constructor(
    private http: HttpClient
  ) { }


  getByCollectionId(collectionId: string): Observable<Post[]> {
    const url = `${this.apiURL}/${collectionId}`;
    return this.http.get<Post[]>(url);
  }

}
