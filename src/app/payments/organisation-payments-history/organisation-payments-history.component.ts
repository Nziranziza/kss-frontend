import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthenticationService, AuthorisationService, ConfirmDialogService, MessageService, OrganisationService} from '../../core/services';
import {Subject} from 'rxjs';
import {BasicComponent} from '../../core/library';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataTableDirective} from 'angular-datatables';
import {DatePipe} from '@angular/common';
import {PaymentService} from '../../core/services/payment.service';

@Component({
  selector: 'app-organisation-payments-history',
  templateUrl: './organisation-payments-history.component.html',
  styleUrls: ['./organisation-payments-history.component.css']
})
export class OrganisationPaymentsHistoryComponent extends BasicComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(private route: ActivatedRoute,
              private modal: NgbModal,
              private messageService: MessageService,
              private authorisationService: AuthorisationService,
              private datePipe: DatePipe,
              private formBuilder: FormBuilder,
              private paymentService: PaymentService,
              private authenticationService: AuthenticationService,
              private confirmDialogService: ConfirmDialogService,
              private organisationService: OrganisationService) {
    super();
  }

  transactions: any;
  totalPayments: number;
  organisationId: string;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  org: any;
  currentSeason: any;
  seasonStartingTime: string;
  filterForm: FormGroup;
  parameters: any;
  paymentChannels: any;
  maxSize = 9;
  order = 'userInfo.foreName';
  reverse = true;
  directionLinks = true;
  message: string;
  showData = false;
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
  searchFields = [
    {value: 'reg_number', name: 'registration number'},
    {value: 'nid', name: 'NID'},
    {value: 'forename', name: 'first name'},
    {value: 'surname', name: 'last name'},
    {value: 'groupname', name: 'group name'}
  ];

  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.organisationService.get(this.organisationId).subscribe(data => {
      this.org = data.content;
    });
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.message = this.messageService.getMessage();

    this.seasonStartingTime = this.authenticationService.getCurrentSeason().created_at;
    this.totalPayments = 0;
    this.parameters = {
      date: {
        from: this.seasonStartingTime,
        to: new Date()
      },
      length: 25,
      start: 0,
      draw: 1
    };

    this.filterForm = this.formBuilder.group({
      status: ['', Validators.required],
      paymentChannel: ['', Validators.required],
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
    this.getTransactions();
    this.getPaymentChannels();
    this.onChangeFarmerStatusFilter();
    this.onChangePaymentChannelFilter();
  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event >= 1) {
      this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }
    this.updateHistory();
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }
  onFilter() {
    if (!this.filterForm.getRawValue().search.term) {
      delete this.parameters.search;
    }
    this.parameters.date = this.filterForm.getRawValue().date;
    this.updateHistory();
  }

  onClearFilter() {
    this.filterForm.controls.date.get('from'.toString()).setValue(this.datePipe.transform(this.seasonStartingTime,
      'yyyy-MM-dd', 'GMT+2'));
    this.filterForm.controls.date.get('to'.toString()).setValue(this.datePipe.transform(new Date(), 'yyyy-MM-dd',
      'GMT+2'));
    this.parameters.date.from = this.datePipe.transform(this.seasonStartingTime,
      'yyyy-MM-dd', 'GMT+2');
    this.parameters.date.to = this.datePipe.transform(new Date(),
      'yyyy-MM-dd', 'GMT+2');
    this.updateHistory();
  }

  onChangeFarmerStatusFilter() {
    this.filterForm.controls.status.valueChanges.subscribe(
      (value) => {
        this.parameters.status = value;
        this.filterForm.controls.search.reset();
        this.filterForm.controls.paymentChannel.reset();
        delete this.parameters.search;
        this.updateHistory();
      }
    );
  }

  onChangePaymentChannelFilter() {
    this.filterForm.controls.paymentChannel.valueChanges.subscribe(
      (value) => {
        this.parameters.paymentChannel = value;
        this.filterForm.controls.paymentChannel.reset();
        this.filterForm.controls.search.reset();
        delete this.parameters.search;
        this.updateHistory();
      }
    );
  }

  getTransactions() {
    this.paymentService.getPaymentHistory(this.parameters)
      .subscribe(data => {
        this.transactions = data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
      }, (err) => {
        if (err.status === 404) {
          this.transactions = undefined;
        }
      });
  }

  getPaymentChannels() {
    this.paymentService.listChannelsConstants().subscribe((data) => {
      this.paymentChannels = Object.keys(data.content).map(key => {
        return {channel: key, _id: data.content[key]};
      });
    });
  }

  updateHistory() {
    this.paymentService.getPaymentHistory(this.parameters)
      .subscribe(data => {
        this.transactions = data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
      }, (err) => {
        if (err.status === 404) {
          this.setWarning('Payments not found!');
          this.transactions = undefined;
        }
      });
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

}
