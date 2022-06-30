import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TrainingService, GapService } from "../../../../core";
import { MessageService } from "../../../../core";
import { HelperService } from "../../../../core";
import { BasicComponent } from "../../../../core";

@Component({
  selector: "app-training-create",
  templateUrl: "./training-create.component.html",
  styleUrls: ["./training-create.component.css"],
})
export class TrainingCreateComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{
  createTraining: FormGroup;
  closeResult = "";
  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private trainingService: TrainingService,
    private gapService: GapService,
    private helperService: HelperService,
    private messageService: MessageService
  ) {
    super();
  }

  ngOnDestroy(): void {}

  ngOnInit() {
    this.getGaps();
    this.createTraining = this.formBuilder.group({
      trainingName: ["", Validators.required],
      description: ["", Validators.required],
      adoptionGap: ["", Validators.required],
      status: [""],
    });
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
  get status() {
    return this.createTraining.get("status");
  }
  files: any[] = [];
  materials: any[] = [];
  results: any[] = [];
  gaps: any[] = [];
  loading = false;

  onFileSelected(event) {
    for (let file of event.target.files) {
      this.files.push({
        name: file.name,
        type: file.type,
        url: "",
        file: file,
        size: Math.round(file.size / 1024) + " " + "KB",
      });
    }
  }

  getGaps(): void {
    this.loading = true;
    this.gapService.all().subscribe((data) => {
      this.gaps = data.data;
      this.loading = false;
    });
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
  async onFileUpload(content) {
    if (this.createTraining.valid) {
      this.loading = true;
      for (let i = 0; i < this.files.length; i++) {
        let data = await this.readBase64(this.files[i].file).then((data) => {
          return data;
        });
        this.materials.push(data);
      }
      this.modalService.open(content, { ariaLabelledBy: "modal-basic-title" });
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
            console.log(err);
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
    let materials = [];
    this.files.map((file, index) => {
      materials.push({
        fileName: file.name,
        url: this.results[index],
      });
    });
    value.materials = materials;
    this.trainingService.create(value).subscribe(
      (data) => {
        this.loading = false;
        this.setMessage("Training successfully created.");
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
    this.modalService.open(content, { ariaLabelledBy: "modal-basic-title" });
  }
}
