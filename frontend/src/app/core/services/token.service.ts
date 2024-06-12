import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from './user.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
    private readonly TOKEN_KEY = 'access_token';
    private jwtHelperService = new JwtHelperService();

    constructor(
        private userService: UserService,
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
     * @returns the user id.
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

}
