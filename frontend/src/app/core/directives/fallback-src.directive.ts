import { Directive, ElementRef, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appFallbackSrc]'
})
export class FallbackSrcDirective {
  @Input() folderName?: 'posts' | 'stickers' | 'messages';
  @Input() appFallbackSrc: string | undefined;

  constructor(private el: ElementRef) {}

  @HostListener('error')
  onError() {
    const element: HTMLImageElement = this.el.nativeElement;
    element.src = this.folderName ? `https://firebasestorage.googleapis.com/v0/b/syncio-bf6ca.appspot.com/o/${this.folderName}%2F${this.appFallbackSrc}?alt=media` 
                                  : `https://firebasestorage.googleapis.com/v0/b/syncio-bf6ca.appspot.com/o/${this.appFallbackSrc}?alt=media` 
                  || 'default-fallback-image-url.jpg';
  }
}