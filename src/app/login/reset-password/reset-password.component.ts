import {Component, OnInit} from '@angular/core';
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
  userId: string;
  isValidToken = false;
  token: string;

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
    this.route.params.subscribe(params => {
      this.token = params['token'.toString()];
    });
    this.authenticationService.validateResetToken(this.token).subscribe(data => {
        this.isValidToken = true;
        this.userId = data.content._id;
      },
      (err) => {
        this.errors = err.errors;
      });
  }

  onSubmit() {
    this.errors = [];
    if (this.resetPasswordForm.invalid) {
      this.errors = this.helperService.getFormValidationErrors(this.resetPasswordForm);
      return;
    }
    const password = this.resetPasswordForm.controls.password.value;
    const confirmPassword = this.resetPasswordForm.controls.confirmPass.value;

    if (password === confirmPassword) {
      this.errors = ['passwords do not match'];
      return;
    }
    const resets = this.resetPasswordForm.value;
    resets['userId'.toString()] = this.userId;
    resets['token'.toString()] = this.token;
    resets['isLoggedIn'.toString()] = false;
    this.authenticationService.resetPassword(resets).subscribe(data => {
        this.router.navigateByUrl('login', {state: {message: 'Password successfully reset'}});
      },
      (err) => {
        this.errors = err.errors;
      });
  }
}
