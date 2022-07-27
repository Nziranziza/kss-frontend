import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-sms-dashboard",
  templateUrl: "./sms-dashboard.component.html",
  styleUrls: ["./sms-dashboard.component.css"],
})
export class SmsDashboardComponent implements OnInit {
  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {}

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: "modal-basic-title" });
  }
}
