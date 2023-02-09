import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthenticationService, SmsService } from "src/app/core";
import { ScrollStrategy } from '@angular/cdk/overlay';
import { omitBy, isNil } from 'lodash';
import moment from 'moment'
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

type TabName = 'sms-history' | 'sms-orders-history';

@Component({
  selector: "app-sms-dashboard",
  templateUrl: "./sms-dashboard.component.html",
  styleUrls: ["./sms-dashboard.component.css"],
})
export class SmsDashboardComponent implements OnInit {
  constructor(
    private modalService: NgbModal,
    private smsService: SmsService,
    private formBuilder: UntypedFormBuilder,
    private authenticationService: AuthenticationService
  ) {}
  createOrder: UntypedFormGroup;
  smsOrders: any[] = [];
  smsBalance: any = { balance: 0, rate: 10 };
  smsHistory: any = {
    meta: {
      summary: [],
    },
  };
  statuses = {
    DELIVERED: "DELIVERED",
    FAILED: "FAILED",
    PENDING: "PENDING",
    UNREACHABLE: "UNREACHABLE",
    REJECTED: "REJECTED",
  };
  statusesArray: string[] = Object.keys(this.statuses);
  activeTab: TabName = "sms-history";
  scrollStrategy: ScrollStrategy;
  filterForm: UntypedFormGroup;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  smsHistoryLoading = false;
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  ngOnInit(): void {
    this.createOrder = this.formBuilder.group({
      smsQuantity: ["", Validators.required],
      email: ["", Validators.required],
    });
    this.createOrder.controls.email.setValue(
      this.authenticationService.getCurrentUser().info.email
    );
    this.filterForm = this.formBuilder.group({
      status: "",
      dateRange: [],
    });
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10
    };
    this.getBalance();
    this.getOrders();
    this.smsService
      .getSmsHistory({ limit: 1000 })
      .subscribe(({ data }) => {
        this.smsHistory = {
          ...data,
          meta: {
            ...data?.meta,
            summary: !this.filterForm.value.status
              ? this.reduceSummary(data?.meta?.summary)
              : this.smsHistory?.meta?.summary,
          },
        };
        this.smsHistoryLoading = false;
        this.dtTrigger.next();
      });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  reduceSummary(summary = []) {
    return summary.reduce(
      (acc, curr) => {
        switch (curr.status) {
          case this.statuses.DELIVERED:
            return {
              ...acc,
              delivered: acc.delivered + curr.count,
            };
          case this.statuses.FAILED:
          case this.statuses.REJECTED:
          case this.statuses.UNREACHABLE:
            return {
              ...acc,
              failed: acc.failed + curr.count,
            };
          case this.statuses.PENDING:
            return {
              ...acc,
              pending: acc.pending + curr.count,
            };
        }
      },
      {
        failed: 0,
        delivered: 0,
        pending: 0,
      }
    )
  }

  getBalance(): any {
    this.smsService
      .getBalance(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe((data) => {
        this.smsBalance = data.data;
      });
  }

  getOrders() {
    this.smsService
      .allOrder(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe((data) => {
        this.smsOrders = data.data;
      });
  }

  getSmsHistory(filters: any = {}) {
    this.smsHistoryLoading = true
    return this.smsService
      .getSmsHistory({ ...filters, limit: 1000 })
      .subscribe(({ data }) => {
        this.smsHistory = {
          ...data,
          meta: {
            ...data?.meta,
            summary: !filters?.status
              ? this.reduceSummary(data?.meta?.summary)
              : this.smsHistory?.meta?.summary,
          },
        };
        this.smsHistoryLoading = false;
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next();
          this.smsHistoryLoading = false;
        });
      });
  }

  orderSms(): void {
    if (this.createOrder.valid) {
      let body = {
        ext_sender_id: this.authenticationService.getCurrentUser().info.org_id,
        credits: this.createOrder.value.smsQuantity,
        email: this.createOrder.value.email,
      };

      this.smsService.createOrder(body).subscribe((data) => {
        this.createOrder.reset();
        this.getOrders();
        this.getBalance();
      });
    }
  }

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: "modal-basic-title" });
  }

  onChangeTab(name: TabName) {
    this.activeTab = name;
  }

  getSMSHistoryByStatus(status: string) {
    this.filterForm.setValue({ ...this.filterForm.value, status })
    this.getSmsHistory({
      status
    })
  }

  onSubmit() {
    const { status, dateRange = [] } = omitBy(this.filterForm.value, isNil);
    const [start, end] = dateRange;
    this.getSmsHistory(
      omitBy(
        {
          status: status || undefined,
          start: start ? moment(start).format("YYYY-MM-DD") : undefined,
          end: end ? moment(end).format("YYYY-MM-DD") : undefined,
        },
        isNil
      )
    );
  }
}
