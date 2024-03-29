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

  hasServices(services: string[]): boolean {
    let hasService = false;
    const orgServices = this.authenticationService.getServices();
    services.forEach((service) => {
      // tslint:disable-next-line:triple-equals
      if (orgServices.findIndex((el) => el.serviceName == service)) {
        hasService = true;
      }
    });
    return hasService;
  }

  clear() {
    this.hasAccess = false;
  }

  isAdmin() {
    console.log(this.authenticationService.getCurrentUser());
    return (+this.authenticationService.getCurrentUser().parameters.type === 1);
  }

  isTechnoServeUser() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(11);
  }

  isCWSUser() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(1);
  }

  isCWSDistributer() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(1) && this.userRoles.includes(8));
  }

  isTechnoServeAdmin() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(11) && +this.authenticationService.getCurrentUser().parameters.type === 1);
  }

  isTechouseUser() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(0);
  }

  isPartnerUser() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(11);
  }

  isDryMillUser() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(2);
  }

  isCeparUser() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(5);
  }

  isCeparAdmin() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(5) && +this.authenticationService.getCurrentUser().parameters.type === 1);
  }

  isNaebUser() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(4));
  }

  isNaebAdmin() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(4) && +this.authenticationService.getCurrentUser().parameters.type === 1);
  }

  canEditUserType(userType: number) {
    if (this.authenticationService.getCurrentUser().parameters.type === 1) {
      return (userType === 2 || userType === 13);
    } else {
      return false;
    }
  }

  isTechouseAdmin() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(0) && +this.authenticationService.getCurrentUser().parameters.type === 1);
  }

  isNaebWareHouseOfficer() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(4) && +this.authenticationService.getCurrentUser().parameters.type === 10);
  }

  isNaebCoffeeValueChainOfficer() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(4) && +this.authenticationService.getCurrentUser().parameters.type === 11);
  }

  isNaebCEO() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(4) && +this.authenticationService.getCurrentUser().parameters.type === 12);
  }

  isInputDistributorAdmin() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(8) && +this.authenticationService.getCurrentUser().parameters.type === 1);
  }

  isCWSAdmin() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(1) && +this.authenticationService.getCurrentUser().parameters.type === 1);
  }

  isSiteManager() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(8) && +this.authenticationService.getCurrentUser().parameters.type === 2);
  }

  isDistrictCashCropOfficer() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(6);
  }

  isExporter() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(12);
  }

  isSWAdmin() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!(this.userRoles.includes(9) && +this.authenticationService.getCurrentUser().parameters.type === 1);
  }
}
