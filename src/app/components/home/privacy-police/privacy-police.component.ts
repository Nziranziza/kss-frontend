import {Component, Inject, Injector, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-privacy-police',
  templateUrl: './privacy-police.component.html',
  styleUrls: ['./privacy-police.component.css']
})
export class PrivacyPoliceComponent implements OnInit {

  modal: NgbActiveModal;

  constructor(
    @Inject(PLATFORM_ID) private platformId, private injector: Injector
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

}
