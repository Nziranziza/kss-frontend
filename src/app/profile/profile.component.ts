import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../core/services/authentication.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private authenticationService: AuthenticationService) {
  }

  changePasswordForm: FormGroup;
  errors: string[];

  ngOnInit() {

    this.changePasswordForm = this.formBuilder.group({
      id: [],
      password: [''],
      confirm_password: ['']
    });
    this.changePasswordForm.patchValue(this.authenticationService.getCurrentUser());
  }

  onSubmit() {
    if (this.changePasswordForm.valid) {
      this.authenticationService.update(this.changePasswordForm.value).subscribe(data => {
          /*this.router.navigateByUrl('admin');*/
          return;
        },
        (err) => {
          this.errors = err;
        });

    }
  }

}
