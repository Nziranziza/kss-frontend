import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService, SiteService} from '../../core';
import {HelperService} from '../../core';
import {MessageService} from '../../core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private authenticationService: AuthenticationService, private siteService: SiteService,
              private helperService: HelperService, private messageService: MessageService) {
  }

  changePasswordForm: FormGroup;
  errors: string[];
  orgInfo: any;
  userInfo: any;
  site: any;
  message: string;

  ngOnInit() {
    this.changePasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
    this.userInfo = this.authenticationService.getCurrentUser().info;
    this.orgInfo = this.authenticationService.getCurrentUser().orgInfo;
    if (this.orgInfo.distributionSites) {
      this.siteService.get(this.orgInfo.distributionSites).subscribe(data => {
        this.site = data.content;
      });
    }
  }

  onSubmit() {
    if (!this.changePasswordForm.invalid) {
      const password = this.changePasswordForm.controls.password.value;
      const confirmPassword = this.changePasswordForm.controls.confirmPassword.value;

      if (password !== confirmPassword) {
        this.errors = ['Passwords do not match'];
        return;
      }
      const resets = {};
      resets['isLoggedIn'.toString()] = true;
      resets['password'.toString()] = password;
      this.authenticationService.resetPassword(resets).subscribe(() => {
          this.messageService.setMessage('Password successfully reset');
          this.authenticationService.purgeAuth();
          this.router.navigate(['login']);
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helperService.getFormValidationErrors(this.changePasswordForm);
      return;
    }
  }

}