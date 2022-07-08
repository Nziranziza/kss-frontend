import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  AuthenticationService,
  AuthorisationService,
  BasicComponent,
  ConfirmDialogService, GroupService, MessageService,
  OrganisationService,
  SiteService, Training
} from '../../../../core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {DataTableDirective} from 'angular-datatables';
import {TrainingDeleteModal} from '../../trainings/training-delete-modal/training-delete-modal.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConfirmModalComponent} from '../../../../shared/layouts/confirm-modal/confirm-modal.component';
import {error} from 'protractor';

@Component({
  selector: 'app-farmer-group-list',
  templateUrl: './farmer-group-list.component.html',
  styleUrls: ['./farmer-group-list.component.css']
})
export class FarmerGroupListComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(
              private authorisationService: AuthorisationService,
              private groupService: GroupService,
              private route: ActivatedRoute,
              private modal: NgbModal,
              private authenticationService: AuthenticationService, private messageService: MessageService) {
    super();
  }
  groups = [];
  loading = false;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  ngOnInit() {
    this.listGroups();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.setMessage(this.messageService.getMessage());
  }


  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.messageService.clearMessage();
  }


  listGroups(): void {
    this.loading = true;
    const body = {
      reference: this.authenticationService.getCurrentUser().info.org_id
    };

    this.groupService.list(body).subscribe((data) => {
      this.groups = data.data;
      this.dtTrigger.next();
    });
  }

  openDelete(group: any, warning?: any ) {
    const modalRef = this.modal.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Delete group';
    modalRef.componentInstance.content =
      'Are you sure you want to delete this Group?';
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.cancelButtonText = 'Cancel';
    modalRef.componentInstance.warning = warning;
    modalRef.result.then((results) => {
      if (results.confirmed) {
        this.groupService.delete(group._id).subscribe(() => {
            this.loading = true;
            const body = {
              reference: this.authenticationService.getCurrentUser().info.org_id
            };

            this.groupService.list(body).subscribe((data) => {
              this.groups = data.data;
              this.loading = false;
            });
            this.setMessage('Group successfully deleted!');
          },
          (err) => {
          this.openDelete(group, err.message);
        });
      }
    });
  }

}
