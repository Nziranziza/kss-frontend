import {Component, OnDestroy, OnInit} from '@angular/core';
import {BasicComponent} from '../../../../core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {
  AuthenticationService,
  CoffeeTypeService,
  ConfirmDialogService, MessageService,
  OrganisationService,
  ParchmentService
} from '../../../../core';

import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe, formatDate} from '@angular/common';
import {HelperService} from '../../../../core';
import {ParchmentTransferService} from '../../../../core/services/parchment-transfer.service';

declare var $;

@Component({
  selector: 'app-parchment-prepare-transfer-cart',
  templateUrl: './parchment-prepare-transfer-cart.component.html',
  styleUrls: ['./parchment-prepare-transfer-cart.component.css']
})
export class ParchmentPrepareTransferCartComponent extends BasicComponent implements OnInit, OnDestroy {

  filterForm: FormGroup;
  transferForm: FormGroup;
  cartItem = [];
  cart = [];
  title = 'Prepare parchments transfer';
  organisations: any;
  coffeeTypes = [];
  initialSearchValue: any;
  filter: any;
  seasonStartingDate: string;
  cartItemInfo: any;
  currentDate: any;
  totalAmountToTransfer = 0;
  itemIndex: number;
  certificates = [];

  constructor(private parchmentService: ParchmentService,
              private router: Router,
              private formBuilder: FormBuilder,
              private coffeeTypeService: CoffeeTypeService,
              private confirmDialogService: ConfirmDialogService,
              private organisationService: OrganisationService,
              private modal: NgbModal,
              private messageService: MessageService,
              private parchmentTransferService: ParchmentTransferService,
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
      amount: [null, Validators.required]
    });
    this.resetSelection();
    this.cartItem.forEach(itm => this.cartItemInfo.totalKgs += itm.totalKgs);
    this.transferForm = this.formBuilder.group({
      destOrgId: ['', Validators.required],
      transferType: ['', Validators.required],
      appliedCertificates: new FormArray([])
    });

    this.initialSearchValue = this.filterForm.value;
    this.organisationService.getOrgByRoles({roles: [2]} ).subscribe(data => {
      if (data) {
        this.organisations = data.content;
      }
    });
    this.organisationService.orgCertificates(this.authenticationService.getCurrentUser().info.org_id).subscribe(data => {
      if (data) {
        const date1 = formatDate(new Date(), 'yyyy-MM-dd', 'en_US');
        this.certificates = data.content.filter((el) => {
          if (el.expirationDate) {
            const date2 = formatDate(el.expirationDate, 'yyyy-MM-dd', 'en_US');
            return date2 >= date1;
          } else {
            return true;
          }
        });
        this.certificates.map(() => {
          const control = new FormControl({value: ''});
          (this.transferForm.controls.appliedCertificates as FormArray).push(control);
        });
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
    this.cart = this.parchmentTransferService.getCart();
    this.getTotalAmountToTransfer();
    this.onChange();
  }

  onFilter() {
    if (this.filterForm.valid) {
      this.loading = true;
      this.filter = JSON.parse(JSON.stringify(this.filterForm.value));
      this.filter['org_id'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
      this.itemIndex = this.cart.findIndex(item => (item.cartItemInfo.coffeeGrade === this.filter.grade
        && item.cartItemInfo.coffeeType._id === this.filter.type));
      this.filter = this.helper.cleanObject(this.filter);
      if (this.itemIndex !== -1 && this.filter.amount) {
        this.filter.amount = +this.filter.amount + this.cart[this.itemIndex].cartItemInfo.totalKgs;
        this.totalAmountToTransfer -= this.cart[this.itemIndex].cartItemInfo.totalKgs;
      }
      this.parchmentService.collectParchments(this.filter)
        .subscribe(data => {
          this.cartItemInfo.totalKgs = 0;
          this.cartItem = data.content;
          this.cartItemInfo['addedToCart'.toString()] = false;
          this.loading = false;
          this.cartItem.forEach(itm => this.cartItemInfo.totalKgs += (+itm.amountToTransfer));
          this.cartItemInfo.coffeeGrade = this.filter.grade;
          this.cartItemInfo.coffeeType = this.coffeeTypes.find(t => t._id === this.filter.type);
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
          items: [],
          appliedCertificates: []
        };

        const selectedCertificates = this.transferForm.value.appliedCertificates
          .map((checked, index) => checked ? this.certificates[index]._id : null)
          .filter(value => value !== null);

        const items = [];
        this.cart.map((item) => {
          const itm = {
            type: item.cartItemInfo.coffeeType._id,
            grade: item.cartItemInfo.coffeeGrade,
            totalKgs: item.cartItemInfo.totalKgs,
            parchments: []
          };
          const parchments = [];
          item.cartItem.map((lot) => {
            parchments.push({
              parchmentId: lot._id,
              lotNumber: lot.lotNumber,
              amountToTransfer: lot.amountToTransfer
            });
          });
          itm.parchments = parchments;
          items.push(itm);
        });
        payload.items = items;
        payload = {...payload, ...this.transferForm.value};
        payload.appliedCertificates = selectedCertificates;
        payload['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
        payload['originOrgId'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
        this.parchmentService.transfer(payload)
          .subscribe(() => {
              this.messageService.setMessage('Transfer successfully recorded');
              this.setMessage('Transfer successfully recorded');
              this.parchmentTransferService.resetCart();
              this.resetSelection();
              this.resetCart();
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
    this.totalAmountToTransfer -= this.cart[i].cartItemInfo.totalKgs;
    this.cart.splice(i, 1);
    this.parchmentTransferService.setCart(this.cart);
  }

  onChange() {
    this.filterForm.controls.producedDate.get('from'.toString()).valueChanges.subscribe((value) => {
      this.filterForm.controls.producedDate.get('from').patchValue(this.helper.setLocalTimeZone(value), {emitEvent: false});
    });
    this.filterForm.controls.producedDate.get('to'.toString()).valueChanges.subscribe((value) => {
      this.filterForm.controls.producedDate.get('to').patchValue(this.helper.setLocalTimeZone(value), {emitEvent: false});
    });
  }

  addCartItemToCart() {
    if (this.cartItem.length !== 0) {
      if (this.itemIndex !== -1) {
        this.cart.splice(this.itemIndex, 1);
      }
      this.totalAmountToTransfer += this.cartItemInfo.totalKgs;
      this.cart.push({
        cartItemInfo: JSON.parse(JSON.stringify(this.cartItemInfo)),
        cartItem: JSON.parse(JSON.stringify(this.cartItem)),
      });
    }
    this.parchmentTransferService.setCart(this.cart);
    this.resetSelection();
  }

  resetSelection() {
    this.cartItemInfo = {
      coffeeType: {
        name: '',
        _id: ''
      },
      coffeeGrade: '',
      totalKgs: 0
    };
    this.cartItem = [];
  }

  resetCart() {
    this.cart = [];
  }

  getTotalAmountToTransfer() {
    this.cart.forEach(itm => this.totalAmountToTransfer += (+itm.cartItemInfo.totalKgs));
    return this.totalAmountToTransfer;
  }

  ngOnDestroy(): void {
  }
}

