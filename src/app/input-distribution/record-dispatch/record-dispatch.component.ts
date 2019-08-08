import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {HelperService} from '../../core/helpers';
import {InputDistributionService} from '../../core/services/input-distribution.service';
import {SiteService} from '../../core/services/site.service';

@Component({
  selector: 'app-record-dispatch',
  templateUrl: './record-dispatch.component.html',
  styleUrls: ['./record-dispatch.component.css']
})
export class RecordDispatchComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private siteService: SiteService,
              private router: Router, private inputDistributionService: InputDistributionService,
              private helper: HelperService) {
  }

  recordDispatchForm: FormGroup;
  errors: any;
  message: any;
  types = [
    {
      name: 'fertilizer',
      value: 'fertilizer'
    },
    {
      name: 'pesticide',
      value: 'pesticide'
    }
  ];
  sites: any;
  inputDispatches: any;
  isSiteManager = false;

  ngOnInit() {
    this.recordDispatchForm = this.formBuilder.group({
      inputType: ['fertilizer', Validators.required],
      drive: ['', Validators.required],
      vehiclePlate: ['', Validators.required],
      numberOfBags: ['', Validators.required],
      totalQty: ['', Validators.required],
      date: ['', Validators.required]
    });
    const body = {
      searchBy: 'province',
      prov_id: ''
    };
    this.siteService.all(body).subscribe((data) => {
      this.sites = data.content;
    });
  }

  onSubmit() {
    if (this.recordDispatchForm.valid) {
      const dispatch = JSON.parse(JSON.stringify(this.recordDispatchForm.value));
      this.inputDistributionService.recordDispatch(dispatch)
        .subscribe(() => {
            this.message = 'Recorded successfully!';
            this.errors = '';
          },
          (err) => {
            this.message = '';
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.recordDispatchForm);
    }
  }
}
