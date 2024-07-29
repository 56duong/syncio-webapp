import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'constructImageUrl'
})

export class ConstructImageUrlPipe implements PipeTransform {

  /**
   * Returns the image url based on the environment
   * @param value the image path. Ex: 'sticker/sticker1.jpg'
   * @returns full image url 
   */
  transform(value: string | undefined): string {
    if(!value) return '';
    const isProduction = environment.production;
    const isApp = environment.android || environment.windows;

    var url = '';
    if(isApp) {
      url = isProduction 
              ? `https://firebasestorage.googleapis.com/v0/b/syncio-bf6ca.appspot.com/o/${value.replaceAll("/", "%2F")}?alt=media`
              : (window.localStorage.getItem('apiUrl') || environment.apiUrl) + 'api/v1/images/' + value;
    }
    else {
      url = isProduction 
              ? `https://firebasestorage.googleapis.com/v0/b/syncio-bf6ca.appspot.com/o/${value.replaceAll("/", "%2F")}?alt=media`
              : `http://localhost:8080/api/v1/images/${value}`;
    }

    return url;
  }

}
