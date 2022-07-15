import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { VisitService, GapService, Training } from "../../../../core";
import { MessageService } from "../../../../core";
import { BasicComponent } from "../../../../core";

@Component({
  selector: 'app-view-farm-visit',
  templateUrl: './view-farm-visit.component.html',
  styleUrls: [ "../../schedules/training-scheduling-create/training-scheduling-create.component.css"]
})
export class ViewFarmVisitComponent extends BasicComponent
implements OnInit, OnDestroy
{
createTraining: FormGroup;
closeResult = "";
id: string;
visits: any;
constructor(
  private visitService: VisitService,
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
  this.visitService.one(this.id).subscribe((data) => {
    this.visits = data.data;
    console.log(this.visits);
  });
}
}
