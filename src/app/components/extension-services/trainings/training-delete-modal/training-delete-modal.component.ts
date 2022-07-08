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
import { BasicComponent, Training, TrainingService } from 'src/app/core';



@Component({
  selector: 'training-delete-modal',
  templateUrl: './training-delete-modal.component.html',
})
export class TrainingDeleteModal extends BasicComponent implements OnInit {
  modal: NgbActiveModal;
  @Input() training: Training;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private trainingService: TrainingService
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  delete(trainingId: string) {
    this.trainingService.delete(trainingId).subscribe(
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
