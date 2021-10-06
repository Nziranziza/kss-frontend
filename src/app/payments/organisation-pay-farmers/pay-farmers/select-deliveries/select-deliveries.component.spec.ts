import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDeliveriesComponent } from './select-deliveries.component';

describe('SelectDeliveriesComponent', () => {
  let component: SelectDeliveriesComponent;
  let fixture: ComponentFixture<SelectDeliveriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectDeliveriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDeliveriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
