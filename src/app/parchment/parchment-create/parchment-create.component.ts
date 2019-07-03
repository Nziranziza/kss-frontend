import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {CoffeeTypeService} from '../../core/services/coffee-type.service';
import {HelperService} from '../../core/helpers';
import {ParchmentService} from '../../core/services/parchment.service';
import {AuthenticationService} from '../../core/services';

@Component({
  selector: 'app-parchment-create',
  templateUrl: './parchment-create.component.html',
  styleUrls: ['./parchment-create.component.css']
})
export class ParchmentCreateComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private parchmentService: ParchmentService,
              private coffeeTypeService: CoffeeTypeService,
              private helper: HelperService, private authenticationService: AuthenticationService) {
  }

  recordParchmentForm: FormGroup;
  errors: string[];
  coffeeTypes = [];
  lotInfo: any;

  ngOnInit() {
    this.recordParchmentForm = this.formBuilder.group({
      coffeeType: ['', Validators.required],
      date: ['', Validators.required],
      totalKgs:  ['', Validators.required],
      producedDate:  ['', Validators.required]
    });
    this.coffeeTypeService.all().subscribe((data) => {
      data.content.map((item) => {
        if (item.level === 'cws') {
          item.category.map((el) => {
            this.coffeeTypes.push(el);
          });
        }
      });
    });
  }

  createLotInfo(): FormGroup {
    return this.formBuilder.group({
      totalKgs: ['63'],
      producedDate: ['']
    });
  }

  get formLotInfo() {
    return this.recordParchmentForm.get('lotInfo') as FormArray;
  }

  addLotInfo() {
    (this.recordParchmentForm.controls.lotInfo as FormArray).push(this.createLotInfo());
  }

  removeLotInfo(index: number) {
    (this.recordParchmentForm.controls.lotInfo as FormArray).removeAt(index);
  }

  getLotInfoFormGroup(index): FormGroup {
    this.lotInfo = this.recordParchmentForm.get('lotInfo') as FormArray;
    return this.lotInfo.controls[index] as FormGroup;
  }

  onSubmit() {
    if (this.recordParchmentForm.valid) {
      const parchment = this.recordParchmentForm.value;
      parchment['org_id'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
      this.parchmentService.save(parchment)
        .subscribe(data => {
            this.router.navigateByUrl('admin/cws/parchments/list');
          },
          (err) => {
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.recordParchmentForm);
    }
  }
}
