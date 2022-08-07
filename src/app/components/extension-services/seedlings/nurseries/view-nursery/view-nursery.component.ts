import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BasicComponent, SeedlingService } from "src/app/core";

@Component({
  selector: "app-view-nursery",
  templateUrl: "./view-nursery.component.html",
  styleUrls: [
    "./view-nursery.component.css",
  ],
})
export class ViewNurseryComponent extends BasicComponent implements OnInit {
  constructor(
    private seedlingService: SeedlingService,
    private route: ActivatedRoute
  ) {
    super();
  }
  id: string;
  nurseryDatas: any;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.id = params["id".toString()];
      this.seedlingService.one(params["id".toString()]).subscribe((data) => {
        const datas = data.data;
        this.nurseryDatas = datas;
      });
    });
  }
}
