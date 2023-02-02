import {Component, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AuthenticationService, AuthorisationService, MessageService, SiteService} from '../../../../core/services';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {BasicComponent} from '../../../../core/library';

@Component({
  selector: 'app-site-pending-farmers',
  templateUrl: './site-pending-farmers.component.html',
  styleUrls: ['./site-pending-farmers.component.css']
})
export class SitePendingFarmersComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(private siteService: SiteService,
              private router: Router, private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private modal: NgbModal, private formBuilder: UntypedFormBuilder, private messageService: MessageService) {
    super();
    this.parameters = {
      length: 25,
      start: 0,
      draw: 1
    };
  }

  farmers = [];
  maxSize = 9;
  showData = false;
  order = 'foreName';
  reverse = true;
  directionLinks = true;
  filterForm: UntypedFormGroup;
  title = 'temporary farmers';
  i: number;
  parameters: any;
  config: any;
  autoHide = false;
  responsive = true;
  labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };
  siteId: string;
  site: any;
  loading = true;
  searchFields = [
    {value: 'phone_number', name: 'phone number'},
    {value: 'nid', name: 'NID'},
    {value: 'foreName', name: 'first name'},
    {value: 'surname', name: 'last name'},
  ];

  static initializePaginationParameters(parameters: any) {
    parameters.length = 25;
    parameters.start = 0;
    parameters.draw = 1;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.siteId = params['siteId'.toString()];
      this.siteService.get(params['siteId'.toString()]).subscribe(data => {
        this.site = data.content;
      });
    });
    this.parameters.siteId = this.siteId;
    this.getFarmers();
    this.filterForm = this.formBuilder.group({
      term: ['', Validators.minLength(3)],
      searchBy: ['foreName']
    });
    this.message = this.messageService.getMessage();
  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event > 1) {
      this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }
    this.siteService.getSitePendingFarmers(this.parameters)
      .subscribe(data => {
        this.farmers = data.data;
      });
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  onFilter() {
    if (this.filterForm.valid) {
      this.loading = true;
      this.parameters['search'.toString()] = this.filterForm.value;
      SitePendingFarmersComponent.initializePaginationParameters(this.parameters);
      this.siteService.getSitePendingFarmers(this.parameters)
        .subscribe(data => {
          this.farmers = data.data;
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: data.recordsTotal
          };
          this.loading = false;
          this.clear();
        }, (err) => {
          this.loading = false;
          this.setError(err.errors);
        });
    }
  }

  ngOnDestroy(): void {
    this.messageService.clearMessage();
  }

  onClearFilter() {
    this.filterForm.controls.term.reset();
    delete this.parameters.search;
    this.loading = true;
    this.clear();
    this.siteService.getSitePendingFarmers(this.parameters)
      .subscribe(data => {
        this.farmers = data.data;
        this.loading = false;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
      });
  }

  getFarmers() {
    this.loading = true;
    this.siteService.getSitePendingFarmers(this.parameters)
      .subscribe(data => {
        this.farmers = data.data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
        this.clear();
        this.showData = true;
        this.loading = false;
      });
  }
}
