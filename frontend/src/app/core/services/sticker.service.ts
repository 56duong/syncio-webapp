import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Sticker } from '../interfaces/sticker';

@Injectable({
  providedIn: 'root'
})

export class StickerService {

  private apiURL = environment.apiUrl + 'api/v1/stickers';

  constructor(private http: HttpClient) { }
  
  /**
   * Get all stickers
   * @returns a list of stickers
   */
  getStickers(): Observable<Sticker[]> {
    return this.http.get<Sticker[]>(this.apiURL);
  }

  /**
   * Get stickers by group id
   * @param groupId 
   * @returns a list of stickers
   */
  getStickersByGroupId(groupId: number): Observable<Sticker[]> {
    const url = `${this.apiURL}/${groupId}`;
    return this.http.get<Sticker[]>(url);
  }

  /**
   * Get stickers by group id and flag true
   * @param groupId 
   * @returns a list of stickers with flag true
   */
  getStickersByGroupIdAndFlagTrue(groupId: number): Observable<Sticker[]> {
    const url = `${this.apiURL}/${groupId}/flag`;
    return this.http.get<Sticker[]>(url);
  }

  /**
   * Create a new sticker
   * @param formData 
   * @returns the id of the new sticker
   */
  createSticker(formData: FormData): Observable<number> {
    return this.http.post<number>(this.apiURL, formData);
  }

  /**
   * Update a sticker
   * @param sticker 
   * @returns the id of the updated sticker 
   */
  updateSticker(sticker: Sticker): Observable<number> {
    const url = `${this.apiURL}/${sticker.id}`;
    return this.http.patch<number>(url, sticker);
  }

}
