import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';
import {SeasonService} from '../../../core/services/season.service';

@Component({
  selector: 'app-create-season',
  templateUrl: './create-season.component.html',
  styleUrls: ['./create-season.component.css']
})
export class CreateSeasonComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() season;
  createSeasonForm: FormGroup;
  errors: string [];
  message: string;
  inputDistributionParams: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private helper: HelperService, private seasonService: SeasonService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.createSeasonForm = this.formBuilder.group({
      year: ['', Validators.required],
      season: ['', Validators.required],
      seasonParams: this.formBuilder.group({
        cherriesUnitPrice: [''],
        fertilizerName: [''],
        fertilizerType: [''],
        fertilizerKgPerTree: [''],
        pesticideName: [''],
        pesticideType: [''],
        pesticideMlPerTree: [''],
        targetedFertilizerQty: [''],
        targetedPesticideQty: [''],
        distribution: new FormArray([])
      })
    });
    this.addDistribution();
    console.log(this.createSeasonForm.value);
  }

  createDistribution(): FormGroup {
    return this.formBuilder.group({
      distributionPeriod: ['', Validators.required],
      totalAvailableFertilizer: ['', Validators.required],
      totalAvailablePesticide: ['', Validators.required]
    });
  }

  get distributionParams() {
    return this.createSeasonForm.controls.seasonParams.get('distribution'.toString()) as FormArray;
  }

  addDistribution() {
    (this.createSeasonForm.controls.seasonParams.get('distribution'.toString()) as FormArray).push(this.createDistribution());
  }

  removeDistribution(index: number) {
    (this.createSeasonForm.controls.seasonParams.get('distribution'.toString()) as FormArray).removeAt(index);
  }

  getDistributionFormGroup(index): FormGroup {
    this.inputDistributionParams = this.createSeasonForm.controls.seasonParams.get('distribution'.toString()) as FormArray;
    return this.inputDistributionParams.controls[index] as FormGroup;
  }

  onSubmit() {
    if (this.createSeasonForm.valid) {
      const season = this.createSeasonForm.value;
      this.seasonService.addSeason(season).subscribe((data) => {
          this.message = 'Season successfully created!';
          this.modal.dismiss();
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createSeasonForm);
    }
  }
}
