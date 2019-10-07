import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {InputDistributionService} from '../../../core/services';
import {isPlatformBrowser} from '@angular/common';
import {MessageService} from '../../../core/services';

@Component({
  selector: 'app-confirm-dispatch',
  templateUrl: './confirm-dispatch.component.html',
  styleUrls: ['./confirm-dispatch.component.css']
})
export class ConfirmDispatchComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() dispatchId;
  @Input() entryId;
  confirmForm: FormGroup;
  errors: string [];
  message: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private helper: HelperService, private inputDistributionService: InputDistributionService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit(): void {
    this.confirmForm = this.formBuilder.group({
      receivedQty: ['', Validators.required],
      comment: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.confirmForm.valid) {
      const record = JSON.parse(JSON.stringify(this.confirmForm.value));
      record['dispatchId'.toString()] = this.dispatchId;
      console.log(this.entryId);
      record['entryId'.toString()] = this.entryId;
      record['receiverId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.inputDistributionService.confirmDispatch(record).subscribe(() => {
          this.message = 'Dispatch confirmed!';
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.confirmForm);
    }
  }
}
