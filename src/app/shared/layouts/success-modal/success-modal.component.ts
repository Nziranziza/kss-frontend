import {
  Component,
  Inject,
  Injector,
  Input,
  OnInit,
  PLATFORM_ID,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { isPlatformBrowser } from "@angular/common";
import { TrainingService, VisitService } from "src/app/core";

@Component({
  selector: "app-success-modal",
  templateUrl: "./success-modal.component.html",
  styleUrls: ["./success-modal.component.css"],
})
export class SuccessModalComponent implements OnInit {
  modal: NgbActiveModal;
  @Input() title: string;
  @Input() closeButtonText: string;
  @Input() message: string;
  @Input() name: string;
  @Input() smsId: string;
  @Input() serviceName: string;
  @Input() messageEnabled: Boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private visitService: VisitService,
    private trainingService: TrainingService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }
  ngOnInit() {}

  close() {
    this.modal.dismiss();
  }

  sendMessage() {
    if (this.serviceName == "visit") {
      this.visitService.sendSms(this.smsId).subscribe((data) => {  
      });

    } else if (this.serviceName == "training") {
      this.trainingService.sendMessage(this.smsId).subscribe((data) => {  
      });
    }
    this.modal.dismiss();
  }
}
