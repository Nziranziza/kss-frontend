import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService, AuthorisationService, ConfirmDialogService} from '../../../core/services';
import {SiteService} from '../../../core/services';
import {Subject} from 'rxjs';
import {MessageService} from '../../../core/services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SiteDetailsComponent} from '../site-details/site-details.component';
import {BasicComponent} from '../../../core/library';

@Component({
  selector: 'app-site-list',
  templateUrl: './site-list.component.html',
  styleUrls: ['./site-list.component.css']
})
export class SiteListComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
              private modal: NgbModal,
              private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService,
              private router: Router, private  confirmDialogService: ConfirmDialogService,
              private siteService: SiteService, private messageService: MessageService) {
    super();
  }

  message: string;
  sites: any;
  loading = false;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.message = this.messageService.getMessage();
    this.getAllSites();
  }

  getAllSites(): void {
    this.loading = true;
    this.clear();
    if (!this.authorisationService.isDistrictCashCropOfficer()) {
      this.siteService.getAll().subscribe(data => {
        if (data) {
          this.sites = data.content;
          this.dtTrigger.next();
          this.loading = false;
        }
      });
    } else {
      const body = {
        searchBy: 'district',
        dist_id: this.authenticationService.getCurrentUser().info.location.dist_id
      };

      this.siteService.getSite(body).subscribe((data) => {
        this.sites = data.content;
        this.dtTrigger.next();
        this.loading = false;
      });
    }
  }

  viewDetails(site: any) {
    const modalRef = this.modal.open(SiteDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.site = site;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.messageService.clearMessage();
  }
}
