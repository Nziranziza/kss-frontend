import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {OrganisationTypeService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {PaymentChannelService} from '../../../core/services/payment-channel.service';
import {BasicComponent} from '../../../core/library';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent extends BasicComponent implements OnInit {

  createForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private router: Router, private paymentChannelService: PaymentChannelService, private helper: HelperService) {
    super();
  }


  ngOnInit() {
    this.createForm = this.formBuilder.group({
      channel: ['Manual', Validators.required]
    });
  }

  onSubmit() {
    if (this.createForm.valid) {
      const channel = this.createForm.value;
      this.paymentChannelService.createChannel(channel).subscribe((response) => {
        this.setMessage(response.message);
      }, (err) => {
        this.setError(err.errors);
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }

}
