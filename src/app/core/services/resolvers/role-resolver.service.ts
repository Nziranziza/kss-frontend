import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {OrganisationService} from '../organisation.service';

@Injectable({
  providedIn: 'root'
})
export class RoleResolverService implements Resolve<any> {

  orgRoles = [];

  constructor(private organisationService: OrganisationService) {
  }

  resolve(route: ActivatedRouteSnapshot) {
    let possibleRoles = [];
    this.orgRoles = [];
    const organisationId = route.paramMap.get('organisationId');
    this.organisationService.possibleRoles().subscribe(data => {
      possibleRoles = Object.keys(data.content).map(key => {
        return {name: key, value: data.content[key]};
      });
      this.organisationService.get(organisationId).subscribe(org => {
        this.orgRoles = possibleRoles.filter(roles => org.content.organizationRole.includes(roles.value));
      });
    });
    return this.orgRoles;
  }
}
