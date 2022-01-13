import { isPlatformBrowser } from "@angular/common";
import {
  Component,
  Inject,
  Injector,
  Input,
  OnInit,
  PLATFORM_ID,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SiteService } from "src/app/core/services/site.service";
import { BasicComponent } from "../../../core/library";

@Component({
  selector: "delete-site-modal",
  templateUrl: "./delete-site-modal-component.html",
})
export class DeleteSiteModal extends BasicComponent implements OnInit {
  modal: NgbActiveModal;
  @Input() site;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private siteService: SiteService
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  delete(siteId) {
    this.siteService.delete(siteId).subscribe(
      (data) => {
        this.setMessage(data.message);
        this.modal.dismiss();
      },
      (err) => {
        this.setError(err.errors);
      }
    );
  }

  ngOnInit() {}
}
