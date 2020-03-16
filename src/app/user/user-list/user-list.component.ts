import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../core/services';
import {User} from '../../core/models';
import {ConfirmDialogService, OrganisationService} from '../../core/services';
import {Subject} from 'rxjs';
import {UserDetailsComponent} from '../user-details/user-details.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {

  organisationId: string;
  users: User[];
  message: string;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  org: any;

  constructor(private route: ActivatedRoute,
              private modal: NgbModal,
              private userService: UserService,
              private confirmDialogService: ConfirmDialogService,
              private organisationService: OrganisationService) {

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.getAllUsers();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.organisationService.get(this.organisationId).subscribe(data => {
      this.org = data.content;
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getAllUsers(): void {
    this.userService.all(this.organisationId).subscribe(data => {
      if (data) {
        this.users = data.content;
        this.dtTrigger.next();
      }
    });
  }

  viewDetails(user: any) {
    const modalRef = this.modal.open(UserDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.user = user;
  }
}
