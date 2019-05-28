import {Component, OnDestroy, OnInit} from '@angular/core';
import {FarmerService} from '../../core/services';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MessageService} from '../../core/services/message.service';

@Component({
  selector: 'app-pending-farmer-list',
  templateUrl: './pending-farmer-list.component.html',
  styleUrls: ['./pending-farmer-list.component.css']
})
export class PendingFarmerListComponent implements OnInit, OnDestroy {

  constructor(private farmerService: FarmerService,
              private router: Router,
              private modal: NgbModal, private formBuilder: FormBuilder, private messageService: MessageService) {
    this.parameters = {
      length: 25,
      start: 0,
      draw: 1
    };
  }

  message: string;
  farmers: any;
  maxSize = 9;
  order = 'foreName';
  reverse = true;
  directionLinks = true;
  filterForm: FormGroup;
  title = 'Temporary Farmers';
  i: number;
  parameters: any;
  config: any;
  autoHide = false;
  responsive = true;
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
    {value: 'nid', name: 'NID'},
    {value: 'forename', name: 'first name'},
    {value: 'surname', name: 'last name'},
  ];

  ngOnInit() {
    this.farmerService.getPendingFarmers(this.parameters)
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

    this.farmerService.getPendingFarmers(this.parameters)
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
      this.farmerService.getPendingFarmers(this.parameters)
        .subscribe(data => {
          this.farmers = data.data;
          this.loading = false;
        });
    }
  }

  ngOnDestroy(): void {
    this.messageService.setMessage('');
  }

  onClearFilter() {
    this.filterForm.controls.term.reset();
    delete this.parameters.search;
    this.farmerService.getPendingFarmers(this.parameters)
      .subscribe(data => {
        this.farmers = data.data;
      });
  }
}
