import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService, OrganisationService} from '../../core/services';
import {Organisation} from '../../core/models';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmDialogService} from '../../core/services';
import {Subject} from 'rxjs';
import {MessageService} from '../../core/services';
import {AuthorisationService} from '../../core/services';
import {SiteService} from '../../core/services';

@Component({
  selector: 'app-organisation-list',
  templateUrl: './organisation-list.component.html',
  styleUrls: ['./organisation-list.component.css']
})
export class OrganisationListComponent implements OnInit, OnDestroy {

  constructor(private organisationService: OrganisationService, private siteService: SiteService,
              private router: Router, private  confirmDialogService: ConfirmDialogService,
              private authorisationService: AuthorisationService,
              private route: ActivatedRoute,
              private authenticationService: AuthenticationService, private messageService: MessageService) {
  }

  message: string;
  organisations = [];
  dtOptions: any = {};
  loading = false;
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  isSuperAdmin = false;
  isNaebCoffeeValueChainOfficer = false;

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
    this.isNaebCoffeeValueChainOfficer = this.authorisationService.isNaebCoffeeValueChainOfficer();
    this.message = this.messageService.getMessage();
  }

  isOrgCWS(org: any) {
    return !!org.organizationRole.includes(1);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.messageService.clearMessage();
  }

  isNotSuperOrganisation(organisation: any) {
    return organisation.organizationRole.indexOf(0) === -1 && organisation.organizationName !== 'BK Techouse';
  }

  deleteOrganisation(organisation: Organisation): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this record?').afterClosed().subscribe(
      res => {
        if (res) {
          this.organisationService.destroy(organisation._id)
            .subscribe(() => {
              this.getAllOrganisations();
              this.message = 'Record successful deleted!';
            });
          this.getAllOrganisations();
        }
      });
  }

  getAllOrganisations(): void {
    this.loading = true;
    if (this.authorisationService.isDistrictCashCropOfficer()) {
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
    } else if (this.authorisationService.isInputDistributorAdmin() || this.authorisationService.isCWSAdmin()) {
      this.organisationService.get(this.authenticationService.getCurrentUser().info.org_id).subscribe(data => {
        if (data) {
          this.organisations.push(data.content);
          this.dtTrigger.next();
          this.loading = false;
        }
      });
    } else {
      this.organisationService.all().subscribe(data => {
        if (data) {
          this.organisations = data.content;
          if (this.authorisationService.isNaebCoffeeValueChainOfficer()) {
            this.organisations = this.organisations.filter((org) => {
              return (
                org.organizationRole.indexOf(1) > -1 ||
                org.organizationRole.indexOf(2) > -1 ||
                org.organizationRole.indexOf(7) > -1 ||
                org.organizationRole.indexOf(9) > -1 ||
                org.organizationRole.indexOf(10) > -1
              );
            });
          }
          this.dtTrigger.next();
          this.loading = false;
        }
      });
    }
  }
}
