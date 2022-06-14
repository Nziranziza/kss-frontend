import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-training-scheduling-create',
  templateUrl: './training-scheduling-create.component.html',
  styleUrls: ['./training-scheduling-create.component.css']
})
export class TrainingSchedulingCreateComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private modalService: NgbModal) { }

  ngOnInit() {
  }

  open(content) {
    this.modalService
      .open(content, { ariaLabelledBy: "modal-basic-title" })
  }

}
