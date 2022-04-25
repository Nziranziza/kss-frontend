import {Component, OnDestroy, OnInit} from '@angular/core';

import {
  AuthenticationService,
  BasicComponent,
  CoffeeTypeService,
  ConfirmDialogService, DryProcessingService,
  HelperService,
  MessageService,
  OrganisationService
} from '../../core';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe} from '@angular/common';
import {GreenCoffeeTransferService} from '../../core/services/green-coffee-transfer.service';

declare var $;

@Component({
  selector: 'app-green-coffee-prepare-transfer',
  templateUrl: './green-coffee-prepare-transfer.component.html',
  styleUrls: ['./green-coffee-prepare-transfer.component.css']
})
export class GreenCoffeePrepareTransferComponent  extends BasicComponent implements OnInit, OnDestroy {

  filterForm: FormGroup;
  transferForm: FormGroup;
  cartItem = [];
  cart = [];
  organisations: any;
  coffeeTypes = [];
  initialSearchValue: any;
  filter: any;
  seasonStartingDate: string;
  cartItemInfo: any;
  currentDate: any;
  totalQtyToTransfer = 0;
  itemIndex: number;
  certificates = [];

  constructor(private dryProcessingService: DryProcessingService,
              private router: Router,
              private formBuilder: FormBuilder,
              private coffeeTypeService: CoffeeTypeService,
              private confirmDialogService: ConfirmDialogService,
              private organisationService: OrganisationService,
              private modal: NgbModal,
              private messageService: MessageService,
              private greenCoffeeTransferService: GreenCoffeeTransferService,
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
      quantity: [null, Validators.required]
    });
    this.resetSelection();
    this.cartItem.forEach(itm => this.cartItemInfo.totalKgs += itm.totalKgs);
    this.transferForm = this.formBuilder.group({
      destOrgId: ['', Validators.required],
    });

    this.initialSearchValue = this.filterForm.value;
    this.organisationService.getOrgByRoles({roles: [9]} ).subscribe(data => {
      if (data) {
        this.organisations = data.content;
      }
    });

    this.coffeeTypeService.all().subscribe((data) => {
      data.content.map((item) => {
        if (item.level === 'DM') {
          item.category.map((el) => {
            this.coffeeTypes.push(el);
          });
        }
      });
    });
    this.cart = this.greenCoffeeTransferService.getCart();
    this.getTotalQtyToTransfer();
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
      if (this.itemIndex !== -1 && this.filter.quantity) {
        this.filter.quantity = +this.filter.quantity + this.cart[this.itemIndex].cartItemInfo.totalKgs;
        this.totalQtyToTransfer -= this.cart[this.itemIndex].cartItemInfo.totalKgs;
      }
      this.dryProcessingService.prepareGreenCoffeeTransfer(this.filter)
        .subscribe(data => {
          this.cartItemInfo.totalKgs = 0;
          this.cartItem = data.content;
          this.cartItemInfo['addedToCart'.toString()] = false;
          this.loading = false;
          this.cartItem.forEach(itm => this.cartItemInfo.totalKgs += (+itm.qtyToTransfer));
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
          totalQtyToTransfer: this.totalQtyToTransfer,
          items: [],
        };
        const items = [];
        this.cart.map((item) => {
          const itm = {
            type: item.cartItemInfo.coffeeType._id,
            grade: item.cartItemInfo.coffeeGrade,
            totalKgs: item.cartItemInfo.totalKgs,
            coffees: []
          };
          const coffees = [];
          item.cartItem.map((lot) => {
            coffees.push({
              coffeeId: lot._id,
              lotNumber: lot.lotNumber,
              quantityToTransfer: lot.qtyToTransfer
            });
          });
          itm.coffees = coffees;
          items.push(itm);
        });
        payload.items = items;
        payload = {...payload, ...this.transferForm.value};
        payload['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
        payload['originOrgId'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
        this.dryProcessingService.transferGreenCoffee(payload)
          .subscribe(() => {
              this.messageService.setMessage('Transfer successfully recorded');
              this.setMessage('Transfer successfully recorded');
              this.greenCoffeeTransferService.resetCart();
              this.resetSelection();
              this.resetCart();
              this.router.navigateByUrl('admin/drymill/green_coffee/list/transfers');
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
    this.totalQtyToTransfer -= this.cart[i].cartItemInfo.totalKgs;
    this.cart.splice(i, 1);
    this.greenCoffeeTransferService.setCart(this.cart);
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
      this.totalQtyToTransfer += this.cartItemInfo.totalKgs;
      this.cart.push({
        cartItemInfo: JSON.parse(JSON.stringify(this.cartItemInfo)),
        cartItem: JSON.parse(JSON.stringify(this.cartItem)),
      });
    }
    this.greenCoffeeTransferService.setCart(this.cart);
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

  getTotalQtyToTransfer() {
    this.cart.forEach(itm => this.totalQtyToTransfer += (+itm.cartItemInfo.totalKgs));
    return this.totalQtyToTransfer;
  }

  ngOnDestroy(): void {
  }

}
