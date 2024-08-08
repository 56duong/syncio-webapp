import { Injectable } from "@angular/core";
import { ConstructImageUrlPipe } from "../pipes/construct-image-url.pipe";

@Injectable({
  providedIn: 'root',
})

export class ImageUtils {

  currentDateTime: number = Date.now(); // the current date time to refresh the image cache

  constructor(
    private constructImageUrlPipe: ConstructImageUrlPipe
  ) { }

  /**
   * Get the image URL with the current date time to refresh the image cache.
   * Also check if the URL already contains a query parameter(?, firebase url), then append the current date time.
   * @param baseUrl 
   * @returns the image URL with the current date time. 
   * @example
   * http://localhost:8080/api/v1/images/users/843b6ab2-80ce-4ebe-9052-6c6840103f45.jpg => http://localhost:8080/api/v1/images/users/843b6ab2-80ce-4ebe-9052-6c6840103f45.jpg?1723135971021
   * https://firebasestorage.googleapis.com/v0/b/syncio-bf6ca.appspot.com/o/users%2F843b6ab2-80ce-4ebe-9052-6c6840103f45.jpg?alt=media => https://firebasestorage.googleapis.com/v0/b/syncio-bf6ca.appspot.com/o/users%2F843b6ab2-80ce-4ebe-9052-6c6840103f45.jpg?alt=media&1723135971021
   */
  getImageURL(baseUrl?: string): string {
    // Use the pipe to transform the URL
    let fullUrl = this.constructImageUrlPipe.transform(baseUrl);
    // Check if the URL already contains a query parameter
    if (fullUrl.includes('?')) {
      fullUrl += '&';
    } else {
      fullUrl += '?';
    }
    // Append the current date
    fullUrl += this.currentDateTime;
    return fullUrl;
  }


  /**
   * Refresh the current date time to refresh the image cache.
   */
  refreshDateTime() {
    this.currentDateTime = Date.now();
  }

}
