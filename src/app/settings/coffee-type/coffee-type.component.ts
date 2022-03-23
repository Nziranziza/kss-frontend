import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CoffeeTypeService } from "../../core/services";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DeleteTypeModal } from './coffee-type-delete-modal/coffee-type-delete-modal-component';

@Component({
  selector: "app-coffee-type",
  templateUrl: "./coffee-type.component.html",
  styleUrls: ["./coffee-type.component.css"],
})
export class CoffeeTypeComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private modal: NgbModal,
    private coffeeTypeService: CoffeeTypeService
  ) {}

  message: string;
  coffeeTypes: any;

  ngOnInit() {
    this.getAllCoffeeTypes();
  }

  getAllCoffeeTypes(): void {
    this.coffeeTypeService.all().subscribe((data) => {
      if (data && data.content) {
        this.coffeeTypes = data.content;
      }
    });
  }

  openDeleteModal(category: any) {
    const modalRef = this.modal.open(DeleteTypeModal);
    modalRef.componentInstance.category = category;
    modalRef.result.finally(() => {
      this.getAllCoffeeTypes();
    });
  }
}
