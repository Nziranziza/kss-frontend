import { Injectable } from '@angular/core';


@Injectable()
export class JwtService {

  getToken(): string {
    return window.localStorage['token'.toString()];
  }

  saveToken(token: string) {
    window.localStorage['token'.toString()] = token;
  }

  destroyToken() {
    window.localStorage.removeItem('token');
  }

}
