import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../core/services';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../core/helpers';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MessageService} from '../../core/services';
import {BasicComponent} from '../../core/library';

declare var $;

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent extends BasicComponent implements OnInit {

  resetPasswordForm: FormGroup;
  userId: string;
  isValidToken = false;
  token: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private http: HttpClient,
    private formBuilder: FormBuilder, private helperService: HelperService,
    private messageService: MessageService
  ) {
    super();
  }

  ngOnInit() {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
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
        this.setWarning(err.errors);
      });
  }

  onSubmit() {
    if (!this.resetPasswordForm.invalid) {
      const password = this.resetPasswordForm.controls.password.value;
      const confirmPassword = this.resetPasswordForm.controls.confirmPassword.value;

      if (password !== confirmPassword) {
        this.setError(['Passwords do not match']);
        return;
      }
      const resets = {};
      resets['isLoggedIn'.toString()] = false;
      resets['password'.toString()] = password;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth-token': this.token });
      const options = { headers };
      this.authenticationService.purgeAuth();
      this.authenticationService.resetPassword(resets, options).subscribe(data => {
          this.messageService.setMessage('Password successfully reset!');
          this.router.navigate(['login']);
        },
        (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helperService.getFormValidationErrors(this.resetPasswordForm));
      return;
    }
  }
}
