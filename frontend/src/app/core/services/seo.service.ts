import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})

export class SeoService {

  constructor(
    private title: Title,
    private meta: Meta
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
    console.log(fullUrl);
    this.meta.updateTag({ property: 'og:url', content: fullUrl });
  }

}
