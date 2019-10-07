import {AfterViewInit, Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-delivery-details',
  templateUrl: './delivery-details.component.html',
  styleUrls: ['./delivery-details.component.css']
})
export class DeliveryDetailsComponent implements OnInit, AfterViewInit {

  modal: NgbActiveModal;
  @Input() deliveries;
  @Input() inputType;
  errors: string [];
  message: string;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector) {
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
}
