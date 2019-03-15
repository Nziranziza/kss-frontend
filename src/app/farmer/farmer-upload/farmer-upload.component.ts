import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {FarmerService} from '../../core/services';

@Component({
  selector: 'app-farmer-upload',
  templateUrl: './farmer-upload.component.html',
  styleUrls: ['./farmer-upload.component.css']
})
export class FarmerUploadComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router,
              private farmerService: FarmerService) {
  }

  editForm: FormGroup;
  errors: string[];
  title = 'Upload farmers';

  ngOnInit() {

    this.editForm = this.formBuilder.group({
      inputFile: []
    });
  }

  onSubmit() {
    return;
  }

}
