import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfirmDialogService, FarmerService} from '../../core/services';
import {Router} from '@angular/router';
import {Farmer} from '../../core/models';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FarmerDetailsComponent} from '../farmer-details/farmer-details.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MessageService} from '../../core/services/message.service';

@Component({
  selector: 'app-farmer-list',
  templateUrl: './farmer-list.component.html',
  styleUrls: ['./farmer-list.component.css'],
})
export class FarmerListComponent implements OnInit, OnDestroy {

  constructor(private farmerService: FarmerService,
              private router: Router, private  confirmDialogService: ConfirmDialogService,
              private modal: NgbModal, private formBuilder: FormBuilder, private messageService: MessageService) {
    this.parameters = {
      length: 25,
      start: 0,
      draw: 1
    };
  }

  filterForm: FormGroup;
  maxSize = 9;
  order = 'userInfo.foreName';
  reverse = true;
  directionLinks = true;
  message: string;
  farmers: any;
  title = 'Farmers';
  id = 'farmers_list';
  parameters: any;
  config: any;
  autoHide = false;
  responsive = false;
  labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };
  loading = false;
  searchFields = [
    {value: 'phone_number', name: 'phone number'},
    {value: 'reg_number', name: 'registration number'},
    {value: 'nid', name: 'NID'},
    {value: 'forename', name: 'first name'},
    {value: 'surname', name: 'last name'},
    {value: 'location', name: 'location'},
    {value: 'groupname', name: 'group name'}
  ];

  ngOnInit(): void {
    this.farmerService.getFarmers(this.parameters)
      .subscribe(data => {
        this.farmers = data.data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };

      });
    this.filterForm = this.formBuilder.group({
      term: ['', Validators.minLength(3)],
      searchBy: ['forename']
    });

    this.message = this.messageService.getMessage();
  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event > 1) {
      this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }

    this.farmerService.getFarmers(this.parameters)
      .subscribe(data => {
        this.farmers = data.data;
      });
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  onFilter() {
    if (this.filterForm.valid) {
      this.loading = true;
      this.parameters['search'.toString()] = this.filterForm.value;
      this.farmerService.getFarmers(this.parameters)
        .subscribe(data => {
          this.farmers = data.data;
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: data.recordsTotal
          };
          this.loading = false;
        });
    }
  }

  onClearFilter() {
    this.filterForm.controls.term.reset();
    delete this.parameters.search;
    this.farmerService.getFarmers(this.parameters)
      .subscribe(data => {
        this.farmers = data.data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
      });
  }

  ngOnDestroy(): void {
    this.messageService.setMessage('');
  }

  deleteFarmer(farmer: Farmer): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this record?').afterClosed().subscribe(
      res => {
        if (res) {
          this.farmerService.destroy(farmer._id)
            .subscribe(data => {
              this.message = 'Record successful deleted!';
            });
        }
      });
  }

  viewDetails(farmer: Farmer) {
    const modalRef = this.modal.open(FarmerDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
  }

  editFarmerProfile() {
  }

  editFarmerRequest() {
  }

  addFarmerRequest() {
  }

  cancelFarmerRequest() {
  }
}
