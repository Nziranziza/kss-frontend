import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmVisitListComponent } from './farm-visit-list.component';

describe('FarmVisitListComponent', () => {
  let component: FarmVisitListComponent;
  let fixture: ComponentFixture<FarmVisitListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmVisitListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmVisitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
