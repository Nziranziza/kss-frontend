import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {
  AuthenticationService,
  AuthorisationService,
  BasicComponent,
  CoffeeTypeService,
  DryProcessingService,
  HelperService
} from '../../../../core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {PaymentService} from '../../../../core/services/payment.service';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-show-results',
  templateUrl: './show-results.component.html',
  styleUrls: ['./show-results.component.css']
})
export class ShowResultsComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: UntypedFormBuilder,
              private paymentService: PaymentService,
              @Inject(PLATFORM_ID) private platformId: object,
              private injector: Injector,
              private datePipe: DatePipe,
              private authenticationService: AuthenticationService,
              private authorizationService: AuthorisationService,
              private route: ActivatedRoute, private coffeeTypeService: CoffeeTypeService,
              private helper: HelperService, private dryProcessingService: DryProcessingService) {

    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  modal: NgbActiveModal;
  uploadResultsForm: UntypedFormGroup;
  results: any;
  fileError: string;
  isImage = false;
  isFileSaved: boolean;
  cardFileBase64: any;
  coffeeTypes = [];
  @Input() id;
  @Input() organisationId;
  grades = [];

  ngOnInit() {
    this.uploadResultsForm = this.formBuilder.group({
      date: [this.datePipe.transform(new Date(), 'yyyy-MM-dd'), Validators.required],
      file: ['', Validators.required],
      quantity: ['', Validators.required],
      grade: ['', Validators.required],
      type: ['', Validators.required]
    });
    this.getGreenCoffeeResults(this.id);
  }

  getGreenCoffeeResults(id: string) {
    this.dryProcessingService.getOneGreenCoffee(this.organisationId, id).subscribe((data) => {
      if (data.content.results) {
        this.results = {
          date: data.content.results.date,
          quantity: data.content.results.quantity,
          grade: data.content.results.grade,
          type: data.content.results.type
        };
        this.cardFileBase64 = data.content.results.file;
        this.isFileSaved = true;
        this.uploadResultsForm.patchValue(this.results);
      }
    });
  }

  downloadResults() {
    const byteArray = new Uint8Array(atob(this.cardFileBase64.split(',')[1]).split('').map(char => char.charCodeAt(0)));
    const newBlob = new Blob([byteArray], {type: 'application/pdf'});
    const linkElement = document.createElement('a');
    const url = URL.createObjectURL(newBlob);
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', 'lab-results' + '.pdf');
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: false
    });
    linkElement.dispatchEvent(clickEvent);
  }
}
