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
      _id: ["", Validators.required],
      name: ["", Validators.required],
      category: new FormArray([]),
      level: ["", Validators.required],
    });
  }

  createCategory(): FormGroup {
    return this.formBuilder.group({
      name: ["", Validators.required],
      _id: [""],
    });
  }

  get formCategory() {
    return this.createForm.get("category") as FormArray;
  }

  addCategory(element, index) {
    (this.createForm.controls.category as FormArray).push(
      this.createCategory()
    );
    (this.createForm.controls.category as FormArray)
      .at(index)
      .get("name")
      .setValue(element.name);
    (this.createForm.controls.category as FormArray)
      .at(index)
      .get("_id")
      .setValue(element._id);
  }

  removeCategory(index: number) {
    (this.createForm.controls.category as FormArray).removeAt(index);
  }

  getCategoryFormGroup(index): FormGroup {
    this.category = this.createForm.get("category") as FormArray;
    return this.category.controls[index] as FormGroup;
  }

  getCategory() {
    this.coffeeTypeService.one(this.id).subscribe((data) => {
      if (data && data.content) {
        this.coffeeType = data.content;
        this.createForm.controls["_id"].setValue(this.coffeeType._id);
        this.createForm.controls["name"].setValue(this.coffeeType.name);
        this.createForm.controls["level"].setValue(
          this.coffeeType.level.toLowerCase(),
          { onlySelf: true }
        );
        this.coffeeType.category.forEach((value, index) => {
          this.addCategory(value, index);
        });
      }
    });
  }

  onSubmit() {
    if (this.createForm.valid) {
      this.coffeeTypeService.update(this.createForm.value).subscribe(
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
