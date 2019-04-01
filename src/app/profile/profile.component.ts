import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../core/services/authentication.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private authenticationService: AuthenticationService) {
  }

  changePasswordForm: FormGroup;
  errors: string[];
  phoneNumber: string;
  email: string;
  message: string;


  ngOnInit() {

    this.changePasswordForm = this.formBuilder.group({
      password: [''],
      confirm_password: ['']
    });
    /*
    this.email = this.authenticationService.getCurrentUser().info.email;
    this.phoneNumber = this.authenticationService.getCurrentUser().info.phoneNumber;
    */
  }

  onSubmit() {
    if (this.changePasswordForm.valid) {
      this.authenticationService.resetPassword(this.changePasswordForm.value).subscribe(data => {
          this.message = data.message;
          return;
        },
        (err) => {
          this.errors = err.errors;
        });

    }
  }

}
