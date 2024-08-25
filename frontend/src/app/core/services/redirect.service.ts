import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';


/** Interface for the Electron API. */
export interface IElectronAPI {
  /** Send a message to the main process via channel 'reload-page' to reload the page. */
  reloadPage: (route?: string) => void;
}

/** Declare the Electron API in the global window object. */
declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}


@Injectable({
  providedIn: 'root'
})

export class RedirectService {

  constructor(
    private router: Router,
    private translateService: TranslateService
  ) { }


  /**
   * Reload the page. 
   * If environment is Windows, use Electron to reload the page, by sending a message to the main process via channel 'reload-page'.
   * Otherwise, use window.location.reload().
   * @param route - The route to navigate to after reloading the page. Example: '/login' 
   */
  reloadPage(route?: string) {
    if(!environment.windows) {
      if(route) window.location.href = route;
      else window.location.reload();
    }
    else {
      if (window.electronAPI && typeof window.electronAPI.reloadPage === 'function') {
        window.electronAPI.reloadPage(route);
      } 
      else {
        console.error('Electron API not available or reloadPage method not defined.');
      }
    }
  }


  /**
   * Redirect to a specific URL by using the Angular Router and reload the page.
   * If environment is Windows, use Electron to reload the page. Otherwise, use window.location.reload().
   * @param url 
   */
  redirectAndReload(url: string) {
    if(!environment.windows) {
      window.location.href = url;
    }
    else {
      this.router.navigate([url]).then(() => {
        if(url === '/') this.reloadPage();
        else this.reloadPage(url);
      });
    }
  }


  /**
   * Redirect to the login page with an error message: "You need to login first." and call the this.reloadPage('/login')
   */
  needLogin() {
    if(!environment.windows) {
      window.location.href = '/login?type=error&message=' + encodeURIComponent(this.translateService.instant('login.you_need_to_login_first'));
    }
    else {
      this.router.navigate(['/login'], { 
        queryParams: { type: 'error', message: this.translateService.instant('login.you_need_to_login_first') } 
      }).then(() => {
        this.reloadPage('/login');
      });
    }
  }


  /**
   * Redirect to the login page with a custom error message. 
   * Call the this.reloadPage('/login') after redirecting.
   * @param message the custom error message. Example: "You need to login first to create a post."
   */
  needLoginWithMessage(message: string) {
    if(!environment.windows) {
      // convert message to URL format
      window.location.href = '/login?type=error&message=' + encodeURIComponent(message);
    }
    else {
      // convert message to URL format
      this.router.navigate(['/login'], { 
        queryParams: { type: 'error', message: message } 
      }).then(() => {
        this.reloadPage('/login');
      });
    }
  }
  
}
