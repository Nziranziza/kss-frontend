import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthenticationService, AuthorisationService, ConfirmDialogService, MessageService, OrganisationService} from '../../../core';
import {BasicComponent} from '../../../core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {PaymentService} from '../../../core/services/payment.service';
import {PaymentHistoryDetailsComponent} from './payment-history-details/payment-history-details.component';
import {HelperService} from '../../../core';

@Component({
  selector: 'app-organisation-payments-history',
  templateUrl: './organisation-payments-history.component.html',
  styleUrls: ['./organisation-payments-history.component.css']
})
export class OrganisationPaymentsHistoryComponent extends BasicComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute,
              private modal: NgbModal,
              private messageService: MessageService,
              private authorisationService: AuthorisationService,
              private datePipe: DatePipe,
              private formBuilder: UntypedFormBuilder,
              private helper: HelperService,
              private paymentService: PaymentService,
              private authenticationService: AuthenticationService,
              private confirmDialogService: ConfirmDialogService,
              private organisationService: OrganisationService) {
    super();
  }

  payments: any = {
    1: []
  };
  totalPayments: number;
  organisationId: string;
  org: any;
  currentSeason: any;
  seasonStartingTime: string;
  filterForm: UntypedFormGroup;
  parameters: any = {
    page: 1,
    limit: 25
  };
  paymentChannels: any;
  maxSize = 9;
  order = 'transaction.regNumber';
  reverse = true;
  directionLinks = true;
  message: string;
  showData = false;
  config: any;
  autoHide = false;
  responsive = false;
  loading = true;
  labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };
  searchFields = [
    {value: 'reg_number', name: 'registration number'},
    {value: 'nid', name: 'nid'},
    {value: 'foreName', name: 'first name/group name'},
    {value: 'surname', name: 'last name'}
  ];
  status: any;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
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
      limit: 25,
      page: 1,
    };

    if (this.authorisationService.isCWSAdmin()) {
      this.parameters.org_id = this.organisationId;
    }

    this.filterForm = this.formBuilder.group({
      status: ['', Validators.required],
      paymentChannel: ['', Validators.required],
      search: this.formBuilder.group({
        term: ['', Validators.minLength(3)],
        searchBy: ['foreName']
      }),
      date: this.formBuilder.group({
        from: [this.datePipe.transform(this.seasonStartingTime,
          'yyyy-MM-dd', 'GMT+2'), Validators.required],
        to: [this.datePipe.transform(new Date(), 'yyyy-MM-dd', 'GMT+2'), Validators.required],
      })
    });
    this.message = this.messageService.getMessage();
    this.getPaymentChannels();
    this.onChangeFarmerStatusFilter();
    this.onChangePaymentChannelFilter();
    this.getTransactions();
    this.getPaymentsStatus();
  }

  onPageChange(event) {
    this.parameters = {
      ...this.parameters,
      page: Number(event)
    }
    if(!this.payments[Number(event)]) {
      this.payments = {
        ...this.payments,
        [Number(event)]: []
      }
      this.updateHistory();
    } else {
      this.config = {
        ...this.config,
        currentPage: Number(event),
      }
    }
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  onFilter() {
    if (this.filterForm.getRawValue().search.term === '') {
      delete this.parameters.search;
    } else {
      this.parameters.search = this.filterForm.getRawValue().search;
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
    delete this.parameters.search;
    this.filterForm.controls.search.get('term').reset();
    this.updateHistory();
  }

  onChangeFarmerStatusFilter() {
    this.filterForm.controls.status.valueChanges.subscribe(
      (value) => {
        this.config = {
          ...this.config,
          currentPage: 1
        }
        if (value === '') {
          const { status, ...restParams } = this.parameters;
          this.parameters = {
            ...restParams,
            page: 1
          }
        } else {
          this.parameters = {
            ...this.parameters,
            status: Number(value)
          }
        }
        this.filterForm.controls.search.reset();
        this.filterForm.controls.search.get('searchBy').setValue('foreName');
        delete this.parameters.search;
        this.updateHistory();
      }
    );
  }

  onChangePaymentChannelFilter() {
    this.filterForm.controls.paymentChannel.valueChanges.subscribe(
      (value) => {
        this.config = {
          ...this.config,
          currentPage: 1
        }
        if (value === '') {
          const { paymentChannel, ...restParams } = this.parameters;
          this.parameters = {
            ...restParams,
            page: 1
          }
        } else {
          this.parameters = {
            ...this.parameters,
            paymentChannel: Number(value),
            page: 1
          }
        }
        this.filterForm.controls.search.reset();
        this.filterForm.controls.search.get('searchBy').setValue('foreName');
        delete this.parameters.search;
        this.updateHistory();
      }
    );
  }

  getTransactions() {
    this.loading = true;
    this.paymentService.getPaymentTransactions(this.parameters)
      .subscribe(({ data, meta }) => {
        this.payments = {
          ...this.payments,
          [meta?.page]: data
        };
        this.showData = true;
        this.config = {
          itemsPerPage: meta?.pageSize,
          currentPage: meta?.page,
          totalItems: meta?.total
        };
        this.loading = false;
      }, (err) => {
        if (err.status === 404) {
          this.payments = undefined;
        }
      });
  }

  getPaymentChannels() {
    this.paymentService.listChannelsConstants().subscribe((data) => {
      this.paymentChannels = Object.keys(data.content).map(key => {
        return {channel: key, _id: data.content[key]};
      });
      this.paymentChannels = this.helper.getFarmersAllPossibleReceivingPaymentChannels(this.paymentChannels);
    });
  }

  updateHistory() {
    this.loading = true;
    this.paymentService.getPaymentTransactions(this.parameters)
      .subscribe(({ data, meta }) => {
        this.payments = {
          ...this.payments,
          [meta?.page]: data
        };
        this.config = {
          itemsPerPage: meta?.pageSize,
          currentPage: meta?.page,
          totalItems: meta?.total
        };
        this.loading = false;
      }, (err) => {
        if (err.status === 404) {
          this.setWarning('Payments not found!');
          this.payments = undefined;
        } else {
          this.setError(err.errors);
        }
      });
  }

  getPaymentsStatus() {
    const object = {
      PENDING: 0,
      SUCCESS: 1,
      FAILED: 2,
      REJECTED: 3
    };
    this.status = Object.keys(object).map(key => {
      return {name: key, value: object[key]};
    });
  }

  viewDeliveries(regNumber: string, paidDeliveries: any) {
    const modalRef = this.modal.open(PaymentHistoryDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.regNumber = regNumber;
    modalRef.componentInstance.deliveries = paidDeliveries;
  }

  viewStatus(value: number) {
    return this.status.find(el => el.value === value).name;
  }

  ngOnDestroy(): void {
    this.messageService.clearMessage();
  }
}
