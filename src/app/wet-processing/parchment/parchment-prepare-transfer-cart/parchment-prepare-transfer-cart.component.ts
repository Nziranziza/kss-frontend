import {Component, OnDestroy, OnInit} from '@angular/core';
import {BasicComponent} from '../../../core/library';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {
  AuthenticationService,
  CoffeeTypeService,
  ConfirmDialogService,
  OrganisationService,
  ParchmentService
} from '../../../core/services';

import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe} from '@angular/common';
import {HelperService} from '../../../core/helpers';

@Component({
  selector: 'app-parchment-prepare-transfer-cart',
  templateUrl: './parchment-prepare-transfer-cart.component.html',
  styleUrls: ['./parchment-prepare-transfer-cart.component.css']
})
export class ParchmentPrepareTransferCartComponent extends BasicComponent implements OnInit, OnDestroy {

  filterForm: FormGroup;
  items = [];
  selectedItems = [];
  title = 'Prepare parchments transfer';
  organisations: any;
  coffeeTypes = [];
  initialSearchValue: any;
  filter: any;
  seasonStartingDate: string;
  currentDate: any;

  constructor(private parchmentService: ParchmentService,
              private router: Router,
              private formBuilder: FormBuilder,
              private coffeeTypeService: CoffeeTypeService,
              private confirmDialogService: ConfirmDialogService,
              private organisationService: OrganisationService,
              private modal: NgbModal,
              private datePipe: DatePipe,
              private helper: HelperService,
              private authenticationService: AuthenticationService) {
    super();
  }

  ngOnInit(): void {
    this.currentDate = new Date();
    this.seasonStartingDate = this.authenticationService.getCurrentSeason().created_at;
    this.filterForm = this.formBuilder.group({
      type: ['', Validators.minLength(3)],
      grade: ['', Validators.required],
      date: this.formBuilder.group({
        from: [],
        to: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd')]
      }),
      amount: [''],
    });
    this.initialSearchValue = this.filterForm.value;
    this.organisationService.all().subscribe(data => {
      if (data) {
        this.organisations = data.content;
      }
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
    this.onChange();
  }


  onFilter() {
    if (this.filterForm.valid) {
      this.loading = true;
      this.filter = this.filterForm.value;
      this.filter['org_id'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
      this.parchmentService.collectParchments(this.filter)
        .subscribe(data => {
          this.items = data.data;
        }, (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.filterForm));
    }
  }

  onClearFilter() {
    this.filterForm.reset(this.initialSearchValue);
    this.items = [];
  }

  onChange() {
  }

  cancelItem(index: number) {
  }

  ngOnDestroy(): void {
  }
}

