import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacySecurityReportingComponent } from './privacy-security-reporting.component';

describe('PrivacySecurityReportingComponent', () => {
  let component: PrivacySecurityReportingComponent;
  let fixture: ComponentFixture<PrivacySecurityReportingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrivacySecurityReportingComponent]
    });
    fixture = TestBed.createComponent(PrivacySecurityReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
