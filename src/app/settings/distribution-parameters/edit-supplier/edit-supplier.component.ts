import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {InputDistributionService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-edit-supplier',
  templateUrl: './edit-supplier.component.html',
  styleUrls: ['./edit-supplier.component.css']
})
export class EditSupplierComponent implements OnInit {

  modal: NgbActiveModal;
  editSupplierForm: FormGroup;
  @Input() supplier;
  errors = [];
  message: string;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private injector: Injector, private formBuilder: FormBuilder,
              private inputDistributionService: InputDistributionService,
              private helper: HelperService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.editSupplierForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: [''],
      phone_number: ['', Validators.required],
      TIN_number: ['', Validators.required]
    });
    this.editSupplierForm.patchValue(this.supplier);
  }

  onSubmit() {
  }
}
