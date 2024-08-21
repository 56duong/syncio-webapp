import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})

export class LangService {

  constructor(
    private translateService: TranslateService
  ) { }

  getLang() {
    return window.localStorage.getItem('lang') || 'vi';
  }

  setLang(lang: string) {
    window.localStorage.setItem('lang', lang);
    this.translateService.use(lang);
  }

  removeLang() {
    window.localStorage.removeItem('lang');
  }

}
