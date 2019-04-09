import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../core';
import {MessageService} from '../../core/services/message.service';

declare var $;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  errors: string[];
  authForm: FormGroup;
  message: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private messageService: MessageService
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
    this.message = this.messageService.getMessage();
  }

  onSubmit() {
    if (!this.authForm.invalid) {
      const credentials = this.authForm.value;
      this.authenticationService.attemptAuth(credentials).subscribe(data => {
          this.router.navigateByUrl('admin/organisations');
        },
        err => {
          this.errors = err.errors;
        });

    } else {
      this.errors.push('Invalid username or email');
      return;
    }
  }

  login() {
    this.router.navigateByUrl('admin');
  }
}
