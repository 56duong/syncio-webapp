import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'tagToLink'
})
export class TagToLinkPipe implements PipeTransform {

  constructor(
    private sanitizer: DomSanitizer,
    private userService: UserService
  ) {}
  

  /**
   * Escapes HTML characters to display them as text.
   * @param value - The text to escape.
   * @returns The escaped text.
   * @example escapeHtml('<script>alert("Hello")</script>') => '&lt;script&gt;alert(&quot;Hello&quot;)&lt;/script&gt;'
   */
  private escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
  }


  /**
   * Transforms the input text by replacing @UUID with a link to the user's profile.
   * Example: 'Hello @123e4567-e89b-12d3-a456-426614174000' => 'Hello <a class="profile-link" data-link="/profile/username">@username</a>'
   * Use: <div [innerHTML]="text | tagToLink | async"></div>
   * @param value - The text to transform.
   * @returns 
   */
  transform(value: string): Observable<SafeHtml> {
    if (!value) return of(value);

    // Escape HTML characters
    const escapedValue = this.escapeHtml(value);

    // Regex pattern to match @UUID
    const uuidPattern = /@([a-fA-F0-9\-]{36})/g;
    const matches = escapedValue.matchAll(uuidPattern);

    // Array of observables to fetch usernames
    const observables: any = [];
    for (const match of matches) {
      const id = match[1];
      const observable = this.userService.getUsernameById(id).pipe(
        map((user: any) => ({ id, username: user.username }))
      );
      observables.push(observable);
    }

    // Return an observable that emits the transformed HTML
    return of(escapedValue).pipe(
      switchMap(text =>
        observables.length ? 
          observables.reduce((acc: any, obs: any) =>
            acc.pipe(switchMap((html: any) =>
              obs.pipe(map((user: any) => {
                const profileUrl = `/profile/${user.username}`;
                return html.replace(`@${user.id}`, `<a class="profile-link" data-link="${profileUrl}">@${user.username}</a>`);
              }))))
          , of(text)) : of(text)
      ),
      map((html: any) => this.sanitizer.bypassSecurityTrustHtml(html))
    );
  }
}