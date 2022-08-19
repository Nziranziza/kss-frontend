import { isPlatformBrowser } from "@angular/common";
import { Component, Inject, Injector, Input, OnInit, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { BasicComponent, SeedlingService } from "src/app/core";

@Component({
  selector: "app-view-nursery",
  templateUrl: "./view-nursery.component.html",
  styleUrls: [
    "./view-nursery.component.css",
  ],
})
export class ViewNurseryComponent extends BasicComponent implements OnInit {
  modal: NgbActiveModal;
  @Input() id: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private seedlingService: SeedlingService,
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }
  nurseryDatas: any;

  ngOnInit() {
    this.seedlingService.one(this.id).subscribe((data) => {
      const datas = data.data;
      this.nurseryDatas = datas;
    });
  }
}
