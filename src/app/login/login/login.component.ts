import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService, HelperService} from '../../core';

declare var $;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  urlRoute = 'login';
  errors: string[];
  authForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
  ) {
    // use FormBuilder to create a form group
    this.authForm = this.formBuilder.group({
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

  onSubmit() {
    this.errors = [];
    if (this.authForm.invalid) {
      this.errors.push('invalid username or email');
      return;
    }
    this.router.navigateByUrl('admin/organisations');
    const credentials = this.authForm.value;
    this.authenticationService.attemptAuth(this.urlRoute, credentials).subscribe(data => {
      /*if (data.status === 200) {
        this.router.navigateByUrl('admin/organisations');
      } else {
        this.errors = data.errors;
      }*/
    });
  }

  login() {
    this.router.navigateByUrl('admin');
  }
}
