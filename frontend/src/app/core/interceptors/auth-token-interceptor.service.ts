import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenInterceptorService implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(private tokenService: TokenService, private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();

    if (token) {
      req = this.addTokenToRequest(req, token);
    }

    return next.handle(req).pipe(
      catchError((error) => {
        // If we get a 401 Unauthorized error, we attempt to refresh the token
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(req, next);
        }
        return throwError(error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null); // Reset the refreshTokenSubject

      const refreshToken = this.tokenService.getRefreshToken();

      if (refreshToken) {
        // Attempt to refresh the token
        return this.tokenService.refreshToken().pipe(
          switchMap((token: string) => {
            this.isRefreshing = false;
            this.tokenService.setToken(token); // Set new access token
            this.refreshTokenSubject.next(token); // Pass new token to subscribers
            return next.handle(this.addTokenToRequest(request, token)); // Retry original request with new token
          }),
          catchError((err) => {
            console.log(err);
            // If refreshing the token fails, redirect to login
            this.isRefreshing = false;
            this.tokenService.removeToken();
            this.router.navigate(['/login'], {
              queryParams: { sessionExpired: true },
            }); // Redirect to login
            return throwError(err);
          })
        );
      } else {
        // If no refresh token is available, redirect to login immediately
        this.router.navigate(['/login'], {
          queryParams: { sessionExpired: true },
        });
        return throwError('No refresh token available');
      }
    } else {
      // If we're already refreshing the token, wait for the refresh process to complete
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addTokenToRequest(request, token));
        })
      );
    }
  }
}
