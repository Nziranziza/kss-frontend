import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TrainingService, GapService } from '../../../../core';
import { HelperService } from '../../../../core';
import { BasicComponent } from '../../../../core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { SuccessModalComponent } from '../../../../shared';
import { Router } from '@angular/router';

@Component({
  selector: 'app-training-create',
  templateUrl: './training-create.component.html',
  styleUrls: ['./training-create.component.css'],
})
export class TrainingCreateComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{
  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private trainingService: TrainingService,
    private gapService: GapService,
    private router: Router,
    private helperService: HelperService
  ) {
    super();
  }
  createTraining: FormGroup;
  closeResult = '';
  gapDropdownSettings: IDropdownSettings = {};

  files: any[] = [];
  materials: any[] = [];
  results: any[] = [];
  gaps: any[] = [];
  loading = false;

  ngOnDestroy(): void {}

  ngOnInit() {
    this.getGaps();
    this.createTraining = this.formBuilder.group({
      trainingName: ['', Validators.required],
      description: ['', Validators.required],
      adoptionGap: [[], Validators.required],
      status: ['active'],
    });
    this.gapDropdownSettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'name',
      selectAllText: 'Select All',
      enableCheckAll: false,
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 6,
      allowSearchFilter: true,
    };
  }

  get trainingName() {
    return this.createTraining.get('trainingName');
  }
  get description() {
    return this.createTraining.get('description');
  }
  get adoptionGap() {
    return this.createTraining.get('adoptionGap');
  }
  get status() {
    return this.createTraining.get('status');
  }

  onGapSelect(item: any) {
    const gapSelected = this.createTraining.get('adoptionGap'.toString());
    if (item._id === '') {
      gapSelected.setValue(
        [
          {
            _id: '',
            name: 'Not Applied',
          },
        ],
        { emitEvent: false }
      );
    } else {
      gapSelected.setValue(gapSelected.value.filter((e) => e._id !== ''));
    }
  }
  onDeGapSelect(item: any) {
    if (item._id === '') {
      this.gapDropdownSettings.singleSelection = false;
    }
    const gapSelected = this.createTraining.get('adoptionGap'.toString());
    const gapOptions = gapSelected.value.filter(
      (data) => data._id !== item._id
    );
    gapSelected.setValue(gapOptions, { emitEvent: false });
  }
  onGapSelectAll(items: any) {
    const gapSelected = this.createTraining.get('adoptionGap'.toString());
    gapSelected.setValue(items, { emitEvent: false });
  }

  onFileSelected(event) {
    for (const file of event.target.files) {
      this.files.push({
        name: file.name,
        type: file.type,
        url: '',
        file,
        size: Math.round(file.size / 1024) + ' ' + 'KB',
      });
    }
  }

  getGaps(): void {
    this.loading = true;
    this.gapService.all().subscribe((data) => {
      const newData: any[] = [
        {
          _id: '',
          name: 'Not Applied',
        },
      ];
      data.data.forEach((gap) => {
        newData.push({ _id: gap._id, name: gap.gap_name });
      });
      this.gaps = newData;
      this.loading = false;
    });
  }

  private readBase64(file): Promise<any> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.addEventListener(
        'load',
        () => {
          resolve(reader.result);
        },
        false
      );
      reader.addEventListener(
        'error',
        (event) => {
          reject(event);
        },
        false
      );

      reader.readAsDataURL(file);
    });
  }
  async onFileUpload(content) {
    if (this.createTraining.valid) {
      this.loading = true;
      for (let i = 0; i < this.files.length; i++) {
        const data = await this.readBase64(this.files[i].file).then((data) => {
          return data;
        });
        this.materials.push(data);
      }
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
      this.trainingService
        .uploadMaterial({ materials: this.materials })
        .subscribe(
          (data) => {
            this.results = data.data;
            this.loading = false;
          },
          (err) => {
            this.loading = false;
            this.errors = err.errors;
          }
        );
    } else {
      if (
        this.helperService.getFormValidationErrors(this.createTraining).length >
        0
      ) {
        this.setError(
          this.helperService.getFormValidationErrors(this.createTraining)
        );
      }
    }
  }

  onSubmit() {
    const value = JSON.parse(JSON.stringify(this.createTraining.value));
    const adoptionGap = [];
    value.adoptionGap.forEach((adoption) => {
      if (adoption._id != '') {
        adoptionGap.push(adoption._id);
      }
    });
    const materials = [];
    this.files.map((file, index) => {
      materials.push({
        fileName: file.name,
        url: this.results[index],
      });
    });

    const data: any = {
      trainingName: value.trainingName,
      description: value.description,
      materials,
    };

    if (adoptionGap.length > 0) {
      data.adoptionGaps = adoptionGap;
    }

    this.trainingService.create(data).subscribe(
      (data) => {
        this.loading = false;
        this.setMessage('Training successfully created.');

      },
      (err) => {
        this.loading = false;
        this.errors = err.errors;
      }
    );
  }

  removeSelectedFile(index) {
    this.files.splice(index, 1);
  }

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  success(name) {
    const modalRef = this.modalService.open(SuccessModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
    });
    modalRef.componentInstance.message = 'has been added';
    modalRef.componentInstance.title = 'Thank you';
    modalRef.componentInstance.name = name;
    modalRef.result.finally(() => {
      this.router.navigateByUrl('admin/training/list');
    });
  }
}
