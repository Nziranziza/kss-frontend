import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPaymentChannelComponent } from './edit-payment-channel.component';

describe('EditSettingsComponent', () => {
  let component: EditPaymentChannelComponent;
  let fixture: ComponentFixture<EditPaymentChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPaymentChannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPaymentChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
