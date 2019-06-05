import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorisationService {

  constructor(private authenticationService: AuthenticationService) {
  }

  userRoles = this.authenticationService.getCurrentUser().parameters.role;
  hasAccess = false;

  hasRoles(roles: string[]): boolean {
    roles.forEach((role) => {
      if (this.userRoles.includes(role)) {
        this.hasAccess = true;
      }
    });
    return this.hasAccess;
  }

  clear() {
    this.hasAccess = false;
  }

  isCWSUser() {
    return !!this.userRoles.includes(1);
  }
}
