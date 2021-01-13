import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmParchmentTransferComponent } from './confirm-parchment-transfer.component';

describe('ConfirmParchmentTransferComponent', () => {
  let component: ConfirmParchmentTransferComponent;
  let fixture: ComponentFixture<ConfirmParchmentTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmParchmentTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmParchmentTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
