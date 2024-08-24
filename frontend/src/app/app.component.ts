import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from './core/services/lang.service';
import { ThemeService } from './core/services/theme.service';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  title = 'Syncio';

  constructor(
    private translate: TranslateService,
    private langService: LangService,
    private themeService: ThemeService,
    private seoService: SeoService
  ) {
    let currentTheme = localStorage.getItem('theme') || 'theme-light';
    this.themeService.applyTheme(currentTheme);

    const defaultLang = langService.getLang();
    translate.setDefaultLang(defaultLang);
    translate.use(defaultLang);

    this.seoService.updateTitleAndCanonical();
  }

}
