import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingScheduleViewComponent } from './training-schedule-view.component';

describe('TrainingScheduleViewComponent', () => {
  let component: TrainingScheduleViewComponent;
  let fixture: ComponentFixture<TrainingScheduleViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingScheduleViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingScheduleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
