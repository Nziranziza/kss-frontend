import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {HelperService} from '../../../../core';
import {PaymentService} from '../../../../core/services/payment.service';
import {BasicComponent} from '../../../../core';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent extends BasicComponent implements OnInit {

  createForm: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder,
              private router: Router, private paymentService: PaymentService, private helper: HelperService) {
    super();
  }

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      channel: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.createForm.valid) {
      const channel = this.createForm.value;
      this.paymentService.createChannel(channel).subscribe((response) => {
        this.setMessage(response.message);
      }, (err) => {
        this.setError(err.errors);
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }

}
