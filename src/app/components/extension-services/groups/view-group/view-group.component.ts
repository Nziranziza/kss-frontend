import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BasicComponent, GroupService, MessageService } from "src/app/core";

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
  id: string;
  groupDetails: any;
  constructor(
    private groupService: GroupService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    super();
  }

  ngOnDestroy(): void {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.id = params["id".toString()];
    });
    this.getVisits();
    this.setMessage(this.messageService.getMessage());
  }

  results: any[] = [];
  gaps: any;
  loading = false;
  dataReturned: any[] = [];

  getVisits() {
    this.groupService.get(this.id).subscribe((data) => {
      this.groupDetails = data.data;
      console.log(this.groupDetails);
    });
  }
}
