import {
  Component,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthorisationService, OrganisationService} from '../../../../core/services';
import {isPlatformBrowser} from '@angular/common';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-supplier-deliveries',
  templateUrl: './supplier-deliveries.component.html',
  styleUrls: ['./supplier-deliveries.component.css']
})
export class SupplierDeliveriesComponent implements OnInit, OnDestroy {

  modal: NgbActiveModal;
  supplier: any;
  @Input() parameters: any;
  isUserCeparOfficer = false;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private organisationService: OrganisationService,
    private authorisationService: AuthorisationService,
    private injector: Injector) {
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.isUserCeparOfficer = this.authorisationService.isCeparUser();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    if (!this.isUserCeparOfficer) {
      this.dtOptions.columns = [{}, {}, {}, {}, {}, {}, {}, {
        class: 'none'
      }, {}, {}];
      this.dtOptions.responsive = true;
    }


    this.organisationService.getSingleSupplier(this.parameters).subscribe((data) => {
      this.supplier = data.content[0];
      this.dtTrigger.next();
    });
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
}
