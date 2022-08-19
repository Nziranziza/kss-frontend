import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
<<<<<<< HEAD:src/app/settings/payment-channel/channel-edit/channel-edit.component.ts
import {PaymentService} from '../../../core/services/payment.service';
import {HelperService} from '../../../core';
import {BasicComponent} from '../../../core';
=======
import {PaymentService} from '../../../../core/services/payment.service';
import {HelperService} from '../../../../core';
import {BasicComponent} from '../../../../core';
>>>>>>> e22c5f780c941d2979066859001d6ccef20276fb:src/app/components/settings/payment-channel/channel-edit/channel-edit.component.ts

@Component({
  selector: 'app-channel-edit',
  templateUrl: './channel-edit.component.html',
  styleUrls: ['./channel-edit.component.css']
})

export class ChannelEditComponent extends BasicComponent implements OnInit {

  editForm: FormGroup;
  id: string;

  constructor(private formBuilder: FormBuilder,
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
