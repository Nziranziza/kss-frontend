import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthenticationService, ParchmentService, UserService} from '../../../../core';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {BasicComponent} from '../../../../core';
import {HelperService} from '../../../../core';

@Component({
  selector: 'app-parchment-report-detail',
  templateUrl: './parchment-report-detail.component.html',
  styleUrls: ['./parchment-report-detail.component.css']
})
export class ParchmentReportDetailComponent extends BasicComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() location;
  production: any;
  loading = false;
  filterForm: UntypedFormGroup;
  seasonStartingDate: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private userService: UserService,
    private datePipe: DatePipe,
    private helper: HelperService,
    private authenticationService: AuthenticationService,
    private parchmentService: ParchmentService, private formBuilder: UntypedFormBuilder,
    private injector: Injector) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.loading = true;
    this.parchmentService.detailedReport(this.location).subscribe((data) => {
      this.production = data.content[0];
      this.loading = false;
    });
    this.seasonStartingDate = this.authenticationService.getCurrentSeason().created_at;
    this.filterForm = this.formBuilder.group({
      date: this.formBuilder.group({
        from: [this.datePipe.transform(this.location.date.from, 'yyyy-MM-dd', 'GMT+2'), Validators.required],
        to: [this.datePipe.transform(this.location.date.to, 'yyyy-MM-dd', 'GMT+2'), Validators.required],
      })
    });
  }

  onSubmit() {
    if (this.filterForm.valid) {
      this.loading = true;
      const filters = JSON.parse(JSON.stringify(this.filterForm.value));
      this.location.date = filters.date;
      this.parchmentService.detailedReport(this.location).subscribe((data) => {
        this.loading = false;
        this.production = data.content[0];
      }, (err) => {
        this.errors = err.errors;
      });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.filterForm));
    }
  }
}
