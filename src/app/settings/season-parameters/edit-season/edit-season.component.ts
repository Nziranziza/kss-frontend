import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';
import {SeasonService} from '../../../core/services';
import {AuthorisationService} from '../../../core/services';

@Component({
  selector: 'app-edit-season',
  templateUrl: './edit-season.component.html',
  styleUrls: ['./edit-season.component.css']
})
export class EditSeasonComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() season;
  editSeasonForm: FormGroup;
  errors: string [];
  message: string;
  inputDistributionParams: any;
  isCurrentUserNaebOfficer: boolean;
  isCurrentUserCeparOfficer: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private authorisationService: AuthorisationService,
    private helper: HelperService, private seasonService: SeasonService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.editSeasonForm = this.formBuilder.group({
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
    this.isCurrentUserCeparOfficer = this.authorisationService.isCeparUser();
    this.isCurrentUserNaebOfficer = this.authorisationService.isNaebUser();
    this.addDistribution();
    this.editSeasonForm.patchValue(this.season);
  }

  createDistribution(): FormGroup {
    return this.formBuilder.group({
      distribution: ['', Validators.required],
      totalFertilizerAvailable: ['', Validators.required],
      totalPesticideAvailable: ['', Validators.required]
    });
  }

  get distributionParams() {
    return this.editSeasonForm.controls.seasonParams.get('distribution'.toString()) as FormArray;
  }

  addDistribution() {
    (this.editSeasonForm.controls.seasonParams.get('distribution'.toString()) as FormArray).push(this.createDistribution());
  }

  removeDistribution(index: number) {
    (this.editSeasonForm.controls.seasonParams.get('distribution'.toString()) as FormArray).removeAt(index);
  }

  getDistributionFormGroup(index): FormGroup {
    this.inputDistributionParams = this.editSeasonForm.controls.seasonParams.get('distribution'.toString()) as FormArray;
    return this.inputDistributionParams.controls[index] as FormGroup;
  }

  onSubmit() {
    const season = JSON.parse(JSON.stringify(this.editSeasonForm.value));
    let payload: any;
    if (this.isCurrentUserCeparOfficer) {
      payload = season.seasonParams.distribution[0];
      payload['seasonId'.toString()] = this.season._id;
      console.log(payload);
      this.seasonService.updateDistribution(payload).subscribe(() => {
          this.message = 'Season successfully updated!';
          this.modal.dismiss();
        },
        (err) => {
          this.errors = err.errors;
        });
    }
    if (this.isCurrentUserNaebOfficer) {
      payload = season.seasonParams
      delete payload.distribution;
      payload['seasonId'.toString()] = this.season._id;
      this.seasonService.updateParameter(payload).subscribe(() => {
          this.message = 'Season successfully updated!';
          this.modal.dismiss();
        },
        (err) => {
          this.errors = err.errors;
        });
    }
  }
}
