import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsernameLabelComponent } from './username-label.component';

describe('UsernameLabelComponent', () => {
  let component: UsernameLabelComponent;
  let fixture: ComponentFixture<UsernameLabelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsernameLabelComponent]
    });
    fixture = TestBed.createComponent(UsernameLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
