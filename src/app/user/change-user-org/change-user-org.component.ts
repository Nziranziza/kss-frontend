import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Inject,
  PLATFORM_ID,
  Injector,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { UserService } from "src/app/core";
import { isPlatformBrowser } from "@angular/common";
import {
  OrganisationService,
  AuthorisationService,
  AuthenticationService,
  MessageService,
} from "src/app/core";
import { DataTableDirective } from "angular-datatables";

@Component({
  selector: "app-change-user-org",
  templateUrl: "./change-user-org.component.html",
  styleUrls: ["./change-user-org.component.css"],
})
export class ChangeUserOrgComponent implements OnInit {
  // TO:DO Build Models for organisations and user

  modal: NgbActiveModal;
  @Input() user: any;
  @Input() org;
  requests: any;
  // Id for the new organisation
  newOrg: String;
  organisations = [];
  isSending: boolean = false;

  // Autocomplete
  // @ts-ignore
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  @ViewChild("origin") origin: any;
  initialValue = "";
  keyword = "organizationName";

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private userService: UserService,
    private injector: Injector,
    private organisationService: OrganisationService,
    private authorisationService: AuthorisationService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.getOrganisations();
  }

  onSubmit() {
    this.isSending = true;
    if (this.newOrg) {
      // TO:DO Send data to the API
      let userData = this.user;
      userData["org_id".toString()] = this.newOrg;
      userData = {
        org_id: userData.org_id,
        id: userData._id,
        lastModifiedBy: {
          _id: this.authenticationService.getCurrentUser().info._id,
          name: this.authenticationService.getCurrentUser().info.surname,
        },
      };

      this.userService.updateBasic(userData).subscribe(
        () => {
          this.messageService.setMessage("user successfully updated.");
          this.isSending = false;
          this.modal.close(this.newOrg);
        },
        (err) => {
          // this.errors = err.errors;
        }
      );
    } else {
      // TO:DO Display Message in the template
      alert("Please new organisation");
    }
  }

  getOrganisations() {
    this.organisationService.all().subscribe((data) => {
      if (data) {
        this.organisations = data.content.filter((org) =>
          org.organizationRole.includes(1)
        );
      }
    });
  }

  selectEvent(item) {
    this.newOrg = item._id;
  }

  deselectEvent() {
    this.newOrg = "";
  }
}
