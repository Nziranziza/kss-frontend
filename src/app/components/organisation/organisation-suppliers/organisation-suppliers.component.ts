import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  AuthenticationService,
  AuthorisationService,
  ExcelServicesService,
  MessageService,
  OrganisationService,
  UserService
} from '../../../core/services';
import {ActivatedRoute} from '@angular/router';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs';
import {ParchmentReportDetailComponent} from '../../reports/parchment-report/parchment-report-detail/parchment-report-detail.component';
import {BasicComponent} from '../../../core/library';
import {DatePipe} from '@angular/common';
import {SupplierDeliveriesComponent} from './supplier-deliveries/supplier-deliveries.component';

@Component({
  selector: 'app-organisation-suppliers',
  templateUrl: './organisation-suppliers.component.html',
  styleUrls: ['./organisation-suppliers.component.css']
})
export class OrganisationSuppliersComponent extends BasicComponent implements OnInit, OnDestroy {
  cwsDashes: any;

  constructor(private organisationService: OrganisationService, private userService: UserService,
              private authenticationService: AuthenticationService,
              private excelService: ExcelServicesService,
              private route: ActivatedRoute,
              private datePipe: DatePipe,
              private formBuilder: UntypedFormBuilder,
              private messageService: MessageService,
              private modal: NgbModal, private authorisationService: AuthorisationService) {
    super();
  }

  suppliers: any;
  organisationId: string;
  cherriesTotalQty = 0;
  owedAmount = 0;
  totalCost = 0;
  fromFilterDate: Date | string = '';
  toFilterDate: Date | string = '';
  // @ts-ignore
  loading = false;
  isUserCWSOfficer = true;
  isUserCeparOfficer = true;
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
  filterForm: UntypedFormGroup;
  showData = false;
  parameters: any;
  errors = [];
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
    this.seasonStartingTime = this.authenticationService.getCurrentSeason().created_at;
    this.route.params.subscribe((params) => {
      if (!params['organisationId'.toString()]) {
        this.route.parent.params.subscribe((params) => {
          this.organisationId = params['organisationId'.toString()];
          this.cwsDashes = 'hello';
        });
      } else {
        this.organisationId = params['organisationId'.toString()];
      }
    });
    this.route.queryParams.subscribe(params => {
      this.toFilterDate = params['to'.toString()] ? new Date(params['to'.toString()])
        : this.datePipe.transform(new Date(), 'yyyy-MM-dd', 'GMT+2');
      this.fromFilterDate = params['from'.toString()] ? new Date(params['from'.toString()]) :
        this.datePipe.transform(this.seasonStartingTime, 'yyyy-MM-dd', 'GMT+2');
      this.parameters = {
        status: 'supplied',
        org_id: this.organisationId,
        date: {
          from: this.fromFilterDate,
          to: this.toFilterDate
        }
      };
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.isUserCeparOfficer = this.authorisationService.isCeparUser();
    this.filterForm = this.formBuilder.group({
      status: [{value: 'supplied', disabled: this.isUserCeparOfficer}, Validators.required],
      search: this.formBuilder.group({
        term: ['', Validators.minLength(3)],
        searchBy: ['forename']
      }),
      date: this.formBuilder.group({
        from: [this.fromFilterDate, Validators.required],
        to: [this.toFilterDate, Validators.required],
      })
    });
    this.subRegionFilter = {
      location: {
        searchBy: 'cws',
        cws_id: this.organisationId
      },

      date: {
        from: this.fromFilterDate ? this.fromFilterDate : this.seasonStartingTime,
        to: this.toFilterDate ? this.toFilterDate : new Date()
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
      /*
      if (this.filterForm.getRawValue().search.term) {
        this.parameters.search = this.filterForm.getRawValue().search;
      } else {
        delete this.parameters.search;
      }
      */
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

  viewDeliveries(regNumber: string) {
    const modalRef = this.modal.open(SupplierDeliveriesComponent, {size: 'lg'});
    const parameters = JSON.parse(JSON.stringify(this.parameters));
    delete parameters.search;
    parameters.regNumber = regNumber;
    modalRef.componentInstance.parameters = parameters;
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
        if (!this.isUserCeparOfficer) {
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
        } else {
            this.printable.push({
            LastName: farmer.userInfo.surname,
            FirstName: farmer.userInfo.foreName,
            RegNumber: farmer.userInfo.regNumber,
            Season: delivery.season.name,
            CherriesType: delivery.cherriesType,
            Qty: delivery.cherriesQty,
            RecordedBy: delivery.recordedBy ? delivery.recordedBy.foreName + ' ' + delivery.recordedBy.surname : '',
            Date: this.datePipe.transform(delivery.created_at,
              'yyyy-MM-dd', 'GMT+2')
          });
        }
      });
    });
  }

  ngOnDestroy(): void {
  }
}
