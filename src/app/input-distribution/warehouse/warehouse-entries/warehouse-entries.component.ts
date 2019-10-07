import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SiteService} from '../../../core/services';
import {Router} from '@angular/router';
import {InputDistributionService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {WarehouseService} from '../../../core/services';
import {Subject} from 'rxjs';
import {AuthenticationService} from '../../../core/services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DeliveryDetailsComponent} from './delivery-details/delivery-details.component';
import {DatePipe} from '@angular/common';
import {constant} from '../../../../environments/constant';

@Component({
  selector: 'app-warehouse-entries',
  templateUrl: './warehouse-entries.component.html',
  providers: [DatePipe],
  styleUrls: ['./warehouse-entries.component.css']
})
export class WarehouseEntriesComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private siteService: SiteService, private modal: NgbModal,
              private authenticationService: AuthenticationService,
              private router: Router, private inputDistributionService: InputDistributionService,
              private helper: HelperService,
              private datePipe: DatePipe,
              private warehouseService: WarehouseService) {
  }

  recordEntriesForm: FormGroup;
  filterEntriesForm: FormGroup;
  errors = [];
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
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;
  currentDate: any;
  kgPerBag: number;
  mlPerJerrycan: number;
  package: any;
  showAddPackageButton = false;
  pesticideTypes: any;
  fertilizer: any;
  supplier: any;
  totalQty = 0;

  ngOnInit() {
    this.currentDate = new Date();
    this.recordEntriesForm = this.formBuilder.group({
      deliveryDetails: this.formBuilder.group({
        driver: [''],
        driverPhoneNumber: [''],
        vehiclePlate: [''],
        package: new FormArray([]),
        totalQty: [''],
        date: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'), Validators.required],
      }),
      inputType: [''],
      supplierId: ['']
    });
    this.kgPerBag = constant.kgPerBag;
    this.mlPerJerrycan = constant.mlPerJerrycan;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.filterEntriesForm = this.formBuilder.group({
      entriesFilter: ['all', Validators.required],
    });

    this.pesticideTypes = this.authenticationService.getCurrentSeason().seasonParams.pesticide;

    this.fertilizer = this.authenticationService.getCurrentSeason().seasonParams.inputName;
    this.supplier = this.authenticationService.getCurrentSeason().seasonParams.supplier;
    this.onChangeEntriesFilter();
    this.onChange();
    this.getEntries();
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

  onChangePackage(index: number) {
    let value;
    if (!this.isTypePesticide) {
      value = this.formPackage.value[index];
      const subTotal = (+value.bagSize) * (+value.numberOfBags);
      this.getPackageFormGroup(index).controls['subTotal'.toString()].setValue(subTotal);
    }
  }

  onChangeEntriesFilter() {
    this.filterEntriesForm.get('entriesFilter'.toString()).valueChanges.subscribe(
      (value) => {
        switch (value) {
          case 'Fertilizer': {
            this.warehouseService.getEntries(value)
              .subscribe((data) => {
                this.entries = data.content;
              });
            break;
          }
          case 'Pesticide': {
            this.warehouseService.getEntries(value)
              .subscribe((data) => {
                this.entries = data.content;
              });
            break;
          }
          default: {
            this.warehouseService.allEntries()
              .subscribe((data) => {
                this.entries = data.content;
              });
          }
        }
      });
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
    const packages = [];
    if (entry.inputType === 'Pesticide') {
      entry.deliveryDetails.package.map((item) => {
        packages.push({
          inputId: item.pesticideType,
          items: 1,
          quantityPerItem: entry.deliveryDetails.totalQty
        });
      });
    } else {
      entry.deliveryDetails.package.map((item) => {
        packages.push({
          inputId: this.fertilizer._id,
          items: item.numberOfBags,
          quantityPerItem: entry.deliveryDetails.totalQty
        });
      });
    }
    entry.deliveryDetails.receivedBy = this.authenticationService.getCurrentUser().info._id;
    console.log(this.authenticationService.getCurrentSeason().seasonParams);
    entry.supplierId = this.authenticationService.getCurrentSeason().seasonParams.supplierId[0]._id;
    entry.deliveryDetails.package = packages;
    delete entry.deliveryDetails.date;
    delete entry.deliveryDetails.totalQty;
    this.warehouseService.saveEntry(entry)
      .subscribe(() => {
          this.message = 'Entry successfully recorded!';
          this.errors = [];
          this.warehouseService.allEntries().subscribe((data) => {
            this.entries = data.content;
          });
          this.recordEntriesForm.reset();
          this.recordEntriesForm.controls.deliveryDetails.get('date').setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
        },
        (err) => {
          this.message = '';
          this.errors = err.errors;
        });
  }

  getEntries() {
    this.loading = true;
    this.warehouseService.allEntries().subscribe((data) => {
      this.loading = false;
      this.entries = data.content;
      this.dtTrigger.next();
    });
  }

  deliveryDetails(details, type) {
    const modalRef = this.modal.open(DeliveryDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.deliveries = details;
    modalRef.componentInstance.inputType = type;
    modalRef.result.finally(() => {
    });
  }
}
