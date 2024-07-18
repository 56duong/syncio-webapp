import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from './core/services/lang.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  constructor(
    private translate: TranslateService,
    private langService: LangService
  ) {
    const defaultLang = langService.getLang() || 'en';
    translate.setDefaultLang(defaultLang);
    translate.use(defaultLang);
  }

}
