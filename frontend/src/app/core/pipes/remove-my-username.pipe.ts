import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeMyUsername'
})

export class RemoveMyUsernamePipe implements PipeTransform {

  /**
   * Replaces the specified username with 'You' in a comma-separated list of names.
   *
   * @param {string} value - The comma-separated list of names.
   * @param {string} username - The username to replace with 'You'.
   * @returns {string} - The list of names with the username replaced with 'You'.
   * @example
   *  {{ 'John, Jane, Doe' | removeMyUsername: 'Jane' }} => 'You, John, Doe'
   */
  transform(value: string, username: string): string {
    const names = value.split(', ');
    const filteredNames = names.filter(name => name !== username);
    
    if (filteredNames.length > 1) {
      // (Room) If there are more than one names left after removing the username
      return 'You, ' + filteredNames.slice(1).join(', ');
    }
    else {
      // 2 users
      return filteredNames.join(', ');
    }
  }

}
