import {Component, OnDestroy, OnInit} from '@angular/core';
import {BasicComponent} from '../../../core/library';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {
  AuthenticationService,
  CoffeeTypeService,
  ConfirmDialogService, MessageService,
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
  lotsSet = [];
  cart = [];
  title = 'Prepare parchments transfer';
  organisations: any;
  coffeeTypes = [];
  initialSearchValue: any;
  filter: any;
  seasonStartingDate: string;
  lotsSetSummary: any;
  currentDate: any;
  totalAmountToTransfer = 0;

  constructor(private parchmentService: ParchmentService,
              private router: Router,
              private formBuilder: FormBuilder,
              private coffeeTypeService: CoffeeTypeService,
              private confirmDialogService: ConfirmDialogService,
              private organisationService: OrganisationService,
              private modal: NgbModal,
              private messageService: MessageService,
              private datePipe: DatePipe,
              private helper: HelperService,
              private authenticationService: AuthenticationService) {
    super();
  }

  ngOnInit(): void {
    $(document).ready(() => {
      $('[data-toggle="popover"]').popover();
    });
    this.currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.seasonStartingDate = this.datePipe.transform(this.authenticationService.getCurrentSeason().created_at, 'yyyy-MM-dd');
    this.filterForm = this.formBuilder.group({
      type: ['', Validators.minLength(3)],
      grade: ['', Validators.required],
      producedDate: this.formBuilder.group({
        from: [this.seasonStartingDate],
        to: [this.currentDate]
      }),
      amount: [''],
    });
    this.resetSelection();
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
          this.lotsSetSummary['addedToCart'.toString()] = false;
          this.loading = false;
          this.lotsSet.forEach(itm => this.lotsSetSummary.totalKgs += itm.amountToTransfer);
          this.lotsSetSummary.coffeeGrade = this.filter.grade;
          this.lotsSetSummary.coffeeType = this.coffeeTypes.find(t => t._id === this.filter.type);
        }, (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.filterForm));
    }
  }

  onTransfer() {
    if (this.cart.length !== 0) {
      if (this.transferForm.valid) {
        let payload = {
          totalAmountToTransfer: this.totalAmountToTransfer,
          items: []
        };
        const items = [];
        this.cart.map((item) => {
          const itm = {
            type: item.lotsSetSummary.coffeeType._id,
            grade: item.lotsSetSummary.coffeeGrade,
            totalKgs: item.lotsSetSummary.totalKgs,
            parchments: []
          };
          const parchments = [];
          item.lotsSet.map((lot) => {
            parchments.push({
              parchmentId: lot._id,
              amountToTransfer: lot.amountToTransfer
            });
          });
          itm.parchments = parchments;
          items.push(itm);
        });
        payload.items = items;
        payload = {...payload, ...this.transferForm.value};
        this.parchmentService.transferCart(payload)
          .subscribe(() => {
              this.messageService.setMessage('Transfer successfully recorded');
              this.router.navigateByUrl('admin/cws/parchments/transfer/history');
            },
            (err) => {
              this.errors = err.errors;
            });

      } else {
        this.setError(this.helper.getFormValidationErrors(this.transferForm));
      }
    } else {
      this.setError(['Please add at least one(1) item to cart before transfer']);

    }

  }

  onClearFilter() {
    this.filterForm.reset(this.initialSearchValue);
    this.resetSelection();
  }

  cancelCartItem(i: number) {
    this.totalAmountToTransfer -= this.cart[i].lotsSetSummary.totalKgs;
    this.cart.splice(i, 1);
  }

  onChange() {
  }

  addLotsSetToCart() {
    if (this.lotsSet.length !== 0 && !this.lotsSetSummary.addedToCart) {
      this.lotsSetSummary['addedToCart'.toString()] = true;
      this.totalAmountToTransfer += this.lotsSetSummary.totalKgs;
      this.cart.push({
        lotsSetSummary: JSON.parse(JSON.stringify(this.lotsSetSummary)),
        lotsSet: JSON.parse(JSON.stringify(this.lotsSet)),
      });
    }
    this.resetSelection();
  }

  resetSelection() {
    this.lotsSetSummary = {
      coffeeType: {
        name: '',
        _id: ''
      },
      coffeeGrade: '',
      totalKgs: 0,
      addedToCart: false
    };
    this.lotsSet = [];
  }

  ngOnDestroy(): void {
  }
}

