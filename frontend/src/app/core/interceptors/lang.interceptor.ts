import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LangService } from '../services/lang.service';

@Injectable()
export class LangInterceptor implements HttpInterceptor {

  constructor(
    private langService: LangService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const lang = this.langService.getLang() || 'vi';
    request = request.clone({
      setHeaders: {
        'Accept-Language': lang
      }
    });
    return next.handle(request);
  }
}
