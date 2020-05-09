import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthorisationService, ConfirmDialogService, MessageService, OrganisationService} from '../../core/services';
import {Subject} from 'rxjs';
import {BasicComponent} from '../../core/library';

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

  ngOnInit() {
    this.totalPayments = 40000;
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.getTransactions();
    this.organisationService.get(this.organisationId).subscribe(data => {
      this.org = data.content;
    });
    this.message = this.messageService.getMessage();
  }

  getTransactions() {
    this.transactions = [
      {
        regNumber: 'bb084567',
        mode: 'single',
        channel: 'MTN',
        payer: 'CWS Manager',
        transactionNumber: 'T-123451',
        amount: 10000,
        status: 'success',
        date: '2020-04-29 13:34:33'
      },
      {
        regNumber: 'bb084567',
        mode: 'bulk',
        channel: 'Ikofi',
        payer: 'CWS Manager',
        transactionNumber: 'T-123452',
        amount: 20000,
        status: 'success',
        date: '2020-04-29 13:34:33'
      },
      {
        regNumber: 'bb084567',
        mode: 'single',
        channel: 'Airtel',
        payer: 'CWS Manager',
        transactionNumber: 'T-123453',
        amount: 10000,
        status: 'success',
        date: '2020-04-29 13:34:33'
      }
    ];
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

}
