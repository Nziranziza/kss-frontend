import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {BasicComponent} from '../../../core/library';

declare var $;

@Component({
  selector: 'app-request-reset',
  templateUrl: './request-reset.component.html',
  styleUrls: ['./request-reset.component.css']
})
export class RequestResetComponent extends BasicComponent implements OnInit {

  errors: any;
  message: string;
  requestResetForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder, private helperService: HelperService
  ) {
    super();
  }

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
          this.setMessage('Request successful submitted!');
          return;
        },
        (err) => {
          this.message = '';
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helperService.getFormValidationErrors(this.requestResetForm));
      return;
    }
  }

}
