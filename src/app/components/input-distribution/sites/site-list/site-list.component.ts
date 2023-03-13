import { HelperService } from 'src/app/core';
import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormControl, FormGroup } from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

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
              private siteService: SiteService, private messageService: MessageService,
              private helperService: HelperService) {
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

  searchForm: FormGroup = new FormGroup({
    search: new FormControl()
  });

  searchSubscription: Subscription

  onSearch = ({ search }) => {
    this.loading = true;
    this.loadedPages = [];
    this.getAllSites(search)
  }

  ngOnInit() {
    this.loading = true;
    this.getAllSites();
    this.message = this.messageService.getMessage();
    this.searchSubscription = this.searchForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(this.onSearch);
  }

  mapSitesData = (data: any) => {
    if (data) {
      this.sites = {
        ...this.sites,
        [data?.meta?.page]: data.content,
      };
      this.loading = false;
      this.config = {
        itemsPerPage: data?.meta?.pageSize,
        currentPage: data?.meta?.page,
        totalItems: data?.meta?.total,
      };
      this.loadedPages = [...this.loadedPages, Number(data?.meta?.page)]
      this.showData = true
    }
  }

  getAllSites(search = '', page = 1 ): void {
    if (!this.authorisationService.isDistrictCashCropOfficer()) {
      this.siteService.getAll({ search: search || '', page }).subscribe(this.mapSitesData);
    } else {
      const body = this.helperService.cleanObject({
        searchBy: 'district',
        dist_id: this.authenticationService.getCurrentUser()?.info?.location?.dist_id,
        search: search || '',
        page
      });
      this.siteService.getSite(body).subscribe(this.mapSitesData);
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
    this.searchSubscription.unsubscribe();
  }

  onPageChange(event: number) {
    if(!this.loadedPages.find((page) => page === event)) {
      this.sites = {
        ...this.sites,
        [Number(event)]: []
      }
      this.getAllSites(this.searchForm.value.search, event)
    } else {
      this.config = {
        ...this.config,
        currentPage: Number(event),
      };
    }
  }
}
