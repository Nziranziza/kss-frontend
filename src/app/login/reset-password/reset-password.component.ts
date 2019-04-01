import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../core/services';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../core/helpers';

declare var $;

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {


  errors: string[];
  message: string;
  resetPasswordForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder, private helperService: HelperService
  ) {
    // use FormBuilder to create a form group
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }


  ngOnInit() {
    document.body.className = 'hold-transition login-page';
    $(() => {
      $('input').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' /* optional */
      });
    });

  }

  onSubmit() {
    this.errors = [];
    if (this.resetPasswordForm.invalid) {
      this.errors = this.helperService.getFormValidationErrors(this.resetPasswordForm);
      return;
    }
    this.authenticationService.resetPassword(this.resetPasswordForm.value).subscribe(data => {
        this.message = data.message;
        this.router.navigateByUrl('login');
      },
      (err) => {
        this.errors = err.errors;
      });
  }
}
