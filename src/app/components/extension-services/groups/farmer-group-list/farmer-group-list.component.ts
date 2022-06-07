import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  AuthenticationService,
  AuthorisationService,
  BasicComponent,
  ConfirmDialogService, MessageService,
  OrganisationService,
  SiteService
} from '../../../../core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {DataTableDirective} from 'angular-datatables';

@Component({
  selector: 'app-farmer-group-list',
  templateUrl: './farmer-group-list.component.html',
  styleUrls: ['./farmer-group-list.component.css']
})
export class FarmerGroupListComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(private organService: OrganisationService, private siteService: SiteService,
              private router: Router, private  confirmDialogService: ConfirmDialogService,
              private authorisationService: AuthorisationService,
              private route: ActivatedRoute,
              private authenticationService: AuthenticationService, private messageService: MessageService) {
    super();
  }
  groups = [];
  dtOptions: any = {};
  loading = false;
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  ngOnInit() {
    this.getGroups();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.setMessage(this.messageService.getMessage());
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.messageService.clearMessage();
  }


  getGroups(): void {
    this.loading = true;
    }

}
