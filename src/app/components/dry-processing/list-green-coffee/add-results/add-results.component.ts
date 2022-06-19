import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PaymentService} from '../../../../core/services/payment.service';
import {ActivatedRoute} from '@angular/router';
import {
  AuthenticationService,
  AuthorisationService,
  BasicComponent,
  CoffeeTypeService,
  DryProcessingService,
  HelperService
} from '../../../../core';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-results',
  templateUrl: './add-results.component.html',
  styleUrls: ['./add-results.component.css']
})
export class AddResultsComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
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
  uploadResultsForm: FormGroup;
  organisationId: string;
  results: any;
  fileError: string;
  isImage = false;
  isFileSaved: boolean;
  cardFileBase64: any;
  coffeeTypes = [];
  @Input() id;
  grades = [];

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.uploadResultsForm = this.formBuilder.group({
      date: [this.datePipe.transform(new Date(), 'yyyy-MM-dd'), Validators.required],
      file: ['', Validators.required],
      quantity: ['', Validators.required],
      grade: ['', Validators.required],
      type: ['', Validators.required]
    });
    this.organisationId = this.authenticationService.getCurrentUser().info.org_id;
    this.coffeeTypeService.all().subscribe((data) => {
      data.content.map((item) => {
        if (item.level === 'DM') {
          item.category.map((el) => {
            this.coffeeTypes.push(el);
          });
        }
      });
    });
    this.getGreenCoffeeResults(this.id);
    this.getGrades();
  }

  getGreenCoffeeResults(id: string) {
    this.dryProcessingService.getOneGreenCoffee(this.organisationId, id).subscribe((data) => {
      if (data.content.results) {
        this.results = {
          date: data.content.results.date,
          quantity: data.content.results.quantity,
          grade: data.content.results.grade,
          type: data.content.results.type._id
        };
        this.cardFileBase64 = data.content.results.file;
        this.isFileSaved = true;
        this.uploadResultsForm.patchValue(this.results);
      }
    });
  }

  fileChangeEvent(fileInput: any) {
    this.fileError = null;
    if (fileInput.target.files && fileInput.target.files[0]) {
      const maxSize = 4194304;
      const allowedDocumentTypes = [
        'application/pdf'
      ];
      if (fileInput.target.files[0].size > maxSize) {
        this.fileError =
          'Maximum size allowed is ' + '4Mb';
        this.removeFile();
        return false;
      }
      if (!allowedDocumentTypes.includes(fileInput.target.files[0].type)) {
        this.fileError = 'Only PDF types are allowed';
        this.removeFile();
        return false;
      }
      this.readBase64(fileInput.target.files[0]).then((data) => {
        this.cardFileBase64 = data;
      });
    }
  }

  removeFile() {
    this.cardFileBase64 = null;
    this.isFileSaved = false;
  }

  onUploadResults() {
    const results = this.uploadResultsForm.value;
    results.id = this.id;
    results.userId = this.authenticationService.getCurrentUser().info._id;
    results.file = this.cardFileBase64;
    this.helper.cleanObject(results);
    this.dryProcessingService.uploadGreenCoffeeResults(results)
      .subscribe(() => {
        this.setMessage('Results successful updated!');
      }, (error) => {
        this.setError(error.errors);
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

  private readBase64(file): Promise<any> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.addEventListener('load', () => {
        resolve(reader.result);
      }, false);
      reader.addEventListener('error', (event) => {
        reject(event);
      }, false);

      reader.readAsDataURL(file);
      this.isFileSaved = true;
    });
  }

  getGrades() {
    this.dryProcessingService.getGreenCoffeeGrades().subscribe((data) => {
      Object.keys(data.content).map(key => {
        this.grades.push({name: key, value: key});
      });
    });
  }
}
