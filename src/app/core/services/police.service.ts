import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class PoliceService {

  public static canSeeOrganisations;
  public static canSeeFarmers;

  constructor(private authenticationService: AuthenticationService) {
  }

  /*parameters = this.authenticationService.getCurrentUser().parameters;*/
  canSeeOrganisations = true; /*this.parameters.role.includes(4);*/
}
