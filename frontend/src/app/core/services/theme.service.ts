import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ThemeService {
  private currentTheme = 'theme-light';

  constructor() { 
    this.currentTheme = localStorage.getItem('theme') || 'theme-light';
  }


  switchTheme(theme: string): void {
    this.applyTheme(theme);
    localStorage.setItem('theme', theme);
  }


  getCurrentTheme() {
    return this.currentTheme;
  }


  applyTheme(theme: string): void {
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = `${theme}.css`;
      this.currentTheme = theme;
    }
  }

}
