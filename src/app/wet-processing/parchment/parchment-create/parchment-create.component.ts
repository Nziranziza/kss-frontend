import {Component, Inject, Injector, OnInit, PLATFORM_ID} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {CoffeeTypeService, UserService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {ParchmentService} from '../../../core/services';
import {AuthenticationService} from '../../../core/services';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import {BasicComponent} from '../../../core/library';

@Component({
  selector: 'app-parchment-create',
  templateUrl: './parchment-create.component.html',
  styleUrls: ['./parchment-create.component.css']
})
export class ParchmentCreateComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private parchmentService: ParchmentService,
              private coffeeTypeService: CoffeeTypeService,
              private datePipe: DatePipe,
              private helper: HelperService, private authenticationService: AuthenticationService,
              @Inject(PLATFORM_ID) private platformId: object, private userService: UserService,
              private injector: Injector) {

    super();

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  modal: NgbActiveModal;
  recordParchmentForm: FormGroup;
  errors: string[];
  coffeeTypes = [];
  package: any;
  totalKgs = 0;
  currentDate: any;

  ngOnInit() {
    this.currentDate = new Date();
    this.recordParchmentForm = this.formBuilder.group({
      coffeeType: ['', Validators.required],
      coffeeGrade: ['A', Validators.required],
      date: ['', Validators.required],
      package: new FormArray([]),
      totalKgs: ['', Validators.required],
      producedDate: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'), Validators.required]
    });
    this.coffeeTypeService.all().subscribe((data) => {
      data.content.map((item) => {
        if (item.level === 'CWS') {
          item.category.map((el) => {
            this.coffeeTypes.push(el);
          });
        }
      });
    });
    this.onChange();
    this.addPackage();
  }

  get formPackage() {
    return this.recordParchmentForm.controls.package as FormArray;
  }

  addPackage() {
    (this.recordParchmentForm.controls.package as FormArray).push(this.createPackage());
  }

  removePackage(index: number) {
    (this.recordParchmentForm.controls.package as FormArray).removeAt(index);
  }

  getPackageFormGroup(index): FormGroup {
    this.package = this.recordParchmentForm.controls.package as FormArray;
    return this.package.controls[index] as FormGroup;
  }

  createPackage(): FormGroup {
    return this.formBuilder.group({
      bagSize: [''],
      numberOfBags: [''],
      subTotal: [0]
    });
  }

  onChangePackageQty(index: number) {
    const value = this.formPackage.value[index];
    const subTotal = (+value.bagSize) * (+value.numberOfBags);
    this.getPackageFormGroup(index).controls['subTotal'.toString()].setValue(subTotal);
  }

  onChangePackageSize(index: number) {
    const value = this.formPackage.value[index];
    let removed = false;
    this.formPackage.value.forEach((el, i) => {
      if (((value.bagSize) === el.bagSize) && (this.formPackage.value.length > 1) && (i !== index)) {
        this.removePackage(index);
        removed = true;
      }
    });
    if (!removed) {
      const subTotal = (+value.bagSize) * (+value.numberOfBags);
      this.getPackageFormGroup(index).controls['subTotal'.toString()].setValue(subTotal);
    }
  }

  onChange() {
    this.formPackage.valueChanges.subscribe((values) => {
      this.totalKgs = 0;
      values.forEach((value) => {
        if (value.bagSize && value.numberOfBags) {
          this.totalKgs = this.totalKgs + (+value.bagSize) * (+value.numberOfBags);
        }
      });
      this.recordParchmentForm.controls.totalKgs.setValue(this.totalKgs);
    });
  }

  onSubmit() {
    if (this.recordParchmentForm.valid) {
      const parchment = JSON.parse(JSON.stringify(this.recordParchmentForm.value));
      parchment['org_id'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
      parchment['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      console.log(parchment);
      this.parchmentService.save(parchment)
        .subscribe((data) => {
            this.modal.close(data.message);
          },
          (err) => {
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.recordParchmentForm);
    }
  }
}
