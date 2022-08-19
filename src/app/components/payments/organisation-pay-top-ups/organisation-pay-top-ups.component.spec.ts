import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationPayTopUpsComponent } from './organisation-pay-top-ups.component';

describe('OrganisationPayTopUpsComponent', () => {
  let component: OrganisationPayTopUpsComponent;
  let fixture: ComponentFixture<OrganisationPayTopUpsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganisationPayTopUpsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganisationPayTopUpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
