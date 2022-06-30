import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteFarmVisitComponent } from './delete-farm-visit.component';

describe('DeleteFarmVisitComponent', () => {
  let component: DeleteFarmVisitComponent;
  let fixture: ComponentFixture<DeleteFarmVisitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteFarmVisitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteFarmVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
