import {Component, OnInit} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {HelperService} from '../../../../core';
import {CoffeeTypeService} from '../../../../core';

@Component({
  selector: 'app-coffee-type-create',
  templateUrl: './coffee-type-create.component.html',
  styleUrls: ['./coffee-type-create.component.css']
})
export class CoffeeTypeCreateComponent implements OnInit {

  constructor(private formBuilder: UntypedFormBuilder,
              private router: Router, private coffeeTypeService: CoffeeTypeService, private helper: HelperService) {
  }

  createForm: UntypedFormGroup;
  errors: string[];
  category: any;

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      name: ['', Validators.required],
      category: new UntypedFormArray([]),
      level: ['', Validators.required]
    });
    this.addCategory();
  }

  createCategory(): UntypedFormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  get formCategory() {
    return this.createForm.get('category') as UntypedFormArray;
  }

  addCategory() {
    (this.createForm.controls.category as UntypedFormArray).push(this.createCategory());
  }

  removeCategory(index: number) {
    (this.createForm.controls.category as UntypedFormArray).removeAt(index);
  }

  getCategoryFormGroup(index): UntypedFormGroup {
    this.category = this.createForm.get('category') as UntypedFormArray;
    return this.category.controls[index] as UntypedFormGroup;
  }

  onSubmit() {
    if (this.createForm.valid) {
      const coffeeType = this.createForm.value;
      this.coffeeTypeService.save(coffeeType)
        .subscribe(() => {
            this.router.navigateByUrl('admin/coffee-type/list');
          },
          (err) => {
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }
}
