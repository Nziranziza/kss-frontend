import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
  AuthenticationService,
  AuthorisationService,
  ConfirmDialogService,
  MessageService,
  SiteService
} from '../../../../core/services';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Farmer} from '../../../../core/models';
import {FarmerDetailsComponent} from '../../../farmer/farmer-details/farmer-details.component';
import {BasicComponent} from '../../../../core/library';
import {isArray, isObject} from 'util';

@Component({
  selector: 'app-site-farmers',
  templateUrl: './site-farmers.component.html',
  styleUrls: ['./site-farmers.component.css']
})
export class SiteFarmersComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(private siteService: SiteService,
              private authenticationService: AuthenticationService,
              private router: Router, private  confirmDialogService: ConfirmDialogService,
              private authorisationService: AuthorisationService,
              private route: ActivatedRoute,
              private modal: NgbModal, private formBuilder: FormBuilder, private messageService: MessageService) {
    super();
    this.parameters = {
      length: 25,
      start: 0,
      draw: 1
    };
  }
  filterForm: FormGroup;
  maxSize = 9;
  order = 'userInfo.foreName';
  reverse = true;
  directionLinks = true;
  farmers = [];
  showData = false;
  title = 'Farmers';
  id = 'farmers-list';
  parameters: any;
  config: any;
  autoHide = false;
  responsive = false;
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
    {value: 'reg_number', name: 'registration number'},
    {value: 'nid', name: 'NID'}
  ];

  static initializePaginationParameters(parameters: any) {
    parameters.length = 25;
    parameters.start = 0;
    parameters.draw = 1;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.siteId = params['siteId'.toString()];
      this.siteService.get(params['siteId'.toString()]).subscribe(data => {
        this.site = data.content;
      });
    });
    this.parameters.siteId = this.siteId;
    this.filterForm = this.formBuilder.group({
      term: ['', Validators.minLength(3)],
      searchBy: ['reg_number']
    });
    this.getFarmers();
    this.setMessage(this.messageService.getMessage());
  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event >= 1) {
      this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }
    this.siteService.getSiteFarmers(this.parameters)
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
      SiteFarmersComponent.initializePaginationParameters(this.parameters);
      this.siteService.getSiteFarmers(this.parameters)
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
          if (err.status === 404) {
            this.setWarning(err.errors[0]);
          } else {
            this.setError(err.errors);
          }
        });
    }
  }

  onClearFilter() {
    this.filterForm.controls.term.reset();
    delete this.parameters.search;
    this.clear();
    this.siteService.getSiteFarmers(this.parameters)
      .subscribe(data => {
        this.farmers = data.data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
        this.clear();
      }, (err) => {
        if (err.status === 404) {
          this.setWarning(err.errors[0]);
        } else {
          this.setError(err.errors);
        }
      });
  }

  viewDetails(farmer: Farmer) {
    const modalRef = this.modal.open(FarmerDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
  }

  getFarmers() {
    this.loading = true;
    this.siteService.getSiteFarmers(this.parameters)
      .subscribe(data => {
        this.farmers = data.data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
        this.showData = true;
        this.loading = false;
        this.clear();
      }, (err) => {
        if (err.status === 404) {
          this.setWarning(err.errors[0]);
        } else {
          this.setError(err.errors);
        }
      });
  }

  hasRequest(farmer: any) {
    if (isArray(farmer.request)) {
      if (farmer.request.length < 0) {
        return false;
      }
    } else {
      return isObject(farmer.request);
    }
  }

  ngOnDestroy(): void {
    this.messageService.clearMessage();
  }
}
