import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {OrganisationService} from '../../core/services';
import {HelperService} from '../../core/helpers';

@Component({
  selector: 'app-organisation-create',
  templateUrl: './organisation-create.component.html',
  styleUrls: ['./organisation-create.component.css']
})
export class OrganisationCreateComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private organisationService: OrganisationService, private helper: HelperService) {
  }

  createForm: FormGroup;
  errors: string[];

  ngOnInit() {

    this.createForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      organisationType: ['', Validators.required],
      website: ['', Validators.required]
    });
  }

  onSubmit() {

    if (this.createForm.valid) {
      const org = this.createForm.value;
      this.organisationService.all().subscribe(data => {
        org['id'.toString()] = data.length + 1;
      });
      this.organisationService.save(org)
        .subscribe(data => {
            this.router.navigateByUrl('admin/organisations');
          },
          (err) => {
            this.errors = err;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }
}
