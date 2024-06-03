import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeMyUsername'
})

export class RemoveMyUsernamePipe implements PipeTransform {

  /**
   * Remove the current username from the list of names
   * @param value The name
   * @param username The current username
   * @returns the name without the current username
   * @example
   * {{ 'John, Jane, Doe' | removeMyUsername: 'Jane' }} => 'John, Doe'
   */
  transform(value: string, username: string): string {
    const names = value.split(', ');
    const filteredNames = names.filter(name => name !== username);
    return filteredNames.join(', ');
  }

}
