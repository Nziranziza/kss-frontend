import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LocationService} from '../../../core/services/location.service';
import {HelperService} from '../../../core/helpers';
import {FarmerService} from '../../../core/services';
import {isPlatformBrowser} from '@angular/common';
import {SeasonService} from '../../../core/services/season.service';

@Component({
  selector: 'app-edit-season',
  templateUrl: './edit-season.component.html',
  styleUrls: ['./edit-season.component.css']
})
export class EditSeasonComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() land;
  editSeasonForm: FormGroup;
  errors: string [];
  message: string;
  submit = false;
  seasonId: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
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
        cherriesUnitPrice: ['', Validators.required],
        parchmentUnitPrice: ['', Validators.required],
        greenCoffeeUnitPrice: ['', Validators.required],
        fertilizerKgPerTree: ['', Validators.required],
      }),
    });
  }

  onSubmit() {
    if (this.editSeasonForm.valid) {
      const season = this.editSeasonForm.value;
      this.seasonService.updateSeason(season).subscribe((data) => {
          this.message = 'Season successfully updated!';
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editSeasonForm);
    }
  }
}
