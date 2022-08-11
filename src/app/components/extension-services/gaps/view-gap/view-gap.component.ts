import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BasicComponent, GapService, MessageService } from "src/app/core";

@Component({
  selector: "app-view-gap",
  templateUrl: "./view-gap.component.html",
  styleUrls: ["./view-gap.component.css"],
})
export class ViewGapComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{
  closeResult = "";
  id: string;
  gapDetails: any;
  constructor(
    private gapService: GapService,
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
    this.gapService.one(this.id).subscribe((data) => {
      this.gapDetails = data.data;
    });
  }
}
