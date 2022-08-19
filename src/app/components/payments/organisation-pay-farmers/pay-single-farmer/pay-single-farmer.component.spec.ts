import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaySingleFarmerComponent } from './pay-single-farmer.component';

describe('PaySingleFarmerComponent', () => {
  let component: PaySingleFarmerComponent;
  let fixture: ComponentFixture<PaySingleFarmerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaySingleFarmerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaySingleFarmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
