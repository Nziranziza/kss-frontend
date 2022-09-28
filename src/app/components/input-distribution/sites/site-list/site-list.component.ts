import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService, AuthorisationService, ConfirmDialogService} from '../../../../core';
import {SiteService} from '../../../../core';
import {Subject} from 'rxjs';
import {MessageService} from '../../../../core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SiteDetailsComponent} from '../site-details/site-details.component';
import { DeleteSiteModal } from '../delete-site-modal/delete-site-modal-component';
import {BasicComponent} from '../../../../core';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-site-list',
  templateUrl: './site-list.component.html',
  styleUrls: ['./site-list.component.css']
})
export class SiteListComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
              private modal: NgbModal,
              private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService,
              private router: Router, private  confirmDialogService: ConfirmDialogService,
              private siteService: SiteService, private messageService: MessageService) {
    super();
  }

  message: string;
  sites: any;
  loading = false;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.getAllSites();
    this.message = this.messageService.getMessage();
  }

  getAllSites(): void {
    this.loading = true;
    if (!this.authorisationService.isDistrictCashCropOfficer()) {
      this.siteService.getAll().subscribe(data => {
        if (data) {
          this.sites = data.content;
          this.dtTrigger.next();
          this.loading = false;
        }
      });
    } else {
      const body = {
        searchBy: 'district',
        dist_id: this.authenticationService.getCurrentUser().info.location.dist_id
      };

      this.siteService.getSite(body).subscribe((data) => {
        this.sites = data.content;
        this.dtTrigger.next();
        this.loading = false;
      });
    }
  }

  viewDetails(site: any) {
    const modalRef = this.modal.open(SiteDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.site = site;
  }

  openDeleteModal(site: any){
    const modalRef = this.modal.open(DeleteSiteModal);
    modalRef.componentInstance.site = site;
    modalRef.result.finally(() => {
      // Re render Datatable
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
      this.getAllSites();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.messageService.clearMessage();
  }
}
