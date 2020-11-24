import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {BasicComponent} from '../../../core/library';
import {PaymentService} from '../../../core/services/payment.service';

@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.css']
})
export class ChannelListComponent extends BasicComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private paymentService: PaymentService) { super();
  }

  channels: any;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.getPaymentChannels();
  }

  getPaymentChannels() {
    this.paymentService.listChannels().subscribe((data) => {
      this.channels = data.content;
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }


}
