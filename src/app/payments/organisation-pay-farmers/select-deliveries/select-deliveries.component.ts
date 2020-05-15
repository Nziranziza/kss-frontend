import {Component, OnInit, OnDestroy, Inject, PLATFORM_ID, Injector} from '@angular/core';
import {
  AuthenticationService,
  MessageService,
  OrganisationService,
  UserService
} from '../../../core/services';

import {DatePipe, isPlatformBrowser} from '@angular/common';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-select-deliveries',
  templateUrl: './select-deliveries.component.html',
  styleUrls: ['./select-deliveries.component.css']
})

export class SelectDeliveriesComponent implements OnInit, OnDestroy {

  constructor(private organisationService: OrganisationService, private userService: UserService,
              private authenticationService: AuthenticationService,
              private datePipe: DatePipe,
              private formBuilder: FormBuilder,
              private messageService: MessageService,
              @Inject(PLATFORM_ID) private platformId: object,
              private injector: Injector) {
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  modal: NgbActiveModal;
  suppliers: any;
  organisationId: string;
  // @ts-ignore
  org: any;
  currentSeason: any;
  seasonStartingTime: string;
  filterForm: FormGroup;
  maxSize = 9;
  order = 'userInfo.foreName';
  reverse = true;
  directionLinks = true;
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
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  ngOnInit() {
    this.seasonStartingTime = this.authenticationService.getCurrentSeason().created_at;
    this.parameters = {
      status: 'supplied',
      org_id: this.authenticationService.getCurrentUser().info.org_id,
      date: {
        from: this.seasonStartingTime,
        to: new Date()
      }
    };
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.filterForm = this.formBuilder.group({
      status: ['supplied', Validators.required],
      search: this.formBuilder.group({
        term: ['', Validators.minLength(3)],
        searchBy: ['forename']
      }),
      date: this.formBuilder.group({
        from: [this.datePipe.transform(this.seasonStartingTime,
          'yyyy-MM-dd', 'GMT+2'), Validators.required],
        to: [this.datePipe.transform(new Date(), 'yyyy-MM-dd', 'GMT+2'), Validators.required],
      })
    });
    this.getSuppliers();
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.onChangeFarmerStatusFilter();
  }

  onFilter() {
    if (this.filterForm.valid) {
      delete this.parameters.search;
      this.parameters.date = this.filterForm.getRawValue().date;
      this.updateSuppliers();
    }
  }

  onClearFilter() {
    this.filterForm.controls.search.get('term'.toString()).reset();
    this.filterForm.controls.date.get('from'.toString()).setValue(this.datePipe.transform(this.seasonStartingTime,
      'yyyy-MM-dd', 'GMT+2'));
    this.filterForm.controls.date.get('to'.toString()).setValue(this.datePipe.transform(new Date(), 'yyyy-MM-dd',
      'GMT+2'));
    this.parameters.date.from = this.datePipe.transform(this.seasonStartingTime,
      'yyyy-MM-dd', 'GMT+2');
    this.parameters.date.to = this.datePipe.transform(new Date(),
      'yyyy-MM-dd', 'GMT+2');
    delete this.parameters.search;
    this.updateSuppliers();
  }

  onChangeFarmerStatusFilter() {
    this.filterForm.controls.status.valueChanges.subscribe(
      (value) => {
        this.parameters.status = value;
        this.filterForm.controls.search.get('term'.toString()).reset();
        delete this.parameters.search;
        this.updateSuppliers();
      }
    );
  }

  getSuppliers(): void {
    this.organisationService.getSuppliers(this.parameters)
      .subscribe(data => {
        this.suppliers = data.content;
        this.dtTrigger.next();
      });
  }

  updateSuppliers() {
    this.organisationService.getSuppliers(this.parameters)
      .subscribe(data => {
        this.suppliers = data.content;
      }, (err) => {
        console.log(err.errors);
      });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
