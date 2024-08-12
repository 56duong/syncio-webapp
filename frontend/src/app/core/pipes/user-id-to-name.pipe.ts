import { Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../services/user.service';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'userIdToName',
})

export class UserIdToNamePipe implements PipeTransform {
  constructor(
    private userService: UserService
  ) { }

  /**
   * Transforms a user ID into a username.
   * @param userId 
   * @returns The username of the user with the given ID, or null if the user is not found.
   * @example
   * {{ userId | userIdToName | async }}
   */
  transform(userId: string | undefined | null): any {
    if (!userId) return null;
    return this.userService
      .getUsernameById(userId)
      .pipe(map((response: any) => (response ? response.username : null)));
  }
}
