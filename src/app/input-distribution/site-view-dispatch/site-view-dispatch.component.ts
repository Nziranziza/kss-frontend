import {Component, OnInit} from '@angular/core';
import {AuthenticationService, ConfirmDialogService, InputDistributionService, MessageService} from '../../core/services';
import {FormBuilder} from '@angular/forms';
import {HelperService} from '../../core/helpers';
import {ConfirmDispatchComponent} from './confirm-dispatch/confirm-dispatch.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs';
import {RecordSiteStockOutComponent} from '../site-view-stockout/site-stock-out/record-site-stock-out.component';

@Component({
  selector: 'app-site-view-dispatch',
  templateUrl: './site-view-dispatch.component.html',
  styleUrls: ['./site-view-dispatch.component.css']
})
export class SiteViewDispatchComponent implements OnInit {

  constructor(private confirmDialogService: ConfirmDialogService,
              private formBuilder: FormBuilder,
              private helper: HelperService,
              private messageService: MessageService,
              private modal: NgbModal,
              private authenticationService: AuthenticationService,
              private inputDistributionService: InputDistributionService) {}

  message: string;
  dispatches: any;
  errors: any;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      columns: [{}, {}, {}, {
        class: 'none'
      }, {}, {}],
      responsive: true
    };
    this.getSiteDispatches();
  }

  confirmDispatch(dispatch): void {
    const modalRef = this.modal.open(ConfirmDispatchComponent, {size: 'lg'});
    modalRef.componentInstance.dispatch = dispatch;
    modalRef.result.finally(() => {
      const id = this.authenticationService.getCurrentUser().orgInfo.distributionSite;
      this.inputDistributionService.getSiteDispatches(id).subscribe((data) => {
        this.dispatches = data.content;
      });
    });
  }

  getSiteDispatches() {
    this.loading = true;
    const id = this.authenticationService.getCurrentUser().orgInfo.distributionSite;
    this.inputDistributionService.getSiteDispatches(id).subscribe((data) => {
      this.loading = false;
      this.dtTrigger.next();
      this.dispatches = data.content;
    });
  }
}
