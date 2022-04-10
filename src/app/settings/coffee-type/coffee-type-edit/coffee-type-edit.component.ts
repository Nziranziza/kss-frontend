import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HelperService } from "../../../core/helpers";
import { CoffeeTypeService } from "../../../core/services";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-coffee-type-edit",
  templateUrl: "./coffee-type-edit.component.html",
  styleUrls: ["./coffee-type-edit.component.css"],
})
export class CoffeeTypeEditComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private coffeeTypeService: CoffeeTypeService,
    private helper: HelperService
  ) {}

  id: string;
  createForm: FormGroup;
  errors: string[];
  category: any;
  coffeeType: any;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.id = params["id".toString()];
    });

    this.getCategory();

    this.createForm = this.formBuilder.group({
      category: ["", Validators.required],
    });
    // this.addCategory();
  }

  getCategory() {
    this.coffeeTypeService.one(this.id).subscribe((data) => {
      if (data && data.content) {
        this.coffeeType = data.content;
        this.createForm.controls["category"].setValue(
          this.coffeeType.category[0].name
        );
      }
    });
  }

  // createCategory(): FormGroup {
  //   return this.formBuilder.group({
  //     name: ['', Validators.required]
  //   });
  // }

  // get formCategory() {
  //   return this.createForm.get('category') as FormArray;
  // }

  // addCategory() {
  //   (this.createForm.controls.category as FormArray).push(this.createCategory());
  // }

  // removeCategory(index: number) {
  //   (this.createForm.controls.category as FormArray).removeAt(index);
  // }

  // getCategoryFormGroup(index): FormGroup {
  //   this.category = this.createForm.get('category') as FormArray;
  //   return this.category.controls[index] as FormGroup;
  // }

  onSubmit() {
    if (this.createForm.valid) {
      const body = {
        _id: this.coffeeType._id,
        category_id: this.coffeeType.category[0]._id,
        name: this.createForm.get("category").value,
      };
      this.coffeeTypeService.update(body).subscribe(
        () => {
          this.router.navigateByUrl("admin/coffee-type/list");
        },
        (err) => {
          this.errors = err.errors;
        }
      );
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }
}
