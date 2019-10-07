import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {InputDistributionService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-edit-input',
  templateUrl: './edit-input.component.html',
  styleUrls: ['./edit-input.component.css']
})
export class EditInputComponent implements OnInit {

  modal: NgbActiveModal;
  editInputForm: FormGroup;
  errors = [];
  message: string;
  @Input() input;
  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private injector: Injector, private formBuilder: FormBuilder,
              private inputDistributionService: InputDistributionService,
              private helper: HelperService) {

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
  }

}
