import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {OrganisationService} from '../../core/services';

@Component({
  selector: 'app-organisation-create',
  templateUrl: './organisation-create.component.html',
  styleUrls: ['./organisation-create.component.css']
})
export class OrganisationCreateComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private organisationService: OrganisationService) {
  }

  createForm: FormGroup;
  errors: string[];

  ngOnInit() {

    this.createForm = this.formBuilder.group({
      email: ['', Validators.required],
      name: ['', Validators.required],
      tin: ['', Validators.required]
    });
  }

  onSubmit() {

    if (this.createForm.valid) {
      this.organisationService.save(this.createForm.value)
        .subscribe((data) => {
            this.router.navigateByUrl('admin/organisations');
          },
          (err) => {
            this.errors = err;
          });
    }
  }
}
