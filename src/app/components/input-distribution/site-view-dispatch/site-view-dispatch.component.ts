import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService, ConfirmDialogService, InputDistributionService, MessageService} from '../../../core/services';
import {FormBuilder} from '@angular/forms';
import {HelperService} from '../../../core/helpers';
import {ConfirmDispatchComponent} from './confirm-dispatch/confirm-dispatch.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs';
import {BasicComponent} from '../../../core/library';
import {DataTableDirective} from 'angular-datatables';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-site-view-dispatch',
  templateUrl: './site-view-dispatch.component.html',
  styleUrls: ['./site-view-dispatch.component.css']
})
export class SiteViewDispatchComponent extends BasicComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private confirmDialogService: ConfirmDialogService,
              private formBuilder: FormBuilder,
              private helper: HelperService,
              private messageService: MessageService,
              private router: Router,
              private modal: NgbModal,
              private route: ActivatedRoute,
              private authenticationService: AuthenticationService,
              private inputDistributionService: InputDistributionService) {

    super();
  }

  dispatches: any;
  errors: any;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;
  table: any;
  siteId: string;

  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      columns: [{}, {}, {}, {
        class: 'none'
      }, {}, {}],
      responsive: true
    };
    this.route.params.subscribe(params => {
      this.siteId = params['siteId'.toString()];
    });
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }

  confirmDispatch(dispatch): void {
    const modalRef = this.modal.open(ConfirmDispatchComponent, {size: 'lg'});
    modalRef.componentInstance.dispatch = dispatch;
    modalRef.result.then((message) => {
      this.getSiteDispatches();
      this.setMessage(message);
    });
  }

  printEntryNote(id: string) {
    this.inputDistributionService.printDispatchEntryNote(id).subscribe((data) => {
      const byteArray = new Uint8Array(atob(data.data).split('').map(char => char.charCodeAt(0)));
      const newBlob = new Blob([byteArray], {type: 'application/pdf'});
      const linkElement = document.createElement('a');
      const url = URL.createObjectURL(newBlob);
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', data.fileName + '.pdf');
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      });
      linkElement.dispatchEvent(clickEvent);
    });
  }

  getSiteDispatches() {
    this.loading = true;
    this.inputDistributionService.getSiteDispatches(this.siteId).subscribe((data) => {
        this.loading = false;
        this.dispatches = data.content;
        this.rerender();
    });
  }

  ngAfterViewInit(): void {
    this.loading = true;
    this.inputDistributionService.getSiteDispatches(this.siteId).subscribe((data) => {
      this.loading = false;
      this.dtTrigger.next();
      this.dispatches = data.content;
    });
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
}
