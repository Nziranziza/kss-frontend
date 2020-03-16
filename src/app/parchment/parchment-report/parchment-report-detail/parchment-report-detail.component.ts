import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UserService} from '../../../core/services';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-parchment-report-detail',
  templateUrl: './parchment-report-detail.component.html',
  styleUrls: ['./parchment-report-detail.component.css']
})
export class ParchmentReportDetailComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() location;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object, private userService: UserService,
    private injector: Injector) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
  }
}
