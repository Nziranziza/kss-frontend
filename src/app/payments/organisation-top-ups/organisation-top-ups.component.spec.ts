import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationTopUpsComponent } from './organisation-top-ups.component';

describe('OrganisationTopUpsComponent', () => {
  let component: OrganisationTopUpsComponent;
  let fixture: ComponentFixture<OrganisationTopUpsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganisationTopUpsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganisationTopUpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
