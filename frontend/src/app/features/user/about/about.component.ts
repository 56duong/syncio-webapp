import { Component } from '@angular/core';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})

export class AboutComponent {
  observer: IntersectionObserver | undefined;
  currentUserId: string = '';

  constructor(
    private redirectService: RedirectService,
    private tokenService: TokenService
  ) {}


  ngOnInit() {
    this.currentUserId = this.tokenService.extractUserIdFromToken();

    document.body.style.overflowX = 'hidden';

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.4) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.4 });

    const elements = document.querySelectorAll('[class^="fade-"]');
    elements.forEach((element) => {
      this.observer?.observe(element);
    });
  }


  navigateTo(url: string) {
    this.redirectService.redirectAndReload(url);
  }
  
  
  /**
   * Scroll to the element with the given id.
   * @param id 
   */
  scrollToElement(id: string): void {
    const element = document.getElementById(id);
    element?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start',
      inline: 'start' 
    });
  }

}
