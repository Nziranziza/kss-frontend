import {Component, Inject, Injector, OnInit, PLATFORM_ID} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {CoffeeTypeService, UserService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {ParchmentService} from '../../core/services';
import {AuthenticationService} from '../../core/services';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import {BasicComponent} from '../../core/library';

@Component({
  selector: 'app-parchment-create',
  templateUrl: './parchment-create.component.html',
  styleUrls: ['./parchment-create.component.css']
})
export class ParchmentCreateComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private parchmentService: ParchmentService,
              private coffeeTypeService: CoffeeTypeService,
              private datePipe: DatePipe,
              private helper: HelperService, private authenticationService: AuthenticationService,
              @Inject(PLATFORM_ID) private platformId: object, private userService: UserService,
              private injector: Injector) {

    super();

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  modal: NgbActiveModal;
  recordParchmentForm: FormGroup;
  errors: string[];
  coffeeTypes = [];
  currentDate: any;

  ngOnInit() {
    this.currentDate = new Date();
    this.recordParchmentForm = this.formBuilder.group({
      coffeeType: ['', Validators.required],
      coffeeGrade: ['A', Validators.required],
      date: ['', Validators.required],
      totalKgs: ['', Validators.required],
      producedDate: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'), Validators.required]
    });
    this.coffeeTypeService.all().subscribe((data) => {
      data.content.map((item) => {
        if (item.level === 'CWS') {
          item.category.map((el) => {
            this.coffeeTypes.push(el);
          });
        }
      });
    });
  }

  onSubmit() {
    if (this.recordParchmentForm.valid) {
      const parchment = JSON.parse(JSON.stringify(this.recordParchmentForm.value));
      parchment['org_id'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
      this.parchmentService.save(parchment)
        .subscribe((data) => {
            this.modal.close(data.message);
          },
          (err) => {
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.recordParchmentForm);
    }
  }
}
