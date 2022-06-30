import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleFarmVisitComponent } from './schedule-farm-visit.component';

describe('ScheduleFarmVisitComponent', () => {
  let component: ScheduleFarmVisitComponent;
  let fixture: ComponentFixture<ScheduleFarmVisitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleFarmVisitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleFarmVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
