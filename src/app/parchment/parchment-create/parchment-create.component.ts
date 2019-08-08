import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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

  ngOnInit() {
    this.recordParchmentForm = this.formBuilder.group({
      coffeeType: ['', Validators.required],
      date: ['', Validators.required],
      totalKgs: ['', Validators.required],
      producedDate: ['', Validators.required]
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
  }

  onSubmit() {
    if (this.recordParchmentForm.valid) {
      const parchment = JSON.parse(JSON.stringify(this.recordParchmentForm.value));
      parchment['org_id'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
      this.parchmentService.save(parchment)
        .subscribe(data => {
            this.errors = [];
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
