import { ActivatedRoute } from '@angular/router';
import { AuthorisationService } from './../../../core/services/authorisation.service';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'src/app/core';
import { PaymentService } from './../../../core/services/payment.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: "app-payments-history",
  templateUrl: "./payments-history.component.html",
  styleUrls: ["./payments-history.component.css"],
})
export class PaymentsHistoryComponent implements OnInit {
  warning: string;
  errors: string;
  message: string;
  histories: any[] = [];
  organisationId: string;
  parameters: any = {
    length: 25,
    start: 0,
    draw: 1,
  };

  constructor(
    private paymentService: PaymentService,
    private authenticationService: AuthenticationService,
    private modal: NgbModal,
    private authorisationService: AuthorisationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
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
    this.paymentService
      .getPaymentHistory(this.parameters)
      .subscribe(({ data }) => {
        this.histories = data;
      });
  }

  viewDetails(payment: any) {
    const modalRef = this.modal.open(PaymentDetailsComponent, { size: "md", centered: true });
    modalRef.componentInstance.payment = payment;
  }
}
