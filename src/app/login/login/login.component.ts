import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {AuthenticationService} from '../../core';
import {Errors} from '../../core';

declare var $;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  authType = 'login';
  errors: Errors = {errors: {}};
  authForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private fb: FormBuilder
  ) {
    // use FormBuilder to create a form group
    this.authForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
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

  submitForm() {
    this.errors = {errors: {}};
    const credentials = this.authForm.value;
    this.authenticationService
      .attemptAuth(this.authType, credentials)
      .subscribe(
        data => this.router.navigateByUrl('admin'),
        err => {
          this.errors = err;
        }
      );
  }

  login() {
    this.router.navigate(['admin']);
  }

}
