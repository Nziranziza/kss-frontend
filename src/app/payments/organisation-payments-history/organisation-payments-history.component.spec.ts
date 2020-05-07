import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationPaymentsHistoryComponent } from './organisation-payments-history.component';

describe('OrganisationPaymentsHistoryComponent', () => {
  let component: OrganisationPaymentsHistoryComponent;
  let fixture: ComponentFixture<OrganisationPaymentsHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganisationPaymentsHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganisationPaymentsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
