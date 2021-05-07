import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService, OrganisationService} from '../../core/services';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmDialogService} from '../../core/services';
import {Subject} from 'rxjs';
import {MessageService} from '../../core/services';
import {AuthorisationService} from '../../core/services';
import {SiteService} from '../../core/services';
import {BasicComponent} from '../../core/library';
import {DataTableDirective} from 'angular-datatables';

@Component({
  selector: 'app-organisation-list',
  templateUrl: './organisation-list.component.html',
  styleUrls: ['./organisation-list.component.css']
})
export class OrganisationListComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(private organisationService: OrganisationService, private siteService: SiteService,
              private router: Router, private  confirmDialogService: ConfirmDialogService,
              private authorisationService: AuthorisationService,
              private route: ActivatedRoute,
              private authenticationService: AuthenticationService, private messageService: MessageService) {
    super();
  }

  organisations = [];
  dtOptions: any = {};
  loading = false;
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
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
    this.setMessage(this.messageService.getMessage());
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

  deleteOrganisation(id: string): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this record?').afterClosed().subscribe(
      res => {
        if (res) {
          const body = {
            id
          };
          this.organisationService.destroy(body)
            .subscribe(() => {
                this.setMessage('Organisation successful deleted!');
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
                    this.loading = false;
                    this.rerender();
                  }
                });
              },
              (err) => {
                this.setError(err.errors);
              });
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
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

}
