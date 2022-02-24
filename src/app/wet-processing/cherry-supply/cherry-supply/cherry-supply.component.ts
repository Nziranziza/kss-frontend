import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {HelperService} from '../../../core/helpers';
import {AuthenticationService, CherrySupplyService, ConfirmDialogService, UserService} from '../../../core/services';
import {Subject} from 'rxjs';
import {DatePipe, Location} from '@angular/common';
import {DataTableDirective} from 'angular-datatables';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PaySingleFarmerComponent} from '../../../payments/organisation-pay-farmers/pay-single-farmer/pay-single-farmer.component';

@Component({
  selector: 'app-cherry-supply',
  templateUrl: './cherry-supply.component.html',
  styleUrls: ['./cherry-supply.component.css']
})
export class CherrySupplyComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(private formBuilder: FormBuilder, private cherrySupplyService: CherrySupplyService,
              private route: ActivatedRoute,
              private confirmDialogService: ConfirmDialogService,
              private userService: UserService,
              private datePipe: DatePipe,
              private modal: NgbModal,
              private router: Router, private helper: HelperService,
              private location: Location, private authenticationService: AuthenticationService) {
  }

  recordCherryDeliveryForm: FormGroup;
  filterSuppliesForm: FormGroup;
  paySuppliesForm: FormGroup;
  errors: any;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  cherrySupplies = [];
  totalAmountToPay = 0;
  paymentDeliveryIds = [];
  farmerUserId: string;
  regNumber: string;
  message: string;
  organisationId: string;
  currentDate: any;

  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  ngOnInit() {
    this.currentDate = new Date();
    this.recordCherryDeliveryForm = this.formBuilder.group({
      cherriesQty: ['', Validators.required],
      cherriesType: ['standard', Validators.required],
      unitPerKg: [this.authenticationService.getCurrentSeason().seasonParams.cherriesUnitPrice, Validators.required],
      cherriesSupplyDate: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd', 'Africa/Cairo'), Validators.required]
    });
    this.filterSuppliesForm = this.formBuilder.group({
      suppliesFilter: ['all', Validators.required],
    });
    this.paySuppliesForm = this.formBuilder.group({
      paidAmount: [0, [Validators.required, Validators.min(1)]],
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      columns: [{}, {}, {}, {}, {}, {}, {}, {}, {
        class: 'none'
      }, {}, {}, {}],
      responsive: true
    };
    this.organisationId = this.authenticationService.getCurrentUser().info.org_id;
    this.route.params.subscribe(params => {
      this.farmerUserId = params['userId'.toString()];
    });
    this.route.params.subscribe(params => {
      this.regNumber = params['regNumber'.toString()];
    });
    this.onChange();
  }

  onSaveSupply() {
    if (this.recordCherryDeliveryForm.valid) {
      const record = this.recordCherryDeliveryForm.value;
      record['org_id'.toString()] = this.organisationId;
      record['regNumber'.toString()] = this.regNumber;
      record['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.cherrySupplyService.saveDelivery(record)
        .subscribe(() => {
            this.getFarmerSupplies(record['org_id'.toString()], record['regNumber'.toString()]);
            this.message = 'Cherries recorded successfully!';
            this.errors = '';
          },
          (err) => {
            this.message = '';
            this.errors = err.errors;
          });
    } else {
      this.message = '';
      this.errors = this.helper.getFormValidationErrors(this.recordCherryDeliveryForm);
    }
  }

  ngAfterViewInit(): void {
    this.cherrySupplyService.getFarmerDeliveries(this.organisationId, this.regNumber).subscribe((data) => {
      this.cherrySupplies = data.content;
      this.dtTrigger.next();
    });
  }

  onSavePay() {
    if (this.paySuppliesForm.valid) {
      if (this.paymentDeliveryIds.length < 1) {
        this.errors = ['Please select at least one record'];
        return;
      }
      const record = JSON.parse(JSON.stringify(this.paySuppliesForm.value));
      record['deliveryIds'.toString()] = this.paymentDeliveryIds;
      record['regNumber'.toString()] = this.regNumber;
      record['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.helper.cleanObject(record);
      const modalRef = this.modal.open(PaySingleFarmerComponent, {size: 'sm'});
      modalRef.componentInstance.paymentData = record;
      modalRef.componentInstance.farmerUserId = this.farmerUserId;
      modalRef.result.finally(() => {
        // this.getFarmerSupplies(this.organisationId, this.regNumber);
        window.location.reload();
      });
    } else {
      this.message = '';
      this.errors = this.helper.getFormValidationErrors(this.paySuppliesForm);
    }
  }

  getFarmerSupplies(organisationId: string, regNumber: string): void {
    this.cherrySupplyService.getFarmerDeliveries(organisationId, regNumber).subscribe((data) => {
      this.cherrySupplies = data.content;
      this.rerender();
      this.draw();
    });
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  selectSupply(isChecked: boolean, supply: any) {
    if (isChecked) {
      this.totalAmountToPay = this.totalAmountToPay + supply.owedAmount;
      this.paymentDeliveryIds.push(supply._id);
    } else {
      this.totalAmountToPay = this.totalAmountToPay - supply.owedAmount;
      this.paymentDeliveryIds.splice(this.paymentDeliveryIds.indexOf(supply._id), 1);
    }
    this.paySuppliesForm.controls.paidAmount.setValue(this.totalAmountToPay);
  }

  cancelSupply(supplyId: string): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to cancel this supply? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          const body = {
            userId: this.authenticationService.getCurrentUser().info._id,
            supplyId
          };
          this.cherrySupplyService.cancelSupply(body).subscribe((data) => {
            this.message = data.message;
            this.getFarmerSupplies(this.organisationId, this.regNumber);
          }, (err) => {
            this.message = '';
            this.errors = err.errors;
          });
        }
      });
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.totalAmountToPay = 0;
      this.paySuppliesForm.controls.paidAmount.setValue(0);
      dtInstance.destroy();
    });
  }

  draw(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
    });
  }

  onChange() {

    this.recordCherryDeliveryForm.controls.cherriesType.valueChanges.subscribe((value) => {
      if (value === 'flottant') {
        this.recordCherryDeliveryForm.controls.unitPerKg
          .patchValue(this.authenticationService.getCurrentSeason().seasonParams.floatingUnitPrice);
      } else if (value === 'standard') {
        this.recordCherryDeliveryForm.controls.unitPerKg
          .patchValue(this.authenticationService.getCurrentSeason().seasonParams.cherriesUnitPrice);
      } else {
        this.recordCherryDeliveryForm.controls.unitPerKg.reset();
      }
    });
  }

  onCancel() {
    this.location.back();
  }

  withPendingApproval(payments: any) {
    return (payments.findIndex((element) => !element.approval)) !== -1;
  }
}
