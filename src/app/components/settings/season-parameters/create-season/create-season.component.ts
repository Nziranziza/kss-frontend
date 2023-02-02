import {Component, Inject, Injector, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../../core';
import {isPlatformBrowser} from '@angular/common';
import {SeasonService} from '../../../../core';

@Component({
  selector: 'app-create-season',
  templateUrl: './create-season.component.html',
  styleUrls: ['./create-season.component.css']
})
export class CreateSeasonComponent implements OnInit {

  modal: NgbActiveModal;
  createSeasonForm: UntypedFormGroup;
  errors: string [];
  message: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: UntypedFormBuilder,
    private helper: HelperService, private seasonService: SeasonService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.createSeasonForm = this.formBuilder.group({
      year: ['', Validators.required],
      season: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.createSeasonForm.valid) {
      const season = this.createSeasonForm.value;
      this.seasonService.addSeason(season).subscribe(() => {
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
