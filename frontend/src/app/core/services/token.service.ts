import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from './user.service';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
    private readonly TOKEN_KEY = 'access_token';
    private jwtHelperService = new JwtHelperService();

    constructor(
        private userService: UserService,
        private router: Router,
        private translateService: TranslateService
    ){ }
    
    //getter/setter
    getToken():string {
        return localStorage.getItem(this.TOKEN_KEY) ?? '';
    }
    setToken(token: string): void {        
        localStorage.setItem(this.TOKEN_KEY, token);             
    }
    getUserId(): number {
        let token = this.getToken();
        if (!token) {
            return 0;
        }
        let userObject = this.jwtHelperService.decodeToken(token);
        return 'userId' in userObject ? parseInt(userObject['userId']) : 0;
    }
    
      
    removeToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
    }              
    isTokenExpired(): boolean { 
        if(this.getToken() == null) {
            return false;
        }       
        return this.jwtHelperService.isTokenExpired(this.getToken()!);
    }

    /**
     * Extract the user id from the token. Return an empty string if the token is expired or not found.
     * @returns the user id, or null if the token is expired or not found.
     */
    extractUserIdFromToken(): any {
        const token = this.getToken();
        if (!token || this.jwtHelperService.isTokenExpired(token)) {
            return null;
        }

        let userObject = this.jwtHelperService.decodeToken(token);
        return 'userId' in userObject ? userObject['userId'] : '';
    }

    /**
     * Extract the username from the token. Return an empty string if the token is expired or not found.
     * @returns the username, or null if the token is expired or not found.
     */
    extractUsernameFromToken(): any {
        const token = this.getToken();
        if (!token || this.jwtHelperService.isTokenExpired(token)) {
            return null;
        }

        let userObject = this.jwtHelperService.decodeToken(token);
        return 'username' in userObject ? userObject['username'] : '';
    }

    /**
     * Extract the user role from the token. Return an empty string if the token is expired or not found.
     * @returns the user role, or null if the token is expired or not found.
     */
    extractUserRoleFromToken(): any {
        const token = this.getToken();
        if (!token || this.jwtHelperService.isTokenExpired(token)) {
            return null;
        }

        let userObject = this.jwtHelperService.decodeToken(token);
        return 'role' in userObject ? userObject['role'] : '';
    }

    /**
     * Check if the token is valid.
     * @returns true if the token is valid, false otherwise.
     */
    isValidToken(): boolean {
        return this.getToken() !== null && !this.isTokenExpired();
    }

    /**
     * Get the current user from the token.
     * @returns the current user. Null if the token is expired or not found.
     * @example
     * this.tokenService.getCurrentUserFromToken().subscribe({
     *  next: (user) => {
     *   this.currentUser = user;
     *  },
     *  error: (error) => {
     *   console.log(error);
     *  }
     * });
     */
    getCurrentUserFromToken(): Observable<any> {
        const token = this.getToken();
        if (!token || this.jwtHelperService.isTokenExpired(token)) {
            return of(null);
        }
    
        let user = this.jwtHelperService.decodeToken(token);
        if('userId' in user) {
            return this.userService.getUser(user['userId']);
        }
        else {
            return of(null);
        }
    }

    /**
     * Check if the user has the required role. Use in the canActivate method of the route guard.
     * @param requiredRole 
     * @returns 
     */
    canActivate(requiredRoles: string[]): boolean {
        let userRole = this.extractUserRoleFromToken();
        if(!userRole) {
            this.router.navigate(['/login'], { 
                queryParams: { 
                    type: 'error',
                    message: this.translateService.instant('login.you_need_to_login_first')
                } 
            });
            return false;
        }
        if (!requiredRoles.includes(userRole)) {
            this.router.navigate(['/not-authorized']);
            return false;
        }
        return true;
    }

}
