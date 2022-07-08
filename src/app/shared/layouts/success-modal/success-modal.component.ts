import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-success-modal',
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.css']
})
export class SuccessModalComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() title: string;
  @Input() closeButtonText: string;
  @Input() message: string;
  @Input() name: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }
  ngOnInit() {
  }

  close() {
    this.modal.dismiss();
  }
}
