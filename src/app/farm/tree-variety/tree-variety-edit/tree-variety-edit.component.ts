import { Component, OnInit } from '@angular/core';
import {BasicComponent, FarmService, HelperService, MessageService} from '../../../core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-tree-variety-edit',
  templateUrl: './tree-variety-edit.component.html',
  styleUrls: ['./tree-variety-edit.component.css']
})
export class TreeVarietyEditComponent extends BasicComponent implements OnInit {

  editForm: FormGroup;
  id: string;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private messageService: MessageService,
              private farmService: FarmService,
              private helper: HelperService) {
    super();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
    });

    this.editForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      acronym: ['', Validators.required],
    });

    this.farmService.getTreeVariety(this.id).subscribe((response) => {
      this.editForm.patchValue(response.data);
    });
  }

  onSubmit() {
    if (this.editForm.valid) {
      const variety = this.editForm.value;
      this.farmService.updateTreeVariety(this.id, variety).subscribe((response) => {
        this.messageService.setMessage(response.message);
        this.router.navigateByUrl('admin/farm/tree-varieties/list');
      }, (err) => {
        this.setError(err.errors);
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editForm);
    }
  }
}
