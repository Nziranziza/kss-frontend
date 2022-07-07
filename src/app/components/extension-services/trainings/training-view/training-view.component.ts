import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TrainingService, GapService, Training } from "../../../../core";
import { MessageService } from "../../../../core";
import { BasicComponent } from "../../../../core";

@Component({
  selector: "app-training-view",
  templateUrl: "./training-view.component.html",
  styleUrls: ["../training-create/training-create.component.css"],
})
export class TrainingViewComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{
  createTraining: FormGroup;
  closeResult = "";
  id: string;
  training: any[] = [];
  constructor(
    private trainingService: TrainingService,
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

    this.getTraining();
    this.setMessage(this.messageService.getMessage());
  }

  results: any[] = [];
  gaps: any[] = [];
  loading = false;
  dataReturned: any[] = [];

  getTraining() {
    this.trainingService.one(this.id).subscribe((data) => {
      if (data && data.data) {
        this.training = data.data;
        console.log(this.training);
      }
    });
  }
}
