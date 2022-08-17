import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { TrainingService, GapService, Training, HelperService } from "../../../../core";
import { MessageService } from "../../../../core";
import { BasicComponent } from "../../../../core";

@Component({
  selector: "app-training-edit",
  templateUrl: "./training-edit.component.html",
  styleUrls: ["../training-create/training-create.component.css"],
})
export class TrainingEditComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{
  createTraining: FormGroup;
  closeResult = "";
  id: string;
  training: Training;
  gapDropdownSettings: IDropdownSettings = {};
  constructor(
    private formBuilder: FormBuilder,
    private trainingService: TrainingService,
    private gapService: GapService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private modalService: NgbModal,
    private helperService: HelperService
  ) {
    super();
  }

  results: any[] = [];
  gaps: any[] = [];
  files: any[] = [];
  materials: any[] = [];
  loading = false;
  dataReturned: any[] = [];

  ngOnDestroy(): void {}

  ngOnInit() {
    this.getGaps();
    this.createTraining = this.formBuilder.group({
      trainingName: ["", Validators.required],
      description: ["", Validators.required],
      adoptionGap: ["", Validators.required],
      status: ["active", Validators.required],
    });

    this.gapDropdownSettings = {
      singleSelection: false,
      idField: "_id",
      textField: "name",
      selectAllText: "Select All",
      enableCheckAll: false,
      unSelectAllText: "UnSelect All",
      itemsShowLimit: 6,
      allowSearchFilter: true,
    };

    this.route.params.subscribe((params) => {
      this.id = params["id".toString()];
    });

    this.getTraining();
    this.setMessage(this.messageService.getMessage());
  }

  get trainingName() {
    return this.createTraining.get("trainingName");
  }
  get description() {
    return this.createTraining.get("description");
  }
  get adoptionGap() {
    return this.createTraining.get("adoptionGap");
  }




  getTraining() {
    this.trainingService.one(this.id).subscribe((data) => {
      if (data && data.data) {

        this.training = data.data;
        console.log(this.training);
        this.createTraining.controls.trainingName.setValue(
          this.training.trainingName
        );
        this.createTraining.controls.description.setValue(
          this.training.description
        );
        this.createTraining.controls.adoptionGap.setValue(
          this.training.adoptionGaps
        );
        this.results = this.training.materials;
      }
    });
  }

  async onFileSelected(event) {
    this.loading = true;
    let files = event.target.files;
    let materials: any[] = [];
    for (let i = 0; i < files.length; i++) {
      let data = await this.readBase64(files[i]).then((data) => {
        return data;
      });
      materials.push(data);
    }
    this.trainingService.uploadMaterial({ materials: materials }).subscribe(
      (data) => {
        for (let i = 0; i < files.length; i++) {
          this.results.push({
            fileName: files[i].name,
            url: data.data[i],
          });
        }
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        this.errors = err.errors;
      }
    );
  }

  getGaps(): void {
    this.loading = true;
    this.gapService.all().subscribe((data) => {
      let newData :any[] = [{
        _id : "",
        name: "Not Applied"
      }];
      data.data.forEach(data => {
        newData.push({_id: data._id, name: data.gap_name});
      });
      this.gaps = newData;
      this.loading = false;
    });
  }

  onGapSelect(item: any) {
    if (item._id === '') {
      this.gapDropdownSettings.singleSelection = true;
    }
  }

  async onFileUpload() {
    if (this.createTraining.valid) {
      this.loading = true;
      for (let i = 0; i < this.files.length; i++) {
        const data = await this.readBase64(this.files[i].file).then((data) => {
          return data;
        });
        this.materials.push(data);
      }
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

  private readBase64(file): Promise<any> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.addEventListener(
        "load",
        () => {
          resolve(reader.result);
        },
        false
      );
      reader.addEventListener(
        "error",
        (event) => {
          reject(event);
        },
        false
      );

      reader.readAsDataURL(file);
    });
  }

  onSubmit() {
    const value = JSON.parse(JSON.stringify(this.createTraining.value));
    value.materials = this.results;
    this.trainingService.update(value, this.id).subscribe(
      (data) => {
        this.loading = false;
        this.setMessage('Training successfully Edited.');
        this.router.navigateByUrl('admin/training/list');
      },
      (err) => {
        this.loading = false;
        this.errors = err.errors;
      }
    );
  }

  removeSelectedFile(index) {
    this.results.splice(index, 1);
  }
}
