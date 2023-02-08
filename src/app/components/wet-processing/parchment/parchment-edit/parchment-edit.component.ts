import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService, CoffeeTypeService, ParchmentService, UserService} from '../../../../core/services';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import {HelperService} from '../../../../core/helpers';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {BasicComponent} from '../../../../core/library';

@Component({
  selector: 'app-parchment-edit',
  templateUrl: './parchment-edit.component.html',
  styleUrls: ['./parchment-edit.component.css']
})
export class ParchmentEditComponent  extends BasicComponent implements OnInit {

  constructor(private formBuilder: UntypedFormBuilder,
              private router: Router, private parchmentService: ParchmentService,
              private coffeeTypeService: CoffeeTypeService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private helper: HelperService, private authenticationService: AuthenticationService,
              @Inject(PLATFORM_ID) private platformId: object, private userService: UserService,
              private injector: Injector) {

    super();

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  modal: NgbActiveModal;
  recordParchmentForm: UntypedFormGroup;
  errors: string[];
  coffeeTypes = [];
  packaging: any;
  totalKgs = 0;
  currentDate: any;
  @Input() id;
  parchment: any;

  ngOnInit() {
    this.currentDate = new Date();
    this.recordParchmentForm = this.formBuilder.group({
      coffeeType: ['', Validators.required],
      coffeeGrade: ['A', Validators.required],
      date: ['', Validators.required],
      packaging: new UntypedFormArray([]),
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
    this.parchmentService.get(this.authenticationService.getCurrentUser().info.org_id, this.id).subscribe(data => {
      this.recordParchmentForm.patchValue(data.content);
      this.parchment = data.content;
      this.parchment.package.forEach((item, i) => {
        this.addPackage();
        ((this.recordParchmentForm.get('packaging') as UntypedFormArray).at(i) as UntypedFormGroup).get('bagSize')
          .setValue(item.bagSize);
        ((this.recordParchmentForm.get('packaging') as UntypedFormArray).at(i) as UntypedFormGroup).get('numberOfBags')
          .setValue(item.numberOfBags);
        ((this.recordParchmentForm.get('packaging') as UntypedFormArray).at(i) as UntypedFormGroup).get('subTotal')
          .setValue(item.bagSize * item.numberOfBags);
      });
      this.recordParchmentForm.controls.coffeeType.setValue(this.parchment.coffeeType._id);
      this.recordParchmentForm.controls.coffeeGrade.setValue(this.parchment.coffeeGrade);
      this.recordParchmentForm.controls.producedDate.setValue(this.parchment.producedDate);
      this.recordParchmentForm.controls.date.setValue(this.parchment.cherriesSupplyDate);
    });
  }

  get formPackage() {
    return this.recordParchmentForm.get('packaging') as UntypedFormArray;
  }

  addPackage() {
    (this.recordParchmentForm.get('packaging') as UntypedFormArray).push(this.createPackage());
  }

  removePackage(index: number) {
    (this.recordParchmentForm.get('packaging') as UntypedFormArray).removeAt(index);
  }

  getPackageFormGroup(index): UntypedFormGroup {
    this.packaging = this.recordParchmentForm.get('packaging') as UntypedFormArray;
    return this.packaging.at(index) as UntypedFormGroup;
  }

  createPackage(): UntypedFormGroup {
    return this.formBuilder.group({
      bagSize: [''],
      numberOfBags: [''],
      subTotal: [0]
    });
  }

  onChangePackageQty(index: number) {
    const value = this.formPackage.value[index];
    const subTotal = (+value.bagSize) * (+value.numberOfBags);
    this.getPackageFormGroup(index).get('subTotal'.toString()).setValue(subTotal);
  }

  onChangePackageSize(index: number) {
    const value = this.formPackage.value[index];
    let removed = false;
    this.formPackage.value.forEach((el, i) => {
      if (((+value.bagSize) === +el.bagSize) && (this.formPackage.value.length > 1) && (i !== index)) {
        this.removePackage(index);
        removed = true;
      }
    });
    if (!removed) {
      const subTotal = (+value.bagSize) * (+value.numberOfBags);
      this.getPackageFormGroup(index).get('subTotal'.toString()).setValue(subTotal);
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

    this.recordParchmentForm.controls.date.valueChanges.subscribe((value) => {
      this.recordParchmentForm.controls.date.patchValue(this.helper.setLocalTimeZone(value), {emitEvent: false});
    });

    this.recordParchmentForm.controls.producedDate.valueChanges.subscribe((value) => {
      this.recordParchmentForm.controls.producedDate.patchValue(this.helper.setLocalTimeZone(value), {emitEvent: false});
    });
  }

  onSubmit() {
    if (this.recordParchmentForm.valid) {
      const parchment = JSON.parse(JSON.stringify(this.recordParchmentForm.value));
      parchment['org_id'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
      parchment['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.parchmentService.update(this.parchment._id, parchment)
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
