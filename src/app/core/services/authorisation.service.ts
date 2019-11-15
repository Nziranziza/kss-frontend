import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorisationService {

  userRoles: any;
  hasAccess: boolean;

  constructor(private authenticationService: AuthenticationService) {
    this.hasAccess = false;
  }

  hasRoles(roles: string[]): boolean {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
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
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(1);
  }
  isTechouseUser() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(0);
  }
  isDryMillUser() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(2);
  }
  isCeparUser() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(5);
  }
  isNaebUser() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(4));
  }
  isNaebAdmin() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(4) && this.authenticationService.getCurrentUser().parameters.type === 1);
  }
  isNaebWareHouseOfficer() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(4) && this.authenticationService.getCurrentUser().parameters.type === 10);
  }
  isNaebCoffeeValueChainOfficer() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(4) && this.authenticationService.getCurrentUser().parameters.type === 11);
  }
  isNaebCEO() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(4) && this.authenticationService.getCurrentUser().parameters.type === 12);
  }
  isInputDistributorAdmin() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(8) && this.authenticationService.getCurrentUser().parameters.type === 1);
  }
  isSiteManager() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(8) && +this.authenticationService.getCurrentUser().parameters.type === 2);
  }
  isDistrictCashCropOfficer() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(6);
  }
}
