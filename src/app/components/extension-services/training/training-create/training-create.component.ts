import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-training-create",
  templateUrl: "./training-create.component.html",
  styleUrls: ["./training-create.component.css"],
})
export class TrainingCreateComponent implements OnInit {
  closeResult = "";
  constructor(private formBuilder: FormBuilder, private modalService: NgbModal) {
  }
  createTraining: FormGroup;

  ngOnInit() {
    this.createTraining = this.formBuilder.group({
      trainingName: [''],
      description: [''],
      associatedGap: [''],
      trainingFiles: ['']
    });
  }

  files: any[] = [];

  onFileSelected(event) {
    for (let file of event.target.files) {
      this.files.push({
        name: file.name,
        type: file.type,
        size: Math.round(file.size / 1024) + " " + "KB",
      });
    }
  }
  removeSelectedFile(index) {
    this.files.splice(index, 1);
  }

  open(content) {
    this.modalService
      .open(content, { ariaLabelledBy: "modal-basic-title" })
  }
}
