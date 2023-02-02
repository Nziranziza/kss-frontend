import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  BasicComponent,
  ConfirmDialogService,
  HelperService, InputDistributionService,
  SeasonService,
  SiteService
} from '../../../../core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-site-dispatch-plan',
  templateUrl: './site-dispatch-plan.component.html',
  styleUrls: ['./site-dispatch-plan.component.css']
})
export class SiteDispatchPlanComponent extends BasicComponent implements OnInit, OnDestroy {


  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private siteService: SiteService,
              private router: Router, private confirmDialogService: ConfirmDialogService,
              private seasonService: SeasonService,
              private inputDistributionService: InputDistributionService,
              private helper: HelperService) {
    super();
  }

  dispatchPlanForm: UntypedFormGroup;
  qtyPesticides = 0;
  season: any;
  id: string;
  includeFertilizer = true;
  includePesticide = false;
  site: any;
  fertilizer: any;
  pesticides: any;
  cws = [];

  ngOnInit() {
    this.dispatchPlanForm = this.formBuilder.group({
      fertilizers: this.formBuilder.group({
        qty: [0],
        cws: new UntypedFormArray([]),
      }),
      pesticides: new UntypedFormArray([]),
      qtyPesticides: [0]
    });
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
      this.siteService.get(params['id'.toString()]).subscribe(data => {
        this.site = data.content;
        this.cws = this.site.coveredAreas.coveredCWS;
        this.getCurrentSeason();
        for (const station of this.cws) {
          (this.dispatchPlanForm.controls.fertilizers.get('cws') as UntypedFormArray)
            .push(
              this.formBuilder.group({
                org_id: [station.org_id],
                name: [station.name],
                qty: [0]
              }));
        }
      })
    });
    this.onChanges();
  }

  get formPesticides() {
    return this.dispatchPlanForm.controls.pesticides as UntypedFormArray;
  }

  getFormPesticidesCws(index: number) {
    return this.formPesticides.controls[index].get('cws') as UntypedFormArray
  }

  get formFertilizersCWS() {
    return this.dispatchPlanForm.controls.fertilizers.get('cws') as UntypedFormArray
  }

  addPesticide() {
    (this.dispatchPlanForm.controls.pesticides as UntypedFormArray).push(this.createPesticide());
  }

  removePesticide(index: number) {
    (this.dispatchPlanForm.controls.pesticides as UntypedFormArray).removeAt(index);
  }

  createPesticide(): UntypedFormGroup {
    const stations = new UntypedFormArray([]);
    for (const station of this.cws) {
      stations.push(
        this.formBuilder.group({
          org_id: [station.org_id],
          name: [station.name],
          qty: [0]
        })
      );
    }
    return this.formBuilder.group({
      inputId: ['', Validators.required],
      qty: [''],
      cws: stations as UntypedFormArray
    });
  }

  onChangePesticides(index: number) {
    const value = this.formPesticides.value[index];
    this.formPesticides.value.forEach((el, i) => {
      if ((value.inputId === el.inputId) && (this.formPesticides.value.length > 1) && (i !== index)) {
        this.removePesticide(index);
      }
    });
  }

  onChangePesticidesCWS(index: number) {
    const values = this.getFormPesticidesCws(index).value;
    let qtyPesticides = 0;
    values.forEach((value) => {
      qtyPesticides = qtyPesticides + (+value.qty);
    });
    this.formPesticides.controls[index].get('qty').setValue(qtyPesticides, {emitEvent: true})
  }

  onChangeFertilizerCWS() {
    const values = this.formFertilizersCWS.value;
    let qtyPesticides = 0;
    values.forEach((value) => {
      qtyPesticides = qtyPesticides + (+value.qty);
    });
    this.dispatchPlanForm.controls.fertilizers.get('qty').setValue(qtyPesticides);
  }

  onChanges() {
    this.formPesticides.valueChanges.subscribe((values) => {
      this.qtyPesticides = 0;
      values.forEach((value) => {
        if (value.qty !== '') {
          this.qtyPesticides = this.qtyPesticides + (+value.qty);
        }
      });
      this.dispatchPlanForm.controls.qtyPesticides.setValue(this.qtyPesticides);
    });
  }

  onSubmit() {
    if (this.dispatchPlanForm.valid) {
      // on submit
      const dispatchPlan = JSON.parse(JSON.stringify(this.dispatchPlanForm.value));
      dispatchPlan.seasonId = this.season._id;
      dispatchPlan.fertilizers.inputId = this.fertilizer;
      delete dispatchPlan.qtyPesticides;
      this.siteService.updateDispatchPlan(this.id, dispatchPlan).subscribe((data) => {
        this.setMessage('Dispatch plan successfully updated');
      }, (err) => {
        this.setError(err.errors);
      });

    } else {
      this.setError(this.helper.getFormValidationErrors(this.dispatchPlanForm));
    }
  }

  onIncludeFertilizer() {
    this.includeFertilizer = !this.includeFertilizer;
  }

  onIncludePesticide() {
    this.includePesticide = !this.includePesticide;
    if ((this.dispatchPlanForm.get('pesticides') as UntypedFormArray).length === 0) {
      this.addPesticide();
    }
  }

  getCurrentSeason() {
    this.seasonService.all().subscribe((dt) => {
      const seasons = dt.content;
      seasons.forEach((item) => {
        if (item.isCurrent) {
          this.fertilizer = item.seasonParams.inputName._id;
          this.pesticides = item.seasonParams.pesticide;
          this.season = item;
        }
      });
      if (this.site.dispatchPlans) {
        const plan = this.site.dispatchPlans.find((pl) => pl.seasonId == this.season._id);
        if(plan) {
          this.populateForm(plan);
        }
      }
    });
  }

  populateForm(plan) {

    this.includeFertilizer = plan.fertilizers.qty > 0;
    for (const pesticide of plan.pesticides) {
      const stations = new UntypedFormArray([]);
      let subTotal = 0;
      for (const station of this.cws) {
        const qt = pesticide.cws.find((c) => c.org_id === station.org_id)?.qty
        stations.push(
          this.formBuilder.group({
            org_id: [station.org_id],
            name: [station.name],
            qty: [qt ? qt: 0]
          })
        );
        subTotal = subTotal + qt;
      }
      (this.dispatchPlanForm.controls.pesticides as UntypedFormArray).push(
        this.formBuilder.group({
          inputId: [pesticide.inputId, Validators.required],
          qty: [subTotal],
          cws: stations
        }));
      this.qtyPesticides = this.qtyPesticides + pesticide.qty;
      this.includePesticide = this.qtyPesticides > 0;
      if(this.includeFertilizer) {
        this.dispatchPlanForm.controls.fertilizers.patchValue(plan.fertilizers, {emitEvent: false})
      }
    }
  }

  ngOnDestroy(): void {
  }
}
