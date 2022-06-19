import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingSchedulingCreateComponent } from './training-scheduling-create.component';

describe('TrainingSchedulingCreateComponent', () => {
  let component: TrainingSchedulingCreateComponent;
  let fixture: ComponentFixture<TrainingSchedulingCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingSchedulingCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingSchedulingCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
