import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {InputDistributionService} from '../../core/services';
import {Router} from '@angular/router';
import {HelperService} from '../../core/helpers';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EditInputComponent} from './edit-input/edit-input.component';
import {EditSupplierComponent} from './edit-supplier/edit-supplier.component';
import {BasicComponent} from '../../core/library';

@Component({
  selector: 'app-distribution-parameters',
  templateUrl: './distribution-parameters.component.html',
  styleUrls: ['./distribution-parameters.component.css']
})
export class DistributionParametersComponent extends BasicComponent implements OnInit {

  createFertilizerForm: FormGroup;
  createPesticideForm: FormGroup;
  createSupplierForm: FormGroup;
  suppliers: any;
  fertilizers: any;
  pesticides: any;

  constructor(private formBuilder: FormBuilder, private helper: HelperService, private modal: NgbModal,
              private router: Router, private inputDistributionService: InputDistributionService) {
    super();
  }

  ngOnInit() {
    this.createFertilizerForm = this.formBuilder.group({
      inputName: ['', Validators.required],
      inputType: ['Fertilizer', Validators.required]
    });

    this.createPesticideForm = this.formBuilder.group({
      inputName: ['', Validators.required],
      inputType: ['Pesticide', Validators.required]
    });

    this.createSupplierForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: [''],
      phone_number: ['', Validators.required],
      TIN_number: ['', Validators.required]
    });
    this.initial();
  }

  onCreateFertilizer() {
    if (this.createFertilizerForm.valid) {
      const fertilizer = this.createFertilizerForm.value;
      this.inputDistributionService.recordInput(fertilizer)
        .subscribe(() => {
            this.setMessage('successful recorded!');
            this.initial();
          },
          (err) => {
            this.setError(err.errors);
          });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.createFertilizerForm));
    }
  }

  onCreatePesticide() {
    if (this.createPesticideForm.valid) {
      const pesticide = this.createPesticideForm.value;
      this.inputDistributionService.recordInput(pesticide)
        .subscribe(() => {
            this.setMessage('Pesticide successful recorded!');
            this.initial();
          },
          (err) => {
            this.setError(err.errors);
          });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.createPesticideForm));
    }
  }

  onCreateSupplier() {
    if (this.createSupplierForm.valid) {
      const supplier = this.createSupplierForm.value;
      this.inputDistributionService.recordSupplier(supplier)
        .subscribe(() => {
            this.setMessage('Supplier successful recorded!');
            this.initial();
          },
          (err) => {
            this.setError(err.errors);
          });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.createSupplierForm));
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
    });
  }

  editInput(input: any) {
    const modalRef = this.modal.open(EditInputComponent, {size: 'sm'});
    modalRef.componentInstance.input = input;
    modalRef.result.finally(() => {
      this.initial();
    });
  }

  editSupplier(supplier: any) {
    const modalRef = this.modal.open(EditSupplierComponent, {size: 'lg'});
    modalRef.componentInstance.supplier = supplier;
    modalRef.result.finally(() => {
      this.initial();
    });
  }
}
