import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {InputDistributionService} from '../../../../core';
import {HelperService} from '../../../../core';
import {isPlatformBrowser} from '@angular/common';
import {BasicComponent} from '../../../../core';

@Component({
  selector: 'app-edit-input',
  templateUrl: './edit-input.component.html',
  styleUrls: ['./edit-input.component.css']
})
export class EditInputComponent extends BasicComponent implements OnInit {

  modal: NgbActiveModal;
  editInputForm: UntypedFormGroup;
  @Input() input;
  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private injector: Injector, private formBuilder: UntypedFormBuilder,
              private inputDistributionService: InputDistributionService,
              private helper: HelperService) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.editInputForm = this.formBuilder.group({
      inputName: ['', Validators.required]
    });

    this.editInputForm.patchValue(this.input);
  }

  onSubmit() {
    if (this.editInputForm.valid) {
      const input = this.editInputForm.value;
      input.inputType = this.input.inputType;
      input.inputId = this.input._id;
      this.inputDistributionService.updateInput(input)
        .subscribe(() => {
            this.setMessage('Input successful updated!');
          },
          (err) => {
            this.setError(err.errors);
          });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.editInputForm));
    }
  }
}
