import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthorisationService } from './../../../core/services/authorisation.service';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService, HelperService } from 'src/app/core';
import { PaymentService } from './../../../core/services/payment.service';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: "app-payments-history",
  templateUrl: "./payments-history.component.html",
  styleUrls: ["./payments-history.component.css"],
})
export class PaymentsHistoryComponent implements OnInit {
  warning: string;
  errors: string;
  message: string;
  histories: any = {
    1: []
  };
  organisationId: string;
  directionLinks = true;
  responsive = false;
  autoHide = false;
  loading = false;
  parameters: any = {
    limit: 25,
    page: 1,
  };
  config: any = {
    currentPage: 1,
    itemsPerPage: 25,
    totalItems: 0
  };
  maxSize = 9;
  labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`,
  };
  filterForm: UntypedFormGroup;
  searchFields = [
    {value: 'reg_number', name: 'Registration number'},
    {value: 'foreName', name: 'First name/group name'},
    {value: 'surname', name: 'Last name'}
  ];
  statuses = ['PENDING', 'SUCCESS', 'FAILED', 'REJECTED'];
  paymentChannels: any;

  constructor(
    private paymentService: PaymentService,
    private authenticationService: AuthenticationService,
    private modal: NgbModal,
    private authorisationService: AuthorisationService,
    private route: ActivatedRoute,
    private helper: HelperService,
    private datePipe: DatePipe,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.filterForm = this.formBuilder.group({
      status: ['', Validators.required],
      paymentChannel: ['', Validators.required],
      search: this.formBuilder.group({
        term: ['', Validators.minLength(3)],
        searchBy: ['foreName']
      }),
      date: this.formBuilder.group({
        from: [this.datePipe.transform(this.authenticationService.getCurrentSeason().created_at,
          'yyyy-MM-dd', 'GMT+2'), Validators.required],
        to: [this.datePipe.transform(new Date(), 'yyyy-MM-dd', 'GMT+2'), Validators.required],
      })
    });
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.parameters = {
      ...this.parameters,
      date: {
        from: this.authenticationService.getCurrentSeason().created_at,
        to: new Date(),
      },
    };
    if (this.authorisationService.isCWSAdmin()) {
      this.parameters.org_id = this.organisationId;
    }
    this.getPayments()
    this.getPaymentChannels()
    this.onChangeFarmerStatusFilter();
    this.onChangePaymentChannelFilter();
  }

  viewDetails(payment: any) {
    const modalRef = this.modal.open(PaymentDetailsComponent, { size: "md", centered: true });
    modalRef.componentInstance.payment = payment;
  }

  getPayments() {
    this.loading = true;
    this.paymentService
      .getPaymentHistory(this.parameters)
      .subscribe(({ data, meta }) => {
        this.histories = {
          ...this.histories,
          [meta?.page]: data
        };
        this.config = {
          itemsPerPage: meta?.pageSize,
          currentPage: meta?.page,
          totalItems: meta?.total
        }
        this.loading = false;
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

  onPageChange(page: string) {
    this.parameters = {
      ...this.parameters,
      page: Number(page)
    }
    if (!this.histories[Number(page)]) {
      this.histories = {
        ...this.histories,
        [Number(page)]: []
      };
      this.getPayments()
    } else {
      this.config = {
        ...this.config,
        currentPage: Number(page)
      }
    }
  }

  onClearFilter() {
    const seasonStartingTime = this.authenticationService.getCurrentSeason().created_at;
    this.filterForm.controls.date.get('from'.toString()).setValue(this.datePipe.transform(seasonStartingTime,
      'yyyy-MM-dd', 'GMT+2'));
    this.filterForm.controls.date.get('to'.toString()).setValue(this.datePipe.transform(new Date(), 'yyyy-MM-dd',
      'GMT+2'));
    this.parameters.date.from = this.datePipe.transform(seasonStartingTime,
      'yyyy-MM-dd', 'GMT+2');
    this.parameters.date.to = this.datePipe.transform(new Date(),
      'yyyy-MM-dd', 'GMT+2');
    delete this.parameters.search;
    this.filterForm.controls.search.get('term').reset();
    this.getPayments();
  }

  onFilter() {
    if (this.filterForm.getRawValue().search.term === '') {
      delete this.parameters.search;
    } else {
      this.parameters.search = this.filterForm.getRawValue().search;
    }
    this.parameters.date = this.filterForm.getRawValue().date;
    this.getPayments();
  }

  onChangeFarmerStatusFilter() {
    this.filterForm.controls.status.valueChanges.subscribe(
      (value) => {
        this.histories = {
          1: []
        }
        this.config = {
          ...this.config,
          currentPage: 1,
          totalItems: 0
        }
        if (value === '') {
          const { status, ...restParams } = this.parameters;
          this.parameters = {
            ...restParams,
            page: 1
          };
        } else {
          this.parameters = {
            ...this.parameters,
            status: Number(value),
            page: 1
          };
        }
        this.filterForm.controls.search.reset();
        this.filterForm.controls.search.get('searchBy').setValue('foreName');
        delete this.parameters.search;
        this.getPayments();
      }
    );
  }

  onChangePaymentChannelFilter() {
    this.filterForm.controls.paymentChannel.valueChanges.subscribe(
      (value) => {
        this.config = {
          ...this.config,
          currentPage: 1,
          totalItems: 0
        }
        if (value === '') {
          const { paymentChannel, ...restParams } = this.parameters;
          this.parameters = {
            ...restParams,
            page: 1
          };
        } else {
          this.parameters = {
            ...this.parameters,
            paymentChannel: Number(value),
            page: 1
          };
        }
        this.filterForm.controls.search.reset();
        this.filterForm.controls.search.get('searchBy').setValue('foreName');
        delete this.parameters.search;
        this.getPayments();
      }
    );
  }
}
