import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../core/services';
import {HelperService} from '../core/helpers';
import {JwtService} from '../core/services';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private authenticationService: AuthenticationService, private helperService: HelperService,
              private jwtService: JwtService) {
  }

  changePasswordForm: FormGroup;
  errors: string[];
  orgInfo: any;
  userInfo: any;
  message: string;

  ngOnInit() {

    this.changePasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
    this.userInfo = this.authenticationService.getCurrentUser().info;
    this.orgInfo = this.authenticationService.getCurrentUser().orgInfo;
  }

  onSubmit() {
    this.errors = [];
    if (this.changePasswordForm.invalid) {
      this.errors = this.helperService.getFormValidationErrors(this.changePasswordForm);
      return;
    }
    const password = this.changePasswordForm.controls.password.value;
    const confirmPassword = this.changePasswordForm.controls.confirmPass.value;

    if (password === confirmPassword) {
      this.errors = ['passwords do not match'];
      return;
    }
    const resets = this.changePasswordForm.value;
    resets['id'.toString()] = this.userInfo._id;
    resets['token'.toString()] = this.jwtService.getToken();
    resets['isLoggedIn'.toString()] = true;
    this.authenticationService.resetPassword(resets).subscribe(data => {
        this.router.navigateByUrl('login', {state: {message: 'Password successfully reset'}});
      },
      (err) => {
        this.errors = err.errors;
      });
  }

}
