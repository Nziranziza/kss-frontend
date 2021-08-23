import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DryProcessingService, ParchmentService} from '../../../core/services';
import {isPlatformBrowser} from '@angular/common';
import {BasicComponent} from '../../../core/library';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HelperService} from '../../../core/helpers';

@Component({
  selector: 'app-edit-parchment',
  templateUrl: './edit-delivery-item.component.html',
  styleUrls: ['./edit-delivery-item.component.css']
})
export class EditDeliveryItemComponent extends BasicComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() payload;
  editForm: FormGroup;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private dryProcessingService: DryProcessingService,
    private parchmentService: ParchmentService,
    private formBuilder: FormBuilder,
    private helper: HelperService,
    private injector: Injector) {

    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      quantity: [this.payload.quantity, Validators.min(0)]
    });
  }

  onSubmit() {
    if (this.editForm.valid) {
      this.payload.quantity = this.editForm.value.quantity;
      this.parchmentService.updateDelivery(this.payload).subscribe((data) => {
          this.modal.close(data.message);
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editForm);
    }
  }
}
