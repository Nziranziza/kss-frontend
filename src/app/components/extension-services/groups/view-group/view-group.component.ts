import { Component, Injector, OnDestroy, OnInit,   PLATFORM_ID,   Inject,   Input,} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { BasicComponent, GroupService, MessageService } from "src/app/core";
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: "app-view-group",
  templateUrl: "./view-group.component.html",
  styleUrls: ["./view-group.component.css"],
})
export class ViewGroupComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{
  closeResult = "";
  groupDetails: any;
  modal: NgbActiveModal;
  @Input() id: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private groupService: GroupService,
    private messageService: MessageService
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal, { size: "lg"});
    }
  }

  ngOnDestroy(): void {}

  ngOnInit() {
    this.getVisits();
    this.setMessage(this.messageService.getMessage());
  }

  results: any[] = [];
  weekDays: string[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  gaps: any;
  loading = false;
  dataReturned: any[] = [];
  totalByGender: any = {
    maleTotal: 0,
    femaleTotal: 0,
    maleYouthTotal: 0,
    femaleYouthTotal: 0,
    maleOldTotal: 0,
    femaleOldTotal: 0,
  };

  getVisits() {
    this.groupService.get(this.id).subscribe((data) => {
      this.groupDetails = data.data;
      this.groupDetails.members.forEach((member) => {
        member.nid ? member.age = new Date().getFullYear() - member.nid.substring(1, 5) : member.age = 0;
        if (member.sex == "m" || member.sex == "M") {
          this.totalByGender.maleTotal += 1;
          if (member.age <= 30) {
            this.totalByGender.maleYouthTotal += 1;
          }
        } else {
          this.totalByGender.femaleTotal += 1;
          if (member.age <= 30) {
            this.totalByGender.femaleYouthTotal += 1;
          }
        }
      });
      this.totalByGender.maleOldTotal =
        this.totalByGender.maleTotal - this.totalByGender.maleYouthTotal;
      this.totalByGender.femaleOldTotal =
        this.totalByGender.femaleTotal - this.totalByGender.femaleYouthTotal;
    });
  }
}
