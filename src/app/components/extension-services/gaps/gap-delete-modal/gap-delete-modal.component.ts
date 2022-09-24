import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  Injector,
  Input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicComponent, Gap, GapService } from 'src/app/core';



@Component({
  selector: 'gap-delete-modal',
  templateUrl: './gap-delete-modal.component.html',
})
export class GapDeleteModal extends BasicComponent implements OnInit {
  modal: NgbActiveModal;
  @Input() gap: Gap;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private gapService: GapService
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  delete(gapId: string) {
    this.gapService.delete(gapId).subscribe(
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
