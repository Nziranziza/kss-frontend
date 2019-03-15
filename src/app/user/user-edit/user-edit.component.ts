import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../core/services/user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

  organisationId: number;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private userService: UserService) {
  }

  editForm: FormGroup;
  errors: string[];

  ngOnInit() {

    this.editForm = this.formBuilder.group({
      id: [],
      firstName: ['', Validators.required],
      email: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      organisationType: ['', Validators.required],
      website: ['', Validators.required]
    });
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
      this.userService.get(this.organisationId, params['id'.toString()]).subscribe(data => {
        this.editForm.patchValue(data);
      });
    });
  }

  onSubmit() {
    if (this.editForm.valid) {
      this.userService.save(this.organisationId, this.editForm.value).subscribe(data => {
          this.router.navigateByUrl('admin/organisations/' + this.organisationId + '/users');
        },
        (err) => {
          this.errors = err;
        });

    }
  }

}
