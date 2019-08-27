import {Component, OnInit} from '@angular/core';
import {AuthenticationService, ConfirmDialogService} from '../../core/services';
import {InputDistributionService} from '../../core/services';
import {FormBuilder} from '@angular/forms';
import {HelperService} from '../../core/helpers';
import {ConfirmDispatchComponent} from './confirm-dispatch/confirm-dispatch.component';
import {MessageService} from '../../core/services/message.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs';
import {RecordSiteStockOutComponent} from './site-stock-out/record-site-stock-out.component';

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
              private inputDistributionService: InputDistributionService,
  ) {
  }

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
      pageLength: 25
    };
    this.getSiteDispatches();
  }

  confirmDispatch(dispatchId: string, entryId: string): void {
    const modalRef = this.modal.open(ConfirmDispatchComponent, {size: 'lg'});
    modalRef.componentInstance.dispatchId = dispatchId;
    modalRef.componentInstance.entryId = entryId;
    modalRef.result.finally(() => {
      const id = '5d414020075a5550b7de08bb';
      this.inputDistributionService.getSiteDispatches(id).subscribe((data) => {
        this.dispatches = data.content;
      });
    });
  }

  stockOut(dispatch: string, entryId: string) {
    const modalRef = this.modal.open(RecordSiteStockOutComponent, {size: 'lg'});
    modalRef.componentInstance.dispatchId = dispatch;
    modalRef.componentInstance.entryId = entryId;
    modalRef.result.finally(() => {
      const id = '5d414020075a5550b7de08bb';
      this.inputDistributionService.getSiteDispatches(id).subscribe((data) => {
        this.dispatches = data.content;
      });
    });
  }

  getSiteDispatches() {
    this.loading = true;
    /* const id = this.authenticationService.getCurrentUser().info.distributionSite; */
    const id = '5d414020075a5550b7de08bb';
    this.inputDistributionService.getSiteDispatches(id).subscribe((data) => {
      this.loading = false;
      this.dtTrigger.next();
      this.dispatches = data.content;
    });
  }
}
