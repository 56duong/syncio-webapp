import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SeoService {

  constructor(
    private title: Title,
    private meta: Meta,
    private router: Router
  ) { }


  setMetaTags(config: { title?: string, description?: string, keywords?: string, image?: string }) {
    if (config.title) {
      this.title.setTitle(config.title);
      this.meta.updateTag({ property: 'og:title', content: config.title });
    }
    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
    }
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
    }
    
    const fullUrl = window.location.href;
    this.meta.updateTag({ property: 'og:url', content: fullUrl });
  }


  updateTitleAndCanonical() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setCanonicalURL();
      });
  }


  private setCanonicalURL() {
    const link: HTMLLinkElement = this.getOrCreateCanonicalLink();
    link.setAttribute('href', window.location.href);
  }


  private getOrCreateCanonicalLink(): HTMLLinkElement {
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']" as any);
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    return link;
  }

}
