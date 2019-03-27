import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, BehaviorSubject, ReplaySubject} from 'rxjs';

import {ApiService} from './api.service';
import {JwtService} from './jwt.service';
import {AuthUser} from '../models';
import {map, distinctUntilChanged} from 'rxjs/operators';


@Injectable()
export class AuthenticationService {
  private currentUserSubject = new BehaviorSubject<AuthUser>({} as AuthUser);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private jwtService: JwtService
  ) {
  }

  setAuth(user: AuthUser) {
    this.jwtService.saveToken(user.token);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  purgeAuth() {
    this.jwtService.destroyToken();
    this.currentUserSubject.next({} as AuthUser);
    this.isAuthenticatedSubject.next(false);
  }

  attemptAuth(credentials): Observable<any> {
    return this.apiService.post('/users/sign.in', credentials)
      .pipe(map(

        data => {
          console.log(data);
          this.setAuth(data.content);
          return data;
        }
      ));
  }

  getCurrentUser(): AuthUser {
    return this.currentUserSubject.value;
  }

  requestReset(email): Observable<any> {
    return this.apiService.post('/users/request-reset', email);
  }

  update(user): Observable<any> {
    return this.apiService
      .put('/users', user)
      .pipe(map(data => {
        this.currentUserSubject.next(data.content);
        return data;
      }));
  }
}
