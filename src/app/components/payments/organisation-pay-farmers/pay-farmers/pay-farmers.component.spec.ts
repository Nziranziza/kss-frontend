import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayFarmersComponent } from './pay-farmers.component';

describe('PayFarmersComponent', () => {
  let component: PayFarmersComponent;
  let fixture: ComponentFixture<PayFarmersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayFarmersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayFarmersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
