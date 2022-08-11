import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthenticationService, SmsService } from "src/app/core";

@Component({
  selector: "app-sms-dashboard",
  templateUrl: "./sms-dashboard.component.html",
  styleUrls: ["./sms-dashboard.component.css"],
})
export class SmsDashboardComponent implements OnInit {
  constructor(
    private modalService: NgbModal,
    private smsService: SmsService,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService
  ) {}
  createOrder: FormGroup;
  smsOrders: any[] = [];
  smsBalance: any = { balance: 0, rate: 10 };

  ngOnInit(): void {
    this.createOrder = this.formBuilder.group({
      smsQuantity: ["", Validators.required],
      email: ["", Validators.required],
    });
    this.createOrder.controls.email.setValue(
      this.authenticationService.getCurrentUser().info.email
    );
    this.getBalance();
    this.getOrders();
  }

  getBalance(): any {
    this.smsService
      .getBalance(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe((data) => {
        this.smsBalance = data.data;
        console.log(this.smsBalance);
      });
  }

  getOrders() {
    this.smsService
      .allOrder(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe((data) => {
        this.smsOrders = data.data;
        console.log(this.smsOrders);
      });
  }

  orderSms(): void {
    if (this.createOrder.valid) {
      let body = {
        ext_sender_id: this.authenticationService.getCurrentUser().info.org_id,
        credits: this.createOrder.value.smsQuantity,
        email: this.createOrder.value.email,
      };

      this.smsService.createOrder(body).subscribe((data) => {
        console.log(data);
        this.createOrder.reset();
        this.getOrders();
        this.getBalance();
      });
    }
  }
  open(content) {
    this.modalService.open(content, { ariaLabelledBy: "modal-basic-title" });
  }
}
