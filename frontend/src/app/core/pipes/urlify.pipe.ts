import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'urlify'
})

export class UrlifyPipe implements PipeTransform {

  /**
   * Transforms a text with URLs into clickable links.
   * @param text - The text to transform.
   * @returns The text with URLs transformed into clickable links.
   */
  transform(text: any): any {
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url: any) {
      return `<a href="${url}" target="_blank">${url}</a>`;
    });
  }

}
