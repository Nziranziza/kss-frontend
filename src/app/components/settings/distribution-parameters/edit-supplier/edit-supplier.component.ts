import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {InputDistributionService} from '../../../../core';
import {HelperService} from '../../../../core';
import {isPlatformBrowser} from '@angular/common';
import {BasicComponent} from '../../../../core';

@Component({
  selector: 'app-edit-supplier',
  templateUrl: './edit-supplier.component.html',
  styleUrls: ['./edit-supplier.component.css']
})
export class EditSupplierComponent extends BasicComponent implements OnInit {

  modal: NgbActiveModal;
  editSupplierForm: FormGroup;
  @Input() supplier;

  constructor(@Inject(PLATFORM_ID) private platformId: object,
              private injector: Injector, private formBuilder: FormBuilder,
              private inputDistributionService: InputDistributionService,
              private helper: HelperService) {
    super();
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
    if (this.editSupplierForm.valid) {
      const supplier = this.editSupplierForm.value;
      supplier.supplierId = this.supplier._id;
      supplier.phone_number = `${supplier.phone_number}`;
      this.inputDistributionService.updateSupplier(supplier)
        .subscribe(() => {
            this.setMessage('supplier successful updated!');
          },
          (err) => {
            this.setError(err.errors);
          });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.editSupplierForm));
    }
  }
}
