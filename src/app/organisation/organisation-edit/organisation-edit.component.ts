import {Component, OnInit, Input} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {OrganisationService} from '../../core/services';

@Component({
  selector: 'app-organisation-edit',
  templateUrl: './organisation-edit.component.html',
  styleUrls: ['./organisation-edit.component.css']
})
export class OrganisationEditComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private organisationService: OrganisationService) {
  }

  editForm: FormGroup;
  errors: string[];

  ngOnInit() {

    this.editForm = this.formBuilder.group({
      id: [],
      email: ['', Validators.required],
      name: ['', Validators.required],
      tin: ['', Validators.required]
    });
    this.route.params.subscribe(params => {

      this.organisationService.get(params['id'.toString()]).subscribe(data => {
        this.editForm.patchValue(data);
      });
    });
  }

  onSubmit() {

    if (this.editForm.valid) {
      this.router.navigateByUrl('admin/organisations');
      this.organisationService.save(this.editForm.value)
        .subscribe((data) => {
            this.router.navigateByUrl('admin/organisations');
          },
          (err) => {
            this.errors = err;
          });
    }
  }

}
