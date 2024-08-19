import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class LangService {

  constructor() { }

  getLang() {
    return window.localStorage.getItem('lang') || 'vi';
  }

  setLang(lang: string) {
    window.localStorage.setItem('lang', lang);
  }

  removeLang() {
    window.localStorage.removeItem('lang');
  }

}
