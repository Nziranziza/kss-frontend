import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
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
  @Input() dispatch;
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
      entries: new FormArray([]),
    });
    const temp = [];
    this.dispatch.entries.forEach((entry) => {
      temp.push({
        entryId : entry._id,
        receivedQty: (entry.numberOfItems *  entry.quantityPerItem),
        comment: ''
      });
      this.addEntry();
    });
    this.confirmForm.controls.entries.patchValue(temp);
  }

  get formEntries() {
    return this.confirmForm.controls.entries as FormArray;
  }

  addEntry() {
    (this.formEntries).push(this.createEntry());
  }

  createEntry(): FormGroup {
    return this.formBuilder.group({
      entryId: [''],
      receivedQty: [''],
      comment: ['']
    });
  }

  onSubmit() {
    if (this.confirmForm.valid) {
      const record = JSON.parse(JSON.stringify(this.confirmForm.value));
      record['receiverId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      record['dispatchId'.toString()] = this.dispatch._id;
      record.entries.forEach((entry) => {
        this.helper.cleanObject(entry);
      });
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
