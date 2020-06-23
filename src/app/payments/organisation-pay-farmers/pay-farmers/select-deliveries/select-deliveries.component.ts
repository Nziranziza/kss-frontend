import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService, OrganisationService, UserService} from '../../../../core/services';
import {DatePipe} from '@angular/common';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {Router} from '@angular/router';
import {DataTableDirective} from 'angular-datatables';
import {PaymentProcessingService} from '../../../../core/services/payment-processing.service';
import {PaymentService} from '../../../../core/services/payment.service';
import {BasicComponent} from '../../../../core/library';

@Component({
  selector: 'app-select-deliveries',
  templateUrl: './select-deliveries.component.html',
  styleUrls: ['./select-deliveries.component.css']
})

export class SelectDeliveriesComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(private organisationService: OrganisationService, private userService: UserService,
              private authenticationService: AuthenticationService,
              private datePipe: DatePipe, private formBuilder: FormBuilder,
              private paymentService: PaymentService,
              private paymentProcessingService: PaymentProcessingService,
              private router: Router) {
    super();
  }

  suppliers: any;
  // @ts-ignore
  org: any;
  currentSeason: any;
  seasonStartingTime: string;
  filterForm: FormGroup;
  parameters: any;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  statistics = {
    owedAmount: 0,
    totalAmountToPay: 0,
    totalCost: 0,
    cherriesTotalQty: 0,
    selectedFarmers: 0
  };
  allSelected = false;
  paymentChannels: any;

  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  ngOnInit() {
    this.seasonStartingTime = this.authenticationService.getCurrentSeason().created_at;
    this.parameters = {
      status: 'supplied',
      org_id: this.authenticationService.getCurrentUser().info.org_id,
      date: {
        from: this.seasonStartingTime,
        to: new Date()
      },
      paymentChannel: 1
    };

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      columns: [{}, {}, {}, {}, {}, {class: 'all'}, {}],
      responsive: true
    };

    this.filterForm = this.formBuilder.group({
      status: ['supplied', Validators.required],
      paymentChannel: [1, Validators.required],
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
    this.getSuppliers();
    this.getPaymentChannels();
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.onChangeFarmerStatusFilter();
    this.onChangePaymentChannelFilter();
  }

  onFilter() {
    if (this.filterForm.valid) {
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
    this.parameters.paymentChannel = 1;
    this.parameters.status = 'supplied';
    this.filterForm.controls.status.setValue('supplied');
    this.filterForm.controls.paymentChannel.setValue(1);
    this.updateSuppliers();
  }

  onChangeFarmerStatusFilter() {
    this.filterForm.controls.status.valueChanges.subscribe(
      (value) => {
        this.parameters.status = value;
        this.filterForm.controls.search.get('term'.toString()).reset();
        delete this.parameters.search;
        this.updateSuppliers();
      }
    );
  }

  onChangePaymentChannelFilter() {
    this.filterForm.controls.paymentChannel.valueChanges.subscribe(
      (value) => {
        this.parameters.paymentChannel = value;
        this.filterForm.controls.search.get('term'.toString()).reset();
        delete this.parameters.search;
        this.updateSuppliers();
      }
    );
  }

  getSuppliers(): void {
    if (!this.paymentProcessingService.getSelectedDeliveries()) {
      this.organisationService.getSuppliers(this.parameters)
        .subscribe(data => {
          this.suppliers = data.content;
          this.updateStatistics();
          this.dtTrigger.next();
        });
    } else {
      this.suppliers = this.paymentProcessingService.getSelectedDeliveries();
      this.filterForm.patchValue(this.paymentProcessingService.getSelectionFilter());
      this.statistics = this.paymentProcessingService.getSelectionStatistics();
      setTimeout(function() {
        this.dtTrigger.next();
      }.bind(this));
    }
  }

  updateSuppliers() {
    this.organisationService.getSuppliers(this.parameters)
      .subscribe(data => {
        this.suppliers = data.content;
        this.paymentProcessingService.setSelectionFilter(this.filterForm.getRawValue());
        this.paymentProcessingService.setSelectedDeliveries(this.suppliers);
        this.rerender();
        this.updateStatistics();
      }, (err) => {
        if (err.status === 400) {
          this.setWarning('Payments not found!');
          this.suppliers = undefined;
        }
      });
  }

  selectAll(isChecked: boolean) {
    if (isChecked) {
      this.suppliers.forEach((supplier) => {
        supplier.selected = true;
        supplier.deliveries.forEach((delivery) => {
          delivery.selected = true;
        });
      });
    } else {
      this.suppliers.forEach((supplier) => {
        supplier.selected = false;
        supplier.deliveries.forEach((delivery) => {
          delivery.selected = false;
        });
      });
    }
    this.allSelected = isChecked;
    this.updateStatistics();
    this.rerender();
  }

  selectFarmer(isChecked: boolean, i: number) {
    this.suppliers[i].selected = isChecked;
    if (isChecked) {
      this.suppliers[i].deliveries.forEach((delivery) => {
        delivery.selected = true;
      });
    } else {
      this.suppliers[i].deliveries.forEach((delivery) => {
        delivery.selected = false;
      });
    }
    this.updateStatistics();
    this.rerender();
  }

  selectDelivery(isChecked: boolean, i: number, t: number) {
    this.suppliers[i].deliveries[t].selected = isChecked;
    this.suppliers[i].selected = false;
    this.suppliers[i].deliveries.forEach((delivery) => {
      if (delivery.selected) {
        this.suppliers[i].selected = true;
      }
    });
    this.updateStatistics();
    this.rerender();
  }

  onNext() {
    this.paymentProcessingService.setSelectionFilter(this.filterForm.getRawValue());
    this.paymentProcessingService.setSelectedDeliveries(this.suppliers);
    this.router.navigateByUrl('admin/pay-farmers/preview-deliveries');
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
    this.allSelected = false;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getPaymentChannels() {
    this.paymentService.listChannelsConstants().subscribe((data) => {
      this.paymentChannels = Object.keys(data.content).map(key => {
        return {channel: key, _id: data.content[key]};
      });
    });
  }

  updateStatistics() {
    this.statistics.owedAmount = 0;
    this.statistics.totalAmountToPay = 0;
    this.statistics.totalCost = 0;
    this.statistics.cherriesTotalQty = 0;
    this.statistics.selectedFarmers = 0;
    this.suppliers.map((farmer) => {
      farmer.deliveries.map((delivery) => {
        this.statistics.owedAmount = this.statistics.owedAmount + delivery.owedAmount;
        if (delivery.selected) {
          this.statistics.totalAmountToPay = this.statistics.totalAmountToPay + delivery.owedAmount;
          this.statistics.cherriesTotalQty = this.statistics.cherriesTotalQty + delivery.cherriesQty;
        }
        this.statistics.totalCost = this.statistics.totalCost + (+delivery.cherriesQty * +delivery.unitPerKg);
      });
      if (farmer.selected) {
        this.statistics.selectedFarmers++;
      }
    });
    this.paymentProcessingService.setSelectionStatistics(this.statistics);
  }
}
