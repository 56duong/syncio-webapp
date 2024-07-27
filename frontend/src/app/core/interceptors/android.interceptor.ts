import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * Interceptor to modify the API URL for Android. For development purposes, the API URL can be changed
 */
@Injectable()
export class AndroidInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (environment.android) {
      let modifiedReq = request;
      const apiUrl = window.localStorage.getItem('apiUrl');
      if (apiUrl) {
        const newUrl = request.url.replace(environment.apiUrl, apiUrl);
        modifiedReq = request.clone({ url: newUrl });
      }
      return next.handle(modifiedReq);
    }
    return next.handle(request);
  }
}
