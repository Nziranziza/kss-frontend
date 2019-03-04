import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingnavbarComponent } from './settingnavbar.component';

describe('SettingnavbarComponent', () => {
  let component: SettingnavbarComponent;
  let fixture: ComponentFixture<SettingnavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingnavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingnavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
