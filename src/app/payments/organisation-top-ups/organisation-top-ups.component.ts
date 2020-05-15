import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {BasicComponent} from '../../core/library';
import {Subject} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthorisationService, ConfirmDialogService, MessageService, OrganisationService} from '../../core/services';
import {SelectDeliveriesComponent} from '../organisation-pay-farmers/select-deliveries/select-deliveries.component';

@Component({
  selector: 'app-organisation-top-ups',
  templateUrl: './organisation-top-ups.component.html',
  styleUrls: ['./organisation-top-ups.component.css']
})
export class OrganisationTopUpsComponent extends BasicComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(private route: ActivatedRoute,
              private modal: NgbModal,
              private messageService: MessageService,
              private authorisationService: AuthorisationService,
              private confirmDialogService: ConfirmDialogService,
              private organisationService: OrganisationService) {
    super();
  }

  transactions: any;
  accountBalance: number;
  organisationId: string;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  org: any;

  ngOnInit() {
    this.accountBalance = 4000000;
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
        mode: 'Mobile',
        channel: 'MTN',
        payer: 'CWS Manager',
        transactionNumber: 'T-123451',
        amount: 1000000,
        status: 'success',
        date: '2020-04-29 13:34:33'
      },
      {
        mode: 'Bank Deposit',
        channel: 'BK',
        payer: 'CWS Manager',
        transactionNumber: 'T-123452',
        amount: 2000000,
        status: 'success',
        date: '2020-04-29 13:34:33'
      },
      {
        mode: 'Bank Deposit',
        channel: 'BK',
        payer: 'CWS Manager',
        transactionNumber: 'T-123453',
        amount: 1000000,
        status: 'success',
        date: '2020-04-29 13:34:33'
      }
    ];
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  payFarmers() {
    this.modal.open(SelectDeliveriesComponent, {size: 'lg'});
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
