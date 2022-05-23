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
import { BasicComponent } from "../../../../core/library";
import { CoffeeTypeService } from "src/app/core";

@Component({
  selector: "coffee-type-delete-modal",
  templateUrl: "./coffee-type-delete-modal-component.html",
})
export class DeleteTypeModal extends BasicComponent implements OnInit {
  modal: NgbActiveModal;
  @Input() category;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private coffeeTypeService: CoffeeTypeService
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  delete(categoryId) {
    this.coffeeTypeService.delete(categoryId).subscribe(
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
