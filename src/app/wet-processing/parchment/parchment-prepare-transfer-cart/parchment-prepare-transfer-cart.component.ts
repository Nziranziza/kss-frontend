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

declare var $;

@Component({
  selector: 'app-parchment-prepare-transfer-cart',
  templateUrl: './parchment-prepare-transfer-cart.component.html',
  styleUrls: ['./parchment-prepare-transfer-cart.component.css']
})
export class ParchmentPrepareTransferCartComponent extends BasicComponent implements OnInit, OnDestroy {

  filterForm: FormGroup;
  transferForm: FormGroup;
  lotsSet = [
    {
      _id: '5fd0f3e746c1af31c9f70732',
      organization: {
        _id: '5d1635ac60c3dd116164d4ae',
        name: 'Nkara/Dukundekawa II',
        prov_id: '5bf8170953d485a9eae4b41a',
        dist_id: '5bf8171e53d485a9eae4b434',
        sect_id: '5bfd8dbf91703530fcb9b2f2',
        cell_id: '5bf816d753d485a9eae4b016',
        village_id: '5bf8163553d485a9eae45466'
      },
      cherriesSupplyDate: '2020-11-30T22:00:00.000Z',
      producedDate: '2020-12-09T00:00:00.000Z',
      coffeeGrade: 'A',
      coffeeType: {
        _id: '5d357e6a7965873efa4f9b8f',
        name: 'Honey washed'
      },
      season: {
        _id: '5fd0f3e746c1af31c9f70733',
        seasonId: '5f7cf3b6459cd90b920092b8',
        name: '20A'
      },
      lotNumber: '201130/PHW/1015',
      package: [
        {
          _id: '5fd0f3e746c1af31c9f70734',
          bagSize: 50,
          numberOfBags: 20,
          subTotal: 1000
        }
      ],
      totalKgs: 1000,
      remainingQty: 1000,
      recordedBy: {
        _id: '5fd0f3e746c1af31c9f70735',
        userId: '5d1c5be629df995f135ad41b',
        foreName: 'JOSEPH',
        surname: 'RUKUNDO'
      },
      destinationOrg: [],
      updatedAt: '2020-12-09T15:57:27.417Z',
      created_at: '2020-12-09T15:57:27.417Z',
      __v: 0
    }
  ];
  cart = [];
  title = 'Prepare parchments transfer';
  organisations: any;
  coffeeTypes = [];
  initialSearchValue: any;
  filter: any;
  seasonStartingDate: string;
  lotsSetSummary = {
    coffeeType: 'Full washed',
    coffeeGrade: 'A',
    totalKgs: 0,
    addedToCart: false
  };
  currentDate: any;
  lotsSetTotalKgs = 0;

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
    $(document).ready(() => {
      $('[data-toggle="popover"]').popover();
    });
    this.currentDate = new Date();
    this.seasonStartingDate = this.authenticationService.getCurrentSeason().created_at;
    this.filterForm = this.formBuilder.group({
      type: ['', Validators.minLength(3)],
      grade: ['', Validators.required],
      producedDate: this.formBuilder.group({
        from: [this.seasonStartingDate],
        to: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd')]
      }),
      amount: [''],
    });
    this.lotsSet.forEach(itm => this.lotsSetSummary.totalKgs += itm.totalKgs);
    this.transferForm = this.formBuilder.group({
      destOrgId: ['', Validators.required],
      transferType: ['', Validators.required]
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
      this.parchmentService.collectParchments(this.helper.cleanObject(this.filter))
        .subscribe(data => {
          this.lotsSetSummary.totalKgs = 0;
          this.lotsSet = data.content;
          this.loading = false;
          this.lotsSet.forEach(itm => this.lotsSetSummary.totalKgs += itm.totalKgs);
          this.lotsSetSummary.coffeeGrade = this.filter.grade;
          this.lotsSetSummary.coffeeType = this.coffeeTypes.find(t => t._id === this.filter.type).name;
        }, (err) => {
          this.setError(err.errors);

        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.filterForm));
    }
  }

  onTransfer() {
  }

  onClearFilter() {
    this.filterForm.reset(this.initialSearchValue);
    this.lotsSet = [];
  }

  cancelCartItem(i: number) {
    delete this.cart[i];
  }

  onChange() {
  }

  cancelLotsSet() {
    this.lotsSet = [];
  }

  addLotsSetToCart() {
    if (!this.lotsSetSummary.addedToCart) {
      this.lotsSetSummary['addedToCart'.toString()] = true;
      this.cart.push({
        lotsSetSummary: this.lotsSetSummary,
        lotsSet: this.lotsSet,
      });
    }
  }

  ngOnDestroy(): void {
  }
}

