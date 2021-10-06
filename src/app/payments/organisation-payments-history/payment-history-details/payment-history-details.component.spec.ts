import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentHistoryDetailsComponent } from './payment-history-details.component';

describe('PaymentHistoryDetailsComponent', () => {
  let component: PaymentHistoryDetailsComponent;
  let fixture: ComponentFixture<PaymentHistoryDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentHistoryDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentHistoryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
