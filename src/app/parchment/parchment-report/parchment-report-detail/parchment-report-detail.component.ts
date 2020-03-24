import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ParchmentService, UserService} from '../../../core/services';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-parchment-report-detail',
  templateUrl: './parchment-report-detail.component.html',
  styleUrls: ['./parchment-report-detail.component.css']
})
export class ParchmentReportDetailComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() location;
  production: any;
  loading = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object, private userService: UserService,
    private parchmentService: ParchmentService,
    private injector: Injector) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.loading = true;
    this.parchmentService.detailedReport(this.location).subscribe((data) => {
      this.production = data.content[0];
      this.loading = false;
    });
  }
}
