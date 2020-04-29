import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  AuthenticationService,
  AuthorisationService,
  ExcelServicesService,
  MessageService,
  OrganisationService,
  UserService
} from '../../core/services';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs';
import {ParchmentReportDetailComponent} from '../../parchment/parchment-report/parchment-report-detail/parchment-report-detail.component';
import {BasicComponent} from '../../core/library';
import {DatePipe} from '@angular/common';
import {SupplierDeliveriesComponent} from './supplier-deliveries/supplier-deliveries.component';
import {del} from 'selenium-webdriver/http';

@Component({
  selector: 'app-organisation-suppliers',
  templateUrl: './organisation-suppliers.component.html',
  styleUrls: ['./organisation-suppliers.component.css']
})
export class OrganisationSuppliersComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(private organisationService: OrganisationService, private userService: UserService,
              private authenticationService: AuthenticationService,
              private excelService: ExcelServicesService,
              private route: ActivatedRoute,
              private datePipe: DatePipe,
              private formBuilder: FormBuilder,
              private messageService: MessageService,
              private modal: NgbModal, private authorisationService: AuthorisationService) {
    super();
  }

  suppliers: any;
  organisationId: string;
  cherriesTotalQty = 0;
  owedAmount = 0;
  totalCost = 0;
  // @ts-ignore
  loading = false;
  isUserCWSOfficer = true;
  org: any;
  currentSeason: any;
  orgCoveredArea = [];
  printable = [];
  cwsSummary = {
    totalCherries: 0,
    totalParchments: 0,
    expectedParchments: 0,
  };
  subRegionFilter: any;
  seasonStartingTime: string;
  filterForm: FormGroup;
  maxSize = 9;
  order = 'userInfo.foreName';
  reverse = true;
  directionLinks = true;
  showData = false;
  parameters: any;
  config: any;
  autoHide = false;
  responsive = false;
  errors = [];
  labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };
  searchFields = [
    {value: 'reg_number', name: 'registration number'},
    {value: 'forename', name: 'first name'},
    {value: 'surname', name: 'last name'},
    {value: 'groupname', name: 'group name'}
  ];
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.seasonStartingTime = this.authenticationService.getCurrentSeason().created_at;
    this.parameters = {
      status: 'supplied',
      org_id: this.organisationId,
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
    this.subRegionFilter = {
      location: {
        searchBy: 'cws',
        cws_id: this.organisationId
      },
      date: {
        from: this.seasonStartingTime,
        to: new Date()
      }
    };
    this.getSuppliers();
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.organisationService.get(this.organisationId).subscribe(data => {
      this.org = data.content;
    });
    this.organisationService.getCwsSummary(this.organisationId).subscribe(data => {
      if (data.content.length) {
        this.cwsSummary = data.content[0];
      }
    });
    this.setMessage(this.messageService.getMessage());
    this.orgCoveredArea = this.route.snapshot.data.orgCoveredAreaData;
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.onChangeFarmerStatusFilter();
  }

  onFilter() {
    if (this.filterForm.valid) {
      this.loading = true;
      /*if (this.filterForm.getRawValue().search.term) {
        this.parameters.search = this.filterForm.getRawValue().search;
      } else {
        delete this.parameters.search;
      }*/
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
        this.cherriesTotalQty = 0;
        this.owedAmount = 0;
        this.totalCost = 0;
        this.updateSuppliers();
      }
    );
  }

  getSuppliers(): void {
    this.loading = true;
    this.organisationService.getSuppliers(this.parameters)
      .subscribe(data => {
        this.suppliers = data.content;
        this.makePrintable();
        this.dtTrigger.next();
        this.loading = false;
        this.updateStatistics();
      });
  }

  showProduction() {
    const modalRef = this.modal.open(ParchmentReportDetailComponent, {size: 'lg'});
    modalRef.componentInstance.location = this.subRegionFilter;
  }

  viewDeliveries(supplier: any) {
    const modalRef = this.modal.open(SupplierDeliveriesComponent, {size: 'lg'});
    modalRef.componentInstance.supplier = supplier;
  }

  exportAsXLSX() {
    this.excelService.exportAsExcelFile(this.printable, 'Deliveries');
  }

  updateSuppliers() {
    this.loading = false;
    this.organisationService.getSuppliers(this.parameters)
      .subscribe(data => {
        this.suppliers = data.content;
        this.makePrintable();
        this.loading = false;
        this.updateStatistics();
      }, (err) => {
        this.loading = false;
        this.errors = err.errors;
      });
  }

  updateStatistics() {
    this.suppliers.map((farmer) => {
      farmer.deliveries.map((delivery) => {
        this.cherriesTotalQty = this.cherriesTotalQty + delivery.cherriesQty;
        this.owedAmount = this.owedAmount + delivery.owedAmount;
        this.totalCost = this.totalCost + (+delivery.cherriesQty * +delivery.unitPerKg);
      });
    });
  }

  makePrintable() {
    this.printable = [];
    this.suppliers.map((farmer) => {
      farmer.deliveries.map((delivery) => {
        this.printable.push({
          LastName: farmer.userInfo.surname,
          FirstName: farmer.userInfo.foreName,
          RegNumber: farmer.userInfo.regNumber,
          PaymentStatus: delivery.paymentStatus,
          PaidAmount: delivery.paidAmount,
          DeliveryApproval: delivery.deliveryApproval,
          Season: delivery.season.name,
          CherriesType: delivery.cherriesType,
          Qty: delivery.cherriesQty,
          UnitPrice: delivery.unitPerKg,
          OwedAmount: delivery.owedAmount,
          RecordedBy: delivery.recordedBy ? delivery.recordedBy.foreName + ' ' + delivery.recordedBy.surname : '',
          Date: this.datePipe.transform(delivery.created_at,
            'yyyy-MM-dd', 'GMT+2')
        });
      });
    });
  }

  ngOnDestroy(): void {
  }
}
