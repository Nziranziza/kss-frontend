import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService, AuthorisationService, ConfirmDialogService} from '../../../../core/services';
import {SiteService} from '../../../../core/services';
import {Subject} from 'rxjs';
import {MessageService} from '../../../../core/services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SiteDetailsComponent} from '../site-details/site-details.component';
import { DeleteSiteModal } from '../delete-site-modal/delete-site-modal-component';
import {BasicComponent} from '../../../../core/library';
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
  sites: any = {
    1: [],
  };
  loading = false;
  showData = false;
  config: any;
  maxSize = 9;
  autoHide = false;
  responsive = false;
  directionLinks = true;
  parameters: any;
  loadedPages: number[] = [];

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`,
  };

  ngOnInit() {
    this.getAllSites();
    this.message = this.messageService.getMessage();
  }

  getAllSites(): void {
    this.loading = true;
    if (!this.authorisationService.isDistrictCashCropOfficer()) {
      this.siteService.getAll().subscribe(data => {
        if (data) {
          this.sites = {
            [data?.meta?.page]: data.content,
          };
          this.dtTrigger.next();
          this.loading = false;
          this.config = {
            itemsPerPage: data?.meta?.pageSize,
            currentPage: data?.meta?.page,
            totalItems: data?.meta?.total,
          };
          this.loadedPages = [...this.loadedPages, data?.meta?.page]
          this.showData = true
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

  onPageChange(event: number) {
    if(!this.loadedPages.find((page) => page === event)) {
      this.sites = {
        ...this.sites,
        [Number(event)]: []
      }
      this.siteService.getAll({ page: event }).subscribe(data => {
        if (data) {
          this.sites = {
            ...this.sites, 
            [data?.meta?.page]: data.content
          };
          this.config = {
            ...this.config,
            currentPage: data?.meta?.page,
          };
          this.loadedPages = [...this.loadedPages, Number(data?.meta?.page)];
        }
      });
    } else {
      this.config = {
        ...this.config,
        currentPage: Number(event),
      };
    }
  }
}
