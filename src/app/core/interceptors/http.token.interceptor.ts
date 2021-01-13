import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthenticationService, JwtService} from '../services';
import {Router} from '@angular/router';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {

  excepts = [
    '/api/users/sign.in',
    '/api/users/confirmation',
    '/api/users/account/unlock',
    '/api/users/request/password-reset',
    '/api/users/password-reset'
  ];

  constructor(private jwtService: JwtService, private router: Router,
              private authenticationService: AuthenticationService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headersConfig = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
    const token = this.jwtService.getToken();
    if (!this.excepts.includes(req.url)) {
      if (this.authenticationService.isLoggedIn()) {
        if (token) {
          headersConfig['x-auth-token'.toString()] = token;
        }
        const request = req.clone({setHeaders: headersConfig});
        return next.handle(request);
      } else {
        return next.handle(req);
      }
    } else if (!this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl('login');
    } else {
      if (token) {
        headersConfig['x-auth-token'.toString()] = token;
      }
      const request = req.clone({setHeaders: headersConfig});
      return next.handle(request);
    }
  }
}
