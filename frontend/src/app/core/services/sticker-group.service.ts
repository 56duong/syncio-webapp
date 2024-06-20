import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StickerGroup } from '../interfaces/sticker-group';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class StickerGroupService {

  private apiURL = environment.apiUrl + 'api/v1/stickergroups';

  constructor(private http: HttpClient) { }

  /**
   * Get all sticker groups
   * @returns a list of sticker groups
   * @example
   * this.stickerGroupService.getStickerGroups().subscribe({
   *  next: (data) => {
   *   console.log(data);
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * });
   */
  getStickerGroups(): Observable<StickerGroup[]> {
    return this.http.get<StickerGroup[]>(this.apiURL);
  }

  /**
   * Get sticker group by flag true
   * @returns a list of sticker groups with flag true
   */
  getStickerGroupByFlagTrue(): Observable<StickerGroup[]> {
    const url = `${this.apiURL}/flag`;
    return this.http.get<StickerGroup[]>(url);
  }

  /**
   * Create a new sticker group
   * @param stickerGroup 
   * @returns the id of the new sticker group
   */
  createStickerGroup(stickerGroup: StickerGroup): Observable<number> {
    return this.http.post<number>(this.apiURL, stickerGroup);
  }

  /**
   * Update a sticker group 
   * @param stickerGroup 
   * @returns the id of the updated sticker group 
   */
  updateStickerGroup(stickerGroup: StickerGroup): Observable<number> {
    const url = `${this.apiURL}/${stickerGroup.id}`;
    return this.http.patch<number>(url, stickerGroup);
  }

}
