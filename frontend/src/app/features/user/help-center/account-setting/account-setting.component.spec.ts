import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingComponent } from './account-setting.component';

describe('AccountSettingComponent', () => {
  let component: AccountSettingComponent;
  let fixture: ComponentFixture<AccountSettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountSettingComponent]
    });
    fixture = TestBed.createComponent(AccountSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
