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
  ) {
    // use FormBuilder to create a form group
    this.requestResetForm = this.formBuilder.group({
      email: ['', Validators.required]
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
    if (this.requestResetForm.invalid) {
      this.errors = this.helperService.getFormValidationErrors(this.requestResetForm);
      return;
    }

    this.authenticationService.requestReset(this.requestResetForm.value).subscribe(data => {
        this.message = data.message;
        return;
      },
      (err) => {
        this.errors = err.errors;
      });
  }

}
