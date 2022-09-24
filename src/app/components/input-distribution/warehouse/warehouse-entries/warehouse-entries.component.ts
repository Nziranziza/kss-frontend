import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthorisationService, SeasonService, SiteService} from '../../../../core/services';
import {Router} from '@angular/router';
import {InputDistributionService} from '../../../../core/services';
import {HelperService} from '../../../../core/helpers';
import {WarehouseService} from '../../../../core/services';
import {AuthenticationService} from '../../../../core/services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DeliveryDetailsComponent} from './delivery-details/delivery-details.component';
import {DatePipe} from '@angular/common';
import {constant} from '../../../../../environments/constant';
import {BasicComponent} from '../../../../core/library';

@Component({
  selector: 'app-warehouse-entries',
  templateUrl: './warehouse-entries.component.html',
  providers: [DatePipe],
  styleUrls: ['./warehouse-entries.component.css']
})
export class WarehouseEntriesComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private siteService: SiteService, private modal: NgbModal,
              private authenticationService: AuthenticationService,
              private authorizationService: AuthorisationService,
              private router: Router, private inputDistributionService: InputDistributionService,
              private helper: HelperService,
              private datePipe: DatePipe,
              private seasonService: SeasonService,
              private warehouseService: WarehouseService) {
    super();
  }

  recordEntriesForm: FormGroup;
  season: any;
  filterEntriesForm: FormGroup;
  errors: any;
  message: any;
  isTypePesticide = false;
  types = [
    {
      name: 'fertilizer',
      value: 'Fertilizer'
    },
    {
      name: 'pesticide',
      value: 'Pesticide'
    }
  ];
  entries: any;
  currentDate: any;
  package: any;
  showAddPackageButton = false;
  pesticideTypes: any;
  fertilizer: any;
  supplier: any;
  totalQty = 0;
  stocks: any;
  canAddEntry = false;

  ngOnInit() {
    this.currentDate = new Date();
    this.getCurrentSeason();
    this.recordEntriesForm = this.formBuilder.group({
      deliveryDetails: this.formBuilder.group({
        driver: [''],
        driverPhoneNumber: [''],
        vehiclePlate: [''],
        package: new FormArray([]),
        totalQty: [''],
        date: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd', 'GMT+2'), Validators.required],
      }),
      inputType: [''],
      supplierId: ['']
    });
    this.canAddEntry = this.authorizationService.isTechouseUser() ||
      this.authorizationService.isNaebWareHouseOfficer() || this.authorizationService.isCeparUser();
    this.filterEntriesForm = this.formBuilder.group({
      entriesFilter: ['all', Validators.required],
    });
    this.onChange();
    this.getEntries();
    this.getStocks(constant.stocks.WAREHOUSE);
  }

  onChange() {
    this.recordEntriesForm.get('inputType'.toString()).valueChanges.subscribe(
      (value) => {
        this.package = (this.recordEntriesForm.controls.deliveryDetails.get('package') as FormArray);

        while (this.package.length !== 0) {
          this.package.removeAt(0);
        }
        this.isTypePesticide = value === 'Pesticide';
        if (!this.isTypePesticide) {
          if (this.recordEntriesForm.value.deliveryDetails.package.length === 0) {
            this.addPackageFertilizer();
          }
          this.showAddPackageButton = true;
        } else {
          if (this.recordEntriesForm.value.deliveryDetails.package.length === 0) {
            this.addPackagePesticide();
          }
          this.showAddPackageButton = true;
        }
      });
    this.formPackage.valueChanges.subscribe((values) => {
      this.totalQty = 0;
      values.forEach((value) => {
        if (this.isTypePesticide) {
          if (value.qty !== '') {
            this.totalQty = this.totalQty + (+value.qty);
          }
        } else {
          if (value.bagSize && value.numberOfBags) {
            this.totalQty = this.totalQty + (+value.bagSize) * (+value.numberOfBags);
          }
        }
      });
      this.recordEntriesForm.controls.deliveryDetails.get('totalQty').setValue(this.totalQty);
    });
  }

  onChangePackageQty(index: number) {
    if (!this.isTypePesticide) {
      const value = this.formPackage.value[index];
      const subTotal = (+value.bagSize) * (+value.numberOfBags);
      this.getPackageFormGroup(index).controls['subTotal'.toString()].setValue(subTotal);
    }
  }

  onChangePackage(index: number) {
    const value = this.formPackage.value[index];
    let removed = false;
    if (!this.isTypePesticide) {
      this.formPackage.value.forEach((el, i) => {
        if (((value.bagSize) === el.bagSize) && (this.formPackage.value.length > 1) && (i !== index)) {
          this.removePackage(index);
          removed = true;
        }
      });
      if (!removed) {
        const subTotal = (+value.bagSize) * (+value.numberOfBags);
        this.getPackageFormGroup(index).controls['subTotal'.toString()].setValue(subTotal);
      }
    } else {
      this.formPackage.value.forEach((el, i) => {
        if ((value.pesticideType === el.pesticideType) && (this.formPackage.value.length > 1) && (i !== index)) {
          this.removePackage(index);
        }
      });
    }
  }

  get formPackage() {
    return this.recordEntriesForm.controls.deliveryDetails.get('package') as FormArray;
  }

  addPackageFertilizer() {
    (this.recordEntriesForm.controls.deliveryDetails.get('package') as FormArray).push(this.createPackageFertilizer());
  }

  addPackagePesticide() {
    (this.recordEntriesForm.controls.deliveryDetails.get('package') as FormArray).push(this.createPackagePesticide());
  }

  removePackage(index: number) {
    (this.recordEntriesForm.controls.deliveryDetails.get('package') as FormArray).removeAt(index);
  }

  getPackageFormGroup(index): FormGroup {
    this.package = this.recordEntriesForm.controls.deliveryDetails.get('package') as FormArray;
    return this.package.controls[index] as FormGroup;
  }

  createPackageFertilizer(): FormGroup {
    return this.formBuilder.group({
      bagSize: ['', Validators.required],
      numberOfBags: ['', Validators.required],
      subTotal: ['', Validators.required]
    });
  }

  createPackagePesticide(): FormGroup {
    return this.formBuilder.group({
      pesticideType: ['', Validators.required],
      qty: ['', Validators.required]
    });
  }

  onSubmit() {
    const entry = JSON.parse(JSON.stringify(this.recordEntriesForm.value));
    const date = this.datePipe.transform(this.recordEntriesForm.value.deliveryDetails.date, 'yyyy-MM-dd', 'GMT+2');
    const packages = [];
    if (entry.inputType === 'Pesticide') {
      entry.deliveryDetails.package.map((item) => {
        packages.push({
          inputId: item.pesticideType,
          items: 1,
          quantityPerItem: +item.qty
        });
      });
    } else {
      entry.deliveryDetails.package.map((item) => {
        packages.push({
          inputId: this.fertilizer._id,
          items: +item.numberOfBags,
          quantityPerItem: +item.bagSize
        });
      });
    }
    entry.deliveryDetails.receivedBy = this.authenticationService.getCurrentUser().info._id;
    if (!this.season.seasonParams.supplierId[0]) {
      this.setError('Please set the season supplier before record any entry');
    }
    entry.deliveryDetails.package = packages;
    entry.deliveryDetails.date = date;
    delete entry.deliveryDetails.totalQty;
    this.warehouseService.saveEntry(entry)
      .subscribe(() => {
          this.setMessage('Entry successfully recorded!');
          this.warehouseService.allEntries().subscribe((data) => {
            this.entries = data.content;
          });
          this.recordEntriesForm.reset();
          this.recordEntriesForm.controls.deliveryDetails.get('date')
            .setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd', 'GMT+2'));
          this.getStocks(constant.stocks.WAREHOUSE);
        },
        (err) => {
          this.setError(err.errors);
        });
  }

  getEntries() {
    this.warehouseService.allEntries().subscribe((data) => {
      this.entries = data.content;
    });
  }

  deliveryDetails(details, type, wareHouseId) {
    const modalRef = this.modal.open(DeliveryDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.deliveries = details;
    modalRef.componentInstance.inputType = type;
    modalRef.componentInstance.wareHouseId = wareHouseId;
    modalRef.result.finally(() => {
      this.getStocks(constant.stocks.WAREHOUSE);
    });
  }

  getStocks(stock: number) {
    this.inputDistributionService.getStock(stock).subscribe((data) => {
      this.stocks = data.content;
    });
  }

  getCurrentSeason() {
    this.seasonService.all().subscribe((dt) => {
      const seasons = dt.content;
      seasons.forEach((item) => {
        if (item.isCurrent) {
          this.season = item;
          this.fertilizer = this.season.seasonParams.inputName;
          this.supplier = this.season.seasonParams.supplierId;
          this.pesticideTypes = this.season.seasonParams.pesticide;
        }
      });
    });
  }
}
