import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {JwtService} from './jwt.service';
import {AuthUser} from '../models';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';

@Injectable()
export class AuthenticationService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private jwtService: JwtService) {
  }

  setAuth(user: AuthUser) {
    this.jwtService.saveToken(user.token);
    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.setItem('loggedIn', 'true');
  }

  purgeAuth() {
    this.jwtService.destroyToken();
    window.localStorage.removeItem('user');
  }

  attemptAuth(credentials): Observable<any> {
    this.purgeAuth();
    return this.apiService.post('/users/sign.in', credentials)
      .pipe(map(
        data => {
          this.setAuth(data.content);
          return data;
        },
      ));
  }

  setCurrentSeason(season: any) {
    window.localStorage.setItem('current-season', JSON.stringify(season));
  }

  getCurrentSeason() {
    return JSON.parse(window.localStorage.getItem('current-season'));
  }

  isLoggedIn() {
    if (window.localStorage.getItem('loggedIn') === 'true') {
      console.log('test');
      return true;
    }
    return false;
  }

  getCurrentUser(): AuthUser {
    return JSON.parse(window.localStorage.getItem('user'));
  }

  requestReset(email): Observable<any> {
    return this.apiService.post('/users/request/password-reset', email);
  }

  resetPassword(password, options?): Observable<any> {
    return this.http.post(`${environment.api_url}${'/users/password-reset'}`, password, options);
  }

  validateResetToken(token: string) {
    return this.apiService.get('/users/confirmation/' + token);
  }

  unlock(body, options?): Observable<any> {
    return this.http.post(`${environment.api_url}${'/users/account/unlock'}`, body, options);
  }
}
