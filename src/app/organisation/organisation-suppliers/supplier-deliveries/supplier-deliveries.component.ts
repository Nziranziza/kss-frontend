import {
  AfterViewInit,
  Component,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UserService} from '../../../core/services';
import {isPlatformBrowser} from '@angular/common';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-supplier-deliveries',
  templateUrl: './supplier-deliveries.component.html',
  styleUrls: ['./supplier-deliveries.component.css']
})
export class SupplierDeliveriesComponent implements OnInit, OnDestroy, AfterViewInit {

  modal: NgbActiveModal;
  @Input() supplier: any;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object, private userService: UserService,
    private injector: Injector) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      columns: [{}, {}, {}, {}, {}, {}, {
        class: 'none'
      }, {}, {}],
      responsive: true
    };
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
}
