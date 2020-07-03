import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPaymentChannelComponent } from './add-payment-channel.component';

describe('OrganisationSettingsComponent', () => {
  let component: AddPaymentChannelComponent;
  let fixture: ComponentFixture<AddPaymentChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPaymentChannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPaymentChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
