import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {HelperService} from '../../../core/helpers';
import {FarmerService} from '../../../core/services';
import {MessageService} from '../../../core/services/message.service';
import {LocationService} from '../../../core/services/location.service';
import {isPlatformBrowser} from '@angular/common';
import {SeasonService} from '../../../core/services/season.service';

@Component({
  selector: 'app-create-season',
  templateUrl: './create-season.component.html',
  styleUrls: ['./create-season.component.css']
})
export class CreateSeasonComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() land;
  createSeasonForm: FormGroup;
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
    this.createSeasonForm = this.formBuilder.group({
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
    if (this.createSeasonForm.valid) {
      const season = this.createSeasonForm.value;
      this.seasonService.updateSeason(season).subscribe((data) => {
          this.message = 'Season successfully updated!';
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createSeasonForm);
    }
  }
}
