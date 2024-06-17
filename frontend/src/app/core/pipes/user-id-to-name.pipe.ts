import { Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../services/user.service';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'userIdToName',
})

export class UserIdToNamePipe implements PipeTransform {
  constructor(private userService: UserService) { }

  transform(userId: string): any {
    return this.userService
      .getUsernameById(userId)
      .pipe(map((response: any) => (response ? response.username : null)));
  }
}
