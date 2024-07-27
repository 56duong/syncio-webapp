import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class RedirectService {

  /**
   * Redirect to the login page with an error message: "You need to login first."
   */
  needLogin() {
    window.location.href = '/login?type=error&message=You%20need%20to%20login%20first.';
  }

  /**
   * Redirect to the login page with a custom error message.
   * @param message the custom error message. Example: "You need to login first to create a post."
   */
  needLoginWithMessage(message: string) {
    // convert message to URL format
    message = message.replace(/ /g, '%20');
    window.location.href = `/login?type=error&message=${message}`;
  }
  
}
