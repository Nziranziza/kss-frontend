import { Component, OnInit } from "@angular/core";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-training-create",
  templateUrl: "./training-create.component.html",
  styleUrls: ["./training-create.component.css"],
})
export class TrainingCreateComponent implements OnInit {
  closeResult = "";
  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

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
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }
}
