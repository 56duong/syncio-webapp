import { Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../services/user.service';
import { map } from 'rxjs';
import { User } from '../interfaces/user';

@Pipe({
  name: 'userIdToName'
})
export class UserIdToNamePipe implements PipeTransform {

  constructor(private userService: UserService) {}

  transform(userId: string): any {
    return this.userService.getUser(userId).pipe(
      map(user => user ? user.username : null)
    );
  }

}
