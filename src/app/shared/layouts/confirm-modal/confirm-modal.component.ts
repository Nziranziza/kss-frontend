import {Component, Inject, Injector, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';
import {BasicComponent} from '../../../core';
import {isUndefined} from 'util';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent extends BasicComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() title: string;
  @Input() content: string;
  @Input() confirmButtonText: string;
  @Input() cancelButtonText: string;
  @Input() warning: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }
  ngOnInit() {
    if (!isUndefined(this.warning)) {
      this.setError(this.warning);
    }
  }

  confirm() {
    this.modal.close({confirmed: true});
  }

  cancel() {
    this.modal.close({confirmed: false});
  }
}
