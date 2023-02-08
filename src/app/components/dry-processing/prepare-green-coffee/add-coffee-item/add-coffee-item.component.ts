import {
  AfterViewInit,
  Component, ElementRef,
  Inject,
  Injector, Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {BasicComponent} from '../../../../core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DataTableDirective} from 'angular-datatables';
import {Subject} from 'rxjs';
import {
  AuthenticationService,
  CoffeeTypeService,
  ConfirmDialogService,
  DryProcessingService,
  MessageService,
  OrganisationService,
  ParchmentService
} from '../../../../core';
import {Router} from '@angular/router';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {PrepareGreenCoffeeService} from '../../../../core/services/prepare-green-coffee.service';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import {HelperService} from '../../../../core';
import {isUndefined} from 'util';


declare var $;

@Component({
  selector: 'app-add-coffee-item',
  templateUrl: './add-coffee-item.component.html',
  styleUrls: ['./add-coffee-item.component.css']
})
export class AddCoffeeItemComponent extends BasicComponent implements OnInit, OnDestroy, AfterViewInit {

  modal: NgbActiveModal;
  filterForm: UntypedFormGroup;
  cartItem = [];
  cart = [];
  title = 'Prepare green coffee';
  coffeeTypes = [];
  initialSearchValue: any;
  filter: any;
  seasonStartingDate: string;
  cartItemInfo: any;
  currentDate: any;
  totalAmount = 0;
  itemIndex: number;
  isLoading = true;
  // @ts-ignore
  @ViewChildren(DataTableDirective, {static: false})
  dtElements: QueryList<DataTableDirective>;
  @ViewChild('supplier') supplierDE: ElementRef;
  dtOptions: any = {};
  // @ts-ignore
  dtTriggerItem = new Subject();
  dtTriggerCart = new Subject();
  season: any;
  organisations = [];
  parameters: any;
  summary: any;
  keyword = 'name';
  initialValue: any;
  transferType: string;
  mixture: any;
  orgId: any;
  @Input() data;
  selectedSupplier: string;
  addToCartDisabled = true;

  constructor(private parchmentService: ParchmentService,
              private router: Router,
              private dryMillService: DryProcessingService,
              private formBuilder: UntypedFormBuilder,
              private coffeeTypeService: CoffeeTypeService,
              private confirmDialogService: ConfirmDialogService,
              private organisationService: OrganisationService,
              @Inject(PLATFORM_ID) private platformId: object, private dryProcessingService: DryProcessingService,
              private injector: Injector,
              private messageService: MessageService,
              private prepareGreenCoffeeService: PrepareGreenCoffeeService,
              private datePipe: DatePipe,
              private helper: HelperService,
              private authenticationService: AuthenticationService) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit(): void {
    $(document).ready(() => {
      $('[data-toggle="popover"]').popover();
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      columns: [{}, {}, {}, {}, {
        class: 'none'
      }, {}],
      searching: false,
      ordering: false,
      paging: false,
      dom: 't',
      responsive: {
        details: {
          type: 'column'
        }
      }
    };
    this.currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.orgId = this.authenticationService.getCurrentUser().info.org_id;
    this.seasonStartingDate = this.datePipe.transform(this.authenticationService.getCurrentSeason().created_at, 'yyyy-MM-dd');
    this.filterForm = this.formBuilder.group({
      type: ['', Validators.minLength(3)],
      grade: ['', Validators.required],
      supplier: [''],
      transferType: ['', Validators.required],
      deliveryDate: this.formBuilder.group({
        from: [this.seasonStartingDate],
        to: [this.currentDate]
      }),
      amount: [null, Validators.required]
    });
    this.resetSelection();
    this.cartItem.forEach(itm => this.cartItemInfo.totalKgs += itm.totalKgs);
    this.initialSearchValue = this.filterForm.value;

    this.dryMillService.getSupplyingOrg(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe(data => {
        if (data) {
          this.organisations = data.content;
          this.isLoading = false;
        }
      }, () => {
      }, () => {
        this.dryProcessingService.getOneGreenCoffee(this.orgId, this.data.id).subscribe((data) => {
          this.mixture = data.content;
          if (this.mixture.deliveryType === 'processing') {
            this.initialValue = this.mixture.mixture[0].supplier;
            this.selectedSupplier = this.mixture.mixture[0].supplier._id;
            this.filterForm.controls.supplier.setValue(this.mixture.mixture[0].supplier._id);
          } else {
            this.initialValue = '';
          }
          this.transferType = this.mixture.deliveryType;
          this.filterForm.controls.transferType.setValue(this.transferType);
          this.filterForm.controls.transferType.disable();
        });
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
    this.cart = this.prepareGreenCoffeeService.getCart();
    if (this.cart.length > 0) {
      this.filterForm.controls.transferType.setValue(this.cart[0].cartItemInfo.transferType);
      this.filterForm.controls.transferType.disable();
      this.transferType = this.cart[0].cartItemInfo.transferType;
    }

    this.getTotalAmount();
    this.onChange();
    const self = this;
    $('.responsive-table').on('click', 'a.print-note', function(e) {
      e.preventDefault();
      self.printNote($(this).attr('id'));
    });
    $('.responsive-table').on('click', 'a.select-parchment', function(e) {
      const data = $(this).attr('id').split('-');
      e.preventDefault();
      self.selectParchment(data[0], data[1], data[2]);
      self.rerender();
    });
  }

  selectParchment(deliveryId, itemId, parchmentId) {
    const deliveryIndex = this.cartItem.findIndex(element => element._id === deliveryId);
    const parchmentIndex = this.cartItem[deliveryIndex].items.parchments.findIndex(element => element._id === parchmentId);
    if (this.cartItem[deliveryIndex].items.selectedQty === this.cartItem[deliveryIndex].items.amountToDeduct
      && (!this.cartItem[deliveryIndex].items.parchments[parchmentIndex].selected)) {
    } else if (this.cartItem[deliveryIndex].items.parchments[parchmentIndex].selected) {
      this.cartItem[deliveryIndex].items.selectedQty =
        this.cartItem[deliveryIndex].items.selectedQty - this.cartItem[deliveryIndex].items.parchments[parchmentIndex].qtyToDeduct;
      delete this.cartItem[deliveryIndex].items.parchments[parchmentIndex].qtyToDeduct;
      delete this.cartItem[deliveryIndex].items.parchments[parchmentIndex].selected;
      this.addToCartDisabled = true;
    } else {
      const qty = this.cartItem[deliveryIndex].items.amountToDeduct <
      this.cartItem[deliveryIndex].items.parchments[parchmentIndex].remainingQty ?
        this.cartItem[deliveryIndex].items.amountToDeduct : this.cartItem[deliveryIndex].items.parchments[parchmentIndex].remainingQty;
      this.cartItem[deliveryIndex].items.selectedQty =
        this.cartItem[deliveryIndex].items.selectedQty ?
          this.cartItem[deliveryIndex].items.selectedQty + qty : qty;
      this.cartItem[deliveryIndex].items.parchments[parchmentIndex].qtyToDeduct = qty;
      this.cartItem[deliveryIndex].items.parchments[parchmentIndex].selected = true;
      const index = this.cartItem.findIndex(delivery => delivery.items.selectedQty !== delivery.items.amountToDeduct);
      this.addToCartDisabled = index > -1;
    }
  }

  ngAfterViewInit(): void {
    this.dtTriggerItem.next();
    this.dtTriggerCart.next();
  }

  onFilter() {
    if (this.filterForm.valid) {
      this.loading = true;
      this.filter = JSON.parse(JSON.stringify(this.filterForm.value));
      if (!isUndefined(this.transferType)) {
        this.filter.transferType = this.transferType;
      } else {
        this.transferType = this.filter.transferType;
      }
      if (this.transferType === 'processing' && isUndefined(this.selectedSupplier)) {
        this.selectedSupplier = this.filter.supplier;
      } else if (this.transferType === 'processing' && !isUndefined(this.selectedSupplier)) {
        this.filter.supplier = this.selectedSupplier;
      }
      this.filter['org_id'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
      this.itemIndex = this.cart.findIndex(item => (item.cartItemInfo.coffeeGrade === this.filter.grade
        && item.cartItemInfo.coffeeType._id === this.filter.type
        && item.cartItemInfo.supplier._id === this.filter.supplier
        && item.cartItemInfo.transferType === this.filter.transferType
      ));
      this.filter = this.helper.cleanObject(this.filter);
      if (this.itemIndex !== -1 && this.filter.amount) {
        this.filter.amount = +this.filter.amount + this.cart[this.itemIndex].cartItemInfo.totalKgs;
        this.totalAmount -= this.cart[this.itemIndex].cartItemInfo.totalKgs;
      }
      this.dryMillService.prepareGreenCoffee(this.filter)
        .subscribe(data => {
          this.cartItemInfo.totalKgs = 0;
          this.cartItem = data.content;
          this.cartItemInfo['addedToCart'.toString()] = false;
          this.cartItemInfo['supplier'.toString()] = this.cartItem[0].originOrg;
          this.loading = false;
          this.cartItem.forEach(itm => this.cartItemInfo.totalKgs += (+itm.items.amountToDeduct));
          this.cartItemInfo.coffeeGrade = this.filter.grade;
          this.cartItemInfo['transferType'.toString()] = this.filter.transferType;
          this.cartItemInfo.coffeeType = this.coffeeTypes.find(t => t._id === this.filter.type);
          if (this.transferType === 'processing') {
            this.filterForm.controls.transferType.disable();
          }
          this.rerender();
        }, (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.filterForm));
    }
  }

  selectEvent(item) {
    this.filterForm.controls.supplier.setValue(item._id);
  }

  deselectEvent() {
    if (this.parameters.search && this.parameters.search.supplier) {
      delete this.parameters.search.supplier;
      this.filterForm.controls.supplier.setValue('');
    }
  }

  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    });
    this.dtTriggerItem.next();
    this.dtTriggerCart.next();
  }

  onSubmit() {
    if (this.cart.length !== 0) {
      const payload = {
        totalAmount: this.totalAmount,
        deliveryType: this.transferType,
        mixture: []
      };
      this.cart.map((item) => {
        const itm = {
          type: item.cartItemInfo.coffeeType._id,
          grade: item.cartItemInfo.coffeeGrade,
          totalKgs: item.cartItemInfo.totalKgs,
          supplier: item.cartItemInfo.supplier._id,
          items: []
        };
        const items = [];
        item.cartItem.map((value) => {
          const parchments = [];
          value.items.parchments.map((parchment) => {
            if (parchment.selected) {
              parchments.push(
                {
                  parchmentId: parchment.parchmentId,
                  qtyToDeduct: parchment.qtyToDeduct,
                  lotNumber: parchment.lotNumber
                }
              );
            }
          });
          const temp = {
            deliveryId: value._id,
            amountToDeduct: value.items.amountToDeduct,
            itemId: value.items._id,
            parchments
          };

          items.push(temp);
        });
        itm.items = items;
        payload.mixture.push(itm);
      });
      payload['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      payload['org_id'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
      this.dryMillService.updateGreenCoffee(payload, this.data.id)
        .subscribe(() => {
            this.prepareGreenCoffeeService.resetCart();
            this.resetSelection();
            this.resetCart();
            this.modal.close('Mixture successfully updated');
          },
          (err) => {
            this.errors = err.errors;
          });
    } else {
      this.setError(['Please add at least one(1) item to cart']);
    }

  }

  onClearFilter() {
    this.filterForm.reset(this.initialSearchValue);
    this.resetSelection();
  }

  cancelCartItem(i: number) {
    this.totalAmount -= this.cart[i].cartItemInfo.totalKgs;
    this.cart.splice(i, 1);
    this.prepareGreenCoffeeService.setCart(this.cart);
    if (this.cart.length === 0) {
      this.filterForm.controls.transferType.enable();
      this.transferType = undefined;
    }
    this.rerender();
  }

  onChange() {
    this.filterForm.controls.deliveryDate.get('from'.toString()).valueChanges.subscribe((value) => {
      this.filterForm.controls.deliveryDate.get('from').patchValue(this.helper.setLocalTimeZone(value), {emitEvent: false});
    });
    this.filterForm.controls.deliveryDate.get('to'.toString()).valueChanges.subscribe((value) => {
      this.filterForm.controls.deliveryDate.get('to').patchValue(this.helper.setLocalTimeZone(value), {emitEvent: false});
    });
  }

  addItemToCart() {
    if (this.cartItem.length !== 0) {
      if (this.itemIndex !== -1) {
        this.cart.splice(this.itemIndex, 1);
      }
      this.totalAmount += this.cartItemInfo.totalKgs;
      this.cart.push({
        cartItemInfo: JSON.parse(JSON.stringify(this.cartItemInfo)),
        cartItem: JSON.parse(JSON.stringify(this.cartItem)),
      });
      this.rerender();
    }
    this.filterForm.controls.transferType.disable();
    this.prepareGreenCoffeeService.setCart(this.cart);
    this.resetSelection();
  }

  resetSelection() {
    this.cartItemInfo = {
      coffeeType: {
        name: '',
        _id: ''
      },
      coffeeGrade: '',
      transferType: '',
      supplier: '',
      totalKgs: 0
    };
    this.cartItem = [];
  }

  resetCart() {
    this.cart = [];
    this.filterForm.controls.transferType.enable();
    this.transferType = undefined;
  }

  getTotalAmount() {
    this.cart.forEach(itm => this.totalAmount += (+itm.cartItemInfo.totalKgs));
    return this.totalAmount;
  }

  printNote(id: string) {
    this.clear();
    this.parchmentService.printDeliveryNote(id).subscribe((data) => {
      const byteArray = new Uint8Array(atob(data.data).split('').map(char => char.charCodeAt(0)));
      const newBlob = new Blob([byteArray], {type: 'application/pdf'});
      const linkElement = document.createElement('a');
      const url = URL.createObjectURL(newBlob);
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', data.fileName + '.pdf');
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      });
      linkElement.dispatchEvent(clickEvent);
    });
  }

  ngOnDestroy(): void {
  }
}
