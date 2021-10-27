import {AfterViewInit, Component, Inject, Injector, Input, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService, InputDistributionService, MessageService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';
import {BasicComponent} from '../../../core/library';
import {Subject} from 'rxjs';
import {DataTableDirective} from 'angular-datatables';

@Component({
  selector: 'app-view-application',
  templateUrl: './view-application.component.html',
  styleUrls: ['./view-application.component.css']
})
export class ViewApplicationComponent extends BasicComponent implements OnInit, AfterViewInit {

  modal: NgbActiveModal;
  @Input() stockOut;
  errors: string [];
  message: string;
  dtOptions: any = {};
  loading = false;
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private inputDistributionService: InputDistributionService) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
  }

  onSubmit() {
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  cancelDistribution(recipientId, regNumber) {
  }

}
