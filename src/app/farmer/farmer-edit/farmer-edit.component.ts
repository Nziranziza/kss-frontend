import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {FarmerService} from '../../core/services';

@Component({
  selector: 'app-farmer-edit',
  templateUrl: './farmer-edit.component.html',
  styleUrls: ['./farmer-edit.component.css']
})
export class FarmerEditComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private farmerService: FarmerService) {
  }

  editForm: FormGroup;
  errors: string[];
  title = 'Edit farmer';

  ngOnInit() {

    this.editForm = this.formBuilder.group({
      foreName: [''],
      surname: [''],
      address: [''],
      ownsLand: [''],
      upiNumber: [''],
      treesNumber: [''],
      belongsToCooperative: ['']

    });
    this.route.params.subscribe(params => {
      this.farmerService.get(params['id'.toString()]).subscribe(data => {
        this.editForm.patchValue(data);
      });
    });
  }

  onSubmit() {
    if (this.editForm.valid) {
      this.farmerService.save(this.editForm.value).subscribe(data => {
          this.router.navigateByUrl('admin/farmers');
        },
        (err) => {
          this.errors = err;
        });

    }
  }

}
