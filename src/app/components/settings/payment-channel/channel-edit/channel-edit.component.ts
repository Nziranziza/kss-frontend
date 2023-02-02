import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {PaymentService} from '../../../../core/services/payment.service';
import {HelperService} from '../../../../core';
import {BasicComponent} from '../../../../core';

@Component({
  selector: 'app-channel-edit',
  templateUrl: './channel-edit.component.html',
  styleUrls: ['./channel-edit.component.css']
})

export class ChannelEditComponent extends BasicComponent implements OnInit {

  editForm: UntypedFormGroup;
  id: string;

  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private paymentService: PaymentService,
              private helper: HelperService) {
    super();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
    });

    this.editForm = this.formBuilder.group({
      channel: ['', Validators.required]
    });

    this.paymentService.getChannel(this.id).subscribe((data) => {
      this.editForm.patchValue(data.content);
    });
  }

  onSubmit() {
    if (this.editForm.valid) {
      const channel = this.editForm.value;
      this.paymentService.createChannel(channel).subscribe((response) => {
        this.setMessage(response.message);
      }, (err) => {
        this.setError(err.errors);
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editForm);
    }
  }
}
