import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TrainingService } from "../../../../core";
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
    private trainingService: TrainingService
  ) {
    super();
  }

  ngOnDestroy(): void {}

  ngOnInit() {
    this.createTraining = this.formBuilder.group({
      trainingName: [""],
      description: [""],
      associatedGap: [""],
      trainingFiles: [""],
    });
  }

  files: any[] = [];
  results: any[] = [];
  fileData: any = [];

  onFileSelected(event) {
    for (let file of event.target.files) {
      this.files.push({
        name: file.name,
        type: file.type,
        url: "",
        file: file,
        size: Math.round(file.size / 1024) + " " + "KB",
      });
      console.log(file);
      this.fileData = event.target.files;
      console.log(this.fileData[0]);
    }
  }
  handleUpload(files: FileList) {
    let filesToUpload = files.item(0);
    this.trainingService.uploadAllMaterial({ files: filesToUpload }).subscribe(
      (data) => {
        console.log(data);
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        this.errors = err.errors;
      }
    );
  }
  // handlefileSyllabus(files: FileList) {
  //   this.fileSyllabus = files.item(0);
  //   this.tradeDetailsService.fileUpload(this.fileSyllabus).subscribe((result: any) => {
  //     this.syllabusFileName = result.renameFile
  //     console.log(result.renameFile);
  //   });
  // }

  onFileUpload() {
    let files: FileList = this.fileData;

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      console.log(files.item(i));
      formData.append("file", files.item(i));
      this.trainingService.uploadMaterial(formData).subscribe(
        (data) => {
          console.log(data);
          this.results.push(data);
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          console.log(err);
          this.errors = err.errors;
        }
      );
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
        console.log(data);
        this.loading = false;
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
