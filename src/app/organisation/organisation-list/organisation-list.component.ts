import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService, OrganisationService} from '../../core/services';
import {Organisation} from '../../core/models';
import {Router} from '@angular/router';
import {ConfirmDialogService} from '../../core/services';
import {Subject} from 'rxjs';
import {MessageService} from '../../core/services/message.service';
import {AuthorisationService} from '../../core/services/authorisation.service';
import {SiteService} from '../../core/services/site.service';

declare var $;

@Component({
  selector: 'app-organisation-list',
  templateUrl: './organisation-list.component.html',
  styleUrls: ['./organisation-list.component.css']
})
export class OrganisationListComponent implements OnInit, OnDestroy {

  constructor(private organisationService: OrganisationService, private siteService: SiteService,
              private router: Router, private  confirmDialogService: ConfirmDialogService,
              private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService, private messageService: MessageService
  ) {

  }

  message: string;
  organisations: any;
  dtOptions: any = {};
  loading = false;
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
    this.message = this.messageService.getMessage();
  }

  isOrgCWS(org: any) {
    return org.organizationRole.includes(1) ? true : false;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.messageService.setMessage('');
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
    this.loading = true;
    if (!this.authorisationService.isDistrictCashCropOfficer()) {
      this.organisationService.all().subscribe(data => {
        if (data) {
          this.organisations = data.content;
          this.dtTrigger.next();
          this.loading = false;
        }
      });
    } else {
      const body = {
        searchBy: 'district',
        dist_id: this.authenticationService.getCurrentUser().info.location.dist_id
      };
      this.siteService.getZone(body).subscribe(data => {
        if (data) {
          this.organisations = data.content;
          this.dtTrigger.next();
          this.loading = false;
        }
      });
    }
  }
}
