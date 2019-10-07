import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../core/services';
import {HelperService} from '../../core/helpers';

declare var $;

@Component({
  selector: 'app-request-reset',
  templateUrl: './request-reset.component.html',
  styleUrls: ['./request-reset.component.css']
})
export class RequestResetComponent implements OnInit {

  errors: string[];
  message: string;
  requestResetForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder, private helperService: HelperService
  ) {}

  ngOnInit() {
    this.requestResetForm = this.formBuilder.group({
      email: ['', Validators.required]
    });
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
    if (!this.requestResetForm.invalid) {
      this.authenticationService.requestReset(this.requestResetForm.value).subscribe(data => {
          this.message = 'Request successful submitted!';
          return;
        },
        (err) => {
          this.message = '';
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helperService.getFormValidationErrors(this.requestResetForm);
      return;
    }
  }

}
