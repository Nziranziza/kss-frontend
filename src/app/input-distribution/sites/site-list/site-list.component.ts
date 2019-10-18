import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmDialogService} from '../../../core/services';
import {SiteService} from '../../../core/services';
import {Subject} from 'rxjs';
import {MessageService} from '../../../core/services';

@Component({
  selector: 'app-site-list',
  templateUrl: './site-list.component.html',
  styleUrls: ['./site-list.component.css']
})
export class SiteListComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
              private router: Router, private  confirmDialogService: ConfirmDialogService,
              private siteService: SiteService, private messageService: MessageService) {
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
    this.siteService.getAll().subscribe(data => {
      if (data) {
        this.sites = data.content;
        this.dtTrigger.next();
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.messageService.setMessage('');
  }
}
