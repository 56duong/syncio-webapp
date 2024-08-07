import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from './core/services/lang.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  constructor(
    private translate: TranslateService,
    private langService: LangService,
    private http: HttpClient,
    private router: Router,
    private themeService: ThemeService
  ) {
    let currentTheme = localStorage.getItem('theme') || 'theme-light';
    this.themeService.applyTheme(currentTheme);

    const defaultLang = langService.getLang() || 'en';
    translate.setDefaultLang(defaultLang);
    translate.use(defaultLang);

    // set for android to enter the ip address of the server, for development purposes
    if(environment.android || environment.windows) {
      const hasChecked = sessionStorage.getItem('hasChecked'); // make sure to check only once when the app is opened
      if(hasChecked) return;
      
      if(this.router.url !== '/update-ip') {
        this.checkLocalhostAvailability();
      }
    }
  }

  checkLocalhostAvailability(): void {
    const url = environment.apiUrl + 'welcome-page';
    this.http.get(url).subscribe({
      next: (response) => {
        console.log('response', response);
      },
      error: (e) => {
        console.log('error', JSON.stringify(e));
        this.router.navigate(['/update-ip']);
      },
      complete: () => {
        sessionStorage.setItem('hasChecked', 'true');
      }
    });
  }

}
