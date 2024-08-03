import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PostCollection } from '../interfaces/post-collection';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PostCollectionService {

  private apiURL = environment.apiUrl + 'api/v1/postcollections';


  constructor(
    private http: HttpClient
  ) { }


  create(formData: FormData): Observable<string> {
    return this.http.post<string>(this.apiURL, formData);
  }


  getById(id: string): Observable<PostCollection> {
    const url = `${this.apiURL}/${id}`;
    return this.http.get<PostCollection>(url);
  }


  getByCreatedById(createdById: string) {
    const url = `${this.apiURL}/user/${createdById}`;
    return this.http.get<PostCollection[]>(url);
  }


  saveToCollections(postId: string, collectionIds: string[]): Observable<string> {
    const url = `${this.apiURL}/save-to-collection/${postId}`;
    return this.http.post<string>(url, collectionIds);
  }


  getByPostIdAndCreatedById(postId: string, createdById: string): Observable<PostCollection[]> {
    const url = `${this.apiURL}/post/user/${postId}/${createdById}`;
    return this.http.get<PostCollection[]>(url);
  }


  deleteImage(collectionId: string): Observable<boolean> {
    const url = `${this.apiURL}/delete-image/${collectionId}`;
    return this.http.delete<boolean>(url);
  }


  update(formData: FormData): Observable<string> {
    return this.http.patch<string>(this.apiURL, formData);
  }

}
