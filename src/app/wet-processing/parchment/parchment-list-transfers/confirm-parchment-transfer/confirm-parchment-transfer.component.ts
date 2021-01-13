import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthenticationService, InputDistributionService, MessageService} from '../../../../core/services';
import {HelperService} from '../../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-confirm-parchment-transfer',
  templateUrl: './confirm-parchment-transfer.component.html',
  styleUrls: ['./confirm-parchment-transfer.component.css']
})
export class ConfirmParchmentTransferComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() transfer;
  confirmForm: FormGroup;
  errors: string [];
  message: string;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

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
      comment: ['']
    });
  }

  onSubmit() {
    if (this.confirmForm.valid) {
      const record = JSON.parse(JSON.stringify(this.confirmForm.value));
      record['receiverId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      record['transferId'.toString()] = this.transfer._id;
      this.helper.cleanObject(record);
      this.inputDistributionService.confirmDispatch(record).subscribe(() => {
          this.modal.close('Dispatch confirmed!');
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.confirmForm);
    }
  }
}
