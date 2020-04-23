import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {HelperService} from '../../core/helpers';
import {CherrySupplyService, ConfirmDialogService} from '../../core/services';
import {Subject} from 'rxjs';
import {AuthenticationService} from '../../core/services';
import {Location} from '@angular/common';
import {DataTableDirective} from 'angular-datatables';

@Component({
  selector: 'app-cherry-supply',
  templateUrl: './cherry-supply.component.html',
  styleUrls: ['./cherry-supply.component.css']
})
export class CherrySupplyComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(private formBuilder: FormBuilder, private cherrySupplyService: CherrySupplyService,
              private route: ActivatedRoute,
              private confirmDialogService: ConfirmDialogService,
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
  regNumber: string;
  message: string;
  organisationId: string;

  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  ngOnInit() {
    this.recordCherryDeliveryForm = this.formBuilder.group({
      cherriesQty: ['', Validators.required],
      cherriesType: ['standard', Validators.required],
      unitPerKg: [this.authenticationService.getCurrentSeason().seasonParams.cherriesUnitPrice, Validators.required]
    });
    this.filterSuppliesForm = this.formBuilder.group({
      suppliesFilter: ['all', Validators.required],
    });
    this.paySuppliesForm = this.formBuilder.group({
      paidAmount: ['', [Validators.required, Validators.min(1)]],
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
      this.regNumber = params['regNumber'.toString()];
    });
    this.onChangeFarmerSuppliesFilter();
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
      this.cherrySupplyService.paySupplies(record)
        .subscribe(() => {
            this.getFarmerSupplies(this.organisationId, this.regNumber);
            this.errors = '';
            this.message = 'Successful payment!';
          },
          (err) => {
            this.message = '';
            this.errors = err.errors;
          });
    } else {
      this.message = '';
      this.errors = this.helper.getFormValidationErrors(this.paySuppliesForm);
    }
  }

  onChangeFarmerSuppliesFilter() {
    this.filterSuppliesForm.get('suppliesFilter'.toString()).valueChanges.subscribe(
      (value) => {
        switch (value) {
          case 'unapproved_delivery': {
            this.cherrySupplyService.getFarmerUnapprovedDeliveries(this.organisationId, this.regNumber)
              .subscribe((data) => {
                this.cherrySupplies = data.content;
                this.rerender();
              });
            break;
          }
          case 'unpaid_delivery': {
            this.cherrySupplyService.getFarmerUnpaidDeliveries(this.organisationId, this.regNumber)
              .subscribe((data) => {
                this.cherrySupplies = data.content;
                this.rerender();
              });
            break;
          }
          case 'unapproved_payment': {
            this.cherrySupplyService.getFarmerUnapprovedPayment(this.organisationId, this.regNumber)
              .subscribe((data) => {
                this.cherrySupplies = data.content;
                this.rerender();
              });
            break;
          }
          default: {
            this.getFarmerSupplies(this.organisationId, this.regNumber);
          }
        }
      }
    );

    this.recordCherryDeliveryForm.get('cherriesType'.toString()).valueChanges.subscribe(
      (value) => {
        switch (value) {
          case 'flottant': {
            this.recordCherryDeliveryForm.get('unitPerKg'.toString())
              .setValue(this.authenticationService.getCurrentSeason().seasonParams.floatingUnitPrice);
            break;
          }
          default: {
            this.recordCherryDeliveryForm.get('unitPerKg'.toString())
              .setValue(this.authenticationService.getCurrentSeason().seasonParams.cherriesUnitPrice);
          }
        }
      }
    );
  }

  getFarmerSupplies(organisationId: string, regNumber: string): void {
    this.cherrySupplyService.getFarmerDeliveries(organisationId, regNumber).subscribe((data) => {
      this.cherrySupplies = data.content;
      this.rerender();
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
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  onCancel() {
    this.location.back();
  }
}
