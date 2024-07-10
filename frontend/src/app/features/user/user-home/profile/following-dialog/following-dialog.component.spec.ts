import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowingDialogComponent } from './following-dialog.component';

describe('FollowingDialogComponent', () => {
  let component: FollowingDialogComponent;
  let fixture: ComponentFixture<FollowingDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FollowingDialogComponent]
    });
    fixture = TestBed.createComponent(FollowingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
