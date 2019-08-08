import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService, OrganisationTypeService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {InputDistributionService} from '../../core/services/input-distribution.service';

@Component({
  selector: 'app-site-distribution',
  templateUrl: './site-distribution.component.html',
  styleUrls: ['./site-distribution.component.css']
})
export class SiteDistributionComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private authenticationService: AuthenticationService,
              private router: Router, private organisationTypeService: OrganisationTypeService,
              private inputDistributionService: InputDistributionService,
              private helper: HelperService) {
  }

  getFarmerRequestsForm: FormGroup;
  errors: string[];
  requests: any;

  ngOnInit() {
    this.getFarmerRequestsForm = this.formBuilder.group({
      farmerRegNumber: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.getFarmerRequestsForm.valid) {
      const requestsOf = JSON.parse(JSON.stringify(this.getFarmerRequestsForm.value));
      requestsOf['managerUserId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.inputDistributionService.getFarmerRequests(requestsOf).subscribe((data) => {
        this.requests = data.content;
      }, (err) => {
        this.errors = err.errors;
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.getFarmerRequestsForm);
    }
  }
}
