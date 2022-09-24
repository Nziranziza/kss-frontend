import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  AuthenticationService,
  AuthorisationService,
  MessageService,
  UserService,
} from "../../../core/services";
import { User } from "../../../core/models";
import { ConfirmDialogService, OrganisationService } from "../../../core/services";
import { Subject } from "rxjs";
import { UserDetailsComponent } from "../user-details/user-details.component";
import { ChangeUserOrgComponent } from "../change-user-org/change-user-org.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BasicComponent } from "../../../core/library";
import { Router } from "@angular/router";

@Component({
  selector: "app-user",
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.css"],
})
export class UserListComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{
  organisationId: string;
  users: User[];
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  org: any;
  isCWSAdmin: boolean;
  currentUser: any;
  cwsDashes: string;

  constructor(
    private route: ActivatedRoute,
    private modal: NgbModal,
    private userService: UserService,
    private messageService: MessageService,
    private authorisationService: AuthorisationService,
    private authenticationService: AuthenticationService,
    private confirmDialogService: ConfirmDialogService,
    private organisationService: OrganisationService,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (!params['organisationId'.toString()]) {
        this.route.parent.params.subscribe((params) => {
          this.organisationId = params['organisationId'.toString()];
          this.cwsDashes = 'hello';
        });
      } else {
        this.organisationId = params['organisationId'.toString()];
      }
    });
    this.isCWSAdmin = this.authorisationService.isCWSAdmin();
    this.currentUser = this.authenticationService.getCurrentUser();
    this.getAllUsers();
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
    };
    this.organisationService.get(this.organisationId).subscribe((data) => {
      this.org = data.content;
    });
    this.setMessage(this.messageService.getMessage());
  }

  getAllUsers(): void {
    this.userService.all(this.organisationId).subscribe((data) => {
      if (data) {
        this.users = data.content;
        this.dtTrigger.next();
      }
    });
  }

  viewDetails(user: any) {
    const modalRef = this.modal.open(UserDetailsComponent, { size: "lg" });
    modalRef.componentInstance.user = user;
  }

  isUserCWSCollector(user: any) {
    let isCollector = false;
    user.hasAccessTo.forEach((form) => {
      if (+form.app === 2 && +form.userType === 13) {
        isCollector = true;
      }
    });
    return isCollector;
  }

  changeUsersOrganisation(user: any) {
    const ref = this.modal.open(ChangeUserOrgComponent, { size: "sm" });
    ref.componentInstance.user = user;
    ref.componentInstance.org = this.org;

    ref.result.then(
      (data) => {
        this.router
          .navigate(["admin/organisations/" + data + "/users"])
          .then(() => {
            window.location.reload();
          });
      },
      (reason) => {
        // on dismiss
      }
    );
  }

  ngOnDestroy(): void {
    this.messageService.clearMessage();
    this.dtTrigger.unsubscribe();
  }
}
