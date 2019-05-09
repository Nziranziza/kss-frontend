import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService, OrganisationService} from '../../core/services';
import {Organisation} from '../../core/models';
import {Router} from '@angular/router';
import {ConfirmDialogService} from '../../core/services';
import {Subject} from 'rxjs';

declare var $;

@Component({
  selector: 'app-organisation-list',
  templateUrl: './organisation-list.component.html',
  styleUrls: ['./organisation-list.component.css']
})
export class OrganisationListComponent implements OnInit, OnDestroy {

  constructor(private organisationService: OrganisationService,
              private router: Router, private  confirmDialogService: ConfirmDialogService,
              private authenticationService: AuthenticationService
  ) {

  }

  message: string;
  organisations: any;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  isSuperAdmin = false;

  ngOnInit() {
    this.getAllOrganisations();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      columns: [{}, {}, {}, {
        class: 'none'
      }, {}],
      responsive: true
    };
    this.isSuperAdmin = this.authenticationService.getCurrentUser().parameters.role.includes(0);
  }

  isOrgCWS(org: any) {
    return org.organizationRole.includes(1) ? true : false;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  isNotSuperOrganisation(organisation: any) {
    if (organisation.organizationRole.indexOf(0) === -1 && organisation.organizationName !== 'BK Techouse') {
      return true;
    } else {
      return false;
    }
  }

  deleteOrganisation(organisation: Organisation): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this record?').afterClosed().subscribe(
      res => {
        if (res) {
          this.organisationService.destroy(organisation._id)
            .subscribe(data => {
              this.getAllOrganisations();
              this.message = 'Record successful deleted!';
            });
          this.getAllOrganisations();
        }
      });
  }

  getAllOrganisations(): void {
    this.organisationService.all().subscribe(data => {
      if (data) {
        this.organisations = data.content;
        this.dtTrigger.next();
      }
    });
  }
}
