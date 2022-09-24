import { isPlatformBrowser } from "@angular/common";
import { Component, Inject, Injector, Input, OnDestroy, OnInit, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
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
  gapDetails: any;
  modal: NgbActiveModal;
  @Input() id: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private gapService: GapService,
    private messageService: MessageService
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnDestroy(): void {}

  ngOnInit() {
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
