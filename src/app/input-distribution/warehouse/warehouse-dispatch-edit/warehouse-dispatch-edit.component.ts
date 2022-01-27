import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
  AuthenticationService,
  ConfirmDialogService,
  InputDistributionService, LocationService,
  SeasonService,
  SiteService,
  WarehouseService
} from '../../../core/services';
import {Router} from '@angular/router';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import {HelperService} from '../../../core/helpers';
import {Subject} from 'rxjs';
import {BasicComponent} from '../../../core/library';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-warehouse-dispatch-edit',
  templateUrl: './warehouse-dispatch-edit.component.html',
  styleUrls: ['./warehouse-dispatch-edit.component.css']
})
export class WarehouseDispatchEditComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private siteService: SiteService,
              private warehouseService: WarehouseService,
              private router: Router, private confirmDialogService: ConfirmDialogService,
              private seasonService: SeasonService,
              private wareHouseService: WarehouseService,
              private datePipe: DatePipe, private authenticationService: AuthenticationService,
              private inputDistributionService: InputDistributionService,
              private helper: HelperService, private locationService: LocationService,
              @Inject(PLATFORM_ID) private platformId: object,
              private injector: Injector) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  modal: NgbActiveModal;
  updateDispatchForm: FormGroup;
  filterForm: FormGroup;
  sites: any;
  provinces: any;
  districts: any;
  @Input() id;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;
  includeFertilizer = false;
  includePesticide = false;
  currentDate: any;
  packagePesticide: any;
  packageFertilizer: any;
  totalQtyFertilizer = 0;
  totalQtyPesticide = 0;
  stocks: any;
  fertilizerStocks: any;
  pesticideStocks: any;
  season: any;
  dispatch: any;

  ngOnInit() {
    this.currentDate = new Date();
    this.updateDispatchForm = this.formBuilder.group({
      entries: this.formBuilder.group({
        driver: [''],
        driverPhoneNumber: [''],
        vehiclePlate: [''],
        vehicleModel: [''],
        date: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd', 'GMT+2'), Validators.required],
        packageFertilizer: new FormArray([]),
        packagePesticide: new FormArray([]),
        totalQtyPesticide: [0],
        totalQtyFertilizer: [0]
      }),
      siteId: [''],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: ['']
      })
    });
    this.initial();
    this.onChanges();
    this.getStocks(1);
    this.getCurrentSeason();
    this.inputDistributionService.getDispatch(this.id).subscribe(data => {
      this.dispatch = data.content;
      this.locationService.getDistricts(this.dispatch.destinationSite.location.prov_id._id).subscribe((districts) => {
        this.districts = districts;
        this.updateDispatchForm.controls.location.get('prov_id').setValue(this.dispatch.destinationSite.location.prov_id._id);
        this.updateDispatchForm.controls.location.get('dist_id').setValue(this.dispatch.destinationSite.location.dist_id._id);
        this.updateDispatchForm.controls.siteId.setValue(this.dispatch.destinationSite.siteId._id);
        this.updateDispatchForm.controls.entries.get('driver').setValue(this.dispatch.driverInfo.driver);
        this.updateDispatchForm.controls.entries.get('vehiclePlate').setValue(this.dispatch.driverInfo.vehiclePlate);
        this.updateDispatchForm.controls.entries.get('vehicleModel').setValue(this.dispatch.driverInfo.vehicleModel);
        this.updateDispatchForm.controls.entries.get('driverPhoneNumber').setValue(this.dispatch.driverInfo.driverPhoneNumber);
        this.updateDispatchForm.controls.entries.get('date').setValue(this.dispatch.date);
      });
      this.dispatch.entries.forEach((item) => {
        let i = 0;
        if (item.inputId.inputType === 'Fertilizer') {
          this.includeFertilizer = true;
          this.addPackageFertilizer();
          i = (this.updateDispatchForm.controls.entries.get('packageFertilizer') as FormArray).length - 1;
          ((this.updateDispatchForm.controls.entries.get('packageFertilizer') as FormArray).at(i) as FormGroup).get('bagSize')
            .setValue(item.quantityPerItem);
          ((this.updateDispatchForm.controls.entries.get('packageFertilizer') as FormArray).at(i) as FormGroup).get('numberOfBags')
            .setValue(item.numberOfItems);
          ((this.updateDispatchForm.controls.entries.get('packageFertilizer') as FormArray).at(i) as FormGroup).get('subTotal')
            .setValue(item.quantityPerItem * item.numberOfItems);
        }
        if (item.inputId.inputType === 'Pesticide') {
          this.includePesticide = true;
          this.addPackagePesticide();
          i = (this.updateDispatchForm.controls.entries.get('packagePesticide') as FormArray).length - 1;
          ((this.updateDispatchForm.controls.entries.get('packagePesticide') as FormArray).at(i) as FormGroup).get('pesticideType')
            .setValue(item.inputId._id);
          ((this.updateDispatchForm.controls.entries.get('packagePesticide') as FormArray).at(i) as FormGroup).get('qty')
            .setValue(item.quantityPerItem);
        }
      });
    });
  }

  get formPackageFertilizer() {
    return this.updateDispatchForm.controls.entries.get('packageFertilizer') as FormArray;
  }

  get formPackagePesticide() {
    return this.updateDispatchForm.controls.entries.get('packagePesticide') as FormArray;
  }

  addPackageFertilizer() {
    (this.updateDispatchForm.controls.entries.get('packageFertilizer') as FormArray).push(this.createPackageFertilizer());
  }

  addPackagePesticide() {
    (this.updateDispatchForm.controls.entries.get('packagePesticide') as FormArray).push(this.createPackagePesticide());
  }

  removePackageFertilizer(index: number) {
    (this.updateDispatchForm.controls.entries.get('packageFertilizer') as FormArray).removeAt(index);
  }

  removePackagePesticide(index: number) {
    (this.updateDispatchForm.controls.entries.get('packagePesticide') as FormArray).removeAt(index);
  }

  getPackageFertilizerFormGroup(index): FormGroup {
    this.packageFertilizer = this.updateDispatchForm.controls.entries.get('packageFertilizer') as FormArray;
    return this.packageFertilizer.controls[index] as FormGroup;
  }

  createPackageFertilizer(): FormGroup {
    return this.formBuilder.group({
      bagSize: [''],
      numberOfBags: [''],
      subTotal: ['']
    });
  }

  createPackagePesticide(): FormGroup {
    return this.formBuilder.group({
      pesticideType: [''],
      qty: ['']
    });
  }

  onChangePackageFertilizer(index: number) {
    let value: { bagSize: string | number; numberOfBags: string | number; };
    value = this.formPackageFertilizer.value[index];
    let removed = false;
    this.formPackageFertilizer.value.forEach((el, i) => {
      if (((value.bagSize) === el.bagSize) && (this.formPackageFertilizer.value.length > 1) && (i !== index)) {
        this.removePackageFertilizer(index);
        removed = true;
      }
    });
    if (!removed) {
      const subTotal = (+value.bagSize) * (+value.numberOfBags);
      this.getPackageFertilizerFormGroup(index).controls['subTotal'.toString()].setValue(subTotal);
    }
  }

  onChangePackagePesticide(index: number) {
    const value = this.formPackagePesticide.value[index];
    this.formPackagePesticide.value.forEach((el, i) => {
      if ((value.pesticideType === el.pesticideType) && (this.formPackagePesticide.value.length > 1) && (i !== index)) {
        this.removePackagePesticide(index);
      }
    });
  }

  onChanges() {
    this.updateDispatchForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
          });
          const body = {
            searchBy: 'province',
            prov_id: value
          };
          this.siteService.all(body).subscribe((data) => {
            this.sites = data.content;
          });
        }
      }
    );
    this.updateDispatchForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          const body = {
            searchBy: 'district',
            dist_id: value
          };
          this.siteService.all(body).subscribe((data) => {
            this.sites = data.content;
          });
        }
      });

    this.formPackagePesticide.valueChanges.subscribe((values) => {
      this.totalQtyPesticide = 0;
      values.forEach((value) => {
        if (value.qty !== '') {
          this.totalQtyPesticide = this.totalQtyPesticide + (+value.qty);
        }
      });
      this.updateDispatchForm.controls.entries.get('totalQtyPesticide').setValue(this.totalQtyPesticide);
    });

    this.formPackageFertilizer.valueChanges.subscribe((values) => {
      this.totalQtyFertilizer = 0;
      values.forEach((value) => {
        if (value.bagSize && value.numberOfBags) {
          this.totalQtyFertilizer = this.totalQtyFertilizer + (+value.bagSize) * (+value.numberOfBags);
        }
      });
      this.updateDispatchForm.controls.entries.get('totalQtyFertilizer').setValue(this.totalQtyFertilizer);
    });
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });
  }

  onSubmit() {
    if (this.updateDispatchForm.valid) {
      const dispatch = JSON.parse(JSON.stringify(this.updateDispatchForm.value));
      this.helper.getDate(this.updateDispatchForm.value.entries.date);
      delete dispatch.location;
      const body = {
        siteId: dispatch.siteId,
        vehicleModel: dispatch.entries.vehicleModel,
        vehiclePlate: dispatch.entries.vehiclePlate,
        date: this.helper.getDate(this.updateDispatchForm.value.entries.date),
        driver: dispatch.entries.driver,
        driverPhoneNumber: dispatch.entries.driverPhoneNumber,
        entries: []
      };
      if (this.includePesticide) {
        dispatch.entries.packagePesticide.forEach((pe) => {
          const id = this.pesticideStocks.find(s => s.inputId._id === pe.pesticideType)
            ? this.pesticideStocks.find(s => s.inputId._id === pe.pesticideType)._id : '';
          const el = {
            stockId: id,
            numberOfItems: 1,
            totalQty: +pe.qty
          };
          body.entries.push(el);
        });
      }
      if (this.includeFertilizer) {
        dispatch.entries.packageFertilizer.forEach((fe) => {
          const id = this.fertilizerStocks.find(s => s.quantityPerItem === +fe.bagSize)
            ? this.fertilizerStocks.find(s => s.quantityPerItem === +fe.bagSize)._id : '';
          const el = {
            stockId: id,
            numberOfItems: +fe.numberOfBags,
            totalQty: +fe.subTotal
          };
          body.entries.push(el);
        });
      }

      this.inputDistributionService.editDispatch(body, this.id)
      .subscribe(() => {
          this.setMessage('Dispatch edited successfully!');
          this.modal.dismiss();
          },
        (err) => {
          this.setError(err.errors);
      });
      
    } else {
      this.setError(this.helper.getFormValidationErrors(this.updateDispatchForm));
    }
  }

  onIncludeFertilizer() {
    this.includeFertilizer = !this.includeFertilizer;
    if (this.updateDispatchForm.value.entries.packageFertilizer.length === 0) {
      this.addPackageFertilizer();
    }
  }

  onIncludePesticide() {
    this.includePesticide = !this.includePesticide;
    if (this.updateDispatchForm.value.entries.packagePesticide.length === 0) {
      this.addPackagePesticide();
    }
  }

  getStocks(stock: number) {
    this.inputDistributionService.getStock(stock).subscribe((data) => {
      this.stocks = data.content;
      this.fertilizerStocks = this.stocks.filter(s => s.inputId.inputType === 'Fertilizer');
      this.pesticideStocks = this.stocks.filter(s => s.inputId.inputType === 'Pesticide');
    });
  }

  getCurrentSeason() {
    this.seasonService.all().subscribe((dt) => {
      const seasons = dt.content;
      seasons.forEach((item) => {
        if (item.isCurrent) {
          this.season = item;
        }
      });
    });
  }

}
