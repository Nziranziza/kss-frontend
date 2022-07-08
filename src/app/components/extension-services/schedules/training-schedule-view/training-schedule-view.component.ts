import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TrainingService, GapService, Training } from "../../../../core";
import { MessageService } from "../../../../core";
import { BasicComponent } from "../../../../core";

@Component({
  selector: 'app-training-schedule-view',
  templateUrl: './training-schedule-view.component.html',
  styleUrls: ['../training-scheduling-create/training-scheduling-create.component.css']
})
export class TrainingScheduleViewComponent extends BasicComponent
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
  this.trainingService.getSchedule(this.id).subscribe((data) => {
    this.training = data.data;
    console.log(this.training);
  });
}
}
