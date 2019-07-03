import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../core';
import {MessageService} from '../../core/services/message.service';
import {HttpHeaders} from '@angular/common/http';
import {AuthorisationService} from '../../core/services/authorisation.service';
import {SeasonService} from '../../core/services/season.service';

declare var $;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  errors: string[];
  authForm: FormGroup;
  message: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private authorisationService: AuthorisationService,
    private seasonService: SeasonService
  ) {
    // use FormBuilder to create a form group
    this.authForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.minLength(8)]
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
    this.route.params
      .subscribe(params => {
        if (params.token !== undefined) {
          console.log('test');
          const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'x-auth-token': params.token
          });
          const options = {headers};
          const body = {};
          this.authenticationService.unlock(body, options).subscribe(data => {
            if (data) {
              this.message = 'Account successfully unlocked!';
              return;
            }
          });
        }
      });
  }

  onSubmit() {
    if (!this.authForm.invalid) {
      const credentials = this.authForm.value;
      this.authenticationService.attemptAuth(credentials).subscribe(data => {
          const orgId = this.authenticationService.getCurrentUser().info.org_id;
          this.seasonService.all().subscribe((dt) => {
            const seasons = dt.content;
            if (this.authenticationService.getCurrentSeason() === null) {
              seasons.forEach((item) => {
                if (item.isCurrent) {
                  this.authenticationService.setCurrentSeason(item);
                }
              });
            }
            if (this.authorisationService.isCWSUser()) {
              this.router.navigateByUrl('admin/cws-farmers/' + orgId);
            } else if (this.authorisationService.isDryMillUser()) {
              this.router.navigateByUrl('admin/drymill/batch/create');
            } else {
              this.router.navigateByUrl('admin/organisations');
            }
          });

        },
        err => {
          this.errors = err.errors;
        });

    } else {
      this.errors = ['Invalid username or email'];
      return;
    }
  }

  ngOnDestroy() {
    this.messageService.setMessage('');
  }
}
