import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';
import {InputDistributionService, SeasonService} from '../../../../core/services';
import {AuthorisationService} from '../../../../core/services';

@Component({
  selector: 'app-edit-season',
  templateUrl: './edit-season.component.html',
  styleUrls: ['./edit-season.component.css']
})
export class EditSeasonComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() season;
  editFertilizerForm: FormGroup;
  editDistributionForm: FormGroup;
  editSeasonParamsForm: FormGroup;
  editPesticideForm: FormGroup;
  editPriceForm: FormGroup;
  errors = [];
  message: string;
  isCurrentUserNaebOfficer: boolean;
  isCurrentUserCeparOfficer: boolean;
  pesticide: any;
  suppliers: any;
  fertilizers: any;
  pesticides: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private authorisationService: AuthorisationService,
    private inputDistributionService: InputDistributionService,
    private helper: HelperService, private seasonService: SeasonService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.editFertilizerForm = this.formBuilder.group({
      inputName: [''],
      fertilizerKgPerTree: ['']
    });
    this.editSeasonParamsForm = this.formBuilder.group({
      year: ['', Validators.required],
      season: ['', Validators.required],
    });
    this.editPesticideForm = this.formBuilder.group({
      pesticide: new FormArray([])
    });
    this.editDistributionForm = this.formBuilder.group({
      distribution: this.formBuilder.group({
        totalFertilizerAvailable: [''],
        totalPesticideAvailable: [''],
        supplierId: new FormArray([]),
        appendixDate: ['']
      })
    });
    this.editPriceForm = this.formBuilder.group({
      cherriesUnitPrice: [''],
      floatingUnitPrice: ['']
    });
    this.isCurrentUserCeparOfficer = this.authorisationService.isCeparUser();
    this.isCurrentUserNaebOfficer = this.authorisationService.isNaebUser();
    this.editSeasonParamsForm.patchValue(this.season);

    if (this.season.seasonParams) {
      if (this.season.seasonParams.pesticide) {
        this.season.seasonParams.pesticide.forEach(() => {
          this.addPesticide();
        });
      } else {
        this.addPesticide();
      }
      if (this.season.seasonParams.distribution) {
        this.season.seasonParams.distribution.totalFertilizerAvailable =
          (this.season.seasonParams.distribution.totalFertilizerAvailable / 1000);
        this.season.seasonParams.distribution.totalPesticideAvailable =
          (this.season.seasonParams.distribution.totalPesticideAvailable);
      }
      if (this.season.seasonParams.supplierId) {
        this.season.seasonParams.distribution.supplierId =
          this.season.seasonParams.supplierId[this.season.seasonParams.supplierId.length - 1]._id;
      }
      if (this.season.seasonParams.inputName) {
        this.season.seasonParams.inputName = this.season.seasonParams.inputName._id;
      }
      if (this.season.seasonParams.pesticide) {
        const pesticides = [];
        this.season.seasonParams.pesticide.map((pe) => {
          pesticides.push({
            inputName: pe.inputName ? pe.inputName._id : null,
            pesticideMlPerTree: pe.pesticideMlPerTree
          });
        });
        this.season.seasonParams.pesticide = pesticides;
      }
      if (this.season.seasonParams.distribution) {
        delete this.season.seasonParams.distribution.supplierId;
      }
      this.editDistributionForm.patchValue(this.season.seasonParams);
      this.editPriceForm.patchValue(this.season.seasonParams);
      this.editPesticideForm.patchValue(this.season.seasonParams);
      this.editFertilizerForm.patchValue(this.season.seasonParams);
    }
    this.initial();
  }

  get formPesticide() {
    return this.editPesticideForm.controls.pesticide as FormArray;
  }

  onChangePesticide(index: number) {
    const value = this.formPesticide.value[index];
    this.formPesticide.value.forEach((el, i) => {
      if ((value.inputName === el.inputName) && (this.formPesticide.value.length > 1) && (i !== index)) {
        this.removePesticide(index);
      }
    });
  }

  addPesticide() {
    (this.editPesticideForm.controls.pesticide as FormArray).push(this.createPesticide());
  }

  removePesticide(index: number) {
    (this.editPesticideForm.controls.pesticide as FormArray).removeAt(index);
  }

  getPesticideFormGroup(index): FormGroup {
    this.pesticide = this.editPesticideForm.controls.pesticide as FormArray;
    return this.pesticide.controls[index] as FormGroup;
  }

  createPesticide(): FormGroup {
    return this.formBuilder.group({
      inputName: ['', Validators.required],
      pesticideMlPerTree: ['', Validators.required]
    });
  }

  updateDistribution() {
    const season = JSON.parse(JSON.stringify(this.editDistributionForm.value));
    let payload: any;
    const selectedSuppliers = this.editDistributionForm.value.distribution.supplierId
      .map((checked, index) => checked ? this.suppliers[index]._id : null)
      .filter(value => value !== null);
    payload = season.distribution;
    payload['seasonId'.toString()] = this.season._id;
    payload['supplierId'.toString()] = selectedSuppliers;
    this.seasonService.updateDistribution(payload).subscribe(() => {
        this.message = 'Distribution info successfully updated!';
        this.errors = [];
      },
      (err) => {
        this.message = '';
        this.errors = err.errors;
      });
  }

  updateFertilizer() {
    const payload = JSON.parse(JSON.stringify(this.editFertilizerForm.value));
    payload['seasonId'.toString()] = this.season._id;
    this.seasonService.updateFertilizer(payload).subscribe(() => {
        this.message = 'Fertilizer info successfully updated!';
        this.errors = [];
      },
      (err) => {
        this.message = '';
        this.errors = err.errors;
      });
  }

  updatePrice() {
    const payload = JSON.parse(JSON.stringify(this.editPriceForm.value));
    payload['seasonId'.toString()] = this.season._id;
    this.seasonService.updatePrice(payload).subscribe(() => {
        this.message = 'Prices info successfully updated!';
        this.errors = [];
      },
      (err) => {
        this.message = '';
        this.errors = err.errors;
      });
  }

  updatePesticide() {
    const payload = JSON.parse(JSON.stringify(this.editPesticideForm.value));
    payload['seasonId'.toString()] = this.season._id;
    if (this.editPesticideForm.controls.pesticide.value.length > 0) {
      this.seasonService.updatePesticide(payload).subscribe(() => {
          this.message = 'Pesticides info successfully updated!';
          this.errors = [];
        },
        (err) => {
          this.message = '';
          this.errors = err.errors;
        });
    }
  }

  initial() {
    this.inputDistributionService.getFertilizers().subscribe((data) => {
      this.fertilizers = data.content;
    });

    this.inputDistributionService.getPesticides().subscribe((data) => {
      this.pesticides = data.content;
    });
    this.inputDistributionService.getSuppliers().subscribe((data) => {
      this.suppliers = data.content;
      this.suppliers.map((supplier) => {
        const temp = this.season.seasonParams.supplierId ?
          this.season.seasonParams.supplierId.find((item => item._id === supplier._id)) : null;
        if (temp) {
          const control = new FormControl(true);
          (this.editDistributionForm.controls.distribution.get('supplierId') as FormArray).push(control);
        } else {
          const control = new FormControl(false);
          (this.editDistributionForm.controls.distribution.get('supplierId') as FormArray).push(control);
        }
      });
    });
  }
}
