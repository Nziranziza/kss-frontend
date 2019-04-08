import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-farmer-details',
  templateUrl: './farmer-details.component.html',
  styleUrls: ['./farmer-details.component.css']
})
export class FarmerDetailsComponent implements OnInit {

  private modal: NgbActiveModal;

  @Input() public farmer;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
  }
}
