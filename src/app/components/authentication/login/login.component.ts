import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpHeaders} from '@angular/common/http';
import {
  AuthenticationService,
  AuthorisationService,
  BasicComponent,
  MessageService,
  OrganisationService
} from '../../../core';
import {SeasonService} from '../../../core';

declare var $;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent extends BasicComponent implements OnInit, OnDestroy {

  authForm: FormGroup;
  viewPasswordEnabled = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private authorisationService: AuthorisationService,
    private organisationService: OrganisationService,
    private seasonService: SeasonService
  ) {
    super();
  }

  ngOnInit() {
    this.authForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.minLength(8)]
    });
    document.body.className = 'hold-transition login-page';
    $(() => {
      $('input').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%' /* optional */
      });
    });
    this.setMessage(this.messageService.getMessage());
    this.route.params
      .subscribe(params => {
        if (params.token !== undefined) {
          const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'x-auth-token': params.token
          });
          const options = {headers};
          const body = {};
          this.authenticationService.unlock(body, options).subscribe(data => {
            if (data) {
              this.setMessage('Account successfully unlocked!');
            }
          },  err => {
            this.setWarning(err.errors);
          });
        }
      });
    if (this.authenticationService.isLoggedIn()) {
      this.seasonService.all().subscribe((dt) => {
        const seasons = dt.content;
        seasons.forEach((item) => {
          if (item.isCurrent) {
            this.authenticationService.setCurrentSeason(item);
          }
        });
      });
      this.authenticationService.clearLocalStorage();
      this.afterLogInRedirect();
    }
  }

  viewPassword() {
    this.viewPasswordEnabled = !this.viewPasswordEnabled;
  }

  onSubmit() {
    if (!this.authForm.invalid) {
      const credentials = this.authForm.value;
      this.authenticationService.attemptAuth(credentials).subscribe(() => {
          this.seasonService.all().subscribe((dt) => {
            const seasons = dt.content;
            seasons.forEach((item) => {
              if (item.isCurrent) {
                this.authenticationService.setCurrentSeason(item);
              }
            });
          });
        },
        err => {
          this.setError(err.errors);
        }, () => {
          this.organisationService.getServices(this.authenticationService.getCurrentUser().info.org_id).subscribe((servicesDt) => {
            const services = servicesDt.data;
            this.authenticationService.setServices(services);
          }, () => {},  () => {
            this.afterLogInRedirect();
          });
        });

    } else {
      this.setError(['Invalid username or email']);
    }
  }

  ngOnDestroy() {
    this.messageService.setMessage('');
  }

  afterLogInRedirect() {
    const orgId = this.authenticationService.getCurrentUser().info.org_id;
    if (this.authorisationService.isCWSUser()) {
      this.router.navigateByUrl('admin/organisations/details/' + orgId + '/dashboard');
    } else if (this.authorisationService.isDryMillUser()) {
      this.router.navigateByUrl('admin/drymill/parchment/list');
    } else if (this.authorisationService.isSWAdmin()) {
      this.router.navigateByUrl('admin/sw/green_coffee/list');
    } else if (this.authorisationService.isCeparUser()) {
      this.router.navigateByUrl('admin/warehouse/dispatches');
    } else if (this.authorisationService.isSiteManager()) {
      this.router.navigateByUrl('admin/input/site/distribution');
    } else if (this.authorisationService.isTechnoServeAdmin()) {
      this.router.navigateByUrl('admin/dashboard/extension');
    } else {
      this.router.navigateByUrl('admin/organisations');
    }
  }
}
